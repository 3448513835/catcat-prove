import MyComponent from "../common/MyComponent";
import MyScrollView from "../common/MyScrollView";
import MapGridView from "../main/MapGridView";
import RoomMgr from "./RoomMgr";
import SkinGroupItem from "./SkinGroupItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class FacSkinGroupTaoZhuang extends MyComponent {

    @property(cc.Node)
    bg: cc.Node = null

    @property(MyScrollView)
    scroll: MyScrollView = null

    @property(cc.Label)
    tip_ttf: cc.Label = null

    private isShow: boolean = false
    private scroll_data = []

    // onLoad () {}

    start () {

    }

    private initView() {
        let need_list = []
        let room_json = this._json_manager.getJson(this._json_name.ROOM)
        for (const key in room_json) {
            if (Object.prototype.hasOwnProperty.call(room_json, key)) {
                const room_data = room_json[key]
                let roomId = room_data["id"]
                
                let isAllFaclock = MapGridView.instance.getRoomFacIsLockByRoomId(roomId) 
                if (isAllFaclock) {
                    need_list.push(room_data)
                }
            }
        }

        
        need_list.sort((a, b) => {
            return a["id"] - b["id"]
        })

        // cc.error(need_list, "need_list========")
        if (need_list.length <= 0) {
            this.tip_ttf.node.active = true
        }else {
            this.tip_ttf.node.active = false
            this.scroll_data = need_list
            this.initScroll(this.scroll, this.scroll_data)
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
        if (node && this.scroll_data[index]) {
            node.getComponent(SkinGroupItem).updateView(this.scroll_data[index], 1)
        }
    }

    public show(callBack?: Function) {
        this.isShow = true
        let height_half = cc.view.getVisibleSize().height / 2
        this.bg.y = -height_half - this.bg.height - 150
        let end_y = -height_half
        cc.tween(this.bg)
            .to(0.3, { y: end_y })
            .call(() => {
                this.initView()
                if (callBack) callBack()
            })
            .start()
    }

    public hide(callBack?: Function) {
        this.isShow = false
        let height_half = cc.view.getVisibleSize().height / 2
        let end_y = -height_half - this.bg.height - 150
        cc.tween(this.bg)
            .to(0.2, { y: end_y })
            .call(() => {
                if (callBack) callBack()
            })
            .start()
    }

    getIsshow() {
        return this.isShow
    }

    // update (dt) {}
}
