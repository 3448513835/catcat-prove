import { UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";
import MyScrollView from "../../common/MyScrollView";
import { User } from "../../common/User";
import HeadItem from "./HeadItem";
import HeadSingleItem from "./HeadSingleItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ChangeHead extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(MyScrollView)
    scroll: MyScrollView = null

    @property(cc.Label)
    ttf_use: cc.Label = null

    @property(cc.Node)
    btn_change: cc.Node = null

    @property(cc.Node)
    btn_buy: cc.Node = null

    @property(cc.Sprite)
    btn_buy_icon: cc.Sprite = null

    @property(cc.Label)
    btn_buy_num: cc.Label = null

    @property(cc.Node)
    btn_lock: cc.Node = null

    @property(cc.Label)
    btn_lock_lv: cc.Label = null

    private head_list = []
    private scroll_data = null
    private cur_head_item: HeadSingleItem
    private local_head_data = {}

    onLoad () {
        this.listen("click_head", this.clickHead, this)
    }

    start () {
        this.initView()
    }

    private initView() {
        let local_use_head_id = UserDefault.getItem(User.getUID() + GameConstant.USE_HEAD_ID)
        if (!local_use_head_id) {
            local_use_head_id = 1001
            UserDefault.setItem(User.getUID() + GameConstant.USE_HEAD_ID, local_use_head_id)
        }
        let local_head_data = UserDefault.getItem(GameConstant.USER_HEAD_DATA)
        // cc.error(local_head_data, "local_head_data=========")
        if (!local_head_data) {
            local_head_data = {}
            let json = this._json_manager.getJson(this._json_name.PROFILE_PHOTO)
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    const item_data = json[key]
                    let unlock_type = item_data["unlock_type"]
                    let id = item_data["ID"]
                    if (unlock_type == 1) {
                        let lv = this._user.getLevel()
                        let need_lv = Number(item_data["unlock_value"])
                        if (lv >= need_lv) {
                            local_head_data[id] = true
                        }else {
                            local_head_data[id] = false
                        }
                    }else if (unlock_type == 2) {
                        local_head_data[id] = false
                    }
                }
            }

            UserDefault.setItem(GameConstant.USER_HEAD_DATA, JSON.stringify(local_head_data))
        }else {
            local_head_data = JSON.parse(local_head_data)
        }
        this.local_head_data = local_head_data
        let json = this._json_manager.getJson(this._json_name.PROFILE_PHOTO)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let is_lock = local_head_data[key]
                item_data["is_lock"] = is_lock
                this.head_list.push(item_data)
            }
        }
        this.head_list.sort((a, b) => {
            return a["ID"] - b["ID"]
        })

        this.scroll_data = this._utils.dataChangte(this.head_list, 4)
        this.initScroll(this.scroll, this.scroll_data)

        this.clickHead({id: local_use_head_id})
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
            node.getComponent(HeadItem).updateView(this.scroll_data[index])
        }
    }

    private clickHead(data) {
        let id = data["id"]
        let content_childs = this.scroll.content.children
        for (let i = 0; i < content_childs.length; i++) {
            const child = content_childs[i]
            let item_childs = child.children
            for (let j = 0; j < item_childs.length; j++) {
                const item_node = item_childs[j]
                if (item_node.active) {
                    let headSingleItem = item_node.getComponent(HeadSingleItem)
                    if (headSingleItem.getId() == id) {
                        headSingleItem.setSelectState(true)
                        this.cur_head_item = headSingleItem
                        this.setState()
                    }else {
                        headSingleItem.setSelectState(false)
                    }
                }
            }
        }
    }

    private getSingItemById(id: number): HeadSingleItem {
        let content_childs = this.scroll.content.children
        for (let i = 0; i < content_childs.length; i++) {
            const child = content_childs[i]
            let item_childs = child.children
            for (let j = 0; j < item_childs.length; j++) {
                const item_node = item_childs[j]
                if (item_node.active) {
                    let headSingleItem = item_node.getComponent(HeadSingleItem)
                    if (headSingleItem.getId() == id) {
                       return headSingleItem
                    }
                }
            }
        }

        return
    }

    private setState() {
        if (cc.isValid(this.cur_head_item)) {
            let id = this.cur_head_item.getId()
            let use_head_id = UserDefault.getItem(User.getUID() + GameConstant.USE_HEAD_ID)
            if (id == use_head_id) {
                this.ttf_use.node.active = true
                this.btn_buy.active = false
                this.btn_lock.active = false
                this.btn_change.active = false
            }else {
                if (this.cur_head_item.getIsLock()) {
                    this.ttf_use.node.active = false
                    this.btn_buy.active = false
                    this.btn_lock.active = false
                    this.btn_change.active = true
                }
                else {
                    let data = this.cur_head_item.getData()
                    let unlock_type = data["unlock_type"]
                    if (unlock_type == 1) {
                        let need_lv = data["unlock_value"]
                        this.ttf_use.node.active = false
                        this.btn_buy.active = false
                        this.btn_lock.active = true
                        this.btn_change.active = false
                        this.btn_lock_lv.string = `Lv.${need_lv}`
                    }
                    else if (unlock_type == 2) {
                        let need_res = data["unlock_value"]
                        let arr = need_res.split(":")
                        this.ttf_use.node.active = false
                        this.btn_buy.active = true
                        this.btn_lock.active = false
                        this.btn_change.active = false
                        let item_json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, arr[0])
                        this._utils.setSpriteFrame(this.btn_buy_icon, `pic/icon/${item_json["icon"]}`)
                        this.btn_buy_num.string = arr[1]
                    }
                }
            }
        }
    }

    private clickChange() {
        if (cc.isValid(this.cur_head_item)) {
            let old_use_id = UserDefault.getItem(User.getUID() + GameConstant.USE_HEAD_ID)
            let old_item = this.getSingItemById(old_use_id) 
        
            let id = this.cur_head_item.getId()
            UserDefault.setItem(User.getUID() + GameConstant.USE_HEAD_ID, id)
            this.setState()
            let data = this.cur_head_item.getData()
            this.cur_head_item.updateItem(data)

            if (cc.isValid(old_item)) {
                let data = old_item.getData()
                old_item.updateItem(data)
            }
            
            // todo 切换头像
        }
    }

    private clickBtnBuy() {
        if (cc.isValid(this.cur_head_item)) {
            let data = this.cur_head_item.getData()
            let need_res = data["unlock_value"]
            let arr = need_res.split(":")
            let need_num = Number(arr[1])
            let my_num = 0
            if (Number(arr[0]) == GameConstant.res_id.coin) {
                my_num = this._user.getGold()
            }
            else if (Number(arr[0]) == GameConstant.res_id.diamond) {
                my_num = this._user.getDiamond()
            }

            if (my_num >= need_num) {
                let id = this.cur_head_item.getId()
                this.local_head_data[id] = true
                let old_use_id = UserDefault.getItem(GameConstant.USE_HEAD_ID)
                let old_item = this.getSingItemById(old_use_id) 
                UserDefault.setItem(User.getUID() + GameConstant.USE_HEAD_ID, id)
                UserDefault.setItem(GameConstant.USER_HEAD_DATA, JSON.stringify(this.local_head_data))
                if (cc.isValid(old_item)) {
                    let data = old_item.getData()
                    old_item.updateItem(data)
                }
                data["is_lock"] = true
                this.cur_head_item.updateItem(data)
                this.setState()
                for (let i = 0; i < this.scroll_data.length; i++) {
                    const item_data = this.scroll_data[i]
                    for (let j = 0; j < item_data.length; j++) {
                        const single_data = item_data[j]
                        if (single_data["ID"] == id) {
                            single_data["is_lock"] = true
                            break
                        }
                    }
                }
                // todo 切换头像
            }else {
                this._dialog_manager.openDialog(this._dialog_name.VideoView)
            }
        }
    }

    // update (dt) {}
}
