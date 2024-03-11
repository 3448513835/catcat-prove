import { UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenDayItem extends MyComponent {

    @property(cc.Sprite)
    icon_bg: cc.Sprite = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    item_num: cc.Label = null

    @property(cc.Sprite)
    red: cc.Sprite = null

    @property(cc.Label)
    aly_get: cc.Label = null

    @property(cc.Label)
    tomorrow_tip: cc.Label = null

    @property(cc.Label)
    lock: cc.Label = null

    @property(cc.Node)
    btn_get: cc.Node = null

    @property(cc.Sprite)
    finished_tip: cc.Sprite = null

    @property([cc.SpriteFrame])
    bg_frames: cc.SpriteFrame[] = []

    @property(cc.Node)
    btn_video: cc.Node = null

    private data = null
    private day: number = 1
    private id: number = null
    private num: number = null

    // onLoad () {}

    start() {

    }

    initItem(data) {
        this.data = data
        let reward = data["reward"]
        let day = data["day"]
        this.day = day

        let arr_reward = reward.split(":")
        let id = arr_reward[0]
        let num = arr_reward[1]
        this.id = Number(id)
        this.num = Number(num)
        this.item_num.string = "x" + num

        let path = this._utils.getItemPathById(id)
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
                let item_type = this._utils.getItemTypeById(id)
                if (item_type == 1) this.icon.node.scale = 0.5
            }
        })

        let state_data = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
        state_data = JSON.parse(state_data)
        let cur_state_data = state_data[day]
        let state = cur_state_data ? cur_state_data["state"] : 0
        //  0 不可以领取 1 可以领取 2 已经领取
        this.btn_get.active = state == 1
        this.item_num.node.active = !(state == 2)
        // this.red.node.active = state == 1
        let video_state = cur_state_data ? cur_state_data["video_state"] : 0
        if (state == 2) {
            //视频领取
            if (video_state == 1) {
                this.btn_video.active = false
                this.aly_get.node.active = true
                this.finished_tip.node.active = true
                this.lock.node.active = false
            } else {
                this.btn_video.active = true
                this.aly_get.node.active = false
                this.finished_tip.node.active = false
                this.lock.node.active = false
            }
        }

        // this.aly_get.node.active = !this.btn_video.active
        // this.finished_tip.node.active = !this.btn_video.active
        // this.lock.node.active = state == 0

        // if (video_state == 1) {
        //     this.icon_bg.spriteFrame = this.bg_frames[0]
        // } else {
        //     this.icon_bg.spriteFrame = this.bg_frames[1]
        // }
        // if (state == 0) {
        //     let tomorrow = this.getTomorrow()
        //     if (tomorrow && tomorrow == day) {
        //         this.lock.node.active = false
        //         this.tomorrow_tip.node.active = true
        //     } else {
        //         this.tomorrow_tip.node.active = false
        //     }
        // }
    }

    private clickGet() {
        let pos_w = this.icon.node.parent.convertToWorldSpaceAR(this.icon.node.position)
        let data = {
            pos_w: pos_w,
            item_id: this.id,
            item_num: this.num,
        }
        this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)

        let state_data = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
        state_data = JSON.parse(state_data)
        let cur_state_data = state_data[this.day]
        if (cur_state_data) {
            cur_state_data["state"] = 2
        } else {
            state_data[this.day] = {
                state: 2
            }
        }
        UserDefault.setItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA, JSON.stringify(state_data))
        this._event_manager.dispatch(this._event_name.EVENT_RED_TIP, {})

        this.initItem(this.data)
    }

    private getTomorrow() {
        let state_data = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
        state_data = JSON.parse(state_data)

        let list = []
        for (const key in state_data) {
            if (Object.prototype.hasOwnProperty.call(state_data, key)) {
                const cur_state_data = state_data[key]
                let data = {
                    day: Number(key),
                    state: cur_state_data["state"]
                }
                list.push(data)
            }
        }

        list.sort((a, b) => {
            return a["day"] - b["day"]
        })

        let length = list.length
        let cur_data = list[length - 1]
        let day = cur_data["day"]
        if (day < 7) {
            return day + 1
        } else {
            return
        }
    }

    private clickBtnVideo() {

        let func = () => {
            let pos_w = this.icon.node.parent.convertToWorldSpaceAR(this.icon.node.position)
            let data = {
                pos_w: pos_w,
                item_id: this.id,
                item_num: this.num,
            }
            this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)

            let state_data = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
            state_data = JSON.parse(state_data)
            let cur_state_data = state_data[this.day]
            if (cur_state_data) {
                cur_state_data["video_state"] = 1
            } else {
                state_data[this.day] = {
                    video_state: 1
                }
            }
            UserDefault.setItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA, JSON.stringify(state_data))
            this._event_manager.dispatch(this._event_name.EVENT_RED_TIP, {})

            this.initItem(this.data)
        }

        if (this._user.getVideo() > 0) {
            this._utils.addResNum(GameConstant.res_id.video, -1)
            func()
        }
        else {
            this._ad_manager.setAdCallback(() => {
                func()
            });
            this._ad_manager.showAd();
        }
    }

    // update (dt) {}
}
