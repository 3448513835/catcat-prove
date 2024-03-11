import { UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";
import { User } from "../../Script/common/User";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PokedexCusInfo extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Mask)
    lock_icon_mask: cc.Mask = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    @property(cc.Label)
    ttf_address: cc.Label = null

    @property(cc.Label)
    ttf_des: cc.Label = null

    @property(cc.Label)
    ttf_tip: cc.Label = null

    @property(cc.Node)
    progress_node: cc.Node = null

    @property(cc.Node)
    progress_mask: cc.Node = null

    @property(cc.Node)
    progress_bar: cc.Node = null

    @property(cc.Label)
    progress_percent: cc.Label = null

    @property(cc.Label)
    intimacy_lv: cc.Label = null

    @property(cc.Sprite)
    intimacy_gift: cc.Sprite = null

    private data = null

    onLoad () {
        this.data = this.getDialogData()
    }

    start () {
        let id = this.data["id"]
        let isLock = false
        let isGetReward = false
        let pokedex_customer_info = UserDefault.getItem(User.getUID() + GameConstant.POKEDEX_CUSTOMER_LOCK_INFO)
        if (pokedex_customer_info) {
            let data = JSON.parse(pokedex_customer_info)
            if (data[id]) {
                let cur_data = data[id]
                isLock = cur_data["isLock"]
                isGetReward = cur_data["isGetReward"]
            }
        }

        this.ttf_des.string = this.data["desc"]

        if (isLock) {
            this.ttf_name.string = this.data["customer_name"]
            this.ttf_address.string = this.data["address"]
            this.icon.node.active = true
            this.lock_icon_mask.node.active = false
            let path = `pic/customer/${this.data["appearance"]}`
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.icon)) {
                    this.icon.spriteFrame = sprite_frame
                }
            })

            this.ttf_tip.node.active = false
            this.progress_node.active = true
        }
        else {
            this.ttf_name.string = "???"
            this.ttf_address.string = "???"
            this.icon.node.active = false
            this.lock_icon_mask.node.active = true
            let path = `pic/customer/${this.data["appearance"]}`
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.lock_icon_mask)) {
                    this.lock_icon_mask.spriteFrame = sprite_frame
                }
            })

            this.ttf_tip.node.active = true
            this.progress_node.active = false
            this.ttf_tip.string = `解锁条件：${this.data["unlock_desc"]}`
        }
    }

    // update (dt) {}
}
