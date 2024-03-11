import { UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";
import ChangeScene from "../main/ChangeScene";


const { ccclass, property } = cc._decorator;

@ccclass
export default class OnLine extends MyComponent {

    @property(cc.Node)
    node_time: cc.Node = null

    @property(cc.Label)
    node_time_ttf: cc.Label = null

    @property(cc.Node)
    node_btn: cc.Node = null

    @property(cc.Node)
    red_node: cc.Node = null

    private time: number = 0
    private end_time: number = 0
    private is_reward: boolean = false
    private max_stage: number = 0

    // private reward_get_state = {}

    onLoad() {
        let time = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_RECOVER_TIME)
        if (time) {
            let isNewDay = this._utils.isNewDay(Number(time))
            // isNewDay = true
            if (isNewDay) {
                UserDefault.removeItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST)
                ChangeScene.instance.setOnLineTime(0)
            }
        }

        UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_RECOVER_TIME, Date.now())

        let reward_get_state = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST)
        if (reward_get_state && JSON.parse(reward_get_state)) {
            reward_get_state = JSON.parse(reward_get_state)
        }
        else {
            reward_get_state = {
                101: {is_get: false, can_get: false},
                102: {is_get: false, can_get: false},
                103: {is_get: false, can_get: false},
                104: {is_get: false, can_get: false},
                105: {is_get: false, can_get: false},
                106: {is_get: false, can_get: false},
            }
            UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST, JSON.stringify(reward_get_state))
            // this.reward_get_state = reward_get_state
        }

        this.schedule(this.tick, 1)
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

    private tick() {
        let total_online_time = ChangeScene.instance.getOnLineTime()
        let cur_min = Math.floor(total_online_time / 60)
        let config_list = this.getConfigList()
        let reward_get_state = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST)
        reward_get_state = JSON.parse(reward_get_state)

        for (let i = 0; i < config_list.length; i++) {
            const item_config = config_list[i]
            let id = item_config["in"]
            let time = item_config["time"]
            if (total_online_time >= time) {
                reward_get_state[id]["can_get"] = true
                UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_GET_LIST, JSON.stringify(reward_get_state))
            }
        }

        if (this.checkIsHaveCanGetReward()) {
            if (!this.red_node.active) this.red_node.active = true
        }else {
            if (this.red_node.active) this.red_node.active = false
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

    // checkOnline() {
    //     this.max_stage = this.getMaxStage()
    //     let stage = this.getRewardStage()
    //     if (stage > this.max_stage) {
    //         ChangeScene.instance.setOnLineTimePro(false)
    //         ChangeScene.instance.setOnLineTime(0)
    //         this.node.active = false
    //         return
    //     }

    //     let reward = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_IS_HAVE_REWARD)
    //     if (reward && JSON.parse(reward)) {
    //         this.is_reward = true
    //         this.setRewardState()
    //     } else {
    //         this.is_reward = false
    //         let time = ChangeScene.instance.getOnLineTime()
    //         this.time = time
    //         this.end_time = this.getStageTime()
    //         this.setTimeState()
    //     }
    // }

    // private getMaxStage() {
    //     let json = this._json_manager.getJson(this._json_name.HAND_UP_REWARD)
    //     let keys = Object.keys(json)
    //     let list = []
    //     keys.forEach(id => {
    //         list.push(Number(id))
    //     });
    //     list.sort((a, b) => {
    //         return a - b
    //     })
    //     return list[list.length - 1]
    // }

    // private getStageTime() {
    //     let stage = this.getRewardStage()
    //     let json = this._json_manager.getJsonData(this._json_name.HAND_UP_REWARD, stage)
    //     return json["time"]
    // }

    // private getRewardStage() {
    //     let stage = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_REWARD_STAGE)
    //     cc.error(stage, "stage-----------")
    //     if (stage) {
    //         stage = Number(stage)
    //     } else {
    //         stage = 101
    //     }

    //     return stage
    // }

    // private setRewardState() {
    //     this.node_time.active = false
    //     this.node_btn.active = true
    // }

    // private setTimeState() {
    //     this.node_time.active = true
    //     this.node_btn.active = false

    //     if (this.end_time - this.time > 0) {
    //         this.node_time_ttf.string = this._utils.formatTimeForSecond(this.end_time - this.time)
    //     } else {
    //         this.node_time_ttf.string = this._utils.formatTimeForSecond(0)
    //     }

    //     this.schedule(this.tickTime, 1)
    // }

    // private tickTime() {
    //     if (this.is_reward) return
    //     this.time += 1
    //     if (this.time >= this.end_time) {
    //         this.is_reward = true
    //         this.setRewardState()

    //         let stage = this.getRewardStage()
    //         let is_ad = false
    //         let data = {
    //             stage: stage,
    //             is_ad: is_ad
    //         }
    //         UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_IS_HAVE_REWARD, JSON.stringify(data))
    //         this._event_manager.dispatch(this._event_name.EVENT_ONLINE_IS_HAVE_REWARD)

    //         let next_stage = stage + 1
    //         if (next_stage > this.max_stage) {
    //             this.unschedule(this.tickTime)
    //         } else {

    //         }
    //         UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_STAGE, next_stage)
    //     } else {
    //         if (this.end_time - this.time > 0) {
    //             this.node_time_ttf.string = this._utils.formatTimeForSecond(this.end_time - this.time)
    //         } else {
    //             this.node_time_ttf.string = this._utils.formatTimeForSecond(0)
    //         }
    //     }
    // }

    // private clickGet() {
    //     this._net_manager.requestTablog(this._config.statistic.ONLINE_CLICK)
    //     let reward = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_IS_HAVE_REWARD)
    //     if (reward) {
    //         let data = JSON.parse(reward)
    //         let stage = data["stage"]
    //         let is_ad = data["is_ad"]
    //         let item_data = this._json_manager.getJsonData(this._json_name.HAND_UP_REWARD, stage)
    //         let free_reward = item_data["free_reward"]
    //         let arr = free_reward.split(":")
    //         let id = arr[0]
    //         let num = Number(arr[1])
    //         let reward_list = []
    //         for (let i = 0; i < num; i++) {
    //             let reward_item = this.getRewardData(Number(id))
    //             if (reward_item) {
    //                 let reward_data = this._utils.changeConfigData(reward_item)
    //                 reward_list.push(...reward_data)
    //             }
    //         }

    //         if (reward_list.length > 0) {
    //             this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
    //         }
    //     }

    //     UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_IS_HAVE_REWARD, JSON.stringify(null))
    //     this._event_manager.dispatch(this._event_name.EVENT_ONLINE_IS_HAVE_REWARD)
    //     ChangeScene.instance.setOnLineTime(0)
    //     this.checkOnline()
    // }

    // private getRewardData(id: number) {
    //     let pool_list = []
    //     let json = this._json_manager.getJson(this._json_name.HAND_UP_POOL)
    //     for (const key in json) {
    //         if (Object.prototype.hasOwnProperty.call(json, key)) {
    //             const element = json[key]
    //             let pool_id = element["pool_id"]
    //             if (id == pool_id) {
    //                 pool_list.push(element)
    //             }
    //         }
    //     }

    //     let total_weight = 0
    //     for (let i = 0; i < pool_list.length; i++) {
    //         const item_data = pool_list[i]
    //         total_weight += item_data["weight"]
    //     }

    //     let list = []
    //     let current_weight = total_weight
    //     for (let i = 0; i < pool_list.length; i++) {
    //         const item_data = pool_list[i]
    //         let id = item_data["ID"]
    //         let weight = item_data["weight"]
    //         let range = [current_weight, current_weight - weight]
    //         current_weight = current_weight - weight
    //         let data = { range: range, id: id }
    //         list.push(data)
    //     }

    //     let need_id = null
    //     let random = this._utils.getRandomInt(0, total_weight)
    //     for (let i = 0; i < list.length; i++) {
    //         const data = list[i]
    //         let range = data["range"]
    //         if (random >= range[1] && random <= range[0]) {
    //             need_id = data["id"]
    //             break
    //         }
    //     }

    //     if (need_id) {
    //         let item_data = json[need_id]
    //         let reward_item = item_data["item"]
    //         return reward_item
    //     } else {
    //         return
    //     }
    // }

    // private clickVideo() {
    //     if (this.is_reward) return
    //     if (this._user.getVideo() > 0) {
    //         this._utils.addResNum(GameConstant.res_id.video, -1);

    //         let stage = this.getRewardStage()
    //             let item_data = this._json_manager.getJsonData(this._json_name.HAND_UP_REWARD, stage)
    //             let free_reward = item_data["ad_reward"]
    //             let arr = free_reward.split(":")
    //             let id = arr[0]
    //             let num = Number(arr[1])
    //             let reward_list = []
    //             for (let i = 0; i < num; i++) {
    //                 let reward_item = this.getRewardData(Number(id))
    //                 if (reward_item) {
    //                     let reward_data = this._utils.changeConfigData(reward_item)
    //                     reward_list.push(...reward_data)
    //                 }
    //             }

    //             if (reward_list.length > 0) {
    //                 this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
    //             }

    //             let next_stage = stage + 1
    //             UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_STAGE, next_stage)

    //             UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_IS_HAVE_REWARD, JSON.stringify(null))
    //             this._event_manager.dispatch(this._event_name.EVENT_ONLINE_IS_HAVE_REWARD)
    //             ChangeScene.instance.setOnLineTime(0)
    //             this.checkOnline()
    //     }
    //     else {

    //         this._ad_manager.setAdCallback(() => {
    //             this._net_manager.requestTablog(this._config.statistic.VIDEO_ONLINE1);
    //             let stage = this.getRewardStage()
    //             let item_data = this._json_manager.getJsonData(this._json_name.HAND_UP_REWARD, stage)
    //             let free_reward = item_data["ad_reward"]
    //             let arr = free_reward.split(":")
    //             let id = arr[0]
    //             let num = Number(arr[1])
    //             let reward_list = []
    //             for (let i = 0; i < num; i++) {
    //                 let reward_item = this.getRewardData(Number(id))
    //                 if (reward_item) {
    //                     let reward_data = this._utils.changeConfigData(reward_item)
    //                     reward_list.push(...reward_data)
    //                 }
    //             }

    //             if (reward_list.length > 0) {
    //                 this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
    //             }

    //             let next_stage = stage + 1
    //             UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_REWARD_STAGE, next_stage)

    //             UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_IS_HAVE_REWARD, JSON.stringify(null))
    //             this._event_manager.dispatch(this._event_name.EVENT_ONLINE_IS_HAVE_REWARD)
    //             ChangeScene.instance.setOnLineTime(0)
    //             this.checkOnline()
    //         });
    //         this._net_manager.requestTablog(this._config.statistic.VIDEO_ONLINE0);
    //         this._ad_manager.showAd();
    //     }
    // }

    // update (dt) {}
}
