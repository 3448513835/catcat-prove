import { UserDefault } from "../common/Config";
import MyComponent from "../common/MyComponent";
import BuildConfig from "./BuildConfig";
import FacSkinGroup from "./FacSkinGroup";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SkinBuyView extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Sprite)
    btn_icon: cc.Sprite = null

    @property(cc.Label)
    btn_num: cc.Label = null

    @property(cc.Label)
    ttf_des: cc.Label = null

    @property(cc.Label)
    ttf_title: cc.Label = null

    private data = null
    private roomId: number = null
    private buy_id: number = null
    private buy_num: number = null
    private isSkinGroup: boolean = false

    onLoad() {
        let eventData = this.getDialogData()
        // cc.error(eventData, "buyview=-===========")
        this.data = eventData["data"]
        this.roomId = eventData["roomId"]
        this.isSkinGroup = eventData["isSkinGroup"]
        this.listen(this._event_name.SOCKET_ROOM_FAC_UNLOCK_SKIN, this.unlockSkin, this)
        this.listen(this._event_name.EVENT_OPENED_DIALOG, this.onOpenDialog, this);
    }

    start() {
        let data = this.data
        let unlock_cost = data["unlock_cost"]
        let arr = unlock_cost.split(":")
        let item_json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, arr[0])
        this._utils.setSpriteFrame(this.btn_icon, `pic/icon/${item_json["icon"]}`)
        this.btn_num.string = `x${arr[1]}`

        this.buy_id = Number(arr[0])
        this.buy_num = Number(arr[1])

        let set = data["set"]
        let path = ""
        if (set < 3) {
            path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/skin1/${data["icon"]}`
        } else {
            path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/skin${set}/${data["icon"]}`
        }
        this._utils.setSpriteFrame(this.icon, path)

        this.ttf_des.string = data["des"]
        this.ttf_title.string = data["name"]
    }

    private clickBtnBuy() {
        let my_num = this._utils.getMyNumByItemId(this.buy_id)
        // this.buy_num = 0
        if (my_num >= this.buy_num) {
            let facId = this.data["own_facility"]
            let skin_id = this.data["id"]
            this._net_manager.roomFacUnlockSkin(facId, skin_id)
            this._utils.addResNum(this.buy_id, -this.buy_num)
        } else {
            this._dialog_manager.showTipMsg("货币不足")
        }
    }

    private unlockSkin(data) {
        // cc.error(data, "unlockSkin==========")
        let facility_id = data["facility_id"]
        let facility_skin = Number(data["use"])
        let roomId = data["roomId"]

        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 16) {
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideMask(true);
            this._guide_manager.triggerGuide();
        }

        let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (skin_data) {
            skin_data = JSON.parse(skin_data)
            if (!skin_data[facility_id]) {
                skin_data[facility_id] = {
                    use_skin_id: facility_skin,
                    have_skin_id_list: [facility_skin]
                }
            } else {
                let fac_skin_data = skin_data[facility_id]
                let have_skin_id_list: any[] = fac_skin_data["have_skin_id_list"]
                have_skin_id_list.push(facility_skin)
                if (!this.isSkinGroup) {
                    fac_skin_data["use_skin_id"] = facility_skin
                }else {
                    let data = FacSkinGroup.instance.cur_change_skin_data
                    data[facility_id] = facility_skin
                }
            }

            UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))

            this._event_manager.dispatch(this._event_name.EVENT_REFRESH_CUR_SKIN_DATA)
            this._event_manager.dispatch(this._event_name.EVENT_REFRESH_CUR_GROUP_SKIN_DATA)

            this.data["is_have"] = true
            this.data["is_use"] = false
            if (this.isSkinGroup) {
                this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, { facId: this.data["own_facility"], skin_num: this.data["set"], skin_id: this.data["id"] })
                this._event_manager.dispatch(this._event_name.EVENT_CLICK_SKIN_ITEM, { data: this.data, roomId: this.roomId, isSkinGroup: this.isSkinGroup })
            }
        }

        let tip_str = this._utils.getTipStrById(10002)
        this._dialog_manager.showTipMsg(tip_str)

        this.close()
    }

    private onOpenDialog(data) {
        if (data.dialog_cfg.prefab == this._dialog_name.SkinBuyView.prefab) {
            this._guide_manager.triggerGuide();
        }
    }

    // update (dt) {}
}
