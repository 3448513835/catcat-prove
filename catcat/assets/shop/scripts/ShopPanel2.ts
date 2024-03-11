import MyComponent from "../../Script/common/MyComponent"
import JSBManager from "../../Script/common/JSBManager"

const { ccclass, property } = cc._decorator;
@ccclass
export default class ShopPanel2 extends MyComponent {
    @property(cc.Label)
    private title_label: cc.Label = null;
    @property(cc.Label)
    private clock_label: cc.Label = null;
    @property(cc.Label)
    private rate_label: cc.Label = null;
    @property(cc.Label)
    private price_label: cc.Label = null;
    @property(cc.Label)
    private ori_price_label: cc.Label = null;
    @property(cc.Node)
    private clock_node: cc.Node = null;
    @property(cc.Node)
    private layout: cc.Node = null;

    private data: any = null;

    onLoad () {
        this.listen(this._event_name.EVENT_ON_PAY_SUCCESS_CALLBACK, this.onShopOrderFinish, this);
    }

    private onShopOrderFinish (data) {
        let order_id = data.goods_id;
        if (order_id == this.data.id) {
            this.node.active = false;
        }
        this._utils.addShopFinishOrder(order_id);
        let json_data = this._json_manager.getJsonData(this._json_name.PAY_GIFT, order_id);
        let reward_list = this._utils.changeConfigData(json_data.index);
        this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
    }

    setData (data) {
        this.data = data;
        this.title_label.string = data.tag_name;
        let end_tm = (new Date(data.discount_over_time+" 24:00:00")).getTime();
        this.schedule(() => {
            let tm = end_tm-Date.now();
            if (tm >= 0) {
                this.clock_label.string = this._utils.convertTime(tm/1000);
            }
            else {
                this.node.destroy();
            }
        }, 1/20);
        this.rate_label.string = (data.discount*10).toString();
        this.price_label.string = "¥"+data.price;
        this.ori_price_label.string = "¥"+(data.price/data.discount);
        let list = data.index.split(",");
        for (let node of this.layout.children) node.active = false;
        for (let i = 0; i < list.length; ++i) {
            let reward_list = list[i].split(":");
            let item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, reward_list[0]);
            let node = this.layout.children[i];
            if (cc.isValid(node) && item) {
                node.active = true;
                this._resource_manager.get(`pic/icon/${item.icon}`, cc.SpriteFrame).then((sprite_frame) => {
                    cc.find("Icon", node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
                });
                cc.find("Label", node).getComponent(cc.Label).string = "x"+reward_list[1];
            }
        }
    }

    private clickBuy () {
        console.log(this.data);
        JSBManager.setGoodsId(this.data.id);
        let user_id = this._user.getUID()
        let other = Date.now().toString() + Math.floor(Math.random() * 999)
        let order_num = `${user_id}${other}`
        let post_data = {
            order_num: order_num,
            goods_id: this.data.id,
            uid: user_id,
            type: 2,
        };
        this._net_manager.requestOrderRecode(post_data, () => {
            this._utils.submitOrder(this.data.tag_name, this.data.price, this.data.id, order_num);
        });
    }

}

