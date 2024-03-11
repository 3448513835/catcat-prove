import { UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";
import { User } from "../../common/User";
// import Mint from 'mint-filter'


const { ccclass, property } = cc._decorator;

@ccclass
export default class ChangeName extends MyComponent {

    @property(cc.EditBox)
    edit: cc.EditBox = null

    @property(cc.Label)
    ttf_tip: cc.Label = null

    @property(cc.Node)
    node_item: cc.Node = null

    @property(cc.Sprite)
    need_icon: cc.Sprite = null

    @property(cc.Label)
    need_num: cc.Label = null

    private change_num: number = 0
    // private mint: any = null;

    onLoad () {
        this.listen(this._event_name.SOCKET_USER_CHANGE_NAME, this.changeName, this)
        let json = this._json_manager.getJson(this._json_name.SENSITIVE);
        // this.mint = new Mint(json.words);
        this.edit.node.on("editing-did-ended", this.check, this);
        this.edit.node.on("text-changed", this.check, this);
        this.edit.node.on("editing-return", this.check, this);
    }

    private check () {
         // console.log(this.mint.filter(this.edit.string));
        // this.edit.string = this.mint.filter(this.edit.string).text;
    }

    start() {
        let str_name = UserDefault.getItem(User.getUID() + GameConstant.USER_NAME) || ""
        this.edit.string = str_name

        this.change_num = UserDefault.getItem(User.getUID() + GameConstant.CHANGE_NAME_NUM) || 0
        // cc.error(this.change_num, "num========")
        // this.change_num = 1
        if (this.change_num == 0) {
            this.ttf_tip.node.active = true
            this.node_item.active = false
        } else {
            this.ttf_tip.node.active = false
            this.node_item.active = true
            let json_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10008)
            let str_para = json_data["str_para"]
            let arr = str_para.split(":")
            let item_json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, arr[0])
            this._utils.setSpriteFrame(this.need_icon, `pic/icon/${item_json["icon"]}`)
            this.need_num.string = arr[1]
        }
    }

    private clickSure() {
        let str = this.edit.string
        if (str.indexOf("*") != -1) {
            this._dialog_manager.showTipMsg("名字中不能包含敏感词！");
        }
        else if (str.length > 0) {
            if (this.change_num == 0) {
                this._net_manager.requestChangeName(str)
            } else {
                let json_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10008)
                let str_para = json_data["str_para"]
                let arr = str_para.split(":")
                let need_num = arr[1]
                let my_num = this._utils.getMyNumByItemId(Number(arr[0]))
                if (my_num >= need_num) {
                    this._net_manager.requestChangeName(str)
                }else {
                    let str = this._utils.getTipStrById(10004)
                    this._dialog_manager.showTipMsg(str)
                }
            }
        }
        // cc.error(this.edit.string, "string=========")
    }

    private changeName(data) {
        let str = this._utils.getTipStrById(10003)
        this._dialog_manager.showTipMsg(str)
        UserDefault.setItem(User.getUID() + GameConstant.USER_NAME, this.edit.string)
        UserDefault.setItem(User.getUID() + GameConstant.CHANGE_NAME_NUM, this.change_num + 1)
        this._event_manager.dispatch("change_name")
        this.close()
    }

    // update (dt) {}
}
