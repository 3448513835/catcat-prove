/*
 * 免费box奖励
 */
import MyComponent from "../../Script/common/MyComponent"
import MyButton from "../../Script/common/MyButton"
import TravelData from "./TravelData"

const { ccclass, property } = cc._decorator;
@ccclass
export default class TravelBoxDialog extends MyComponent {
    @property(cc.Node)
    private free_tip_node: cc.Node = null;
    @property(cc.Sprite)
    private icon_sprite: cc.Sprite = null;
    @property(cc.Label)
    private cost_label: cc.Label = null;

    onLoad () {
        super.onLoad && super.onLoad();
        let travel_data = TravelData.getTravelData();
        this.icon_sprite.node.parent.active = false;
    }

    private clickOpen () {
        let id = this.getDialogData().point_id;
        let reward = TravelData.getBoxReward(id);
        if (reward.length > 0) {
            let reward_list = this._utils.changeConfigData(reward.join(","));
            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list);
        }
        let travel_data = TravelData.getTravelData();
        travel_data.box_gain_list[id] = 1;
        TravelData.saveTravelData(travel_data);
        this._event_manager.dispatch(this._event_name.EVENT_EXPLORE_FINISH);
        this.close();
    }
}
