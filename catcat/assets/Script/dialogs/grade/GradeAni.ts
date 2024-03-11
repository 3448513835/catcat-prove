import MyComponent from "../../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GradeAni extends MyComponent {

    @property(cc.Label)
    view2_lv: cc.Label = null

    // onLoad () {}

    start () {

    }

    private setLv() {
        let cur_lv = this._user.getLevel()
        let json_lv = this._json_manager.getJson(this._json_name.PLAYER_LV)
        let length = Object.keys(json_lv).length
        if (cur_lv < length) {
            this.view2_lv.string = (cur_lv).toString()
        }
    }

    // update (dt) {}
}
