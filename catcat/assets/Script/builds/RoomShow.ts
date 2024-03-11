import MyComponent from "../common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomShow extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    private data = null
    private room_name = {
        101: 1,
        102: 2,
        103: 3,
        104: 4,
        105: 5,
        106: 6,
        107: 7,
        108: 8,
        109: 9,
    }

    onLoad() {
        this.data = this.getDialogData()
        let roomId = this.data["roomId"]
        let path = `pic/room_show/${this.room_name[roomId]}`
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
            }
        })
    }


    start() {

    }

    private btnSave() {

    }

    private btnShare() {

    }

    onDestroy() {
        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1011,
            args: [this.data.roomId],
        })
        super.onDestroy && super.onDestroy()
    }

    // update (dt) {}
}
