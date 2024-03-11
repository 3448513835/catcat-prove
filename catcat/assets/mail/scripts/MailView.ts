import MyComponent from "../../Script/common/MyComponent";
import MailInfo from "./MailInfo";
import MailList from "./MailList";


const {ccclass, property} = cc._decorator;

@ccclass
export default class MailView extends MyComponent {

    @property(MailList)
    mailList: MailList = null

    @property(MailInfo)
    mailInfo: MailInfo = null

    onLoad () {
        this.listen(this._event_name.EVENT_MAIL_INFO, this.showInfo,  this)
        this.listen(this._event_name.EVENT_MAIL_DEL_MAIL, this.delMail, this)
    }

    start () {

    }

    private showInfo(data) {
        this.mailList.node.active = false
        this.mailInfo.node.active = true

        this.mailInfo.initInfo(data)
    }

    private clickClose() {
        if (this.mailInfo.node.active) {
            this.mailInfo.node.active = false
            this.mailList.node.active = true
        }else {
            this.close()
        }
    }

    private delMail() {
        this.mailInfo.node.active = false
        this.mailList.node.active = true
    }

    // update (dt) {}
}
