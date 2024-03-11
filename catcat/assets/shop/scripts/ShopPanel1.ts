import MyComponent from "../../Script/common/MyComponent"
import ShopItem from "./ShopItem"

const { ccclass, property } = cc._decorator;
@ccclass
export default class ShopPanel1 extends MyComponent {
    @property(cc.Label)
    private title_label: cc.Label = null;
    @property(cc.Node)
    private layout: cc.Node = null;

    onLoad () {
        this.listen(this._event_name.EVENT_ON_PAY_SUCCESS_CALLBACK, this.onShopOrderFinish, this);
    }

    private onShopOrderFinish (data) {
        let order_id = data.goods_id;
        for (let node of this.layout.children) {
            node.getComponent(ShopItem).finishOrder(order_id);
        }
    }

    setData (list) {
        this.title_label.string = list[0].com_name;
        for (let node of this.layout.children) node.active = false;
        let finish_list = this._utils.getShopFinishOrderList();
        for (let i = 0; i < list.length; ++i) {
            let node = this.layout.children[i];
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.layout.children[0]);
                node.parent = this.layout;
            }
            if (cc.isValid(node)) {
                node.active = true;
                node.getComponent(ShopItem).setData(list[i]);
            }
            let first_node = cc.find("First", node);
            first_node.active = (finish_list.indexOf(list[i].com_id) == -1);
        }
        /* this.scheduleOnce(() => {
            if (list.length > 6) {
                this.node.height = (804-717)+this.layout.height;
            }
        }, 0); */
    }
}
