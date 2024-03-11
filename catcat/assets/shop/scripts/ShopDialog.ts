import MyComponent from "../../Script/common/MyComponent"
import ShopPanel1 from "./ShopPanel1"
import ShopPanel2 from "./ShopPanel2"

const { ccclass, property } = cc._decorator;
@ccclass
export default class ShopDialog extends MyComponent {
    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.Prefab)
    private shop_panel1: cc.Prefab = null;
    @property(cc.Prefab)
    private shop_panel2: cc.Prefab = null;

    onLoad () {
        super.onLoad && super.onLoad();
        // this.listen(this._event_name.SOCKET_CHARGE_ORDER_LIST, this.onChargeOrderList, this);
        // this._net_manager.requestChargeOrderList("1");
        let pay_gift = this._json_manager.getJson(this._json_name.PAY_GIFT);
        let now = Date.now();
        let list = [];
        // this._utils.addShopFinishOrder(20001);
        let finish_list = this._utils.getShopFinishOrderList();
        for (let key in pay_gift) {
            let value = pay_gift[key];
            let start = (new Date(value.discount_start_time+" 00:00:00")).getTime();
            let end = (new Date(value.discount_over_time+" 24:00:00")).getTime();
            if (now >= start && now <= end && (finish_list.indexOf(value.id) == -1)) {
                let shop_panel2 = cc.instantiate(this.shop_panel2);
                shop_panel2.parent = this.content;
                shop_panel2.getComponent(ShopPanel2).setData(value);
            }
        }
        let pay_shop_list = {};
        let pay_shop = this._json_manager.getJson(this._json_name.PAY_SHOP);
        for (let key in pay_shop) {
            let value = pay_shop[key];
            if (!pay_shop_list[value.item_id]) { pay_shop_list[value.item_id] = []; }
            pay_shop_list[value.item_id].push(value);
        }
        for (let key in pay_shop_list) {
            pay_shop_list[key].sort((a, b) => { return a.ex_price-b.ex_price; });
            let shop_panel1 = cc.instantiate(this.shop_panel1);
            shop_panel1.parent = this.content;
            shop_panel1.getComponent(ShopPanel1).setData(pay_shop_list[key]);
        }
    }

    private onChargeOrderList (data) {
        console.log("onChargeOrderList", data);
    }
}
