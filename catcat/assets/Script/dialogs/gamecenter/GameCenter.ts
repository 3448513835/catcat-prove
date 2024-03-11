import { UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCenter extends MyComponent {

    @property(cc.Node)
    pick_node: cc.Node = null

    private pick_surplus_num: number = 0
    private pick_num: number = 0
    private pick_config = null

    // onLoad () {}

    start() {
        this.setPickItem()
    }

    private setPickItem() {
        // UserDefault.removeItem(this._user.getUID() + GameConstant.TODAY_PICK_GAME_NUM)
        let local_pick_data = UserDefault.getItem(this._user.getUID() + GameConstant.TODAY_PICK_GAME_NUM)
        if (local_pick_data) {
            local_pick_data = JSON.parse(local_pick_data)
        } else {
            local_pick_data = {}
            local_pick_data.play_num = 0

            UserDefault.setItem(this._user.getUID() + GameConstant.TODAY_PICK_GAME_NUM, JSON.stringify(local_pick_data))
        }

        let time = UserDefault.getItem(this._user.getUID() + GameConstant.PICK_RECOVER_TIME)
        if (time) {
            let isNewDay = this._utils.isNewDay(Number(time))
            if (isNewDay) {
                local_pick_data.play_num = 0
                UserDefault.setItem(this._user.getUID() + GameConstant.TODAY_PICK_GAME_NUM, JSON.stringify(local_pick_data))
            }
        }

        UserDefault.setItem(this._user.getUID() + GameConstant.PICK_RECOVER_TIME, Date.now())

        let pick_play_num = local_pick_data["play_num"]
        this.pick_num = pick_play_num

        let config = this._json_manager.getJson(this._json_name.GAME_ELE_START)
        let total_num = Object.keys(config).length
        let diff_num = total_num - pick_play_num

        this.pick_surplus_num = diff_num

        let num = this.pick_node.getChildByName("Num").getComponent(cc.Label)
        let btn_icon = cc.find("Btn/layout/Icon", this.pick_node).getComponent(cc.Sprite)
        let btn_ttf = cc.find("Btn/layout/Num", this.pick_node).getComponent(cc.Label)

        num.string = `今日剩余：${diff_num}`

        let cur_config = null
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                const item_config = config[key]
                if (item_config["round"] == pick_play_num + 1) {
                    cur_config = item_config
                    break
                }
            }
        }
        if (cur_config) {
            this.pick_config = cur_config

            let game_start = cur_config["game_start"]
            if (game_start == 1) {
                // 免费
                btn_icon.node.active = false
                btn_ttf.string = "免费"
            }
            else if (game_start == 2) {
                // 看视频
                btn_icon.node.active = true
                btn_ttf.string = "免费"
            }
            else if (game_start == 3) {
                // 道具
                let pay = cur_config["pay"]
                let arr = pay.split(":")
                btn_icon.node.active = true
                let item_id = Number(arr[0])
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(btn_icon)) {
                        btn_icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) btn_icon.node.scale = 0.3
                    }
                })
                btn_ttf.string = arr[1]
            }
        }
    }

    private clickPick() {
        if (this.pick_surplus_num > 0) {
            if (this.pick_config) {
                let game_start = this.pick_config["game_start"]
                if (game_start == 1) {
                    // 免费
                    this._dialog_manager.openDialog(this._dialog_name.PickView, this.pick_config)
                    this.setPickNum()
                    this.close()
                }
                else if (game_start == 2) {
                    // 看视频
                    this._ad_manager.setAdCallback(() => {
                        this._dialog_manager.openDialog(this._dialog_name.PickView, this.pick_config)
                        this.setPickNum()
                        this.close()
                    });
                    this._ad_manager.showAd();
                }
                else if (game_start == 3) {
                    // 道具
                    let pay = this.pick_config["pay"]
                    let arr = pay.split(":")
                    let item_id = Number(arr[0])
                    let need_num = Number(arr[1])

                    let my_num = this._utils.getMyNumByItemId(item_id)
                    if (my_num >= need_num) {
                        this._utils.addResNum(item_id, -Number(need_num))
                        this._dialog_manager.openDialog(this._dialog_name.PickView, this.pick_config)
                        this.setPickNum()
                        this.close()
                    } else {
                        this._dialog_manager.showTipMsg("货币不足")
                    }
                }
            }
        } else {
            this._dialog_manager.showTipMsg("今日次数已用完")
        }
    }

    private setPickNum() {
        let local_pick_data = UserDefault.getItem(this._user.getUID() + GameConstant.TODAY_PICK_GAME_NUM)
        local_pick_data = JSON.parse(local_pick_data)
        local_pick_data.play_num = this.pick_num + 1

        UserDefault.setItem(this._user.getUID() + GameConstant.TODAY_PICK_GAME_NUM, JSON.stringify(local_pick_data))
    }

    // update (dt) {}
}
