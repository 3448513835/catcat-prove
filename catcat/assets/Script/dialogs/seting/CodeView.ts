import MyComponent from "../../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class CodeView extends MyComponent {

    @property(cc.EditBox)
    edit: cc.EditBox = null

    // onLoad () {}

    start () {

    }

    private clickGet() {
        let str = this.edit.string
        if (str.length > 0) {
            let data = {
                uid: this._user.getUID,
                exchange: str
            }
            let func = (isSucceed, response) => {
                response = JSON.parse(response)
                let code = response["code"]
                if (code == 1) {
                    let reward = response["data"]
                    this._dialog_manager.openDialog(this._dialog_name.RewardView, reward)
                }else {
                    this._dialog_manager.showTipMsg(response["msg"])
                }
                
            }
            this._net_manager.requestDuiHuanMa(data, func)
        }
    }

    private clickPaste() {
        
    }

    // update (dt) {}
}
