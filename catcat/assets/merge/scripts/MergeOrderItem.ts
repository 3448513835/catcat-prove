/*
 * 订单
 */
import MyComponent from "../../Script/common/MyComponent"
import MyButton from "../../Script/common/MyButton"
import { MergeData } from "./MergeData"
import { OrderData } from "./MergeDataInterface"
import GuideManager from "../../Script/common/GuideManager"

const MOVE_SPEED = 0.3;
const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeOrderItem extends MyComponent {
    @property(cc.Node)
    private reward_node: cc.Node = null;
    @property(cc.Node)
    private item_node1: cc.Node = null;
    @property(cc.Node)
    private item_node2: cc.Node = null;
    @property(cc.Node)
    private finish_node: cc.Node = null;

    private order_data: OrderData = null;
    private cell_count_list: Map<string, number> = null;
    private map_data = null;
    private shop_list = null;

    public setData (order_data: OrderData, cell_count_list: any, map_data, shop_list) {
        this.order_data = order_data;
        this.cell_count_list = cell_count_list;
        this.map_data = map_data;
        this.shop_list = shop_list;
        if (!this.finish_node.getComponent(MyButton).interactable) {
            return;
        }
        let json_data = this._json_manager.getJsonData(this._json_name.ORDER, this.order_data.id);
        let order_info_list = json_data.order_info.split(",");
        if (order_info_list.length == 2) {
            this.item_node1.active = true;
            this.item_node1.x = -70;
            this.item_node2.active = true;
            this.item_node2.x = 70;
        }
        else {
            this.item_node1.active = true;
            this.item_node1.x = 0;
            this.item_node2.active = false;
        }
        let can_finish = true;
        for (let i = 0; i < order_info_list.length; ++i) {
            let [ele_id, ele_count] = order_info_list[i].split(":");
            let node = (i == 0)? this.item_node1:this.item_node2;
            let icon_sprite = cc.find("Button/Icon", node).getComponent(cc.Sprite);
            let icon_url = this._json_manager.getJsonData(this._json_name.ELE, ele_id).icon;
            this._resource_manager.getSpriteFrame(`merge/ele/${icon_url}`).then((sprite_frame) => {
                if (cc.isValid(icon_sprite)) {
                    icon_sprite.spriteFrame = sprite_frame;
                    let pos = sprite_frame.getOffset();
                    icon_sprite.node.x = -pos.x/2;
                    icon_sprite.node.y = -pos.y/2;
                }
            });
            let has_count = this.cell_count_list[ele_id] || 0;
            if (has_count >= ele_count) {
                cc.find("Finish", node).active = true;
                cc.find("Right", node).active = true;
                cc.find("Sale", node).active = false;
            }
            else {
                cc.find("Finish", node).active = false;
                cc.find("Right", node).active = false;
                let index = this.shop_list.indexOf(Number(ele_id));
                cc.find("Sale", node).active = (index != -1);
                can_finish = false;
            }
            cc.find("Label", node).getComponent(cc.Label).string = has_count+"/"+ele_count;
        }
        if (can_finish) {
            cc.find("Bg1", this.node).active = false;
            cc.find("Bg2", this.node).active = true;
            this.finish_node.active = true;
            cc.tween(this.finish_node).repeatForever(
                cc.tween().to(0.5, { scale: 1.1 }).to(0.5, { scale: 1 })
            ).start();
            this.finish_node.getComponent(MyButton).interactable = true;
            for (let i = 0; i < order_info_list.length; ++i) {
                let node = (i == 0)? this.item_node1:this.item_node2;
                cc.find("Finish", node).active = false;
            }
        }
        else {
            cc.find("Bg1", this.node).active = true;
            cc.find("Bg2", this.node).active = false;
            this.finish_node.active = false;
        }
        let reward_info_list = json_data.order_reward.split(",");
        let reward_icon1 = cc.find("Item1", this.reward_node);
        let reward_label1 = cc.find("Label1", this.reward_node);
        let reward_info1 = reward_info_list[0].split(":");
        this._utils.setSpriteFrame(
            reward_icon1.getComponent(cc.Sprite),
            `pic/icon/`+this._json_manager.getJsonData(this._json_name.ITEM_BASE, reward_info1[0]).icon
        );
        reward_label1.getComponent(cc.Label).string = reward_info1[1];
        this.reward_node.width = reward_label1.x+reward_info1[1].length*25+14;
        let guide_id = GuideManager.getGuideId();
        let guide_node = cc.find("GuideItem", this.node);
        if (cc.isValid(guide_node)) {
            guide_node.active = true;
        }
    }

    public refrushCellCountList (cell_count_list, shop_list) {
        this.setData(this.order_data, cell_count_list, this.map_data, shop_list);
    }

    private clickFinish () {
        this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
            show: false,
            level: this._guide_manager.HandConfig.MERGE_ORDER,
        });
        this._net_manager.requestTablog(this._config.statistic.FINISH_ORDER0+this.order_data.id);

        let order_json = this._json_manager.getJsonData(this._json_name.ORDER, this.order_data.id);
        let order_info_list = order_json.order_info.split(",");
        let data = {
            order_data: this.order_data,
            order_info: [],
            reward_node: cc.find("Reward/Item1", this.node),
        };
        let node_list = [this.item_node1, this.item_node2];
        for (let order_info of order_info_list) {
            let [ele_id, ele_count] = order_info.split(":");
            let node = node_list.shift();
            data.order_info.push({
                ele_id: ele_id,
                ele_count: ele_count,
                node: cc.find("Button/Icon", node),
            });
        }
        this._event_manager.dispatch(this._event_name.EVENT_MERGE_FINISH_ORDER, data);

        this.finish_node.getComponent(MyButton).interactable = false;
        this.finish_node.stopAllActions();
        cc.tween(this.finish_node)
            .to(0.10, { scale: 0 })
            .call(() => {
                this.finish_node.active = false;
            })
            .start();
        cc.tween(this.node)
            .delay(1.1)
            .to(MOVE_SPEED, { scale: 0 })
            .call(() => { 
                let json = this._json_manager.getJson(this._json_name.ORDER);
                let add_order_data = [];
                let order_id = this.order_data.id;
                for (let key in json) {
                    let value = json[key];
                    if (value.pre_order == order_id) {
                        add_order_data.push({
                            id: value.id,
                            finish: false,
                        });
                    }
                }
                this._event_manager.dispatch(this._event_name.EVENT_MERGE_CHANGE_ORDER, {
                    add_order_data: add_order_data,
                    del_order_data: this.order_data,
                });
            })
            .start();
        let guide_id = GuideManager.getGuideId();
        if (guide_id == 7) {
            GuideManager.closeGuideDialog(guide_id);
            GuideManager.setGuideMask(true);
            GuideManager.setGuideId(GuideManager.GuideConfig[guide_id].next);
            GuideManager.triggerGuide();
        }
    }

    private click (event, param) {
        let guide_id = GuideManager.getGuideId();
        if (guide_id == 7) {
            this.clickFinish();
            return;
        }
        let json_data = this._json_manager.getJsonData(this._json_name.ORDER, this.order_data.id);
        let order_info = json_data.order_info.split(",")[Number(param)];
        let [id, _] = order_info.split(":");
        this._dialog_manager.openDialog(this._dialog_name.MergeElementDialog, {
            element_id: id,
        });
    }

    public playMoveAnimation (position: cc.Vec2) {
        if (this.node.position.x != position.x || this.node.position.y != position.y) {
            this.node.scale = 1;
            cc.tween(this.node)
                .to(MOVE_SPEED, { x: position.x, y: position.y })
                .call(() => { this.showTipHand(); })
                .start();
        }
        else {
            this.showTipHand();
        }
    }

    private showTipHand () {
        if (this.finish_node.active && this._guide_manager.getHandTipLevel() < this._guide_manager.HandConfig.MERGE_ORDER) {
            this.node.parent.x = 0;
            this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
                show: true,
                node: this.finish_node,
                level: this._guide_manager.HandConfig.MERGE_ORDER,
            });
        }
    }

    public playFinishAnimation () {
        cc.tween(this.node)
            .to(MOVE_SPEED, { scale: 0 })
            .call(() => { 
                // TODO 生成新订单
            })
            .start();
    }

    public playAppearAnimation () {
        this.node.scale = 0;
        cc.tween(this.node)
            .delay(MOVE_SPEED)
            .to(0.2, { scale: 1.18 })
            .to(0.05, { scale: 0.85 })
            .to(0.05, { scale: 1.00 })
            .call(() => { this.showTipHand(); })
            .start();
    }

    public getOrderId (): number {
        return this.order_data.id;
    }
}
