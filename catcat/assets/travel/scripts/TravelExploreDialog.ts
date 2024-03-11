/*
 * 关卡选择
 */
import MyComponent from "../../Script/common/MyComponent"
import MyButton from "../../Script/common/MyButton"
import TravelData from "./TravelData"

const { ccclass, property } = cc._decorator;
@ccclass
export default class TravelExploreDialog extends MyComponent {
    @property(cc.Label)
    private name_label: cc.Label = null;
    @property(cc.Label)
    private desc_label: cc.Label = null;
    @property(cc.Node)
    private reward_layout: cc.Node = null;
    @property(cc.Node)
    private explore_button1: cc.Node = null;
    @property(cc.Node)
    private explore_button2: cc.Node = null;
    @property(cc.Node)
    private explore_button3: cc.Node = null;

    private point_id: number = null;
    private can_explore: boolean = false;

    onLoad () {
        super.onLoad && super.onLoad();
        this.point_id = this.getDialogData().point_id;
        this.listen(this._event_name.EVENT_EXPLORE_FINISH, this.refrush, this);
        this.refrush();
    }

    private refrush () {
        let json_data = this._json_manager.getJsonData(this._json_name.EXPLOER_BASE, this.point_id);
        this.name_label.string = json_data.name;
        this.desc_label.string = json_data.index;
        let reward_info_list = json_data.unlock_reword.split(",");
        for (let i = 0; i < reward_info_list.length; ++i) {
            let reward_info = reward_info_list[i];
            let item_node = this.reward_layout.children[i];
            if (!cc.isValid(item_node)) { continue; }
            item_node.active = true;
            let name_label = cc.find("Name", item_node).getComponent(cc.Label);
            let icon_sprite = cc.find("Icon", item_node).getComponent(cc.Sprite);
            let count_label = cc.find("Count", item_node).getComponent(cc.Label);
            let [id, count] = reward_info.split(":");
            name_label.string = this._json_manager.getJsonData(this._json_name.ITEM_BASE, id).name;
            count_label.string = count;
            let url = this._json_manager.getJsonData(this._json_name.ITEM_BASE, id).icon;
            this._resource_manager.getSpriteFrame(`pic/icon/${url}`).then((sprite_frame) => {
                if (cc.isValid(icon_sprite)) {
                    icon_sprite.spriteFrame = sprite_frame;
                }
            });
        }
        let level = this._user.getLevel();
        let travel_data = TravelData.getTravelData();
        if (level < json_data.lv) { // 未开放
            this.explore_button1.active = false;
            this.explore_button2.active = true;
            this.explore_button3.active = false;
            cc.find("LvLabel", this.explore_button2).getComponent(cc.Label).string = `需要Lv.${json_data.lv}`;
        }
        else if (travel_data.point_id > this.point_id || (travel_data.point_id == this.point_id && travel_data.finish)) { // 已通关
            this.explore_button1.active = false;
            this.explore_button2.active = false;
            this.explore_button3.active = true;
        }
        else { // 可探索
            this.explore_button1.active = true;
            this.explore_button2.active = false;
            this.explore_button3.active = false;
            let icon_sprite = cc.find("Layout/Icon", this.explore_button1).getComponent(cc.Sprite);
            let num_label = cc.find("Layout/Num", this.explore_button1).getComponent(cc.Label);
            let [id, count] = json_data.prop_mumber.split(":");
            let url = this._json_manager.getJsonData(this._json_name.ITEM_BASE, id).icon;
            this._resource_manager.getSpriteFrame(`pic/icon/${url}`).then((sprite_frame) => {
                if (cc.isValid(icon_sprite)) {
                    icon_sprite.spriteFrame = sprite_frame;
                }
            });
            num_label.string = "x"+count;
            if (this._user.getTrave() >= Number(count)) {
                num_label.node.color = cc.Color.WHITE;
                this.can_explore = true;
                cc.find("Tip", this.explore_button1).active = false;
            }
            else {
                num_label.node.color = this._config.color.red;
                cc.find("Tip", this.explore_button1).active = true;
            }
        }
    }

    private clickExplore () {
        let travel_data = TravelData.getTravelData();
        let cur_json_data = this._json_manager.getJsonData(this._json_name.EXPLOER_BASE, travel_data.point_id);
        travel_data.percent = cur_json_data.rate;
        travel_data.point_id ++;
        let next_json_data = this._json_manager.getJsonData(this._json_name.EXPLOER_BASE, travel_data.point_id);
        if (!next_json_data) { // 结束
            travel_data.point_id --;
            travel_data.percent = 100;
            travel_data.finish = true;
        }
        if (this.can_explore) {
            let [id, count] = cur_json_data.prop_mumber.split(":");
            this._utils.addResNum(id, -Number(count));
            TravelData.saveTravelData(travel_data);
            this._event_manager.dispatch(this._event_name.EVENT_EXPLORE_FINISH);
            let reward_list = this._utils.changeConfigData(cur_json_data.unlock_reword)
            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
            this.close();
        }
        else {
            let msg = this._json_manager.getJsonData(this._json_name.TIPS, 10004).tip;
            this._dialog_manager.showTipMsg(msg);
        }
    }
}
