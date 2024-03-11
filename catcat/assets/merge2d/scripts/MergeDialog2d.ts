/*
 * 合成界面
 */
import MyComponent   from "../../Script/common/MyComponent"
import MergeElement  from "./MergeElement2d"
import { MergeData } from "./MergeData2d"
import MergeBottom   from "./MergeBottom2d"
import { COL, ROW, TWIDTH, THEIGHT, TILE_MOVE_SPEED, CellData, TileData, MapData, MOVE_DURATION, ShopItem, BubbleData, TmpBubbleData, PackCellData } from "./MergeDataInterface2d"
import ChangeScene from "../../Script/main/ChangeScene"
import MergeStage from "./MergeStage"

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeDialog2d extends MyComponent {

    @property(cc.Node)
    private map_node: cc.Node = null;
    @property(cc.Node)
    public tiles_layout: cc.Node = null;
    @property(cc.Node)
    private tip_layout_node: cc.Node = null;
    @property(cc.Node)
    public elments_layout: cc.Node = null;
    @property(cc.Node)
    public cloud_layout: cc.Node = null;
    @property(cc.Node)
    private effects_layout: cc.Node = null;
    @property(cc.Node)
    private bubble_layout: cc.Node = null;
    @property([cc.SpriteFrame])
    public land_spritefrmaes: cc.SpriteFrame[] = [];

    @property(cc.Prefab)
    public element_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    private tip_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public tile_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public cloud_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public bubble_prefab: cc.Prefab = null;

    @property(cc.Label)
    public level_label: cc.Label = null;
    @property(cc.Label)
    public stage_label: cc.Label = null;
    @property(cc.Prefab)
    public tile_up_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public element_up_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public light_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public use_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public element_new_prefab: cc.Prefab = null;
    @property(cc.Node)
    public task_node: cc.Node = null;
    @property(MergeBottom)
    private merge_bottom: MergeBottom = null;
    @property(cc.Prefab)
    public combo_effect_prefab: cc.Prefab = null;
    @property(cc.Node)
    private pack_button1: cc.Node = null;
    @property(cc.Node)
    private pack_button2: cc.Node = null;
    @property(MergeStage)
    private merge_stage: MergeStage = null;
    @property(cc.Material)
    public mask_material: cc.Material = null;
    @property(cc.Prefab)
    public boxopen_prefab: cc.Prefab = null;
    @property([cc.SpriteFrame])
    public guide_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Node)
    public guide_hand_node: cc.Node = null;
    @property(cc.Prefab)
    public speedup_effect_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public speedup_effect_prefab2: cc.Prefab = null;
    @property(cc.Label)
    private string_label: cc.Label = null;
    @property(cc.Node)
    private endless_node: cc.Node = null;
    @property(cc.Label)
    private endless_tm_label: cc.Label = null;
    @property(cc.Prefab)
    private tmpbubble_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public click_effect: cc.Prefab = null;
    @property(cc.Prefab)
    public bubble_effect: cc.Prefab = null;

    private tile_node_map = {}; // 瓦片地图
    private element_node_map = {}; // 元素列表
    private choose_tmpbubble: TmpBubbleData = null; // 选中气泡
    private choose_cell: CellData = null; // 被选中元素
    private pre_choose_cell: CellData = null; // 上一个被选中的元素
    private slipe_to_edg: cc.Vec2 = null;
    private slipe_touch_point: cc.Vec2 = null;
    private merge_data: MergeData = null;
    private add_tip_nodes: any = null;
    private pre_move_tile: cc.Vec2 = null;
    private touch_point_count: any = 0;

    onLoad () {
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_MERGE_SOLD_ELEMENT, this.onSoldElement, this);
        this.listen(this._event_name.EVENT_MERGE_SPEED_ELEMENT, this.onSpeedElement, this);
        this.listen(this._event_name.EVENT_MERGE_VIDEO_CD, this.onVideoSpeedElement, this);
        this.listen(this._event_name.EVENT_MERGE_FINISH_ORDER, this.onFinishOrder, this);
        this.listen(this._event_name.EVENT_MERGE_SHOP_BUY, this.onShopBuy, this);
        this.listen(this._event_name.EVENT_MERGE_SHOP_USE, this.useBubble, this);
        this.listen(this._event_name.EVENT_MERGE_USE_PACK, this.usePackElement, this);
        this.node.setContentSize(cc.visibleRect.width, cc.visibleRect.height);
        this.merge_data = this.node.getComponent(MergeData);
        this.map_node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.map_node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.map_node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.map_node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
        /* if (this._config.debug) {
            this.scheduleOnce(() => { this._utils.addMergeElement(112, 4); }, 1);
        } */
    }

    start () {
        if (!this._guide_manager.getGuideFinish()) {
            let guide_id = this._guide_manager.getGuideId();
            if (guide_id == 111) {
                this._guide_manager.setGuideId(110);
            }
            else if (guide_id == 114) {
                this._guide_manager.setGuideId(113);
            }
            this._guide_manager.triggerGuide();
        }
        else {
            this._guide_manager.setGuideMask(false);
            let data = this.merge_data.getDailyRewardData();
            if (!data.poped) {
                this._dialog_manager.openDialog(this._dialog_name.MergeDailyRewardDialog, data);
            }
        }
    }

    private touchStart (event: cc.Event.EventTouch) {
        this.merge_data.stopPlayMergeTipAnimal();
        if (cc.isValid(this.add_tip_nodes)) {
            this.add_tip_nodes.destroy();
            this.add_tip_nodes = null;
        }
        if (this.touch_point_count == 0) {
            let pos = this.tiles_layout.convertToNodeSpaceAR(event.getLocation());
            this.choose_tmpbubble = null;
            let tile_pos = this.positionToTile(pos);
            let choose_cell = this.getElementCell(tile_pos);
            this.pre_choose_cell = this.choose_cell;
            for (let bubble_data of this.merge_data.tmp_bubble_list) {
                if (pos.sub(bubble_data.node.position).mag() < 80) {
                    this.choose_tmpbubble = bubble_data;
                    if (this.choose_tmpbubble && cc.isValid(this.choose_tmpbubble.node)) {
                        this.choose_tmpbubble.node.stopAllActions();
                        this.choose_tmpbubble.node.scale = 1.1;
                    } 
                    break;
                }
            }
            if (this.choose_tmpbubble) {
                this.choose_cell = null;
                this.showChooseCell(this.choose_cell);
            }
            else if (choose_cell && /* choose_cell.tile_data.light && */ choose_cell.tile_data.unlock && choose_cell.element_node) {
                this.choose_cell = choose_cell;
                this.pack_button1.stopAllActions();
                cc.tween(this.pack_button1)
                    .to(0.15, { scale: 1.15 })
                    .to(0.15, { scale: 1.0 })
                    .start();
                }
            else {
                this.choose_cell = null;
                this.showChooseCell(this.choose_cell);
            }
            this.pre_move_tile = null;
        }
        ++ this.touch_point_count;
    }

    private touchMove (event: cc.Event.EventTouch) {
        if (this.touch_point_count == 1 && this.choose_cell && this.choose_cell.tile_data.unlock && this.choose_cell.tile_data.light && this.choose_cell.element_node) {
            let pos = this.elments_layout.convertToNodeSpaceAR(event.getLocation());
            this.choose_cell.element_node.setPosition(pos);
            this.choose_cell.element_node.zIndex = 2;
            let tip_node = this.choose_cell.element_node.getChildByName("Tip");
            tip_node.scale = 0;
        }
        else if (this.touch_point_count == 1 && this.choose_tmpbubble) {
            let n_pos = this.tiles_layout.convertToNodeSpaceAR(event.getLocation());
            if (cc.isValid(this.choose_tmpbubble.node)
                && n_pos.x < this.map_node.width-100 && n_pos.y < this.map_node.height-100
                && n_pos.x > 100 && n_pos.y > 100) {
                this.choose_tmpbubble.node.setPosition(n_pos);
            }
        }
    }

    private touchEnd (event: cc.Event.EventTouch) {
        if (this.touch_point_count == 0) { return; }
        this.touch_point_count --;
        this.merge_data.startPlayMergeTipAnimal();
        let move_distance = event.getLocation().sub(event.getStartLocation()).mag();
        if (this.choose_tmpbubble && cc.isValid(this.choose_tmpbubble.node)) {
            this.choose_tmpbubble.node.scale = 1;
            cc.tween(this.choose_tmpbubble.node).repeatForever(
                cc.tween().by(1.5, { y: 20 }).by(1.5, { y: -20 })
            ).start();
            this.chooseCopyNode(this.choose_tmpbubble);
        }
        else if (this.choose_cell && this.choose_cell.element_node) {
            let tip_node = this.choose_cell.element_node.getChildByName("Tip");
            tip_node.scale = 1;
            this.choose_cell.element_node.zIndex = 0;
            let tile_pos = this.positionToTile(this.tiles_layout.convertToNodeSpaceAR(event.getLocation()));
            let occupy_cell = this.getElementCell(tile_pos);
            if (!occupy_cell && this._guide_manager.getGuideFinish()) {
                let w_pos = this.choose_cell.element_node.parent.convertToWorldSpaceAR(this.choose_cell.element_node.getPosition());
                let n_pos = this.pack_button1.convertToNodeSpaceAR(w_pos);
                if (Math.abs(n_pos.x) <= this.pack_button1.width/2 && Math.abs(n_pos.y) <= this.pack_button1.height/2) {
                    if (!this.saveElementInPack()) {
                        this.merge_data.refrushCell(this.choose_cell);
                    }
                }
                else {
                    this.merge_data.refrushCell(this.choose_cell);
                }
            }
            else {
                let guide_id = this._guide_manager.getGuideId();
                if (guide_id == 103) {
                    this.choose_cell = this.getElementCell(new cc.Vec2(2, 4));
                    occupy_cell = this.getElementCell(new cc.Vec2(3, 4));
                    this._guide_manager.setGuideMask(true);
                    this._guide_manager.closeGuideDialog(guide_id);
                    this.scheduleOnce(() => {
                        this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                        this._guide_manager.triggerGuide();
                    }, 0.5);
                }
                else if (guide_id == 104) {
                    this.choose_cell = this.getElementCell(new cc.Vec2(3, 4));
                    occupy_cell = this.getElementCell(new cc.Vec2(3, 3));
                    this._guide_manager.setGuideMask(true);
                    this._guide_manager.closeGuideDialog(guide_id);
                    this.scheduleOnce(() => {
                        this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                        this._guide_manager.triggerGuide();
                    }, 0.5);
                }
                else if (guide_id == 105) {
                    this.choose_cell = this.getElementCell(new cc.Vec2(3, 3));
                    occupy_cell = this.getElementCell(new cc.Vec2(4, 3));
                    this._guide_manager.setGuideMask(true);
                    this._guide_manager.closeGuideDialog(guide_id);
                    this.scheduleOnce(() => {
                        this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                        this._guide_manager.triggerGuide();
                    }, 0.5);
                }
                else if (guide_id == 106 || guide_id == 107 || guide_id == 108) {
                    this.pre_choose_cell = this.choose_cell;
                    occupy_cell = this.choose_cell;
                    this._guide_manager.setGuideMask(true);
                    this._guide_manager.closeGuideDialog(guide_id);
                    this.scheduleOnce(() => {
                        this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                        this._guide_manager.triggerGuide();
                    }, 0.5);
                }
                else if (guide_id == 109) {
                    this.choose_cell = this.getElementCell(new cc.Vec2(2, 4));
                    occupy_cell = this.getElementCell(new cc.Vec2(3, 4));
                    this._guide_manager.setGuideMask(true);
                    this._guide_manager.closeGuideDialog(guide_id);
                    this.scheduleOnce(() => {
                        this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                        this._guide_manager.triggerGuide();
                    }, 0.5);
                }
                else if (guide_id == 300) {
                    this.saveElementInPack();
                    let guide_id = this._guide_manager.getGuideId();
                    this._guide_manager.closeGuideDialog(guide_id);
                    this._guide_manager.setGuideMask(true);
                    this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                    this._guide_manager.triggerGuide();
                    return;
                }
                if (!occupy_cell || occupy_cell == this.choose_cell || !this.choose_cell.tile_data.light) {
                    this.merge_data.refrushCell(this.choose_cell);
                    this.showChooseCell(this.choose_cell);
                    if (this.choose_cell == this.pre_choose_cell) {
                        this.doubleClickCell(this.choose_cell);
                    }
                    else {
                        this.playElementJump(this.choose_cell);
                    }
                }
                else if (occupy_cell.tile_data.light || (occupy_cell.tile_data.unlock && occupy_cell.element == this.choose_cell.element)) {
                    let is_copy = this.merge_data.moveCopyElement(occupy_cell, this.choose_cell);
                    let is_split = !is_copy && this.merge_data.moveSplitElement(occupy_cell, this.choose_cell);
                    if (!is_copy && !is_split) {
                        let has_merge = this.merge_data.moveElement(occupy_cell, this.choose_cell);
                        // this.showChooseCell(has_merge? null:occupy_cell);
                        this.showChooseCell(occupy_cell);
                    }
                }
                else {
                    this.merge_data.refrushCell(this.choose_cell);
                    this.showChooseCell(this.choose_cell);
                }
            }
        }
    }

    /**
     * 判断新手是否可以滑动
     * param choose_cell
     * param occupy_cell
     */
    private checkGuideCanMove (choose_cell: CellData, occupy_cell: CellData): boolean {
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 2) {
            if (choose_cell && choose_cell.tile_data.tile_x == 3 && choose_cell.tile_data.tile_y == 2 &&
                occupy_cell && occupy_cell.tile_data.tile_x == 4 && occupy_cell.tile_data.tile_y == 2) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (guide_id == 3) {
            return false;
        }
        else if (guide_id == 5) {
            if (choose_cell && choose_cell.tile_data.tile_x == 1 && choose_cell.tile_data.tile_y == 2 &&
                occupy_cell && occupy_cell.tile_data.tile_x == 2 && occupy_cell.tile_data.tile_y == 2) {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }

    /**
     * 双击元素
     * param cell_data
     */
    private doubleClickCell (cell_data: CellData) {
        if (cell_data.element && cell_data.use && cell_data.use.count > 0 && cell_data.tile_data.light && cell_data.tile_data.unlock) {
            let cell_json = this._json_manager.getJsonData(this._json_name.ELE_2D, cell_data.element);
            if (cell_json.type == 102) { // 加速器
                let has_use = this.merge_data.onUseTool(cell_json.type, cell_json.use_value);
                if (has_use) {
                    cell_data.element = 0;
                    this.merge_data.refrushCell(cell_data);
                    this.merge_data.saveMergeData();
                    this.showChooseCell(null);
                }
                else {
                    this._dialog_manager.showTipMsg("当前没有任何物品需要加速哦，以后再用吧~");
                }
            }
            else if (cell_json.type == 103) { // 无限能量
                cell_data.element = 0;
                let node = cell_data.element_node;
                cell_data.element_node = null;
                let pos = node.parent.convertToWorldSpaceAR(node.getPosition());
                let start_pos = this.endless_node.parent.convertToNodeSpaceAR(pos);
                let end_pos = this.endless_node.getPosition();
                let duration = end_pos.sub(start_pos).mag()/1500;
                let offx = (end_pos.x-start_pos.x >= 0)? 200:-200;
                node.setPosition(start_pos);
                node.parent = this.endless_node.parent;
                cc.tween(node)
                    .bezierTo(duration, start_pos, new cc.Vec2(start_pos.x+offx, start_pos.y), end_pos)
                    .removeSelf()
                    .start();
                this.merge_data.refrushCell(cell_data);
                this.showChooseCell(null);
                if (this.merge_data.endless_strength_tm >= Date.now()) {
                    this.merge_data.endless_strength_tm += cell_json.use_value*1000;
                }
                else {
                    this.merge_data.endless_strength_tm = cell_json.use_value*1000+Date.now();
                }
                this.merge_data.saveMergeData();
            }
            else if (cell_json.type == 104) { // 拆分器
                /* null */
            }
            else if (cell_json.type == 105) { // 复制器
                /* null */
            }
            else {
                let json_data = this._json_manager.getJsonData(this._json_name.DROP, cell_json.use_value);
                let reward_ele_list = json_data.reward_ele.split(",");
                let weight_list = json_data.weight.split(",");
                let sum = 0;
                for (let i = 0; i < weight_list.length; ++i) {
                    weight_list[i] = Number(weight_list[i]);
                    sum += weight_list[i];
                }
                let random = Math.random()*sum, index = null;
                for (index = 0; index < weight_list.length; ++index) {
                    if (random <= weight_list[index]) { break; }
                    else { random -= weight_list[index]; }
                }
                let result_list = reward_ele_list[index].split(":");
                for (let i = 0; i < result_list.length; ++i) {
                    result_list[i] = Number(result_list[i]);
                }
                while (result_list[1]) {
                    let new_cell = this.merge_data.getNearEmptyElement(cell_data.tile_data.tile_x, cell_data.tile_data.tile_y);
                    if (!new_cell) {
                        let tip = this._json_manager.getJsonData(this._json_name.TIPS, 20003).tip;
                        this._dialog_manager.showTipMsg(tip);
                        return;
                    }
                    else {
                        if (cell_data.use.is_use != 2 && cell_data.use.is_use != 3 && cell_json.use_cost) {
                            let [cost_id, cost_count] = cell_json.use_cost.split(":");
                            cost_count = Number(cost_count);
                            if (Date.now() > this.merge_data.endless_strength_tm) {
                                if (this._utils.getMyNumByItemId(cost_id) < cost_count) {
                                    let name = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_id).name;
                                    // this._dialog_manager.showTipMsg(`合成需要扣除${cost_count}${name}，${name}不足`);
                                    this._dialog_manager.openDialog(this._dialog_name.PowerView);
                                    return;
                                }
                                this._utils.addResNum(cost_id, -cost_count);
                            }
                        }
                        let click_effect_node = cc.instantiate(this.click_effect);
                        click_effect_node.parent = cell_data.element_node;
                        cc.tween(click_effect_node).delay(0.5).removeSelf().start();
                        this._audio_manager.playEffect(this._audio_name.MERGE_APPEAR);
                        new_cell.element = result_list[0];
                        this.merge_data.recordNewElement(new_cell.element, true, true);
                        let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, new_cell.element);
                        new_cell.icon = json_data.icon;
                        new_cell.com_next = json_data.com_next;
                        new_cell.use = (json_data.is_use)? {
                            is_use: json_data.is_use,
                            tm: Date.now(),
                            count: (json_data.is_use == 2)? 0:json_data.ues_time,
                            max_count: json_data.ues_time,
                            cd: json_data.cd,
                            runing: (json_data.is_use == 2)? 0:1,
                        }:null;
                        this.merge_data.refrushCell(new_cell);
                        new_cell.element_node.setPosition(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
                        new_cell.element_node.scale = 0.5;
                        cc.tween(new_cell.element_node).parallel(
                            cc.tween().to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y }, { easing: 'sineOut' }),
                            cc.tween().to(MOVE_DURATION/6, { scale: 1.5 }).to(MOVE_DURATION*5/6, { scale: 1 })
                        )
                        .call(() => {
                            this.playNewElementEffect(new_cell);
                        })
                        .start();
                    }
                    -- result_list[1];
                }
                -- cell_data.use.count;
                if (cell_data.use.count == 0) {
                    cell_data.use.tm = Date.now();
                }
                if ((cell_data.use.is_use == 2 || cell_data.use.is_use == 3) && cell_data.use.count == 0) { // 使用后消失
                    cell_data.element = 0;
                    cell_data.icon = null;
                    cell_data.use = null;
                    this.choose_cell = null;
                }
                this.merge_data.refrushCell(cell_data);
                this.showChooseCell(cell_data);

                this.merge_data.refrushOrderPanel();
                this.merge_data.saveMergeData();
                this.triggerPackGuide();
            }
        }
        else if (cell_data.element && cell_data.tile_data.light && cell_data.tile_data.unlock) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, cell_data.element);
            if (cell_data.use && !cell_data.use.runing && cell_data.use.is_use == 2) {
                if (MergeData.instance.getHasLimitElement()) {
                    this._dialog_manager.showTipMsg("其它礼包正在开启，请稍等...");
                }
                else {
                    cell_data.use.runing = 1;
                    cell_data.use.tm = Date.now();
                    MergeData.instance.refrushCell(cell_data);
                    this.merge_bottom.setData(cell_data);
                    MergeData.instance.saveMergeData();
                }
            }
            else if (json_data.type == 3) {
                this._event_manager.dispatch(this._event_name.EVENT_MERGE_SOLD_ELEMENT, cell_data);
            }
        }
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 3) {
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideMask(true);
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.triggerGuide();
        }
    }

    private chooseCopyNode (tmp_bubble_data: TmpBubbleData) {
        // this.pack_button1.active = true;
        // this.pack_button2.active = false;
        this.merge_bottom.setCopyData(tmp_bubble_data);
    }

    /**
     * 播放新元素的动效
     */
    public playNewElementEffect (cell_data: CellData) {
        let node = cc.instantiate(this.element_new_prefab);
        if (cc.isValid(cell_data.element_node)) {
            let sprite_frame = cc.find("Sprite", cell_data.element_node).getComponent(cc.Sprite).spriteFrame;
            cc.find("ele_11", node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
            node.parent = cell_data.element_node;
            node.setPosition(0, 0);
            this.scheduleOnce(() => {
                if (cc.isValid(node)) { node.destroy(); }
            }, 2);
        }
    }

    /**
     * 选中元素
     * param cell_data
     */
    private showChooseCell (cell_data: CellData) {
        if (!cell_data || !cell_data.element) {
            // this.pack_button1.active = true;
            // this.pack_button2.active = false;
            if (cc.isValid(this.add_tip_nodes)) {
                this.add_tip_nodes.destroy();
                this.add_tip_nodes = null;
            }
        }
        else {
            // if (!cell_data.tile_data.light) {
            //     this.pack_button1.active = true;
            //     this.pack_button2.active = false;
            // }
            // else {
            //     this.pack_button1.active = false;
            //     this.pack_button2.active = true;
            // }
            if (!cc.isValid(this.add_tip_nodes)) {
                this.add_tip_nodes = cc.instantiate(this.tip_prefab);
                this.add_tip_nodes.parent = this.tip_layout_node;
            }
            this.add_tip_nodes.setPosition(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
        }
        this.merge_bottom.setData(cell_data);
        if (!this._guide_manager.getGuideFinish()) {
            let guide_id = this._guide_manager.getGuideId();
            if (guide_id == 113) {
                this._guide_manager.setGuideMask(true);
                this._guide_manager.closeGuideDialog(guide_id);
                this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                this._guide_manager.triggerGuide();
            }
        }
    }

    public refrushMap (map_data: MapData) {
        this.level_label.string = map_data.level.toString();
        this.stage_label.string = map_data.stage_name;
    }

    public refrushBubble (bubble_list: BubbleData[]) {
        this.merge_stage.refrushBubble(bubble_list);
    }

    /**
     * 刷新临时产出气泡
     */
    public refrushTmpBubble (tmp_bubble_list: TmpBubbleData[]) {
        let now = Date.now();
        for (let i = tmp_bubble_list.length-1; i >= 0; --i) {
            let item = tmp_bubble_list[i];
            if (item.tm <= now) {
                tmp_bubble_list.splice(i, 1);
                let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, item.id);
                let [id, num] = json_data.copyturn.split(":");
                this._utils.addResNum(Number(id), Number(num));
            }
            else {
                let cell_data = {
                    element: item.id,
                    tile_data: {
                        pos_x: item.x,
                        pos_y: item.y,
                    },
                };
                item.node = this.generateCopyNode(cell_data as CellData, false);
            }
        }
    }

    /**
     * 获取元素节点
     * param p 位置
     */
    private getElementCell (p: number|cc.Vec2): CellData {
        if (typeof(p) == "number") {
            return this.merge_data.cell_data_list[p];
        }
        else {
            return this.merge_data.cell_data_list[p.x+p.y*COL];
        }
    }

    /**
     * 转换瓦片位置在地图上实际位置
     * param p cc.Vec2
     */
    private tileToPosition (p: cc.Vec2): cc.Vec2 {
        return new cc.Vec2(
            p.x*TWIDTH+TWIDTH/2,
            p.y*THEIGHT+THEIGHT/2
        );
    }

    /**
     * tile是否点亮
     */
    private getTileUnLock (x: number, y: number): boolean {
        let cell_data = this.merge_data.cell_data_list[x+y*COL];
        return cell_data && !!cell_data.tile_data.unlock;
    }

    /**
     * 转换位置为瓦片地图的坐标
     * param pos cc.Vec2
     */
    private positionToTile (pos: cc.Vec2): cc.Vec2 {
        let y = Math.floor(pos.y/THEIGHT);
        let x = Math.floor(pos.x/THEIGHT);
        return new cc.Vec2(x, y);
    }

    /**
     * 打开商店
     */
    private clickShop () {
        this._dialog_manager.openDialog(this._dialog_name.MergeShopDialog2d, this.merge_data.map_data);
    }

    private clickPack () {
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 301) {
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideMask(true);
            // this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            // this._guide_manager.triggerGuide();
        }
        if (this.pack_button2.active) {
            this.saveElementInPack();
        }
        else {
            this._dialog_manager.openDialog(this._dialog_name.MergePackDialog2d);
            this.scheduleOnce(() => {
                if (guide_id == 301) {
                    this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                    this._guide_manager.triggerGuide();
                }
            }, 0.5);
        }
    }

    /**
     * 元素存入背包
     */
    private saveElementInPack () {
        if (this.choose_cell && cc.isValid(this.choose_cell.element_node)) {
            this.pack_button1.stopAllActions();
            cc.tween(this.pack_button1)
                .to(0.15, { scale: 1.15 })
                .to(0.15, { scale: 1.0 })
                .start();
            let pack_data = this.merge_data.pack_data;
            if (pack_data.pack_list.length >= pack_data.own) {
                let tip = this._json_manager.getJsonData(this._json_name.TIPS, 20004).tip;
                this._dialog_manager.showTipMsg(tip);
                return false;
            }
            else {
                let node = cc.instantiate(this.choose_cell.element_node);
                let pos = this.choose_cell.element_node.parent.convertToWorldSpaceAR(this.choose_cell.element_node.getPosition());
                pos = this.pack_button2.parent.convertToNodeSpaceAR(pos);
                node.setPosition(pos);
                node.parent = this.pack_button2.parent;
                let end_pos = this.pack_button2.getPosition();
                let tm = end_pos.sub(pos).mag()/TILE_MOVE_SPEED;
                cc.tween(node)
                .to(tm, { x: end_pos.x, y: end_pos.y })
                .removeSelf()
                .start();
                this.merge_data.addPackCellData(this.choose_cell);
                this.choose_cell.element = 0;
                this.showChooseCell(null);
                this.merge_data.refrushCell(this.choose_cell);
                this.merge_data.saveMergeData();
                this.merge_data.refrushOrderPanel();
                return true;
            }
        }
    }

    private clickClose () {
        let _resource_manager = this._resource_manager;
        ChangeScene.instance.enter(() => {
            _resource_manager.loadBundle("main_scene").then((bundle) => {
                cc.director.loadScene("Main");
            });
        })
    }

    private clickElementDetail () {
        if (this.choose_cell) {
            this._dialog_manager.openDialog(this._dialog_name.MergeElementDialog2d, {
                element_id: this.choose_cell.element,
            });
        }
    }

    private moveCellElement (point: cc.Vec2) {
        let tile = this.positionToTile(this.tiles_layout.convertToNodeSpaceAR(point));
        let tile_index = tile.x+tile.y*COL;
        let occupy_cell = this.getElementCell(tile);
        if ((!this.pre_move_tile || this.pre_move_tile.x != tile.x || this.pre_move_tile.y != tile.y) && occupy_cell && occupy_cell.tile_data.unlock) {
            this.pre_move_tile = tile;
            let end_pos = new cc.Vec2(occupy_cell.tile_data.pos_x, occupy_cell.tile_data.pos_y);
            let tm = end_pos.sub(this.choose_cell.element_node.getPosition()).mag()/TILE_MOVE_SPEED;
            this.choose_cell.element_node.setPosition(end_pos);
            // this.choose_cell.element_node.stopAllActions();
            // cc.tween(this.choose_cell.element_node)
            //     .to(tm, { x: end_pos.x, y: end_pos.y })
            //     .start();
        }
    }

    private tmpBubbleBroken (tmp_bubble_data: TmpBubbleData) {
        let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, tmp_bubble_data.id);
        let [id, num] = json_data.copyturn.split(":");
        let new_cell = this.merge_data.getEmptyElement();
        if (new_cell) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, id);
            new_cell.element = Number(id);
            new_cell.icon = json_data.icon;
            new_cell.com_next = json_data.com_next;
            new_cell.use = (json_data.is_use)? {
                is_use: json_data.is_use,
                tm: Date.now(),
                count: (json_data.is_use == 2)? 0:json_data.ues_time,
                max_count: json_data.ues_time,
                cd: json_data.cd,
                runing: (json_data.is_use == 2)? 0:1,
            }:null;
            this.merge_data.refrushCell(new_cell);
            new_cell.element_node.setPosition(tmp_bubble_data.node.position);
            cc.tween(new_cell.element_node)
                .delay(0.5)
                .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
                .call(() => {
                    this.playNewElementEffect(new_cell);
                })
                .start();

            let bubble_effect_node = cc.instantiate(this.bubble_effect);
            bubble_effect_node.parent = this.effects_layout;
            bubble_effect_node.setPosition(tmp_bubble_data.node.position);
            cc.tween(bubble_effect_node)
                .delay(0.5)
                .removeSelf()
                .start();

            this.merge_data.refrushOrderPanel();
            this.merge_data.recordNewElement(new_cell.element, true, true);
            tmp_bubble_data.node.destroy();
            this.merge_data.saveMergeData();
        }
        else {
            let node = tmp_bubble_data.node;
            cc.find("Sprite", node).getComponent(cc.Sprite).enabled = false;
            cc.find("Label", node).getComponent(cc.Label).enabled = false;
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, id);
            let pos = this.merge_stage.node.getPosition();
            pos = this.merge_stage.node.parent.convertToWorldSpaceAR(pos);
            pos = node.parent.convertToNodeSpaceAR(pos);
            this._resource_manager.getSpriteFrame(`merge2d/ele/${json_data.icon}`).then((sprite_frame) => {
                if (cc.isValid(node)) {
                    this.addSpriteFrameRef(sprite_frame);
                    cc.find("Icon", node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
                    node.stopAllActions();
                    cc.tween(node)
                        .to(MOVE_DURATION, { x: pos.x, y: pos.y-50 })
                        .call(() => {
                            this.onShopBuy({
                                reward_type: 1,
                                reward: Number(id),
                                sum: 1,
                            } as ShopItem);
                            this.merge_data.saveMergeData();
                        })
                        .removeSelf()
                        .start();
                }
            });
        }
    }

    private onSoldElement () {
        this.showChooseCell(null);
        this.merge_data.refrushOrderPanel();
    }

    private onSpeedElement (cell_data: CellData) {
        cell_data.use.count = cell_data.use.max_count;
        if (cell_data.use.is_use == 2) {
            this.merge_data.setHasLimitElement(false);
        }
        this.merge_data.refrushCell(cell_data);
        this.showChooseCell(cell_data);
        this.merge_data.saveMergeData();
        let effect_node = cc.instantiate(this.speedup_effect_prefab2);
        effect_node.parent = cell_data.element_node;
        effect_node.setPosition(0, 0);
        effect_node.zIndex = 3;
        cc.tween(effect_node).delay(1.5).removeSelf().start();
    }

    private onVideoSpeedElement (data) {
        if (data.type == 1 && data.cell_data) {
            let cell_data: CellData = data.cell_data;
            cell_data.use.tm -= 30*60*1000;
            this.merge_data.refrushCell(cell_data);
            if (cell_data.use.is_use == 2 && cell_data.use.count > 0) {
                this.merge_data.setHasLimitElement(false);
            }
            this.showChooseCell(cell_data);
            this.merge_data.saveMergeData();
            let effect_node = cc.instantiate(this.speedup_effect_prefab2);
            effect_node.parent = cell_data.element_node;
            effect_node.setPosition(0, 0);
            effect_node.zIndex = 3;
            cc.tween(effect_node).delay(1.5).removeSelf().start();
        }
    }

    private onFinishOrder () {
        this.showChooseCell(null);
    }

    private onShopBuy (data: ShopItem) {
        if (data.reward_type == 1) { // 元素
            for (let i = 0; i < data.sum; ++i) {
                let bubble_data: BubbleData = {
                    id: data.reward,
                    node: null,
                };
                this.merge_data.bubble_list.unshift(bubble_data);
            }
            this.refrushBubble(this.merge_data.bubble_list);
            this.merge_data.saveMergeData();
        }
    }

    private useBubble (bubble_data: BubbleData) {
        let new_cell = this.merge_data.getEmptyElement();
        if (new_cell) {
            let index = this.merge_data.bubble_list.indexOf(bubble_data);
            console.log("useBubble", index);
            this.merge_data.bubble_list.splice(index, 1);
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, bubble_data.id);
            new_cell.element = bubble_data.id;
            new_cell.icon = json_data.icon;
            new_cell.com_next = json_data.com_next;
            new_cell.use = (json_data.is_use)? {
                is_use: json_data.is_use,
                tm: Date.now(),
                count: (json_data.is_use == 2)? 0:json_data.ues_time,
                max_count: json_data.ues_time,
                cd: json_data.cd,
                runing: (json_data.is_use == 2)? 0:1,
            }:null;
            this.merge_data.refrushCell(new_cell);
            let pos = bubble_data.node.parent.convertToWorldSpaceAR(bubble_data.node.getPosition());
            pos = new_cell.element_node.parent.convertToNodeSpaceAR(pos);
            new_cell.element_node.setPosition(pos);
            cc.tween(new_cell.element_node)
                .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
                .call(() => {
                    this.playNewElementEffect(new_cell);
                })
                .start();
            bubble_data.node.removeFromParent(); // magic
            bubble_data.node.destroy();
            this.merge_data.refrushOrderPanel();
            this.merge_data.recordNewElement(new_cell.element, true, true);
            this.refrushBubble(this.merge_data.bubble_list);
            this.triggerPackGuide();
        }
        else {
            let tip = this._json_manager.getJsonData(this._json_name.TIPS, 20003).tip;
            this._dialog_manager.showTipMsg(tip);
        }
    }

    private triggerPackGuide () {
        // if (!cc.sys.localStorage.getItem("PACK_GUIDE") && this._guide_manager.getGuideFinish()) {
        if (!this._user.getItem("PACK_GUIDE") && this._guide_manager.getGuideFinish()) {
            let count = 0;
            for (let cell_data of this.merge_data.cell_data_list) {
                if (cell_data && cell_data.element) {
                    ++ count;
                }
            }
            if (count == this.merge_data.cell_data_list.length) {
                this._guide_manager.setGuideId(300);
                this._guide_manager.triggerGuide();
                // cc.sys.localStorage.setItem("PACK_GUIDE", 1);
                this._user.setItem("PACK_GUIDE", 1);
            }
        }
    }

    public useTmpBubble (tmp_bubble_data: TmpBubbleData) {
        let index = this.merge_data.tmp_bubble_list.indexOf(tmp_bubble_data);
        this.merge_data.tmp_bubble_list.splice(index, 1);
        let new_cell = this.merge_data.getEmptyElement();
        if (new_cell) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, tmp_bubble_data.id);
            new_cell.element = tmp_bubble_data.id;
            new_cell.icon = json_data.icon;
            new_cell.com_next = json_data.com_next;
            new_cell.use = (json_data.is_use)? {
                is_use: json_data.is_use,
                tm: Date.now(),
                count: (json_data.is_use == 2)? 0:json_data.ues_time,
                max_count: json_data.ues_time,
                cd: json_data.cd,
                runing: (json_data.is_use == 2)? 0:1,
            }:null;
            this.merge_data.refrushCell(new_cell);
            new_cell.element_node.setPosition(tmp_bubble_data.node.position);
            cc.tween(new_cell.element_node)
                .delay(0.5)
                .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
                .call(() => {
                    this.playNewElementEffect(new_cell);
                })
                .start();

            let bubble_effect_node = cc.instantiate(this.bubble_effect);
            bubble_effect_node.parent = this.effects_layout;
            bubble_effect_node.setPosition(tmp_bubble_data.node.position);
            cc.tween(bubble_effect_node)
                .delay(0.5)
                .removeSelf()
                .start();

            this.merge_data.refrushOrderPanel();
            this.merge_data.recordNewElement(new_cell.element, true, true);
        }
        else {
            this.onShopBuy({
                reward_type: 1,
                reward: tmp_bubble_data.id,
                sum: 1,
            } as ShopItem);
        }
        tmp_bubble_data.node.destroy();
    }

    public generateCopyNode (cell_data: CellData, is_new: boolean) {
        let element = cell_data.element;
        let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, element);
        let node = cc.instantiate(this.tmpbubble_prefab);
        node.parent = this.bubble_layout;
        node.setPosition(cell_data.tile_data.pos_x+50, cell_data.tile_data.pos_y+50);
        cc.tween(node).repeatForever(
            cc.tween().by(1.5, { y: 20 }).by(1.5, { y: -20 })
        ).start();
        this._resource_manager.getSpriteFrame(`merge2d/ele/${json_data.icon}`).then((sprite_frame) => {
            if (cc.isValid(node)) {
                this.addSpriteFrameRef(sprite_frame);
                cc.find("Icon", node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
            }
        });
        if (is_new) {
            let tmp_bubble_data: TmpBubbleData = {
                id: element,
                node: node,
                tm: Date.now()+json_data.copytime*1000,
                x: cell_data.tile_data.pos_x,
                y: cell_data.tile_data.pos_y,
            };
            // tmp_bubble_data.tm = Date.now()+5*1000; // TEST
            this.merge_data.tmp_bubble_list.push(tmp_bubble_data);
        }
        return node;
    }

    private usePackElement () {
        let has_element = false;
        let tmp_pack_cell_list = MergeData.instance.tmp_pack_cell_list;
        while (tmp_pack_cell_list.length > 0) {
            let pack_cell_data = tmp_pack_cell_list.pop();
            let new_cell = this.merge_data.getEmptyElement();
            if (new_cell) {
                has_element = true;
                let pack_list = this.merge_data.pack_data.pack_list;
                new_cell.element = pack_cell_data.element;
                new_cell.icon = pack_cell_data.icon;
                new_cell.use = pack_cell_data.use;
                new_cell.com_next = pack_cell_data.com_next;
                this.merge_data.refrushCell(new_cell);
                let start_pos = this.pack_button1.parent.convertToWorldSpaceAR(this.pack_button1.getPosition());
                start_pos = new_cell.element_node.parent.convertToNodeSpaceAR(start_pos);
                new_cell.element_node.setPosition(start_pos);
                let end_pos = new cc.Vec2(new_cell.tile_data.pos_x, new_cell.tile_data.pos_y);
                let tm = end_pos.sub(start_pos).mag()/TILE_MOVE_SPEED;
                cc.tween(new_cell.element_node)
                    .to(tm, { x: end_pos.x, y: end_pos.y })
                    .call(() => {
                        this.playNewElementEffect(new_cell);
                    })
                    .start();
            }
            else {
                break;
            }
        }
        if (has_element) {
            this.triggerPackGuide();
            cc.tween(this.pack_button1)
                // .to(0.15, { scale: 1.15 })
                // .to(0.15, { scale: 1.0 })
                .to(0.15, { scale: 1.15 })
                .to(0.15, { scale: 1.0 })
                .start();
        }
        this.merge_data.saveMergeData();
        this.merge_data.refrushOrderPanel();
    }

    /**
     * 元素跳动效果
     */
    public playElementJump (cell_data: CellData) {
        if (cc.isValid(cell_data.element_node) && (!cell_data.use || cell_data.use.count == 0)) {
            let icon_node = cc.find("Sprite", cell_data.element_node);
            cc.tween(icon_node)
                .to(15/120, { scale: 1.08, })
                .to(15/120, { scale: 1, })
                .to(15/120, { scale: 1.08, })
                .to(25/120, { scale: 1, })
                .start();
        }
    }

    update () {
        if (this.merge_data.tmp_bubble_list.length > 0) {
            let now = Date.now();
            for (let i = this.merge_data.tmp_bubble_list.length-1; i >= 0; --i) {
                let tmp_bubble_data = this.merge_data.tmp_bubble_list[i];
                if (cc.isValid(tmp_bubble_data.node)) {
                    if (tmp_bubble_data.tm < now) {
                        this.merge_data.tmp_bubble_list.splice(i, 1);
                        this.tmpBubbleBroken(tmp_bubble_data);
                    }
                    else {
                        let label = cc.find("Label", tmp_bubble_data.node).getComponent(cc.Label);
                        label.string = this._utils.convertTime((tmp_bubble_data.tm-now)/1000);
                        // if (tmp_bubble_data.tm-now <= 30000) {
                        //     label.node.active = true;
                        //     label.string = this._utils.convertTime((tmp_bubble_data.tm-now)/1000);
                        // }
                        // else {
                        //     label.node.active = false;
                        // }
                    }
                }
            }
        }
        let tm = (this.merge_data.endless_strength_tm-Date.now())/1000;
        if (tm > 0) {
            this.string_label.node.active = false;
            this.endless_node.active = true;
            this.endless_tm_label.string = this._utils.convertTime(tm);
        }
        else {
            this.string_label.node.active = true;
            this.endless_node.active = false;
        }
    }

    /**
     * 测试给订单中的元素
     */
    private testAddOrderElement () {
        this.scheduleOnce(() => {
            let order_list = this.merge_data.map_data.order_list;
            for (let order_data of order_list) {
                let json_data = this._json_manager.getJsonData(this._json_name.ORDER_2D, order_data.id);
                let order_info_list = json_data.order_info.split(",");
                for (let order_info of order_info_list) {
                    let [ele_id, ele_count] = order_info.split(":");
                    this.onShopBuy({
                        reward_type: 1,
                        reward: Number(ele_id),
                        sum: Number(ele_count),
                    } as ShopItem);
                }
            }
        }, 1);
    }
}
