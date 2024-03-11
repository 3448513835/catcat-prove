import { UserDefault } from "../common/Config";
import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import BuildConfig from "./BuildConfig";
import FacSkinGroupPreview from "./FacSkinGroupPreview";
import FacSkinGroupRoom from "./FacSkinGroupRoom";
import FacSkinGroupSkin from "./FacSkinGroupSkin";
import FacSkinGroupTaoZhuang from "./FacSkinGroupTaoZhuang";
import SkinGroupSingItem from "./SkinGroupSingItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class FacSkinGroup extends MyComponent {

    @property(FacSkinGroupTaoZhuang)
    facSkinGroupTaoZhuang: FacSkinGroupTaoZhuang = null

    @property(FacSkinGroupRoom)
    facSkinGroupRoom: FacSkinGroupRoom = null

    @property(FacSkinGroupSkin)
    facSkinGroupSkin: FacSkinGroupSkin = null

    @property(SkinGroupSingItem)
    skinGroupSingItem: SkinGroupSingItem = null

    @property(FacSkinGroupPreview)
    facSkinGroupPreview: FacSkinGroupPreview = null

    @property(cc.Node)
    btn_preview: cc.Node = null

    @property(cc.Node)
    btn_change: cc.Node = null

    @property(cc.Node)
    btn_back: cc.Node = null

    @property(cc.Node)
    btn_save: cc.Node = null

    private cur_skin_group_data = null
    /** 本次操作变化的皮肤数据 */
    public cur_change_skin_data = {}

    public static instance: FacSkinGroup = null
    onLoad() {
        FacSkinGroup.instance = this

        this.node.height = cc.view.getVisibleSize().height
        this.node.width = cc.view.getVisibleSize().width

        this.listen(this._event_name.EVENT_SHOW_SINGLE_SKIN_ITEM, this.showSingSkinItem, this)
    }

    start() {
        let func = () => {
            this.btn_back.active = true
            this.btn_save.active = true
        }
        this.facSkinGroupTaoZhuang.show(func)
    }

    onDestroy() {
        FacSkinGroup.instance = null
        super.onDestroy && super.onDestroy()
        // this.destroy()
    }

    private clickBack() {
        if (this.facSkinGroupSkin.getIsshow()) {
            this.facSkinGroupSkin.hide()
            this.setTopBtnState(false)
            this.cur_skin_group_data = null
            MapGridView.instance.setSkinGroupState(0)
        }
        else if (this.facSkinGroupRoom.getIsshow()) {
            this.facSkinGroupRoom.hide()
            this.setTopBtnState(false)
        }
        else if (this.facSkinGroupTaoZhuang.getIsshow()) {
            if (Object.keys(this.cur_change_skin_data).length > 0) {
                this.showIsSave()
            }else {
                let func = () => {
                    this._event_manager.dispatch(this._event_name.EVENT_SKIN_SHOW_UI, false)
                    this.btn_back.active = false
                    this.btn_save.active = false
                    this.node.destroy()

                    MapGridView.instance.is_have_skin_group = false
                    MapGridView.instance.setSkinGroupState(0)
                }
                this.facSkinGroupTaoZhuang.hide(func)
            }
        }
    }

    private showIsSave() {
        let sure_func = () => {
            this.clickSave()
        }
        let cancel_func = () => {
            let func = () => {
                if (Object.keys(this.cur_change_skin_data).length > 0) {
                    let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
                    if (skin_data) {
                        skin_data = JSON.parse(skin_data)
                        for (const key in this.cur_change_skin_data) {
                            if (Object.prototype.hasOwnProperty.call(this.cur_change_skin_data, key)) {
                                const skinId = this.cur_change_skin_data[key]
                                if (skin_data[key]) {
                                    let use_skin_id = skin_data[key]["use_skin_id"]
                                    let item_data = this._json_manager.getJsonData(this._json_name.FACILITY_SKIN, use_skin_id)
                                    let data = {
                                        facId: item_data["own_facility"],
                                        skin_num: item_data["set"],
                                        skin_id: item_data["id"],
                                    }
                                    this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, data)
                                }
                            }
                        }
        
                        UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))
                    }
                    
                }
                
                this._event_manager.dispatch(this._event_name.EVENT_SKIN_SHOW_UI, false)
                this.btn_back.active = false
                this.btn_save.active = false
                this.node.destroy()

                MapGridView.instance.is_have_skin_group = false
                MapGridView.instance.setSkinGroupState(0)
            }
            this.facSkinGroupTaoZhuang.hide(func)
        }

        this._dialog_manager.openTipDialog("当前修改尚未保存，是否保存当前修改？", sure_func, cancel_func, "保存修改", "放弃保存")
    }

    private clickSave() {
        if (Object.keys(this.cur_change_skin_data).length > 0) {
            let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
            if (skin_data) {
                skin_data = JSON.parse(skin_data)
                for (const key in this.cur_change_skin_data) {
                    if (Object.prototype.hasOwnProperty.call(this.cur_change_skin_data, key)) {
                        const skinId = this.cur_change_skin_data[key]
                        if (skin_data[key]) {
                            skin_data[key]["use_skin_id"] = skinId
                        }
                    }
                }

                UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))
            }
            
        }
        let func = () => {
            this._event_manager.dispatch(this._event_name.EVENT_SKIN_SHOW_UI, false)
            this.btn_back.active = false
            this.btn_save.active = false
            this.node.destroy()

            MapGridView.instance.is_have_skin_group = false
            MapGridView.instance.setSkinGroupState(0)
        }
        this.facSkinGroupTaoZhuang.hide(func)
    }

    private clickPreview() {
        this.setPreview(true)
    }

    private clickChange() {
        let sure_func = () => {
            this.changeHaveSkin()
        }
        let cancel_func = () => {

        }

        this._dialog_manager.openTipDialog("是否更换当前套装的所有皮肤？", sure_func, cancel_func)
    }

    public setPreview(isShow: boolean) {
        this.facSkinGroupTaoZhuang.node.active = !isShow
        this.facSkinGroupRoom.node.active = !isShow
        this.facSkinGroupSkin.node.active = !isShow
        this.skinGroupSingItem.node.active = isShow
        this.btn_back.active = !isShow
        this.btn_save.active = !isShow
        this.btn_preview.active = !isShow
        this.btn_change.active = !isShow

        this.facSkinGroupPreview.node.active = isShow
        if (this.cur_skin_group_data && isShow) {
            this.facSkinGroupPreview.initView(this.cur_skin_group_data)
            this.changePreviewSkin()
        }
    }

    private showSingSkinItem(data) {
        let isShow = data["isShow"]
        this.facSkinGroupTaoZhuang.node.active = !isShow
        this.facSkinGroupRoom.node.active = !isShow
        this.facSkinGroupSkin.node.active = !isShow
        this.skinGroupSingItem.node.active = isShow
        this.btn_back.active = !isShow
        this.btn_save.active = !isShow
        this.btn_preview.active = !isShow
        this.btn_change.active = !isShow
        if (isShow) {
            this.skinGroupSingItem.initView(data)

            MapGridView.instance.setSkinGroupState(1)
            MapGridView.instance.setCurSkinGroupSet(data["skin_num"])
            MapGridView.instance.setCurGroupSkinFacId(data["facId"])
        }else {
            MapGridView.instance.setSkinGroupState(0)
        }
    }

    public setTopBtnState(isShow: boolean) {
        this.btn_preview.active = isShow
        this.btn_change.active = isShow
    }

    public setCurSkinGroupData(data) {
        this.cur_skin_group_data = data
    }

    public changeUseSkin() {
        if (this.cur_skin_group_data) {
            let need_fac_list = []
            let roomId = this.cur_skin_group_data["room"]
            let json_fac = this._json_manager.getJson(this._json_name.FACILITY)
            for (const key in json_fac) {
                if (Object.prototype.hasOwnProperty.call(json_fac, key)) {
                    const fac_data = json_fac[key]
                    let owning_room = fac_data["owning_room"]
                    if (roomId == owning_room) {
                        need_fac_list.push(fac_data["id"])
                    }
                }
            }

            let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
            if (skin_data) {
                skin_data = JSON.parse(skin_data)
            }else {
                skin_data = {}
            }
            for (let i = 0; i < need_fac_list.length; i++) {
                const facId = need_fac_list[i]
                if (skin_data[facId]) {
                    let use_skin_id = skin_data[facId]["use_skin_id"]
                    let item_data = this._json_manager.getJsonData(this._json_name.FACILITY_SKIN, use_skin_id)
                    let data = {
                        facId: item_data["own_facility"],
                        skin_num: item_data["set"],
                        skin_id: item_data["id"],
                    }
                    this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, data)
                }
            }
        }
    }

    private changePreviewSkin() {
        if (this.cur_skin_group_data) {
            let group = this.cur_skin_group_data["group"]
            let skin_json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
            let need_list = []
            for (const key in skin_json) {
                if (Object.prototype.hasOwnProperty.call(skin_json, key)) {
                    const item_data = skin_json[key]
                    let item_data_group = item_data["group"]
                    if (group == item_data_group) {
                        need_list.push(item_data)
                    }
                }
            }

            if (need_list.length > 0) {
                let roomId = this.cur_skin_group_data["room"]
                MapGridView.instance.moveToRoomPosByRoomId(roomId)
                for (let i = 0; i < need_list.length; i++) {
                    const item_data = need_list[i]

                    let data = {
                        facId: item_data["own_facility"],
                        skin_num: item_data["set"],
                        skin_id: item_data["id"],
                    }
                    this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, data)
                }
            }
        }
    }

    private changeHaveSkin() {
        if (this.cur_skin_group_data) {
            let group = this.cur_skin_group_data["group"]
            let skin_json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
            let temp_list = []
            for (const key in skin_json) {
                if (Object.prototype.hasOwnProperty.call(skin_json, key)) {
                    const item_data = skin_json[key]
                    let item_data_group = item_data["group"]
                    if (group == item_data_group) {
                        temp_list.push(item_data)
                    }
                }
            }
            let need_list = []
            let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
            if (skin_data) {
                skin_data = JSON.parse(skin_data)
                for (let i = 0; i < temp_list.length; i++) {
                    const item_data = temp_list[i]
                    let own_facility = item_data["own_facility"]
                    let fac_skin_data = skin_data[own_facility]
                    if (fac_skin_data) {
                        let skin_id = item_data["id"]
                        let have_skin_id_list: any[] = fac_skin_data["have_skin_id_list"]
                        if (have_skin_id_list.indexOf(skin_id) != -1) {
                            need_list.push(item_data)
                        }
                    }
                }
            }

            if (need_list.length > 0) {
                let roomId = this.cur_skin_group_data["room"]
                MapGridView.instance.moveToRoomPosByRoomId(roomId)
                for (let i = 0; i < need_list.length; i++) {
                    const item_data = need_list[i]
                    let facId = item_data["own_facility"]
                    let skin_id = item_data["id"]

                    // let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
                    // if (skin_data) {
                    //     skin_data = JSON.parse(skin_data)
                    //     if (!skin_data[facId]) {
                    //         skin_data[facId] = {
                    //             use_skin_id: skin_id,
                    //             have_skin_id_list: [skin_id]
                    //         }
                    //     } else {
                    //         let fac_skin_data = skin_data[facId]
                    //         let have_skin_id_list: any[] = fac_skin_data["have_skin_id_list"]
                    //         have_skin_id_list.push(skin_id)
                    //         fac_skin_data["use_skin_id"] = skin_id
                    //     }

                    //     UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))
                    // }


                    let data = {
                        facId: facId,
                        skin_num: item_data["set"],
                        skin_id: item_data["id"],
                    }
                    this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, data)

                    this.cur_change_skin_data[facId] = skin_id
                }
                let tip = this._json_manager.getJsonData(this._json_name.TIPS, 10007).tip
                this._dialog_manager.showTipMsg(tip)
            } else {
                let tip = this._json_manager.getJsonData(this._json_name.TIPS, 10008).tip
                this._dialog_manager.showTipMsg(tip)
            }
        }
    }

    public getCurChangeSkinData() {
        return this.cur_change_skin_data
    }

    // update (dt) {}
}
