import { UserDefault } from "../common/Config";
import MyComponent from "../common/MyComponent";
import MyScrollView from "../common/MyScrollView";
import BuildConfig from "./BuildConfig";
import SkinGroupItem from "./SkinGroupItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class FacSkinGroupRoom extends MyComponent {

    @property(cc.Node)
    bg: cc.Node = null

    @property(MyScrollView)
    scroll: MyScrollView = null

    @property(cc.Label)
    ttf_title: cc.Label = null

    private isShow: boolean = false
    private scroll_data = []

    private roomId:number = null
    
    // onLoad () {}

    start () {

    }

    private initView(roomId: number) {
        this.roomId = roomId
        let room_data = this._json_manager.getJsonData(this._json_name.ROOM, roomId)
        this.ttf_title.string = room_data["name"]

        this.checkSkinData()

        let need_list = []
        let skin_json = this._json_manager.getJson(this._json_name.FACILITY_SKIN_GROUP)
        for (const key in skin_json) {
            if (Object.prototype.hasOwnProperty.call(skin_json, key)) {
                const skin_data = skin_json[key]
                let room_id = skin_data["room"]
                if (roomId == room_id) {
                    need_list.push(skin_data)
                }
            }
        }

        this.scroll_data = need_list
        this.initScroll(this.scroll, this.scroll_data)
    }

    private checkSkinData() {
        let skin_json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        let list = []
        for (const key in skin_json) {
            if (Object.prototype.hasOwnProperty.call(skin_json, key)) {
                const item_data = skin_json[key]
                let facId = item_data["own_facility"]
                let fac_data = this._json_manager.getJsonData(this._json_name.FACILITY, facId)
                let own_room = fac_data["owning_room"]
                if (own_room == this.roomId) {
                    list.push(item_data)
                }
            }
        }

        let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (!skin_data) {
            skin_data = {}
            for (let i = 0; i < list.length; i++) {
                const item_data = list[i]
                let facId = item_data["own_facility"]
                if (!skin_data[facId]) {
                    let defaultSkinId = this.getDefaultSkinId(facId)
                    skin_data[facId] = {
                        use_skin_id: defaultSkinId,
                        have_skin_id_list: [defaultSkinId]
                    }
                }
            }
            UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))
        }
        else {
            skin_data = JSON.parse(skin_data)
            for (let i = 0; i < list.length; i++) {
                const item_data = list[i]
                let facId = item_data["own_facility"]
                
                if (!skin_data[facId]) {
                    let defaultSkinId = this.getDefaultSkinId(facId)
                    skin_data[facId] = {
                        use_skin_id: defaultSkinId,
                        have_skin_id_list: [defaultSkinId]
                    }
                }
            }

            UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))
        }
    }

    /**
     * 获取初始默认皮肤id
     */
    private getDefaultSkinId(facId: number): number {
        let skin_list = this.getSkinListByFacId(facId)
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
    private getSkinListByFacId(facId: number) {
        let skin_list = []
        let json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let own_facility = item_data["own_facility"]
                if (facId == own_facility) {
                    skin_list.push(item_data)
                }
            }
        }

        return skin_list
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
        if (node && this.scroll_data[index]) {
            node.getComponent(SkinGroupItem).updateView(this.scroll_data[index], 2)
        }
    }

    public show(roomId?: number) {
        this.node.active = true
        this.isShow = true
        let height_half = cc.view.getVisibleSize().height / 2
        this.bg.y = -height_half - this.bg.height - 150
        let end_y = -height_half
        cc.tween(this.bg)
            .to(0.3, { y: end_y })
            .call(() => {
                this.initView(roomId)
            })
            .start()
    }

    public hide() {
        this.isShow = false
        let height_half = cc.view.getVisibleSize().height / 2
        let end_y = -height_half - this.bg.height - 150
        cc.tween(this.bg)
            .to(0.2, { y: end_y })
            .call(() => {
                
            })
            .start()
    }

    getIsshow() {
        return this.isShow
    }

    // update (dt) {}
}
