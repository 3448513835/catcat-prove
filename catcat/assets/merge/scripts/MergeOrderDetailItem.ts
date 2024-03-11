import MyComponent from "../../Script/common/MyComponent"
import { MergeData } from "./MergeData"

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeOrderDetailItem extends MyComponent {
    @property([cc.Node])
    private item_node_list: cc.Node[] = [];
    @property(cc.Label)
    private reward_label1: cc.Label = null;
    @property(cc.Sprite)
    private reward_sprite1: cc.Sprite = null;
    @property(cc.Label)
    private reward_label2: cc.Label = null;
    @property(cc.Sprite)
    private reward_sprite2: cc.Sprite = null;

    private order_id: number = null;
    private map_data = null;

    public setData (order_id: number, cell_count_list: any, map_data) {
        this.order_id = order_id;
        this.map_data = map_data;
        let json_data = this._json_manager.getJsonData(this._json_name.ORDER, this.order_id);
        let order_info_list = json_data.order_info.split(",");
        for (let i = 0; i < this.item_node_list.length; ++i) {
            this.item_node_list[i].active = (i < order_info_list.length);
        }
        for (let i = 0; i < order_info_list.length; ++i) {
            let [ele_id, ele_count] = order_info_list[i].split(":");
            let node = this.item_node_list[i];
            let icon_sprite = cc.find("Icon", node).getComponent(cc.Sprite);
            let icon_url = this._json_manager.getJsonData(this._json_name.ELE, ele_id).icon;
            this._resource_manager.getSpriteFrame(`merge/ele/${icon_url}`).then((sprite_frame) => {
                if (cc.isValid(icon_sprite)) {
                    icon_sprite.spriteFrame = sprite_frame;
                    let pos = sprite_frame.getOffset();
                    icon_sprite.node.x -= pos.x/2;
                    icon_sprite.node.y -= pos.y/2;
                }
            });
            let has_count = cell_count_list[ele_id] || 0;
            if (has_count >= ele_count) {
                cc.find("Finish", node).active = true;
                cc.find("Bg1", node).active = false;
                cc.find("Bg2", node).active = true;
            }
            else {
                cc.find("Bg1", node).active = true;
                cc.find("Bg2", node).active = false;
                cc.find("Finish", node).active = false;
            }
            cc.find("Label", node).getComponent(cc.Label).string = has_count+"/"+ele_count;
        }
        let reward_info_list = json_data.order_reward.split(",");
        let reward_info1 = reward_info_list[0].split(":");
        this.reward_label1.getComponent(cc.Label).string = reward_info1[1];
        this._utils.setSpriteFrame(
            this.reward_sprite1,
            `pic/icon/`+this._json_manager.getJsonData(this._json_name.ITEM_BASE, reward_info1[0]).icon
        );
        let reward_info2 = reward_info_list[1].split(":");
        this.reward_label2.getComponent(cc.Label).string = reward_info2[1];
        this._utils.setSpriteFrame(
            this.reward_sprite2,
            `pic/icon/`+this._json_manager.getJsonData(this._json_name.ITEM_BASE, reward_info2[0]).icon
        );
    }

    private click (event, param) {
        let json_data = this._json_manager.getJsonData(this._json_name.ORDER, this.order_id);
        let order_info = json_data.order_info.split(",")[Number(param)];
        let [id, _] = order_info.split(":");
        this._dialog_manager.openDialog(this._dialog_name.MergeElementDialog, {
            element_id: id,
            // map_data: this.map_data,
        });
    }
}
