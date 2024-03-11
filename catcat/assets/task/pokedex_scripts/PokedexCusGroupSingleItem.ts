import { UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";
import { User } from "../../Script/common/User";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PokedexCusGroupSingleItem extends MyComponent {

    @property(cc.Sprite)
    bg1: cc.Sprite = null

    @property(cc.Sprite)
    bg2: cc.Sprite = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    @property(cc.Node)
    reward_node: cc.Node = null

    @property(cc.Sprite)
    reward_icon: cc.Sprite = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Mask)
    lock_icon_mask: cc.Mask = null

    private data = null

    // onLoad () {}

    start() {

    }

    updateItem(data) {
        this.data = data
        let id = data["id"]
        // cc.error(data, "data============")
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

        if (isLock) {
            this.ttf_name.string = data["customer_name"]
            this.icon.node.active = true
            this.lock_icon_mask.node.active = false
            let path = `pic/customer/${data["appearance"]}`
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.icon)) {
                    this.icon.spriteFrame = sprite_frame
                }
            })

            if (isGetReward) {
                this.reward_node.active = false
            }
            else {
                this.reward_node.active = true
                let unlock_reward = this.data["unlock_reward"]
                let arr = unlock_reward.split(":")
                let path = this._utils.getItemPathById(arr[0])
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(this.reward_icon)) {
                        this.reward_icon.spriteFrame = sprite_frame
                    }
                })
            }
        }
        else {
            this.reward_node.active = false

            this.ttf_name.string = "???"
            this.icon.node.active = false
            this.lock_icon_mask.node.active = true
            let path = `pic/customer/${data["appearance"]}`
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.lock_icon_mask)) {
                    this.lock_icon_mask.spriteFrame = sprite_frame
                }
            })
        }

    }

    private getReward() {
        let unlock_reward = this.data["unlock_reward"]
        let arr = unlock_reward.split(":")
        let pos_w = this.reward_icon.node.parent.convertToWorldSpaceAR(cc.v2(this.reward_icon.node.position))
        let data = {
            pos_w: pos_w,
            item_id: Number(arr[0]),
            item_num: Number(arr[1]),
        }
        this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)

        let pokedex_customer_info = UserDefault.getItem(User.getUID() + GameConstant.POKEDEX_CUSTOMER_LOCK_INFO)
        if (pokedex_customer_info) {
            let data = JSON.parse(pokedex_customer_info)
            let id = this.data["id"]
            if (data[id]) {
                data[id]["isGetReward"] = true
            }

            UserDefault.setItem(User.getUID() + GameConstant.POKEDEX_CUSTOMER_LOCK_INFO, JSON.stringify(data))

            let isCusRed = this._utils.getPokedexCusIsHaveRed()
            this._event_manager.dispatch(this._event_name.EVENT_RED_TIP, { pokedex_cus: isCusRed })
        }
        
        this.reward_node.active = false
    }

    private clickItem() {
        this._dialog_manager.openDialog(this._dialog_name.PokedexCusInfo, this.data)
    }

    // update (dt) {}
}
