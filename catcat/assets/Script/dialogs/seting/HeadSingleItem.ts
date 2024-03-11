import { UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";
import { User } from "../../common/User";


const {ccclass, property} = cc._decorator;

@ccclass
export default class HeadSingleItem extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Node)
    select: cc.Node = null

    @property(cc.Node)
    node_use: cc.Node = null

    @property(cc.Node)
    node_lock: cc.Node = null

    private data = null

    // onLoad () {}

    start () {

    }

    updateItem(data) {
        this.data = data
        let is_lock = data["is_lock"]
        if (is_lock) {
            this.node_lock.active = false
        }else {
            this.node_lock.active = true
        }

        let id = data["ID"]
        let use_head_id = UserDefault.getItem(User.getUID() + GameConstant.USE_HEAD_ID)
        if (id == use_head_id) {
            this.node_use.active = true
        }else {
            this.node_use.active = false
        }
    }

    private click() {
        this._event_manager.dispatch("click_head", {id: this.data["ID"]})
    }

    public getId() {
        return this.data["ID"]
    }

    public setSelectState(isSelect: boolean) {
        if (isSelect) {
            this.select.active = true
        }else {
            this.select.active = false
        }
    }

    public getData() {
        return this.data
    }

    public getIsLock() {
        return this.data["is_lock"]
    }

    // update (dt) {}
}
