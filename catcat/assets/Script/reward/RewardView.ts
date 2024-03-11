import MyComponent from "../common/MyComponent";
import MyScrollView from "../common/MyScrollView";
import MapGridView from "../main/MapGridView";
import RewardItem from "./RewardItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class RewardView extends MyComponent {

    @property(cc.Node)
    layout: cc.Node = null

    @property(MyScrollView)
    scroll: MyScrollView = null

    @property(cc.Prefab)
    item_node: cc.Prefab = null

    private scroll_data = []

    onLoad () {
        this.scroll_data = this.getDialogData()
        if (this.scroll_data.length > 3) {
            this.scroll.node.active = true
            this.layout.active = false

            this.initScroll(this.scroll, this.scroll_data)
        }else {
            this.scroll.node.active = false
            this.layout.active = true

            this.setLayout()
        }

        this._audio_manager.playEffect(this._audio_name.GONGXIHUODE)
    }

    start () {

    }

    private setLayout() {
        for (let i = 0; i < this.scroll_data.length; i++) {
            const item_data = this.scroll_data[i]
            let node = cc.instantiate(this.item_node)
            this.layout.addChild(node)
            node.getComponent(RewardItem).updateView(item_data)
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
            node.getComponent(RewardItem).updateView(this.scroll_data[index])
        }
    }

    // update (dt) {}
}
