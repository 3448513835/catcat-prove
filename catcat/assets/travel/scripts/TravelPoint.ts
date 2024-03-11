/*
 * 旅行点
 */
import MyComponent from "../../Script/common/MyComponent"
import MyButton from "../../Script/common/MyButton"
import SlideMap from "../../Script/common/SlideMap"
import TravelData from "./TravelData"

const { ccclass, property } = cc._decorator;
@ccclass
export default class TravelPoint extends MyComponent {
    @property([cc.SpriteFrame])
    private reach_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    private reach_sprite: cc.Sprite = null;
    @property(cc.Label)
    private name_label: cc.Label = null;

    private point_id: number = null;
    private data = null;

    public setData (data) {
        this.data = data;
        this.point_id = data.point_id;
        this.name_label.string = data.name;
        let travel_data = TravelData.getTravelData();
        if (this.point_id < travel_data.point_id || (this.point_id == travel_data.point_id && travel_data.finish)) {
            this.reach_sprite.spriteFrame = this.reach_spriteframes[1];
        }
        else {
            this.reach_sprite.spriteFrame = this.reach_spriteframes[0];
        }
    }

    private click () {
        let travel_data = TravelData.getTravelData();
        if (this.point_id <= travel_data.point_id) {
            this._dialog_manager.openDialog(this._dialog_name.TravelExploreDialog, {
                point_id: this.point_id,
            });
        }
        else {
            this._dialog_manager.showTipMsg("请先探索上一个地点！");
        }
    }

    public onExploreFinish () {
        this.reach_sprite.spriteFrame = this.reach_spriteframes[1];
    }
}
