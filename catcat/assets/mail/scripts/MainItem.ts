import MyComponent from "../../Script/common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainItem extends MyComponent {

    @property(cc.Label)
    ttf_title: cc.Label = null

    @property(cc.Label)
    ttf_time: cc.Label = null

    @property(cc.Label)
    ttf_from: cc.Label = null

    @property(cc.Label)
    ttf_residue_time: cc.Label = null

    @property(cc.Sprite)
    icon_state: cc.Sprite = null

    @property([cc.SpriteFrame])
    state_freams: cc.SpriteFrame[] = []

    private data = null
    // onLoad () {}

    start() {

    }

    updateView(data) {
        this.data = data
        let award = data["award"]
        //状态 0 未读  1 已读
        let status = data["status"]
        let length = award.length

        if (status == 0) {
            if (length <= 0) {
                this.icon_state.spriteFrame = this.state_freams[2]
            } else {
                this.icon_state.spriteFrame = this.state_freams[0]
            }
        } else {
            if (length <= 0) {
                this.icon_state.spriteFrame = this.state_freams[3]
            } else {
                //是否领取奖励 1 是 0 否
                let is_get_award = data["is_get_award"]
                if (is_get_award == 0) {
                    this.icon_state.spriteFrame = this.state_freams[1]
                } else {
                    this.icon_state.spriteFrame = this.state_freams[3]
                }
            }
        }

        this.ttf_title.string = data["title"]
        this.ttf_time.string = data["time"]
        this.ttf_residue_time.string = `过期时间：${data["expiration_time"]}`
    }

    private clickInfo() {
        this._event_manager.dispatch(this._event_name.EVENT_MAIL_INFO, this.data)
    }

    // update (dt) {}
}
