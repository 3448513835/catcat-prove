import BuildConfig from "../builds/BuildConfig";
import { UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";
import { User } from "../common/User";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ChangeScene extends MyComponent {

    @property(cc.Sprite)
    bg: cc.Sprite = null

    @property(cc.Node)
    layout_node: cc.Node = null

    @property(cc.Node)
    private fish_node: cc.Node = null;
    @property(cc.Node)
    private foot_node: cc.Node = null;

    private layout_height: number = null;

    private record_time: number = null
    private cur_power_end_time: number = 0

    private online_time: number = 0
    private online_time_pro: boolean = false

    /**委托任务时间 */
    private entrust_time: number = 0
    private entrust_all_time: number = null
    private is_have_entrust: boolean = false

    public static instance: ChangeScene = null

    onLoad() {
        ChangeScene.instance = this
        cc.game.addPersistRootNode(this.node)
        this.bg.node.setContentSize(cc.view.getVisibleSize())
        this.node.x = cc.view.getVisibleSize().width / 2
        this.node.y = cc.view.getVisibleSize().height / 2

        this.bg.node.y = this.bg.node.height
    }

    start() {
        this.adddDecoration()

        let time = UserDefault.getItem(User.getUID() + GameConstant.RECORD_GAME_TIME)
        this.record_time = Number(time)
        this.checkPowerTime()

        this.checkOnLine()

        this.schedule(this.tickTime, 1)
    }

    private adddDecoration() {
        let total_height = cc.visibleRect.height
        let total_weight = cc.visibleRect.width
        let item_width = 300
        let item_height = 260
        let num_row = Math.ceil(total_height / item_height)
        let num_col = Math.ceil(total_weight / item_width)
        for (let i = 0; i < num_col; i++) {
            for (let j = 0; j < num_row; j++) {
                let node = cc.instantiate(this.fish_node)
                node.active = true
                node.parent = this.layout_node
                node.x = i * item_width
                node.y = total_height - j * item_height
            }
        }

        for (let i = 0; i < num_col; i++) {
            for (let j = 0; j < num_row; j++) {
                let node = cc.instantiate(this.foot_node)
                node.active = true
                node.parent = this.layout_node
                node.x = 150 + i * item_width
                node.y = total_height - j * item_height
            }
        }
    }

    public enter(callBack: Function) {
        this.bg.node.active = true
        this.bg.node.y = this.bg.node.height
        cc.tween(this.bg.node)
            .to(0.5, { y: 0 }, { easing: "cubicOut" })
            .call(() => {
                if (callBack) callBack()
            })
            .delay(0.1)
            .call(() => {
                this.out()
            })
            .start()
    }

    public out() {
        // this.bg.node.stopAllActions()
        cc.tween(this.bg.node)
            .to(0.5, { y: this.bg.node.height }, { easing: "cubicIn" })
            .call(() => {
                this.bg.node.active = false
            })
            .start()
    }

    // update () {
    //     let top = this.layout_height/2;
    //     for (let node of this.layout_node.children) {
    //         node.y += SPEED;
    //         if (node.y >= top) { node.y = -top; }
    //     }
    // }

    private tickTime() {
        UserDefault.setItem(User.getUID() + GameConstant.RECORD_GAME_TIME, Date.now())

        this.tickEntrustTime()
        this.tickOnLineTime()
    }

    private checkPowerTime() {
        let user_data = UserDefault.getItem(User.getUID() + GameConstant.USER_DATA)
        let recode_time = UserDefault.getItem(User.getUID() + GameConstant.RECORD_GAME_TIME)
        if (user_data && recode_time) {
            let data = JSON.parse(user_data)
            let stamina = data["stamina"]
            let max_power = GameConstant.MAX_POWER_NUM
            if (stamina >= max_power) {
                this.cur_power_end_time = Math.floor(Date.now() / 1000)
            } else {
                let single_time = GameConstant.POWER_RECOVER_TIME
                let now_time = Date.now()
                let diff_time = Math.ceil((now_time - this.record_time) / 1000)

                let num = Math.floor(diff_time / single_time)

                let diff_power = max_power - stamina
                if (num >= diff_power) {
                    this.cur_power_end_time = Math.floor(Date.now() / 1000)
                    data["stamina"] = stamina + diff_power
                    UserDefault.setItem(User.getUID() + GameConstant.USER_DATA, JSON.stringify(data))
                } else {
                    data["stamina"] = stamina + num
                    UserDefault.setItem(User.getUID() + GameConstant.USER_DATA, JSON.stringify(data))
                    let shengyu_time = diff_time % single_time

                    let djs = Number(UserDefault.getItem(User.getUID() + GameConstant.RECORD_POWER_RESIDUE_TIME))
                    if (djs) {
                        if (djs <= 0) {
                            this.cur_power_end_time = Math.floor(Date.now() / 1000) + (single_time - shengyu_time)
                        } else {
                            this.cur_power_end_time = Math.floor(Date.now() / 1000) + Math.abs(djs - shengyu_time)
                        }
                    } else {
                        this.cur_power_end_time = Math.floor(Date.now() / 1000)
                    }
                }
            }
        }
    }

    public getNextPowerTime() {
        let user_data = UserDefault.getItem(User.getUID() + GameConstant.USER_DATA)
        let data = JSON.parse(user_data)
        let stamina = data["stamina"]
        let max_power = GameConstant.MAX_POWER_NUM
        if (stamina >= max_power) {
            this.cur_power_end_time = Math.floor(Date.now() / 1000)
        } else {
            this.cur_power_end_time = Math.floor(Date.now() / 1000) + GameConstant.POWER_RECOVER_TIME
        }

        return this.cur_power_end_time
    }

    public getCurPowerEndTime() {
        return this.cur_power_end_time
    }

    /**
     * 是否有可以建造的东西
     */
    public getIsCanLockFac() {
        let isCan = false
        let my_fish_num = this._user.getFish()
        let json_data = UserDefault.getItem(BuildConfig.data_json_name)
        if (json_data) {
            let data = JSON.parse(json_data)
            let nextUnlock = data["nextUnlock"]
            for (const key in nextUnlock) {
                if (Object.prototype.hasOwnProperty.call(nextUnlock, key)) {
                    const id = nextUnlock[key]
                    if (id > 100000) {
                        let build_json = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_LV, id)
                        if (build_json) {
                            let unlock_cost = build_json["consume_item"]
                            let arr = unlock_cost.split(":")
                            let num = Number(arr[1])
                            if (my_fish_num >= num) {
                                isCan = true
                                break
                            }
                        }
                    } else {
                        let room_json = this._json_manager.getJsonData(this._json_name.ROOM, id)
                        if (room_json) {
                            let unlock_cost = room_json["unlock_cost"]
                            let arr = unlock_cost.split(":")
                            let num = Number(arr[1])
                            if (my_fish_num >= num) {
                                isCan = true
                                break
                            }
                        }
                        else {
                            let fac_json = this._json_manager.getJsonData(this._json_name.FACILITY, id)
                            if (fac_json) {
                                let unlock_cost = fac_json["unlock_cost"]
                                let arr = unlock_cost.split(":")
                                let num = Number(arr[1])
                                if (my_fish_num >= num) {
                                    isCan = true
                                    break
                                }
                            }
                        }
                    }
                }
            }
        }

        return isCan
    }

    /**
     * 在线奖励
     */
    private checkOnLine() {
        // let reward = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_IS_HAVE_REWARD)

        // if (reward && JSON.parse(reward)) {
        //     this.online_time_pro = false
        //     this.online_time = 0
        // } else {
        //     let time = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_TOTAL_TIME)
        //     if (time) {
        //         this.online_time = Number(time)
        //         this.online_time_pro = true
        //     }
        //     else {
        //         this.online_time = 0
        //         this.online_time_pro = true
        //     }
        // }

        let time = UserDefault.getItem(this._user.getUID() + GameConstant.ONLINE_TOTAL_TIME)
        if (time) {
            this.online_time = Number(time)
            this.online_time_pro = true
        }
        else {
            this.online_time = 0
            this.online_time_pro = true
        }
    }

    public tickOnLineTime() {
        if (this.online_time_pro) {
            this.online_time += 1

            if (this.online_time == 500) {
                this._net_manager.requestTablog(this._config.statistic.EVENT_ONLINE_TIME)
            }

            UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_TOTAL_TIME, this.online_time)
        }
    }

    public getOnLineTime() {
        return this.online_time
    }

    public setOnLineTime(value: number) {
        this.online_time = value
        UserDefault.setItem(this._user.getUID() + GameConstant.ONLINE_TOTAL_TIME, this.online_time)
    }

    public setOnLineTimePro(value) {
        this.online_time_pro = value
    }

    private tickEntrustTime() {
        if (this.entrust_all_time) {
            this.entrust_time += 1
            if (this.entrust_time >= this.entrust_all_time) {
                this.is_have_entrust = true
                this.entrust_time = 0
            }
        }
    }

    public setIsHaveEntrust(value: boolean) {
        this.is_have_entrust = value
    }

    public getIsHaveEntrust() {
        return this.is_have_entrust
    }

    public setEntrustAllTime(value: number) {
        // temp_test
        // value = 5
        this.entrust_all_time = value
    }

    onDestroy() {
        ChangeScene.instance = null
        this.destroy()
    }

    // update (dt) {}
}
