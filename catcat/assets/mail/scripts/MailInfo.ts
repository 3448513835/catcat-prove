import MyComponent from "../../Script/common/MyComponent";
import MyScrollView from "../../Script/common/MyScrollView";
import MailList from "./MailList";
import MailRewardItem from "./MailRewardItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MailInfo extends MyComponent {

    @property(cc.Label)
    residueTime: cc.Label = null

    @property(cc.Node)
    reward_node: cc.Node = null

    @property(MyScrollView)
    reward_scroll: MyScrollView = null

    @property(cc.Label)
    content: cc.Label = null

    @property(cc.Node)
    info_bg: cc.Node = null

    @property(cc.Label)
    ttf_title: cc.Label = null

    @property(cc.Node)
    btn_cancel: cc.Node = null

    @property(cc.Node)
    btn_get: cc.Node = null

    @property([cc.SpriteFrame])
    btn_no_frame: cc.SpriteFrame[] = []

    private data = null
    private height1: number = 716
    private height2: number = 977
    private scroll_data = []
    private isGetAward: boolean = false

    // onLoad () {}

    start() {

    }

    initInfo(data) {
        this.isGetAward = false
        this.data = data
        let award = data["award"]
        //状态 0 未读  1 已读
        let status = data["status"]
        let length = award.length
        if (length <= 0) {
            this.reward_node.active = false
            this.info_bg.height = this.height2
            this.btn_cancel.x = 0
            this.btn_get.active = false
        } else {
            this.scroll_data = award
            this.reward_node.active = true
            //是否领取奖励 1 是 0 否
            let is_get_award = data["is_get_award"]
            if (is_get_award == 0) {
                this.btn_get.getComponent(cc.Sprite).spriteFrame = this.btn_no_frame[1]
            } else {
                this.isGetAward = true
                this.btn_get.getComponent(cc.Sprite).spriteFrame = this.btn_no_frame[0]
            }

            this.initScroll(this.reward_scroll, this.scroll_data)
        }


        this.ttf_title.string = data["title"]
        this.content.string = data["content"]
        this.residueTime.string = `过期时间：${data["expiration_time"]}`

        this._net_manager.requestReadMail(this.data["id"])
    }

    private cancel() {
        this._net_manager.requestDelMail(this.data["id"])
        this._event_manager.dispatch(this._event_name.EVENT_MAIL_DEL_MAIL)
    }

    private getReard() {
        if (this.isGetAward) return
        let award = this.data["award"]
        this._dialog_manager.openDialog(this._dialog_name.RewardView, award)
        this._net_manager.requestGetMailAward(this.data["id"])
        this.isGetAward = true
        this.btn_get.getComponent(cc.Sprite).spriteFrame = this.btn_no_frame[0]
        this.initScroll(this.reward_scroll, this.scroll_data)
    }

    private initScroll(scroll: MyScrollView, data: any[]) {
        if (scroll.content.childrenCount > 0) {
            scroll.ClearData()
            scroll.numItems = data.length
        } else {
            scroll.setTemplateItem()
            scroll.numItems = data.length
        }
    }

    /**
     * 刷新单个tem状态
     * @param node
     * @param index
     */
    onScrollItemUpdate(node: cc.Node, index: number) {
        if (node && this.scroll_data[index]) {
            node.getComponent(MailRewardItem).updateView(this.scroll_data[index], this.isGetAward)
        }
    }

    // update (dt) {}
}
