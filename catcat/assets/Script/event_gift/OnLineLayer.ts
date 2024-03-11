// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyButton from "../common/MyButton";
import MyComponent from "../common/MyComponent";
import ChangeScene from "../main/ChangeScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OnLineLayer extends MyComponent {

    @property([cc.Node])
    item_list: cc.Node[] = []

    @property(cc.Node)
    btn_video: cc.Node = null

    @property(cc.Label)
    ttf_time: cc.Label = null

    @property(MyButton)
    btn_get: MyButton = null

    // private reward_get_state = {}

    onLoad() {
        // let reward_get_state = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST)
        // if (reward_get_state && JSON.parse(reward_get_state)) {
        //     this.reward_get_state = JSON.parse(reward_get_state)
        // }
        // else {
        //     reward_get_state = {
        //         101: {is_get: false, can_get: false},
        //         102: {is_get: false, can_get: false},
        //         103: {is_get: false, can_get: false},
        //         104: {is_get: false, can_get: false},
        //         105: {is_get: false, can_get: false},
        //         106: {is_get: false, can_get: false},
        //     }
        //     UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST, JSON.stringify(reward_get_state))
        //     this.reward_get_state = reward_get_state
        // }

        let total_online_time = ChangeScene.instance.getOnLineTime()
        let cur_min = Math.floor(total_online_time / 60)
        // let config_list = this.getConfigList()
        // for (let i = 0; i < config_list.length; i++) {
        //     const item_config = config_list[i]
        //     let id = item_config["in"]
        //     let time = item_config["time"]
        //     if (total_online_time >= time) {
        //         this.reward_get_state[id]["can_get"] = true
        //     }
        // }

        // UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST, JSON.stringify(this.reward_get_state))

        this.ttf_time.string = `已在线${cur_min}分钟`
        this.schedule(this.tick, 1)
    }

    start() {
        this.setItemState()
        this.setBtnState()

        
    }

    private tick() {
        let total_online_time = ChangeScene.instance.getOnLineTime()
        let cur_min = Math.floor(total_online_time / 60)
        // let config_list = this.getConfigList()
        // for (let i = 0; i < config_list.length; i++) {
        //     const item_config = config_list[i]
        //     let id = item_config["in"]
        //     let time = item_config["time"]
        //     if (total_online_time >= time) {
        //         this.reward_get_state[id]["can_get"] = true
        //         UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST, JSON.stringify(this.reward_get_state))
        //         this.setBtnState()
        //     }
        // }

        this.ttf_time.string = `已在线${cur_min}分钟`
        this.setItemState()
        this.setBtnState()
    }

    private checkIsHaveCanGetReward(): boolean {
        let reward_get_state = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST)
        reward_get_state = JSON.parse(reward_get_state)
        if (reward_get_state && Object.keys(reward_get_state).length > 0) {
            for (const key in reward_get_state) {
                if (Object.prototype.hasOwnProperty.call(reward_get_state, key)) {
                    const element = reward_get_state[key]
                    if (element["can_get"] && element["is_get"] == false) {
                        return true
                    }
                }
            }
        }else {
            return false
        }
    }


    private setBtnState() {
        // let reward = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_IS_HAVE_REWARD)
        // if (reward && JSON.parse(reward)) {
        //     this.btn_video.active = false
        // }
        // else {
        //     this.btn_video.active = true
        // }

        if (this.checkIsHaveCanGetReward()) {
            this.btn_get.interactable = true
        }else {
            this.btn_get.interactable = false
        }
    }

    private setItemState() {
        let reward_get_state = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST)
        reward_get_state = JSON.parse(reward_get_state)

        let config_list = this.getConfigList()
        for (let i = 0; i < this.item_list.length; i++) {
            const item = this.item_list[i]
            let item_data = config_list[i]
            if (!item_data) {
                item.active = false
                continue
            }
            else {
                let id = item_data["in"]
                let time = item.getChildByName("time").getComponent(cc.Label)
                let num = item.getChildByName("num").getComponent(cc.Label)
                let icon = item.getChildByName("icon").getComponent(cc.Sprite)
                let mask = item.getChildByName("Mask")
                let canget = item.getChildByName("canget")
                let config_time = item_data["time"]
                time.string = `${config_time / 60}分钟`

                let free_reward = item_data["free_reward"]
                let arr = free_reward.split(":")
                let item_id = arr[0]
                let item_num = Number(arr[1])

                num.string = `${item_num}`
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(icon)) {
                        icon.spriteFrame = sprite_frame
                    }
                })

                if (reward_get_state[id]) {
                    let state_data = reward_get_state[id]
                    if (state_data["is_get"]) {
                        mask.active = true
                        canget.active = false
                    }else {
                        mask.active = false
                        if (state_data["can_get"]) {
                            canget.active = true
                        }else {
                            canget.active = false
                        }
                    }
                }else {
                    mask.active = false
                    canget.active = false
                }
            }
        }
    }

    private getConfigList() {
        let json = this._json_manager.getJson(this._json_name.HAND_UP_REWARD)
        let list = []
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const element = json[key];
                list.push(element)
            }
        }
        list.sort((a, b) => {
            return a["in"] - b["in"]
        })

        return list
    }

    private clickGet() {
        let list = []
        let json = this._json_manager.getJson(this._json_name.HAND_UP_REWARD)
        let reward_get_state = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST)
        reward_get_state = JSON.parse(reward_get_state)
        if (reward_get_state && Object.keys(reward_get_state).length > 0) {
            for (const key in reward_get_state) {
                if (Object.prototype.hasOwnProperty.call(reward_get_state, key)) {
                    const element = reward_get_state[key]
                    if (element["can_get"] && element["is_get"] == false) {
                        let item = json[key]
                        let free_reward = item["free_reward"]
                        let reward_list = this._utils.changeConfigData(free_reward)
                        list.push(...reward_list)

                        element["is_get"] = true
                        UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST, JSON.stringify(reward_get_state))
                    }
                }
            }
        }
        if (list.length > 0) {
            this._dialog_manager.openDialog(this._dialog_name.RewardView, list)
        }

        this.setItemState()
    }

    // update (dt) {}
}
