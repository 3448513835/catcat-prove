import MyComponent from "../common/MyComponent";
import BuildConfig from "./BuildConfig";


const {ccclass, property} = cc._decorator;

@ccclass
export default class FacLockView extends MyComponent {

    @property(cc.Node)
    bg: cc.Node = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_title: cc.Label = null

    @property(cc.Label)
    ttf_des: cc.Label = null

    @property(cc.Label)
    ttf_need_lv: cc.Label = null

    @property(cc.Label)
    ttf_tip_need_lv: cc.Label = null

    private roomId: number = null
    private facId: number = null
    private isRoom: boolean = false
    private needLv: number = 1

    onLoad() {
        this.node.height = cc.view.getVisibleSize().height
        this.node.width = cc.view.getVisibleSize().width
    }

    start() {
        let height_half = cc.view.getVisibleSize().height / 2
        this.bg.y = -height_half - this.bg.height - 150
        let end_y = -height_half
        cc.tween(this.bg)
            .to(0.3, { y: end_y })
            .call(() => {
            })
            .start()
    }

    init(roomId: number, facId: number, isRoom: boolean, needLv: number) {
        this.roomId = roomId
        this.facId = facId
        this.isRoom = isRoom

        let json = this._json_manager.getJsonData(this._json_name.ROOM, this.roomId)
        let icon = json["icon"]
        let des = json["des"]
        let name = json["name"]
        let reward = json["reward"]
        let unlock_cost = json["unlock_cost"]

        this.setView(icon, des, unlock_cost, name, reward)
    }

    private setView(icon, des, unlock_cost, name, reward) {
        this.ttf_title.string = `解锁${name}`
        this.ttf_des.string = des
        let path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/skin1/${icon}`
        this._utils.setSpriteFrame(this.icon, path)

        this.ttf_need_lv.string = this.needLv.toString()
        this.ttf_tip_need_lv.string = `等级需达到${this.needLv}级`
    }

    private click() {
        let height_half = cc.view.getVisibleSize().height / 2
        let end_y = -height_half - this.bg.height - 150
        cc.tween(this.bg)
            .to(0.2, { y: end_y })
            .call(() => {
                this.node.destroy()
            })
            .start()
    }

    // update (dt) {}
}
