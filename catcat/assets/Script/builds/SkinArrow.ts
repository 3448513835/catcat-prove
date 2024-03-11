import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SkinArrow extends MyComponent {

    @property(cc.Animation)
    ani: cc.Animation = null

    private roomId: number = null
    private facId: number = null

    onLoad () {
        this.ani.on("finished", () => {
            this._event_manager.dispatch(this._event_name.EVENT_ADD_FAC_SKIN_VIEW, {roomId: this.roomId, facId: this.facId})
            this.node.destroy()
        })
    }

    start () {
        
    }

    init(roomId: number, facId: number) {
        this.roomId = roomId
        this.facId = facId
        this.ani.play()

        if (!MapGridView.instance.getIsAddSkinArrow()) {
            this.node.destroy()
        }
    }

    // update (dt) {}
}
