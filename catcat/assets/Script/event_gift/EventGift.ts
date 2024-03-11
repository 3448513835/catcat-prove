import { UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class EventGift extends MyComponent {

    @property(cc.Label)
    ttf_time: cc.Label = null

    private show_pos_x: number = -105
    private hide_pos_x: number = 120
    private ani_time: number = 0.5
    private isShow: boolean = false
    private gift_data: object = null
    private end_time: number = null

    onLoad () {
        // let size = cc.view.getVisibleSize()
        // this.hide_pos_x = size.width / 2 + 150
        // this.show_pos_x = size.width / 2 - 105
        this.node.x = this.hide_pos_x

        this.listen(this._event_name.EVENT_EVENT_GIFT_DATA, this.addGift, this)
        this.listen(this._event_name.EVENT_REMOVE_EVENT_GIFT, this.removeGift, this)
    }

    start () {
        let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.EVENT_GIFT_LOCAL_DATA)
        if (local_data) {
            let data = JSON.parse(local_data)
            let end_time = data["end_time"]
            let now_time = Date.now()
            if (end_time > now_time) {
                this.end_time = end_time
                this.gift_data = data["gift_data"]

                this.showAni()
                this.tickTime()
                this.schedule(this.tickTime, 1)
            }
        }
    }

    private addGift(data) {
        this.unschedule(this.tickTime)

        this.gift_data = data
        if (this.isShow) {
            
        }
        else {
            this.showAni()
        }

        let json = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10009)
        let time = json["int_para"]
        let end_time = Date.now() + time * 1000
        this.end_time = end_time
        let temp_data = {
            end_time: end_time,
            gift_data: this.gift_data
        }
        UserDefault.setItem(this._user.getUID() + GameConstant.EVENT_GIFT_LOCAL_DATA, JSON.stringify(temp_data))

        this.tickTime()
        this.schedule(this.tickTime, 1)
    }

    private tickTime() {
        if (this.end_time) {
            let now_time = Date.now()
            let diff_time = Math.ceil((this.end_time - now_time) / 1000)
            if (diff_time > 0) {
                this.ttf_time.string = this._utils.formatTimeForSecond(diff_time)
            }else {
                this.unschedule(this.tickTime)
                this.hideAni()
            }
        }
    }

    private click() {
        if (!this.isShow) return
        this._net_manager.requestTablog(this._config.statistic.EVENT_GIFT_CLICK)
        let temp_data = {
            end_time: this.end_time,
            gift_data: this.gift_data
        }
        this._dialog_manager.openDialog(this._dialog_name.EventGiftView, temp_data)
    }

    private removeGift() {
        this.unschedule(this.tickTime)
        let temp_data = {
            end_time: 0,
            gift_data: null
        }
        UserDefault.setItem(this._user.getUID() + GameConstant.EVENT_GIFT_LOCAL_DATA, JSON.stringify(temp_data))
        this.hideAni()
    }

    private showAni() {
        this.node.stopAllActions()
        this.isShow = true
        cc.tween(this.node)
            .to(this.ani_time, {x: this.show_pos_x})
            .start()
    }

    private hideAni() {
        this.node.stopAllActions()
        this.isShow = false
        cc.tween(this.node)
            .to(this.ani_time, {x: this.hide_pos_x})
            .start()
    }

    // update (dt) {}
}
