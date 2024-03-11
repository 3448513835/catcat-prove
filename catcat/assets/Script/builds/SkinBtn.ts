import { UserDefault } from "../common/Config";
import MyComponent from "../common/MyComponent";
import BuildConfig from "./BuildConfig";
import FacSkinGroup from "./FacSkinGroup";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SkinBtn extends MyComponent {

    @property(cc.Node)
    btn_close: cc.Node = null

    @property(cc.Node)
    btn_buy: cc.Node = null

    @property(cc.Node)
    btn_change: cc.Node = null

    private data = null
    private roomId: number = null
    private isSkinGroup: boolean = false

    onLoad() {
        this.listen(this._event_name.EVENT_REMOVE_FAC_SKIN_BTN, this.removeNode, this)
        this.listen(this._event_name.EVENT_CLICK_SKIN_ITEM, this.clickSkinItem, this)
        this.listen(this._event_name.SOCKET_ROOM_FAC_USE_SKIN, this.useSkinBack, this)
    }

    start() {

    }

    private removeNode() {
        this.node.destroy()
    }

    private clickClose() {
        if (this.isSkinGroup) {
            this._event_manager.dispatch(this._event_name.EVENT_SHOW_SINGLE_SKIN_ITEM, { isShow: false })
            let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
            if (skin_data) {
                skin_data = JSON.parse(skin_data)
                let facId = this.data["own_facility"]
                let cur_skin_data = skin_data[facId]
                if (cur_skin_data && cur_skin_data["use_skin_id"]) {
                    let item_data = this._json_manager.getJsonData(this._json_name.FACILITY_SKIN, cur_skin_data["use_skin_id"])
                    let data = {
                        facId: item_data["own_facility"],
                        skin_num: item_data["set"],
                        skin_id: item_data["id"],
                    }
                    this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, data)

                    let temp_data = FacSkinGroup.instance.cur_change_skin_data
                    temp_data[item_data["own_facility"]] = item_data["id"]
                }

            }
        } else {
            this._event_manager.dispatch(this._event_name.EVENT_REMOVE_FAC_SKIN_VIEW)
            this._event_manager.dispatch(this._event_name.EVENT_SKIN_SHOW_UI, false)
        }

        this.node.destroy()
    }

    private clickBuy() {
        this._dialog_manager.openDialog(this._dialog_name.SkinBuyView, { data: this.data, roomId: this.roomId, isSkinGroup: this.isSkinGroup })
    }

    private clickChange() {
        let is_use = this.data["is_use"]
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 17) {
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideMask(true);
            this._guide_manager.triggerGuide();
        }
        if (is_use) {
            if (this.isSkinGroup) {
                this._event_manager.dispatch(this._event_name.EVENT_SHOW_SINGLE_SKIN_ITEM, { isShow: false })
            } else {
                this._event_manager.dispatch(this._event_name.EVENT_REMOVE_FAC_SKIN_VIEW)
                this._event_manager.dispatch(this._event_name.EVENT_SKIN_SHOW_UI, false)
            }
            this.node.destroy()
        } else {
            let facId = this.data["own_facility"]
            let skin_id = this.data["id"]
            this._net_manager.roomFacUseSkin(facId, skin_id)
        }
    }

    private useSkinBack(data) {
        // cc.error(data, "useSkinBack==========")
        let facility_id = data["facility_id"]
        let facility_skin = Number(data["use"])
        let roomId = data["roomId"]

        if (this.isSkinGroup) {
            let data = FacSkinGroup.instance.cur_change_skin_data
            data[facility_id] = facility_skin
        } else {
            let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
            if (skin_data) {
                skin_data = JSON.parse(skin_data)
                let fac_skin_data = skin_data[facility_id]
                fac_skin_data["use_skin_id"] = facility_skin

                UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))
            }
        }
        if (this.isSkinGroup) {
            this._event_manager.dispatch(this._event_name.EVENT_SHOW_SINGLE_SKIN_ITEM, { isShow: false })
        } else {
            this._event_manager.dispatch(this._event_name.EVENT_REMOVE_FAC_SKIN_VIEW)
            this._event_manager.dispatch(this._event_name.EVENT_SKIN_SHOW_UI, false)
        }

        this.node.destroy()
    }

    public clickSkinItem(eventData) {
        // cc.error(eventData, "skinbtn===========")
        let data = eventData["data"]
        this.data = data
        this.isSkinGroup = eventData["isSkinGroup"]
        this.roomId = eventData["roomId"]
        let is_have = data["is_have"]
        this.btn_buy.active = !is_have
        this.btn_change.active = is_have
    }

    // update (dt) {}
}
