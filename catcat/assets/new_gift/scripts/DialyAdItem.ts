import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DialyAdItem extends MyComponent {

    @property([cc.Node])
    item_list: cc.Node[] = []

    @property(cc.Label)
    ttf_aly_get: cc.Label = null

    @property(cc.Node)
    btn: cc.Node = null

    private reward_list = []
    private data = null

    // onLoad () {}

    start() {

    }

    updateView(data) {
        this.data = data
        let item = data["item"]
        this.reward_list = this._utils.changeConfigData(item)
        for (let j = 0; j < this.item_list.length; j++) {
            const node = this.item_list[j]
            let item_data = this.reward_list[j]
            if (item_data) {
                node.active = true
                let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                let num = node.getChildByName("Num").getComponent(cc.Label)
                // let name = node.getChildByName("Name").getComponent(cc.Label)
                num.string = item_data["item_num"]

                let item_id = item_data["item_id"]
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(icon)) {
                        icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) {
                            icon.node.scale = 0.4
                        } else {
                            icon.node.scale = 0.8
                        }
                    }
                })

            } else {
                node.active = false
            }
        }

        let is_get = data["is_get"]
        this.ttf_aly_get.node.active = is_get
        this.btn.active = !is_get
    }

    private clickBtn() {
        let id = this.data["id"];
        if (this._user.getVideo() > 0) {
            this._utils.addResNum(GameConstant.res_id.video, -1);
            this.ttf_aly_get.node.active = true
            this.btn.active = false
            this._event_manager.dispatch(this._event_name.EVENT_GET_DIALY_AD_REWARD, { id: id, reward: this.reward_list })
        }
        else {
            this._ad_manager.setAdCallback(() => {
                this.ttf_aly_get.node.active = true
                this.btn.active = false
                this._net_manager.requestTablog(this._config.statistic.WELFARE1 + id);
                this._event_manager.dispatch(this._event_name.EVENT_GET_DIALY_AD_REWARD, { id: id, reward: this.reward_list })
            });
            this._net_manager.requestTablog(this._config.statistic.WELFARE0 + id);
            this._ad_manager.showAd();
        }
    }

    // update (dt) {}
}
