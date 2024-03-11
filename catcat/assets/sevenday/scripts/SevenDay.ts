import { UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";
import SevenDayItem from "./SevenDayItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenDay extends MyComponent {

    @property([SevenDayItem])
    item_list: SevenDayItem[] = []

    @property(cc.Label)
    today_num: cc.Label = null

    private init_pop_type = null

    onLoad() {
        let data = this.getDialogData()
        if (data) {
            this.init_pop_type = data["init_pop_type"]
        }

        let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
        if (local_data) {
            local_data = JSON.parse(local_data)
            let length = Object.keys(local_data).length
            this.today_num.string = `第${length}天`
        } else {
            this.today_num.node.active = false
        }


        // // UserDefault.removeItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
        // // UserDefault.removeItem(this._user.getUID() + GameConstant.SEVENT_DAY_RECOVER_TIME)
        // let data = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
        // if (data) {
        //     data = JSON.parse(data)
        // }else {
        //     data = {
        //         1: {
        //             state: 1, //  0 不可以领取 1 可以领取 2 已经领取
        //         }
        //     }
        // }

        // let time = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_RECOVER_TIME)
        // if (time) {
        //     let isNewDay = this._utils.isNewDay(Number(time))
        //     if (isNewDay) {
        //         let length = Object.keys(data).length
        //         if (length < 7) {
        //             data[length + 1] = {
        //                 state: 1, //  0 不可以领取 1 可以领取 2 已经领取
        //             }
        //         }
        //     }
        // } 

        // UserDefault.setItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA, JSON.stringify(data))
        // UserDefault.setItem(this._user.getUID() + GameConstant.SEVENT_DAY_RECOVER_TIME, Date.now())
    }

    start() {
        let json = this._json_manager.getJson(this._json_name.SEVEN_DAY)
        let list = []
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                list.push(item_data)
            }
        }
        list.sort((a, b) => {
            return a["day"] - b["day"]
        })
        for (let i = 0; i < list.length; i++) {
            const item_data = list[i]
            let item = this.item_list[i]
            if (cc.isValid(item)) {
                item.initItem(item_data)
            }
        }
    }

    onDestroy() {
        if (this.init_pop_type) {
            this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEXT_POP_VIEW, this.init_pop_type)
        }
        super.onDestroy && super.onDestroy()
    }

    // update (dt) {}
}
