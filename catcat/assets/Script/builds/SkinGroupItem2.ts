import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import BuildConfig from "./BuildConfig";
import RoomMgr from "./RoomMgr";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SkinGroupItem2 extends MyComponent {

    @property(cc.Sprite)
    bg: cc.Sprite = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Node)
    btnBuy: cc.Node = null

    @property(cc.Sprite)
    btn_icon: cc.Sprite = null

    @property(cc.Label)
    btn_num: cc.Label = null

    @property(cc.Label)
    ttf_use: cc.Label = null

    @property(cc.Label)
    ttf_have: cc.Label = null

    @property([cc.SpriteFrame])
    bg_frames: cc.SpriteFrame[] = []

    private data = null
    private roomId = null

    // onLoad () {}

    start () {

    }

    updateView (data, roomId) {
        this.data = data
        this.roomId = roomId

        let is_have = data["is_have"]
        let is_use = data["is_use"]
        this.btnBuy.active = !is_have
        this.ttf_have.node.active = (is_have && !is_use)
        this.ttf_use.node.active = (is_have && is_use)

        if (!is_have) {
            let unlock_cost = data["unlock_cost"]
            let arr = unlock_cost.split(":")
            let item_json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, arr[0])
            this._utils.setSpriteFrame(this.btn_icon, `pic/icon/${item_json["icon"]}`)
            this.btn_num.string = `x${arr[1]}`
        }

        let set = data["set"]
        let path = ""
        if (set < 3) {
            path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[roomId]}/skin1/${data["icon"]}`
        }else {
            path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[roomId]}/skin${set}/${data["icon"]}`
        }
        
        this._utils.setSpriteFrame(this.icon, path)

        if (is_use) {
            this.bg.spriteFrame = this.bg_frames[1]
        }else {
            this.bg.spriteFrame = this.bg_frames[0]
        }
    }

    private clickItem() {
        this.moveToPos()
        let temp_data = {
            roomId: this.roomId, 
            facId: this.data["own_facility"],
            data: this.data,
            isSkinGroup: true
        }
        this._event_manager.dispatch(this._event_name.EVENT_ADD_FAC_SKIN_BTN, temp_data)

        let data = {
            facId: this.data["own_facility"],
            skin_num: this.data["set"],
            skin_id: this.data["id"],
        }
        this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, data)

        let event_data = {
            facId: this.data["own_facility"],
            skin_num: this.data["set"],
            isShow: true
        }
        this._event_manager.dispatch(this._event_name.EVENT_SHOW_SINGLE_SKIN_ITEM, event_data)
    }

    private clickBuy() {
        this.moveToPos()
        this._dialog_manager.openDialog(this._dialog_name.SkinBuyView, {data: this.data, roomId: this.roomId, isSkinGroup: true})
    }

    private moveToPos() {
        let roomFac = RoomMgr.instance.getRoomFac(this.roomId, this.data["own_facility"])
        let pos_w = roomFac.node.parent.convertToWorldSpaceAR(roomFac.node.position)
        let node = roomFac.node
        let map = MapGridView.instance.map
        let pos_n = map.convertToNodeSpaceAR(pos_w)

        let icon = roomFac.getIcon()
        let rect = icon.spriteFrame.getRect()
        let size = cc.view.getVisibleSize()
        let scale_width = size.width / (rect.width * 1.7)
        let scale_height = size.height / (rect.height * 1.7)
        let need_scale = scale_height > scale_width ? scale_width : scale_height
        
        let event_data = { 
            pos: pos_n, 
            isNotMoment: true, 
            node: node,
            callBack: () => {
                
            }, 
            need_scale: need_scale
        }
        this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, event_data)
    }

    // update (dt) {}
}
