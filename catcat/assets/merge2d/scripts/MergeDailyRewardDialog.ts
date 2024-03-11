/*
 * 每日奖励
 */
import MyComponent   from "../../Script/common/MyComponent"
import MyButton   from "../../Script/common/MyButton"
import { MergeDailyRewardData } from "./MergeDataInterface2d"

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeDailyRewardDialog extends MyComponent {
    @property([cc.Node])
    private item_node_list: cc.Node[] = [];
    @property([cc.SpriteFrame])
    private button_spriteframes: cc.SpriteFrame[] = [];

    private reward_data: MergeDailyRewardData = null;
    onLoad () {
        super.onLoad && super.onLoad();
        this.reward_data = this.getDialogData();
        for (let i = 0; i < this.reward_data.list.length; ++i) {
            let item = this.reward_data.list[i];
            let node = this.item_node_list[i];
            this.setItem(node, item);
        }
        this.reward_data.poped = true;
        const key = "DAILY_REWARD_DATA";
        // cc.sys.localStorage.setItem(key, JSON.stringify(this.reward_data));
        this._user.setItem(key, JSON.stringify(this.reward_data));
    }

    private setItem (node: cc.Node, data) {
        let [id, count] = data.reword.split(":");
        let json = this._json_manager.getJsonData(this._json_name.ELE_2D, id);
        cc.find("Label", node).getComponent(cc.Label).string = json.name;
        let icon_sprite = cc.find("Icon", node).getComponent(cc.Sprite);
        this._resource_manager.getSpriteFrame(`merge2d/ele/${json.icon}`).then((sprite_frame) => {
            if (cc.isValid(icon_sprite)) {
                this.addSpriteFrameRef(sprite_frame);
                icon_sprite.spriteFrame = sprite_frame;
            }
        });
        if (data.get == 1) {
            cc.find("Button/Icon", node).active = false;
            cc.find("Button/Label", node).x = 0;
        }
    }

    private clickItem (event: cc.Event.EventTouch, param) {
        let node = event.getCurrentTarget();
        node.getComponent(cc.Sprite).spriteFrame = this.button_spriteframes[0];
        node.getComponent(MyButton).interactable = false;
        let data = this.reward_data.list[Number(param)];
        let [id, count] = data.reword.split(":");
        if (data.get == 1) {
            this._utils.addMergeElement(id, count);
            let reward_data = [{
                item_id: id,
                item_num: count,
            }];
            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_data)   
        }
        else {
            this._ad_manager.setAdCallback(() => {
                this._utils.addMergeElement(id, count);
                let reward_data = [{
                    item_id: id,
                    item_num: count,
                }];
                this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_data)   
            });
            this._ad_manager.showAd();
        }
    }
}
