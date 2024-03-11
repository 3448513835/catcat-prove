import MyComponent from "../../Script/common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class WelfareCenter extends MyComponent {

    // onLoad () {}

    start () {

    }

    private clickDailyAd(...params) {
        let index = Number(params[1])
        if (index == 1) {
            this._dialog_manager.openDialog(this._dialog_name.DialyAd)
        }
        else if (index == 2) {
            this._dialog_manager.openDialog(this._dialog_name.MonthCard)
        }
        
        this.close()
    }

    // update (dt) {}
}
