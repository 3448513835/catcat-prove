import MyComponent from "../../Script/common/MyComponent"
import { ShopItem } from "./MergeDataInterface2d"
import MergeData from "./MergeData2d"
import GameConstant from "../../Script/common/GameConstant"

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeShopItem extends MyComponent {
    @property(cc.Sprite)
    private icon_sprite: cc.Sprite = null;
    @property(cc.Sprite)
    private button_sprite: cc.Sprite = null;
    @property([cc.SpriteFrame])
    private button_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Label)
    private count_label: cc.Label = null;
    @property(cc.Label)
    private rest_label: cc.Label = null;
    @property(cc.Node)
    private tip_node: cc.Node = null;
    // @property(cc.SpriteFrame)
    // private video_spriteframe: cc.SpriteFrame = null;

    private video_spriteframes: cc.SpriteFrame[] = null;
    private data: ShopItem = null;

    public setData (data: ShopItem, video_spriteframes: cc.SpriteFrame[]) {
        this.data = data;
        this.video_spriteframes = video_spriteframes;
        let icon_url = null;
        if (this.data.reward_type == 1) { // 元素
            let item_json = this._json_manager.getJsonData(this._json_name.ELE_2D, this.data.reward);
            icon_url = "merge2d/ele/"+item_json.icon;
            this.tip_node.active = true;
            this.icon_sprite.node.setContentSize(250, 250);
        }
        else if (this.data.reward_type == 2) { // 物品
            let item_json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, this.data.reward);
            icon_url = "pic/icon/"+item_json.icon;
            this.tip_node.active = false;
            this.icon_sprite.node.setContentSize(125, 125);
        }
        this.count_label.string = this.data.sum.toString();
        let rest_count = this.data.day_buy-this.data.buy_count;
        this.rest_label.string = `剩余${rest_count}次`;
        this.button_sprite.spriteFrame = this.button_spriteframes[(rest_count == 0)? 0:1];
        let button_sprite = cc.find("Icon", this.button_sprite.node).getComponent(cc.Sprite);
        let button_label = cc.find("Label", this.button_sprite.node).getComponent(cc.Label);
        if (rest_count == 0) {
            button_sprite.node.active = false;
            button_label.string = "售罄";
            button_label.node.x = 0;
        }
        else {
            button_sprite.node.active = true;
            button_label.node.x = 25;
            if (this.data.buy_type == 1) { // 视频
                // button_sprite.spriteFrame = this.video_spriteframe;
                button_sprite.spriteFrame = video_spriteframes[(this._user.getVideo() > 0)? 1:0];
                button_label.string = "免费";
            }
            else {
                let cost_list = this.data.cost_sum.split(":");
                let cost_json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_list[0]);
                button_label.string = cost_list[1];
                this._resource_manager.getSpriteFrame(`pic/icon/${cost_json.icon}`).then((sprite_frame) => {
                    if (cc.isValid(button_sprite)) {
                        this.addSpriteFrameRef(sprite_frame);
                        button_sprite.spriteFrame = sprite_frame;
                    }
                });
            }
        }

        this._resource_manager.getSpriteFrame(icon_url).then((sprite_frame) => {
            if (cc.isValid(this.icon_sprite)) {
                this.addSpriteFrameRef(sprite_frame);
                this.icon_sprite.spriteFrame = sprite_frame;
                if (icon_url.indexOf("merge2d") != -1) {
                    let pos = sprite_frame.getOffset();
                    this.icon_sprite.node.x = -pos.x*0.5;
                    this.icon_sprite.node.y = 58-pos.y*0.5;
                }
            }
        }).catch(() => {
            console.log(this.data.reward);
        });
    }

    public refrushVideoCard (video_spriteframes: cc.SpriteFrame[]) {
        let rest_count = this.data.day_buy-this.data.buy_count;
        let button_sprite = cc.find("Icon", this.button_sprite.node).getComponent(cc.Sprite);
        if (rest_count != 0 && this.data.buy_type == 1) {
            button_sprite.spriteFrame = video_spriteframes[(this._user.getVideo() > 0)? 1:0];
        }
    }

    private clickIcon () {
        this._event_manager.dispatch(this._event_name.EVENT_MERGE_SHOP_MSG, { 
            shop_data: this.data,
            pos: this.node.parent.convertToWorldSpaceAR(this.node.position),
        });
    }

    private clickBuy () {
        if (this.data.buy_count >= this.data.day_buy) { return; } // 售罄
        let buy_success = () => {
            this.data.buy_count += 1;
            this.setData(this.data, this.video_spriteframes);
            this._event_manager.dispatch(this._event_name.EVENT_MERGE_SHOP_BUY, this.data);
            if (this.data.reward_type == 1) { // 元素
                /* null */
            }
            else if (this.data.reward_type == 2) { // 物品
                let data = {
                    pos_w: this.node.parent.convertToWorldSpaceAR(this.node.position),
                    item_id: this.data.reward,
                    item_num: this.data.sum,
                };
                this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
            }
            this._dialog_manager.showTipMsg("购买成功!");
        };
        if (this.data.buy_type == 1) { // 视频
            if (this._user.getVideo() > 0) {
                this._utils.addResNum(GameConstant.res_id.video, -1);
                buy_success();
            }
            else {
                this._ad_manager.setAdCallback(() => {
                    this._net_manager.requestTablog(this._config.statistic.MERGE_SHOP1+this.data.id);
                    buy_success();
                });
                this._net_manager.requestTablog(this._config.statistic.MERGE_SHOP0+this.data.id);
                this._ad_manager.showAd();
            }
        }
        else {
            let cost_id: any = null, cost_num: any = null;
            [cost_id, cost_num] = this.data.cost_sum.split(":");
            cost_id = Number(cost_id); cost_num = Number(cost_num);
            let has_num = this._utils.getMyNumByItemId(cost_id);
            if (has_num >= cost_num) {
                this._utils.addResNum(cost_id, -cost_num);
                buy_success();
            }
            else {
                this._dialog_manager.openDialog(this._dialog_name.VideoView);
            }
        }
    }
}
