import MyComponent from "../../Script/common/MyComponent";
import MyScrollView from "../../Script/common/MyScrollView";
import MainItem from "./MainItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MailList extends MyComponent {

    @property(cc.Node)
    no_mail: cc.Node = null

    @property(MyScrollView)
    scroll: MyScrollView = null

    @property(cc.Label)
    mailNum: cc.Label = null

    @property(cc.Label)
    noMailNum: cc.Label = null

    private scroll_data = []

    onLoad() {
        this.listen(this._event_name.SOCKET_MAIL_LIST, this.mailData, this)
        
        this._net_manager.requestMailList()
    }

    start() {

    }

    private mailData(data) {
        // cc.error(data, "dadta=[===========")
        // data = []
        this.scroll_data = data
        if (this.scroll_data.length > 0) {
            this.no_mail.active = false
            this.scroll.node.active = true

            this.initScroll(this.scroll, this.scroll_data)
        } else {
            this.no_mail.active = true
            this.scroll.node.active = false
        }

        this.setNum()
    }

    private setNum() {
        this.mailNum.string = `${this.scroll_data.length}/100`
        this.noMailNum.string = `${this.getNoReadNum()}`
    }

    private getNoReadNum() {
        let num = 0
        for (let i = 0; i < this.scroll_data.length; i++) {
            const item_data = this.scroll_data[i]
            let state = item_data["status"]
            if (state == 0) {
                num += 1
            }
        }

        return num
    }

    private cancelAll() {
        this._net_manager.requestDelMail(null)
    }

    private getAll() {
        let list = []
        for (let i = 0; i < this.scroll_data.length; i++) {
            const item_data = this.scroll_data[i]
            let award = item_data["award"]
            if (award.length > 0) {
                //是否领取奖励 1 是 0 否
                let is_get_award = item_data["is_get_award"]
                if (is_get_award == 0) {
                    list.push(...award)
                }
            }
        }

        if (list.length > 0) {
            let temp_data = {}
            let copy_list = this._utils.clone(list)
            for (let i = 0; i < copy_list.length; i++) {
                const item_data = copy_list[i]
                let id = item_data["item_id"]
                if (temp_data[id]) {
                    let num = Number(temp_data[id]["item_num"]) + Number(item_data["item_num"])
                    temp_data[id]["item_num"] = num
                }else {
                    temp_data[id] = item_data
                }
            }
            let need_list = []
            for (const key in temp_data) {
                if (Object.prototype.hasOwnProperty.call(temp_data, key)) {
                    const item_data = temp_data[key]
                    need_list.push(item_data)
                }
            }
            this._dialog_manager.openDialog(this._dialog_name.RewardView, need_list)
            this._net_manager.requestGetMailAward(null)
            this._net_manager.requestReadMail(null)
        }
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
            node.getComponent(MainItem).updateView(this.scroll_data[index])
        }
    }

    // update (dt) {}
}
