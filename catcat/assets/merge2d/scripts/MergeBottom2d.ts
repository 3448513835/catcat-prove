/*
 * 合成底部显示
 */
import MyComponent from "../../Script/common/MyComponent"
import GameConstant from "../../Script/common/GameConstant"
import { MergeData } from "./MergeData2d"
import { TILE_MOVE_SPEED, CellData, TileData, MapData, MOVE_DURATION, TmpBubbleData } from "./MergeDataInterface2d"


const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeBottom extends MyComponent {
    @property(cc.Node)
    private unchoose_tip_node: cc.Node = null;
    @property(cc.Node)
    private detail_tip_node: cc.Node = null;
    @property(cc.Label)
    private name_label: cc.Label = null;
    @property(cc.Label)
    private desc_label: cc.Label = null;
    @property(cc.Node)
    private sold_node: cc.Node = null;
    @property(cc.Node)
    private speed_node: cc.Node = null;
    @property(cc.Node)
    private unlock_node: cc.Node = null;
    @property(cc.Node)
    private video_node: cc.Node = null;
    @property([cc.SpriteFrame])
    private video_spriteframes: cc.SpriteFrame[] = [];

    private cell_data: CellData = null;
    private tmp_bubble_data: TmpBubbleData = null;
    private cd_cost_min = 0;

    onLoad () {
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_VIDEO_CARD, this.onVideoCard, this);
    }

    public setData (cell_data: CellData) {
        this.cell_data = cell_data;
        this.unscheduleAllCallbacks();
        // this.speed_node.x = 77;
        if (!this.cell_data || !this.cell_data.element) {
            this.unchoose_tip_node.active = true;
            this.detail_tip_node.active = false;
        }
        else {
            this.unchoose_tip_node.active = false;
            this.detail_tip_node.active = true;
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, this.cell_data.element);
            cc.find("Label", this.video_node).getComponent(cc.Label).string = "加速";
            this.name_label.string = json_data.name+" "+json_data.item_level+"级";
            this.desc_label.string = json_data.description;
            if (this.cell_data.use && this.cell_data.use.count == 0 && this.cell_data.use.runing == 1) { // 加速
                this.sold_node.active = false;
                this.speed_node.active = true;
                this.video_node.active = true;
                this.unlock_node.active = false;
                let cd_cost = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1002).str_para.split(":");
                this.cd_cost_min = Number(cd_cost[1]);
                let icon = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cd_cost[0]).icon;
                this._resource_manager.getSpriteFrame(`pic/icon/${icon}`).then((sprite_frame) => {
                    if (cc.isValid(this.speed_node)) {
                        this.addSpriteFrameRef(sprite_frame);
                        cc.find("Icon", this.speed_node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
                    }
                });
                this.runSpeedClock();
                this.schedule(this.runSpeedClock.bind(this), 1/5);
            }
            else if (this.cell_data.use && this.cell_data.use.count == 0 && this.cell_data.use.runing == 0 /* && !MergeData.instance.getHasLimitElement() */) { // 解锁
                this.sold_node.active = false;
                this.speed_node.active = false;
                this.video_node.active = false;
                this.unlock_node.active = true;
                let sec = this.cell_data.use.cd;
                cc.find("Label", this.unlock_node).getComponent(cc.Label).string = this._utils.convertTime(sec);
            }
            else if (!this.cell_data.use && this.cell_data.tile_data.light && this.cell_data.element) { // 售卖
                this.sold_node.active = true;
                this.speed_node.active = false;
                this.video_node.active = false;
                this.unlock_node.active = false;
                let [item_id, item_count] = json_data.price.split(":");
                let icon = this._json_manager.getJsonData(this._json_name.ITEM_BASE, item_id).icon;
                this._resource_manager.getSpriteFrame(`pic/icon/${icon}`).then((sprite_frame) => {
                    if (cc.isValid(this.sold_node)) {
                        this.addSpriteFrameRef(sprite_frame);
                        cc.find("Icon", this.sold_node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
                    }
                });
                cc.find("Count", this.sold_node).getComponent(cc.Label).string = item_count;
            }
            else if (!this.cell_data.use && !this.cell_data.tile_data.light && this.cell_data.element) { // 点亮 TODO
                this.sold_node.active = false;
                this.speed_node.active = false;
                this.video_node.active = false;
                this.unlock_node.active = false;
            }
            else {
                this.sold_node.active = false;
                this.speed_node.active = false;
                this.video_node.active = false;
                this.unlock_node.active = false;
            }
        }
    }

    public setCopyData (tmp_bubble_data: TmpBubbleData) {
        this.cell_data = null;
        this.tmp_bubble_data = tmp_bubble_data;
        this.unchoose_tip_node.active = false;
        this.detail_tip_node.active = true;
        let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, tmp_bubble_data.id);
        this.name_label.string = json_data.name+" "+json_data.item_level+"级";
        this.desc_label.string = json_data.description;
        this.unscheduleAllCallbacks();
        this.sold_node.active = false;
        this.speed_node.active = true;
        this.video_node.active = true;
        this.unlock_node.active = false;
        // this.speed_node.x = 224;
        cc.find("Label", this.video_node).getComponent(cc.Label).string = "解锁";
        cc.find("TmLabel", this.video_node).getComponent(cc.Label).string = "";

        let [id, cost] = json_data.copycost.split(":");
        this.cd_cost_min = Number(cost);
        let icon = this._json_manager.getJsonData(this._json_name.ITEM_BASE, id).icon;
        this._resource_manager.getSpriteFrame(`pic/icon/${icon}`).then((sprite_frame) => {
            if (cc.isValid(this.speed_node)) {
                this.addSpriteFrameRef(sprite_frame);
                cc.find("Icon", this.speed_node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
            }
        });
        this.runCopyClock();
        this.schedule(this.runCopyClock.bind(this), 1/5);
    }

    private runCopyClock () {
        let sec = 0;
        if (this.tmp_bubble_data) {
            sec = this.tmp_bubble_data.tm-Date.now();
            cc.find("Label", this.speed_node).getComponent(cc.Label).string = this._utils.convertTime(sec/1000);
            cc.find("Count", this.speed_node).getComponent(cc.Label).string = this.cd_cost_min.toString();
        }
        if (!this.tmp_bubble_data || sec < 0) {
            this.unschedule(this.runCopyClock);
            this.tmp_bubble_data = null;
            this.unchoose_tip_node.active = true;
            this.detail_tip_node.active = false;
        }
    }

    private runSpeedClock () {
        let sec = this.cell_data.use.cd-(Date.now()-this.cell_data.use.tm)/1000;
        cc.find("Label", this.speed_node).getComponent(cc.Label).string = this._utils.convertTime(sec);
        cc.find("Count", this.speed_node).getComponent(cc.Label).string = (Math.ceil(sec/60)*this.cd_cost_min).toString();
        cc.find("TmLabel", this.video_node).getComponent(cc.Label).string = (sec >= 1800)? "-30m":"";
        if (sec <= 0) { this.unschedule(this.runSpeedClock); }
    }

    /**
     * 卖出或解锁
     */
    private clickSold () {
        this._event_manager.dispatch(this._event_name.EVENT_MERGE_SOLD_ELEMENT, this.cell_data);
    }

    /**
     * 母体加速
     */
    private clickSpeed () {
        let count = Number(cc.find("Count", this.speed_node).getComponent(cc.Label).string);
        let id;
        if (this.cell_data) {
            id = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1002).str_para.split(":")[0];
        }
        else if (this.tmp_bubble_data) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, this.tmp_bubble_data.id);
            id = json_data.copycost.split(":")[0];
        }
        if (count > 0) {
            let diamond = this._utils.getMyNumByItemId(id);
            if (diamond >= count) {
                this._net_manager.requestTablog(this._config.statistic.MERGE_CD);
                this._utils.addResNum(id, -count);

                // this._event_manager.dispatch(this._event_name.EVENT_MERGE_SPEED_ELEMENT, this.cell_data);
                if (this.cell_data) {
                    this._event_manager.dispatch(this._event_name.EVENT_MERGE_SPEED_ELEMENT, this.cell_data);
                }
                else if (this.tmp_bubble_data) {
                    MergeData.instance.merge_dialog.useTmpBubble(this.tmp_bubble_data);
                    this.tmp_bubble_data = null;
                }
            }
            else {
                // let name = this._json_manager.getJsonData(this._json_name.ITEM_BASE, id).name;
                // this._dialog_manager.showTipMsg(`${name}不足`);
                this._dialog_manager.openDialog(this._dialog_name.VideoView);
            }
        }
    }

    /**
     * 视频加速
     */
    private clickVideo () {
        if (this.cell_data) {
            if (this._user.getVideo() > 0) {
                this._utils.addResNum(GameConstant.res_id.video, -1);
                this._event_manager.dispatch(this._event_name.EVENT_MERGE_VIDEO_CD, {
                    type: 1,
                    cell_data: this.cell_data,
                });
            }
            else {
                this._ad_manager.setAdCallback(() => {
                    this._net_manager.requestTablog(this._config.statistic.MERGE_VIDEO_CD1);
                    this._event_manager.dispatch(this._event_name.EVENT_MERGE_VIDEO_CD, {
                        type: 1,
                        cell_data: this.cell_data,
                    });
                });
                this._net_manager.requestTablog(this._config.statistic.MERGE_VIDEO_CD0);
                this._ad_manager.showAd();
            }
        }
        else if (this.tmp_bubble_data) {
            if (this._user.getVideo() > 0) {
                MergeData.instance.merge_dialog.useTmpBubble(this.tmp_bubble_data);
                this.tmp_bubble_data = null;
            }
            else {
                this._ad_manager.setAdCallback(() => {
                    this._net_manager.requestTablog(this._config.statistic.MERGE_VIDEO_CD1);
                    MergeData.instance.merge_dialog.useTmpBubble(this.tmp_bubble_data);
                    this.tmp_bubble_data = null;
                });
                this._net_manager.requestTablog(this._config.statistic.MERGE_VIDEO_CD0);
                this._ad_manager.showAd();
            }
        }
    }

    /**
     * 解锁
     */
    private clickUnlock () {
        if (MergeData.instance.getHasLimitElement()) {
            this._dialog_manager.showTipMsg("其它礼包正在开启，请稍等...");
        }
        else {
            this.cell_data.use.runing = 1;
            this.cell_data.use.tm = Date.now();
            MergeData.instance.refrushCell(this.cell_data);
            this.setData(this.cell_data);
            MergeData.instance.saveMergeData();
        }
        if (!this._guide_manager.getGuideFinish()) {
            let guide_id = this._guide_manager.getGuideId();
            if (guide_id == 114) {
                this._guide_manager.setGuideMask(true);
                this._guide_manager.closeGuideDialog(guide_id);
                this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                this._guide_manager.triggerGuide();
            }
        }
    }

    private onVideoCard () {
        let video_sprite = cc.find("Sprite", this.video_node).getComponent(cc.Sprite);
        if (cc.isValid(video_sprite)) {
            video_sprite.spriteFrame = this.video_spriteframes[
                (this._user.getVideo() > 0)? 1:0
            ];
        }
    }
}
