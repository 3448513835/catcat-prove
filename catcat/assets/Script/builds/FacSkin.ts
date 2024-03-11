import { UserDefault } from "../common/Config";
import MyComponent from "../common/MyComponent";
import MyScrollView from "../common/MyScrollView";
import MapGridView from "../main/MapGridView";
import BuildConfig from "./BuildConfig";
import RoomMgr from "./RoomMgr";
import SkinItem from "./SkinItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class FacSkin extends MyComponent {

    @property(cc.Node)
    bg: cc.Node = null

    @property(cc.Label)
    ttf_title: cc.Label = null

    @property(MyScrollView)
    scroll: MyScrollView = null

    private roomId: number = null
    private facId: number = null
    private skin_list = null
    private select_skin_id: number = null

    onLoad() {
        this.node.height = cc.view.getVisibleSize().height
        this.node.width = cc.view.getVisibleSize().width

        this.listen(this._event_name.EVENT_REMOVE_FAC_SKIN_VIEW, this.removeNode, this)
        this.listen(this._event_name.EVENT_CLICK_SKIN_ITEM, this.clickSkinItem, this)
        this.listen(this._event_name.EVENT_REFRESH_CUR_SKIN_DATA, this.refreshView, this)
    }

    start() {
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 14) {
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideMask(true);
        }
        let height_half = cc.view.getVisibleSize().height / 2
        this.bg.y = -height_half - this.bg.height - 150
        let end_y = -height_half
        cc.tween(this.bg)
            .to(0.3, { y: end_y })
            .call(() => {
                this._guide_manager.triggerGuide();
            })
            .start()
    }

    init(roomId: number, facId: number) {
        this.roomId = roomId
        this.facId = facId
        this.skin_list = this.changeConfigData()
        this.addSkinBtn()
        // cc.error(this.skin_list, "list==========")
        this.initScroll(this.scroll, this.skin_list)
        this.setSelectItem()
    }

    changeFac(roomId: number, facId: number) {
        this.roomId = roomId
        this.facId = facId
        this.skin_list = this.changeConfigData()
        this.addSkinBtn()
        // cc.error(this.skin_list, "list==========")
        this.initScroll(this.scroll, this.skin_list)
        this.setSelectItem()
    }

    private refreshView() {
        this.skin_list = this.changeConfigData()
        // cc.error(this.skin_list, "list==========22")
        this.initScroll(this.scroll, this.skin_list)
        this.setSelectItem()
    }

    private setSelectItem() {
        if (this.select_skin_id) {
            for (let i = 0; i < this.skin_list.length; i++) {
                const item_data = this.skin_list[i]
                let id = item_data["id"]
                if (this.select_skin_id == id) {
                    this.clickSkinItem({data: item_data, roomId: this.roomId})
                    this._event_manager.dispatch(this._event_name.EVENT_CLICK_SKIN_ITEM, {data: item_data, roomId: this.roomId})
                    break
                }
            }
        }
    }

    private addSkinBtn() {
        let data
        for (let i = 0; i < this.skin_list.length; i++) {
            const item_data = this.skin_list[i]
            let is_use = item_data["is_use"]
            if (is_use) {
                data = item_data
                break
            }
        }
        if (data) {
            let temp_data = {
                roomId: this.roomId, 
                facId: this.facId,
                data: data
            }
            this.select_skin_id = data["id"]
            this._event_manager.dispatch(this._event_name.EVENT_ADD_FAC_SKIN_BTN, temp_data)
        }
    }

    private clickSkinItem(eventData) {
        let data = eventData["data"]
        let id = data["id"]
        let content_childs = this.scroll.content.children
        for (let i = 0; i < content_childs.length; i++) {
            const item_node = content_childs[i]
            if (item_node.active) {
                let skinItem = item_node.getComponent(SkinItem)
                if (skinItem.getId() == id) {
                    this.select_skin_id = id
                    skinItem.setSelectState(true)
                    this.ttf_title.string = data["name"]
                }else {
                    skinItem.setSelectState(false)
                }
            }
        }
    }

    private initScroll(scroll: MyScrollView, data: any[]) {
        if (scroll.content.childrenCount > 0) {
            scroll.ClearData()
            scroll.numItems = data.length
        } else {
            scroll.setTemplateItem()
            scroll.numItems = data.length
        }
    }

    /**
     * 刷新单个tem状态
     * @param node
     * @param index
     */
    onScrollItemUpdate(node: cc.Node, index: number) {
        if (node && this.skin_list[index]) {
            node.getComponent(SkinItem).updateView(this.skin_list[index], this.roomId)
        }
    }

    /**
     * 增加配置数据（是否拥有，解锁）
     */
    private changeConfigData() {
        let skin_data = this.initCurrentSkinData()
        let fac_skin_data = skin_data[this.facId]
        let skin_list = this.getSkinListByFacId()
        for (let i = 0; i < skin_list.length; i++) {
            const item_data = skin_list[i]
            let id = item_data["id"]
            if (fac_skin_data) {
                let use_skin_id = fac_skin_data["use_skin_id"]
                if (use_skin_id == id) {
                    item_data["is_use"] = true
                }else {
                    item_data["is_use"] = false
                }
                let have_skin_id_list: any[] = fac_skin_data["have_skin_id_list"]
                if (have_skin_id_list.indexOf(id) != -1) {
                    item_data["is_have"] = true
                }else {
                    item_data["is_have"] = false
                }
            }else {
                let unlock_cost = item_data["unlock_cost"]
                if (unlock_cost == "0") {
                    item_data["is_use"] = true
                    item_data["is_have"] = true
                }else {
                    item_data["is_use"] = false
                    item_data["is_have"] = false
                }
            }
        }

        return skin_list
    }

    /**
     * 初始皮肤数据
     */
    private initCurrentSkinData() {
        // UserDefault.removeItem(BuildConfig.fac_skin_data)
        let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (!skin_data) {
            skin_data = {}
        }else {
            skin_data = JSON.parse(skin_data)
        }
        // cc.error(skin_data, "skin_data==========")
        if (!skin_data[this.facId]) {
            let defaultSkinId = this.getDefaultSkinId()
            skin_data[this.facId] = {
                use_skin_id: defaultSkinId,
                have_skin_id_list: [defaultSkinId]
            }
        }

        // cc.error(skin_data, "skin_data============")
        UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))

        return skin_data
    }

    private removeNode() {
        let height_half = cc.view.getVisibleSize().height / 2
        let end_y = -height_half - this.bg.height - 150
        cc.tween(this.bg)
            .to(0.2, { y: end_y })
            .call(() => {
                this.node.destroy()
            })
            .start()
    }

    private closeAni() {
        this._event_manager.dispatch(this._event_name.EVENT_REMOVE_FAC_SKIN_VIEW)
        this._event_manager.dispatch(this._event_name.EVENT_REMOVE_FAC_SKIN_BTN)
    }

    private getUseSkinId() {
        let skin_id = null
        let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (!skin_data) {
            skin_id = this.getDefaultSkinId()
        }else {
            skin_data = JSON.parse(skin_data)
            if (!skin_data[this.facId]) {
                skin_id = this.getDefaultSkinId()
            }else {
                skin_id = skin_data[this.facId]["use_skin_id"]
            }
        }
        
        return skin_id
    }

    /**
     * 获取初始默认皮肤id
     */
    private getDefaultSkinId(): number {
        let skin_list = this.getSkinListByFacId()
        for (let i = 0; i < skin_list.length; i++) {
            const item_data = skin_list[i]
            let unlock_cost = item_data["unlock_cost"]
            if (unlock_cost == "0") {
                return item_data["id"]
            }
        }

        return
    }

    /**
     * 获取配置皮肤列表
     */
    private getSkinListByFacId() {
        let skin_list = []
        let json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let own_facility = item_data["own_facility"]
                if (this.facId == own_facility) {
                    skin_list.push(item_data)
                }
            }
        }

        return skin_list
    }

    onDestroy () {
        super.onDestroy && super.onDestroy()
        let use_skin_id = this.getUseSkinId()
        if (use_skin_id != this.select_skin_id) {
            let skin_data = this._json_manager.getJsonData(this._json_manager._json_name.FACILITY_SKIN, use_skin_id)
            this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, {facId: skin_data["own_facility"], skin_num: skin_data["set"], skin_id: use_skin_id})
        }
    }

    // update (dt) {}
}
