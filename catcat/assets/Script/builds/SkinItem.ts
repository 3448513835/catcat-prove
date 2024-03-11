import MyComponent from "../common/MyComponent";
import BuildConfig from "./BuildConfig";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SkinItem extends MyComponent {

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
        // cc.error(data, "data-===========")
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
            // cc.error(unlock_cost, arr[0], arr[1], "dump-----------11")
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

    private clickBuy() {
        this.clickItem()
        this._dialog_manager.openDialog(this._dialog_name.SkinBuyView, {data: this.data, roomId: this.roomId})
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 15) {
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideMask(true);
        }
    }

    private clickItem() {
        this._event_manager.dispatch(this._event_name.EVENT_CLICK_SKIN_ITEM, {data: this.data, roomId: this.roomId})

        this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, {facId: this.data["own_facility"], skin_num: this.data["set"], skin_id: this.data["id"]})
    }

    public getId() {
        return this.data["id"]
    }

    public setSelectState(value: boolean) {
        if (value) {
            this.bg.spriteFrame = this.bg_frames[1]
        }else {
            this.bg.spriteFrame = this.bg_frames[0]
        }
    }

    // update (dt) {}
}
