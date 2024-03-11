import MyComponent from "../../Script/common/MyComponent"
import JSBManager from "../../Script/common/JSBManager"

const { ccclass, property } = cc._decorator;
@ccclass
export default class ShopItem extends MyComponent {
    private data: any = null;

    public setData (data) {
        this.data = data;
        let icon_sprite = cc.find("Icon", this.node).getComponent(cc.Sprite);
        this._resource_manager.get(`shop/texture/${data.com_picture}`, cc.SpriteFrame).then((sprite_frame) => {
            icon_sprite.spriteFrame = sprite_frame;
        });
        let count_label = cc.find("Count", this.node).getComponent(cc.Label);
        count_label.string = data.item_quantity;
        let first_count_label = cc.find("First/Count", this.node).getComponent(cc.Label);
        first_count_label.string = "+"+data.item_quantity;
        let cost_label = cc.find("Button/Label", this.node).getComponent(cc.Label);
        let ori_cost_label = cc.find("Button/Label2", this.node).getComponent(cc.Label);
        cost_label.string = "¥"+data.ex_price;
        ori_cost_label.string = "¥"+(data.ex_price/data.discount);
    }

    public finishOrder (order_id) {
        if (order_id == this.data.com_id) {
            let list = this._utils.getShopFinishOrderList();
            cc.find("First", this.node).active = false;
            let json_data = this._json_manager.getJsonData(this._json_name.PAY_SHOP, order_id);
            let reward_list = [{
                item_id: json_data.item_id,
                item_num: json_data.item_quantity,
            }];
            if (list.indexOf(order_id) == -1) {
                reward_list = [{
                    item_id: json_data.item_id,
                    item_num: 2*json_data.item_quantity,
                }];
            }
            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
            this._utils.addShopFinishOrder(order_id);
        }
    }

    private click () {
        console.log(this.data);
        JSBManager.setGoodsId(this.data.com_id);
        let user_id = this._user.getUID()
        let other = Date.now().toString() + Math.floor(Math.random() * 999)
        let order_num = `${user_id}${other}`
        let post_data = {
            order_num: order_num,
            goods_id: this.data.com_id,
            uid: user_id,
            type: 2,
        };
        this._net_manager.requestOrderRecode(post_data, () => {
            this._utils.submitOrder(this.data.com_name, this.data.ex_price, this.data.com_id, order_num);
        });
    }
}
