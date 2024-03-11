import MyComponent from "../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ShanGuang extends MyComponent {

    @property(cc.Animation)
    ani: cc.Animation = null

    private roomId: number = null

    onLoad () {
        this.ani.on("finished", () => {
            if (this.roomId) {
                this._dialog_manager.openDialog(this._dialog_name.RoomShow, {roomId: this.roomId})
            }
            this.node.destroy()
        })
    }

    start () {

    }

    init(data) {
        this.roomId = data["roomId"]
    }

    // update (dt) {}
}
