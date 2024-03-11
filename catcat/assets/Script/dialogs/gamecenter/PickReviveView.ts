import MyComponent from "../../common/MyComponent";
import MyScrollView from "../../common/MyScrollView";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PickReviveView extends MyComponent {

    @property(cc.Label)
    ttf_tip: cc.Label = null

    @property(cc.Sprite)
    btn_icon: cc.Sprite = null

    @property(cc.Label)
    btn_ttf: cc.Label = null

    private data = null
    private need_config = null

    onLoad() {
        this.data = this.getDialogData()
    }

    start() {
        let my_score = this.data["score"]
        let need_config = null
        let config = this._json_manager.getJson(this._json_name.GAME_ELE_REWARD)
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                const item_data = config[key]
                let sort = item_data["sort"]
                let arr = sort.split("-")
                if (Number(arr[0]) <= my_score && my_score <= Number(arr[1])) {
                    need_config = item_data
                    break
                }
            }
        }

        if (need_config) {
            this.need_config = need_config
            let relife_stytle = need_config["relife_stytle"]
            if (relife_stytle == 1) {
                // 看视频
                this.btn_icon.node.active = true
                this.btn_ttf.string = "获得"
            }
            else if (relife_stytle == 2) {
                // 道具
                let pay = this.need_config["relife"]
                let arr = pay.split(":")
                this.btn_icon.node.active = true
                let item_id = Number(arr[0])
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(this.btn_icon)) {
                        this.btn_icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) this.btn_icon.node.scale = 0.3
                    }
                })
                this.btn_ttf.string = arr[1]
            }
            else if (relife_stytle == 3) {
                // 免费
                this.btn_icon.node.active = false
                this.btn_ttf.string = "免费"
            }
        }
    }

    private clickGet() {
        let relife_stytle = this.need_config["relife_stytle"]
        if (relife_stytle == 1) {
            // 看视频
            this._ad_manager.setAdCallback(() => {
                if (this.data.func) {
                    this.data.func(true)
                }
                this.close()
            });
            this._ad_manager.showAd();
        }
        else if (relife_stytle == 2) {
            // 道具
            let pay = this.need_config["relife"]
            let arr = pay.split(":")
            let item_id = Number(arr[0])
            let need_num = Number(arr[1])

            let my_num = this._utils.getMyNumByItemId(item_id)
            if (my_num >= need_num) {
                this._utils.addResNum(item_id, -Number(need_num))
                if (this.data.func) {
                    this.data.func(true)
                }
                this.close()
            } else {
                this._dialog_manager.showTipMsg("货币不足")
            }
        }
        else if (relife_stytle == 3) {
            // 免费
            if (this.data.func) {
                this.data.func(true)
            }
            this.close()
        }
    }

    private clickClose() {
        if (this.data.func) {
            this.data.func(false)
        }
        this.close()
    }

    // update (dt) {}
}
