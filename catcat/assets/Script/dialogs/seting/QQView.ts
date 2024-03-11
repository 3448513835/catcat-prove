import { Config } from "../../common/Config";
import MyComponent from "../../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class QQView extends MyComponent {

    @property(cc.Label)
    qq_group: cc.Label = null

    // onLoad () {}

    start () {
        this.qq_group.string = this._config.QQ;
    }

    private clickCopyQQ() {
        this._utils.webCopyString(this.qq_group.string.toString())
        this._dialog_manager.showTipMsg("QQ群号已经复制到粘贴板")
    }

    // update (dt) {}
}
