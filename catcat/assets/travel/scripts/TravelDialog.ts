/*
 * 旅行
 */
import MyComponent from "../../Script/common/MyComponent"
import MyButton    from "../../Script/common/MyButton"
import SlideMap    from "../../Script/common/SlideMap"
import TravelData  from "./TravelData"
import TravelPoint from "./TravelPoint"

const { ccclass, property } = cc._decorator;
@ccclass
export default class TravelDialog extends MyComponent {
    @property(cc.Node)
    private map_node: cc.Node = null;
    @property(SlideMap)
    private slide_map: SlideMap = null;
    @property(cc.Node)
    private gray_line_node: cc.Node = null;
    @property(cc.Node)
    private light_line_node: cc.Node = null;
    @property(cc.Prefab)
    private travel_point_prefab: cc.Prefab = null;
    @property(cc.Node)
    private mark_node: cc.Node = null;
    @property(cc.Label)
    private diamond_label: cc.Label = null;
    @property(cc.Label)
    private name_label: cc.Label = null;
    @property(cc.Label)
    private percent_label: cc.Label = null;
    @property(cc.Label)
    private box_count_label: cc.Label = null;
    @property(cc.Label)
    private travel_label: cc.Label = null;
    @property(cc.Node)
    private explore_button1: cc.Node = null;
    @property(cc.Node)
    private explore_button2: cc.Node = null;
    @property(cc.Node)
    private explore_button3: cc.Node = null;
    @property(cc.Node)
    private box_layout: cc.Node = null;
    @property([cc.SpriteFrame])
    private box_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Node)
    private top_node: cc.Node = null;


    private json_data = null;
    private travel_point_list: cc.Node[] = [];
    private can_explore: boolean = false;
    // private travel_gray_line_list: cc.Node[] = [];
    // private travel_light_line_list: cc.Node[] = [];

    onLoad () {
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_USER_UPDATE, this.onUserData, this)
        this.listen(this._event_name.EVENT_EXPLORE_FINISH, this.onExploreFinish, this);
        this.node.setContentSize(cc.visibleRect.width, cc.visibleRect.height);
        this.travel_label.string = this._user.getTrave().toString();
        let safe_area_top = this._utils.getSafeAreaTop();
        let widget = this.top_node.getComponent(cc.Widget);
        widget.enabled = false;
        this.top_node.y = cc.visibleRect.height / 2 - widget.top - safe_area_top;
    }

    start () {
        let travel_msg = TravelData.getTravelData();
        this.json_data = this._json_manager.getJson(this._json_name.EXPLOER_BASE);
        this.percent_label.string = travel_msg.percent+"%";
        this.name_label.string = this.json_data[travel_msg.point_id].name;
        this.mark_node.zIndex = 2;
        let len = Object.keys(this.json_data).length;
        for (let i = 1; i <= len; ++i) {
            let start_node = cc.find("Item"+i, this.map_node);
            let end_node = cc.find("Item"+(i+1), this.map_node);
            if (!cc.isValid(start_node)) { continue; }
            if (cc.isValid(start_node) && cc.isValid(end_node)) {
                this.drawLine(start_node.getPosition(), end_node.getPosition(), 0);
            }
            let travel_point_node = cc.instantiate(this.travel_point_prefab);
            travel_point_node.parent = this.map_node;
            travel_point_node.zIndex = 1;
            travel_point_node.setPosition(start_node.getPosition());
            this.travel_point_list[i] = travel_point_node;
            travel_point_node.getComponent(TravelPoint).setData({
                name: this.json_data[i].name,
                point_id: i,
            });
            if (i+1 <= travel_msg.point_id) {
                this.drawLine(start_node.getPosition(), end_node.getPosition(), 1);
            }
            if (i == travel_msg.point_id) {
                this.scheduleOnce(() => {
                    this.slide_map.moveToPos({ pos: start_node.getPosition(), });
                }, 0.1);
            }
            else {
            }
        }
        this.mark_node.position = this.travel_point_list[travel_msg.point_id].position;
        this.playMarkAnimal();
        this.setExploreButton();
        this.setBox();
    }

    private drawLine (pos1: cc.Vec2, pos2: cc.Vec2, type: number) {
        let line = cc.instantiate((type == 0)? this.gray_line_node:this.light_line_node);
        line.parent = this.map_node;
        line.setPosition(pos1);
        line.width = pos2.sub(pos1).mag(); 
        if (pos1.x == pos2.x) {
            line.angle = (pos2.y > pos1.y)? 90:-90;
        }
        else if (pos1.y == pos2.y) {
            line.angle = (pos1.x > pos2.x)? -180:0;
        }
        else {
            line.angle = Math.atan((pos2.y-pos1.y)/(pos2.x-pos1.x))/Math.PI*180;
        }
    }

    private onExploreFinish () {
        this.travel_label.string = this._user.getTrave().toString();
        let travel_data = TravelData.getTravelData();
        this.percent_label.string = travel_data.percent+"%";
        let name = this._json_manager.getJsonData(this._json_name.EXPLOER_BASE, travel_data.point_id).name;
        this.name_label.string = name;
        let pre_node = this.travel_point_list[travel_data.point_id-1];
        let cur_node = this.travel_point_list[travel_data.point_id];
        if (cc.isValid(pre_node)) {
            pre_node.getComponent(TravelPoint).onExploreFinish();
        }
        if (travel_data.finish) {
            cur_node.getComponent(TravelPoint).onExploreFinish();
        }
        if (cc.isValid(cur_node)) {
            this.drawLine(pre_node.getPosition(), cur_node.getPosition(), 1);
            // this.mark_node.setPosition((pre_node.x+cur_node.x)/2, (pre_node.y+cur_node.y)/2);
            this.slide_map.moveToPos({ pos: cur_node.getPosition(), });
        }
        this.mark_node.position = this.travel_point_list[travel_data.point_id].position;
        this.playMarkAnimal();
        this.setExploreButton();
        this.setBox();
    }

    private playMarkAnimal () {
        this.mark_node.stopAllActions();
        cc.tween(this.mark_node).repeatForever(
            cc.tween().by(1.0, { y: 20 }).by(1.0, { y: -20 })
        ).start();
    }

    private setExploreButton () {
        this.can_explore = false;
        let travel_data = TravelData.getTravelData();
        if (travel_data.finish) {
            this.explore_button1.active = false;
        }
        else {
            let level = this._user.getLevel();
            this.explore_button1.active = true;
            let json_data = this._json_manager.getJsonData(this._json_name.EXPLOER_BASE, travel_data.point_id);
            if (level < json_data.lv) { // 未开放
                this.explore_button1.active = false;
                this.explore_button2.active = true;
                this.explore_button3.active = false;
                cc.find("LvLabel", this.explore_button2).getComponent(cc.Label).string = `需要Lv.${json_data.lv}`;
            }
            else {
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
                }
                else {
                    num_label.node.color = this._config.color.red;
                }
            }
        }
    }

    private setBox () {
        let travel_data = TravelData.getTravelData();
        let gain_count = 0, has_count = travel_data.point_id;
        if (!travel_data.finish) { has_count --; }
        for (let i = 1; i <= 12; ++i) {
            if (travel_data.box_gain_list[i]) { ++ gain_count; }
            let box_node = cc.find("Item"+i, this.box_layout);
            if (i > travel_data.point_id || (i == travel_data.point_id && !travel_data.finish)) {
                box_node.getComponent(cc.Sprite).spriteFrame = this.box_spriteframes[2];
                box_node.getComponent(MyButton).interactable = false;
            }
            else {
                if (travel_data.box_gain_list[i]) {
                    box_node.getComponent(cc.Sprite).spriteFrame = this.box_spriteframes[1];
                    box_node.getComponent(MyButton).interactable = false;
                }
                else {
                    box_node.getComponent(cc.Sprite).spriteFrame = this.box_spriteframes[0];
                    box_node.getComponent(MyButton).interactable = true;
                }
            }
        }
        this.box_count_label.string = (has_count-gain_count)+"/"+has_count;
        this.diamond_label.string = this._user.getDiamond().toString();
    }

    private clickBox (event, param) {
        this._dialog_manager.openDialog(this._dialog_name.TravelBoxDialog, {
            point_id: Number(param),
        });
    }

    private clickExplore () {
        let travel_data = TravelData.getTravelData();
        this._dialog_manager.openDialog(this._dialog_name.TravelExploreDialog, {
            point_id: travel_data.point_id,
        });
        // let cur_json_data = this._json_manager.getJsonData(this._json_name.EXPLOER_BASE, travel_data.point_id);
        // travel_data.percent = cur_json_data.rate;
        // travel_data.point_id ++;
        // let next_json_data = this._json_manager.getJsonData(this._json_name.EXPLOER_BASE, travel_data.point_id);
        // if (!next_json_data) { // 结束
        //     travel_data.point_id --;
        //     travel_data.percent = 100;
        //     travel_data.finish = true;
        // }
        // if (this.can_explore) {
        //     let [id, count] = cur_json_data.prop_mumber.split(":");
        //     this._utils.addResNum(id, -Number(count));
        //     TravelData.saveTravelData(travel_data);
        //     this._event_manager.dispatch(this._event_name.EVENT_EXPLORE_FINISH);
        //     let reward_list = this._utils.changeConfigData(cur_json_data.unlock_reword)
        //     this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
        // }
        // else {
        //     let msg = this._json_manager.getJsonData(this._json_name.TIPS, 10004).tip;
        //     this._dialog_manager.showTipMsg(msg);
        // }
    }

    private clickDiamond () {
        this._dialog_manager.openDialog(this._dialog_name.VideoView);
    }

    private onUserData() {
        this.diamond_label.string = this._user.getDiamond().toString();
    }

    private clickHelp () {
        this._dialog_manager.openDialog(this._dialog_name.TravelHelpDialog);
    }
}
