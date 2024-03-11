
import { Holder } from "../adapter/abstract/Holder";
import { HolderEvent } from "../adapter/define/enum";
import MyComponent from "../../Script/common/MyComponent";
import PokedexCusGroupItem from "./PokedexCusGroupItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PokedexCusItem extends MyComponent {

    @property(cc.Sprite)
    bg: cc.Sprite = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    @property(cc.Node)
    template_item: cc.Node = null

    @property(cc.Layout)
    layout_item: cc.Layout = null

    private data = null
    private _holder: Holder = null
    private node_init_height: number = 54
    private template_item_height: number = 289
    private reward_change_list = []

    onLoad() {
        this.node.on(HolderEvent.CREATED, this.onCreated, this)
        this.node.on(HolderEvent.VISIBLE, this.onVisible, this)
        this.node.on(HolderEvent.DISABLE, this.onDisabled, this)
    }

    private onCreated() {

    }

    private onVisible(holder: Holder) {
        // cc.error("我收到了显示", holder.data)
        this.data = holder.data
        this._holder = holder

        this.ttf_name.string = this.data["group_name"]

        this.layout_item.node.removeAllChildren()
        let task_data = this.data["cus_list"]
        if (task_data.length > 0) {
            for (let i = 0; i < task_data.length; i++) {
                const item_data = task_data[i]
                let node_item = cc.instantiate(this.template_item)
                node_item.active = true
                node_item.getComponent(PokedexCusGroupItem).initItem(item_data)
                this.layout_item.node.addChild(node_item)
            }
            let y = this.layout_item.paddingTop + this.layout_item.paddingBottom
            y += task_data.length * (this.template_item_height + this.layout_item.spacingY)
            this.node.height = this.node_init_height + y
        } else {
            this.node.height = this.node_init_height
        }
        this.bg.node.height = this.node.height
    }

    private onDisabled() {

    }

    start() {
        
    }
}
