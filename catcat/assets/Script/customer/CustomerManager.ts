import RoomMgr from "../builds/RoomMgr";
import { UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";
import { User } from "../common/User";
import ChangeName from "../dialogs/seting/ChangeName";
import ChangeScene from "../main/ChangeScene";


const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomerManager extends MyComponent {

    private point_one_time: number = 0
    private point_two_time: number = 0
    private point_three_time: number = 0

    private entrust_cus_list = {}

    public is_product: boolean = true

    private room_list = [
        105,
        106,
        107,
        108,
    ]

    public static instance: CustomerManager = null
    protected onLoad() {
        CustomerManager.instance = this
    }

    start() {
        this.schedule(this.checkProduce, 1)
    }

    private checkProduce() {
        if (!this.is_product) return
        this.checkProduceByPoint(1)
        this.checkProduceByPoint(2)
        this.checkProduceByPoint(3)
    }

    private checkProduceByPoint(point: number) {
        let time = this.point_one_time
        if (point == 2) {
            time = this.point_two_time
        } else if (point == 3) {
            time = this.point_three_time
        }
        if (time <= 0) {
            let customer_list = UserDefault.getItem(User.getUID() + GameConstant.CUSTOMER_UNLOCK_LIST)
            let config = this.getProdecePointConfigById(point)

            // customer_list = JSON.stringify([10003, 10002, 10001])
            // cc.error(customer_list, "list============")
            if (customer_list && config) {
                let list = JSON.parse(customer_list)
                if (list.length > 0) {
                    let behavior_type = config["behavior_type"]
                    let behavior_weight = config["behavior_weight"]
                    let cur_type = this.getBehaviorType(behavior_type, behavior_weight)
                    // cur_type = 102
                    if (cur_type == 101) {
                        let cus_id = this.getCurCustomerByType(cur_type)
                        if (cus_id) {
                            let data = {
                                point: point,
                                id: cus_id,
                                roomId: null, 
                                behavior_type: cur_type, 
                                is_have_entrust: ChangeScene.instance.getIsHaveEntrust()
                            }
                            this._event_manager.dispatch(this._event_name.EVENT_RANDOM_BEHAVIOR_CUSTOMER, data)
                            if (ChangeScene.instance.getIsHaveEntrust()) {
                                ChangeScene.instance.setIsHaveEntrust(false)
                            }
                        }
                    }
                    else if (cur_type == 102) {
                        let random = this._utils.getRandomInt(0, this.room_list.length - 1)
                        let roomId = this.room_list[random]
                        let islock = RoomMgr.instance.getRoomFacIsAllUnLockByRoomId(roomId)
                        // islock = true
                        if (islock) {
                            let cus_id = this.getCurCustomerByType(cur_type)
                            if (cus_id) {
                                let data = {
                                    point: point,
                                    id: cus_id,
                                    roomId: roomId,
                                    behavior_type: cur_type,
                                }
                                this._event_manager.dispatch(this._event_name.EVENT_RANDOM_BEHAVIOR_CUSTOMER, data)
                            }
                        }
                    }
                }
            }

            if (config) {
                let generate_time = config["generate_time"]
                if (point == 2) {
                    this.point_two_time = this.getRandomTime(generate_time)
                } else if (point == 3) {
                    this.point_three_time = this.getRandomTime(generate_time)
                } else if (point == 1) {
                    this.point_one_time = this.getRandomTime(generate_time)
                }
            }
        }
        else {
            if (point == 2) {
                this.point_two_time -= 1
            } else if (point == 3) {
                this.point_three_time -= 1
            } else if (point == 1) {
                this.point_one_time -= 1
            }
        }
    }

    /**
     * 根据行为获取顾客
     */
    private getCurCustomerByType(type: number) {
        let can_cus_list = []
        let json = this._json_manager.getJson(this._json_name.CUSTOMER_WEIGHT)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let behavior_type = item_data["behavior_type"]
                if (type == behavior_type) {
                    let customer_pool = item_data["customer_pool"]
                    can_cus_list.push(customer_pool)
                }
            }
        }

        let customer_list = UserDefault.getItem(User.getUID() + GameConstant.CUSTOMER_UNLOCK_LIST)
        // customer_list = JSON.stringify([10003, 10002, 10001])
        if (customer_list) {
            customer_list = JSON.parse(customer_list)
            let intersect = can_cus_list.filter(function (v) { return customer_list.indexOf(v) > -1 })
            if (intersect.length > 0) {
                let random = this._utils.getRandomInt(0, intersect.length - 1)
                return intersect[random]
            }
            else {
                return
            }
        }
        else {
            return
        }
    }

    /**
     * 获取本次行为
     */
    private getBehaviorType(type: string, type_weight: string) {
        let need_type = 0
        if (type && type_weight) {
            let num_arrow = type.split(",")
            let num_weight_arrow = type_weight.split(",")
            let total_weight = 0
            for (let i = 0; i < num_weight_arrow.length; i++) {
                const weight = Number(num_weight_arrow[i])
                total_weight += weight
            }

            let list = []
            let current_weight = total_weight
            for (let j = 0; j < num_weight_arrow.length; j++) {
                const value = Number(num_weight_arrow[j])
                let cus_num = Number(num_arrow[j])
                let range = [current_weight, current_weight - value]
                current_weight = current_weight - value
                let data = { range: range, type: cus_num }
                list.push(data)
            }

            let random = this._utils.getRandomInt(0, total_weight)
            for (let i = 0; i < list.length; i++) {
                const data = list[i]
                let range = data["range"]
                if (random >= range[1] && random <= range[0]) {
                    need_type = data["type"]
                    break
                }
            }
        }

        return need_type
    }

    /**
     * 获取本次随机时间
     */
    private getRandomTime(generate_time: string) {
        let arr = generate_time.split("_")
        let time = this._utils.getRandomInt(Number(arr[0]), Number(arr[1]))
        return time
    }

    /**
     * 获取生成点配置
     */
    private getProdecePointConfigById(id: number) {
        let json = this._json_manager.getJson(this._json_name.CUSTOMER_BEHAVIOR)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let generate_point = item_data["generate_point"]
                if (id == generate_point) {
                    return item_data
                }
            }
        }
        return
    }

    public addEntrustCusToList(key, value) {
        this.entrust_cus_list[key] = value
    }

    public getEntrustCusList() {
        return this.entrust_cus_list
    }

    public removeEntrustCusToList(key) {
        if (this.entrust_cus_list[key]) {
            delete this.entrust_cus_list[key]
        }
    }

    onDestroy() {
        super.onDestroy && super.onDestroy()
        CustomerManager.instance = null
    }

    // update (dt) {}
}
