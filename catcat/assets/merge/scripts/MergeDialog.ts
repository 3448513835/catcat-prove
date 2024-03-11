/*
 * 合成界面
 */
import MyComponent   from "../../Script/common/MyComponent"
import SlideMap      from "../../Script/common/SlideMap"
import MergeElement  from "./MergeElement"
import { MergeData } from "./MergeData"
import MergeBottom   from "./MergeBottom"
import {
    TILE_MOVE_SPEED,
    CellData,
    TileData,
    MapData,
    MOVE_DURATION,
    ShopItem,
    BubbleData,
    TmpBubbleData,
    PackCellData 
} from "./MergeDataInterface"
import ChangeScene from "../../Script/main/ChangeScene"

const COL       = 12;
const ROW       = 10;
const TWIDTH    = 272;
const THEIGHT   = 140;
const SLIPE_EDG = 1/5;
const MAGNET    = 0.1;

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeDialog extends MyComponent {
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
    @property([cc.SpriteFrame])
    public cloud_spritefrmaes: cc.SpriteFrame[] = [];

    @property(cc.Prefab)
    public element_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    private tip_prefab: cc.Prefab = null;
    @property([cc.SpriteFrame])
    private tip_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Prefab)
    public tile_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public cloud_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public bubble_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public tmpbubble_prefab: cc.Prefab = null;
    @property(SlideMap)
    private slide_map: SlideMap = null;

    @property(cc.Label)
    public level_label: cc.Label = null;
    @property(cc.Label)
    public stage_label: cc.Label = null;
    @property(cc.Node)
    private bottom_panel: cc.Node = null;
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
    @property(cc.SpriteAtlas)
    public merge_atlas: cc.SpriteAtlas = null;
    @property(cc.Node)
    public task_node: cc.Node = null;
    @property(MergeBottom)
    private merge_bottom: MergeBottom = null;
    @property(cc.Prefab)
    public combo_effect_prefab: cc.Prefab = null;
    @property(cc.SpriteFrame)
    public great_spriteframe: cc.SpriteFrame = null;
    @property(cc.Node)
    private pack_button1: cc.Node = null;
    @property(cc.Node)
    private pack_button2: cc.Node = null;
    @property(cc.Node)
    public guide_hand_node: cc.Node = null;
    @property([cc.SpriteFrame])
    public guide_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Prefab)
    private bubble_effect: cc.Prefab = null;
    @property(cc.Label)
    private string_label: cc.Label = null;
    @property(cc.Node)
    private endless_node: cc.Node = null;
    @property(cc.Label)
    private endless_tm_label: cc.Label = null;
    @property(cc.Prefab)
    public speedup_effect_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public speedup_effect_prefab2: cc.Prefab = null;
    @property(cc.Prefab)
    public copytile_effect_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    public copy_effect_prefab: cc.Prefab = null;


    private tile_node_map = {}; // 瓦片地图
    private tip_node_list = []; // 选择提示列表
    private element_node_map = {}; // 元素列表
    private choose_cell: CellData = null; // 被选中元素
    private choose_bubble: BubbleData = null; // 选中气泡
    private choose_tmpbubble: TmpBubbleData = null; // 选中气泡
    private pre_choose_cell: CellData = null; // 上一个被选中的元素
    private slipe_to_edg: cc.Vec2 = null;
    private slipe_touch_point: cc.Vec2 = null;
    private merge_data: MergeData = null;
    private add_tip_nodes: boolean = false;
    private pre_move_tile: cc.Vec2 = null;
    private show_magnet: { magenet: boolean, index: number } = null;
    private touch_point_count: any = 0;
    private copy_effect_node_list: cc.Node[] = [];

    onLoad () {
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_MERGE_SOLD_ELEMENT, this.onSoldElement, this);
        this.listen(this._event_name.EVENT_MERGE_SPEED_ELEMENT, this.onSpeedElement, this);
        this.listen(this._event_name.EVENT_MERGE_VIDEO_CD, this.onVideoSpeedElement, this);
        this.listen(this._event_name.EVENT_MERGE_FINISH_ORDER, this.onFinishOrder, this);
        this.listen(this._event_name.EVENT_MERGE_SHOP_BUY, this.onShopBuy, this);
        this.listen(this._event_name.EVENT_MERGE_USE_PACK, this.usePackElement, this);
        this.node.setContentSize(cc.visibleRect.width, cc.visibleRect.height);
        this.merge_data = this.node.getComponent(MergeData);
        this.slide_map.setTouchStart(this.touchStart.bind(this));
        this.slide_map.setTouchMove(this.touchMove.bind(this));
        this.slide_map.setTouchEnd(this.touchEnd.bind(this));
        this.slide_map.setTouchCancel(this.touchEnd.bind(this));
        this._resource_manager.loadBundle("merge").then((bundle) => { bundle.preloadDir("ele"); });
        /* if (this._config.debug) {
            this.scheduleOnce(() => { this._utils.addMergeElement(112, 6); }, 1);
        } */
       // this.testAddOrderElement();
    }

    start () {
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 2 && this._guide_manager.getRecoveryId() < 2) {
            this._net_manager.requestTablog(this._config.statistic.ENTER_MERGE_SCENE);
        }
        if (!this._config.guide || this._guide_manager.getGuideFinish()) {
            this.slide_map.map.scale = this.slide_map.minScale;
            this.slide_map.map.setPosition(145, 0);
        }
        else {
            this.slide_map.map.scale = 1;
            if (guide_id == 20) {
                this.slide_map.map.setPosition(45, 17);
            }
            else {
                this.slide_map.map.setPosition(263, 17);
            }
        }
        this._guide_manager.triggerGuide();
    }

    private touchStart (event: cc.Event.EventTouch): boolean {
        this.merge_data.stopPlayMergeTipAnimal();
        this.choose_bubble = null;
        this.choose_tmpbubble = null;
        if (this.touch_point_count == 0) {
            this.slipe_to_edg = null;
            this.add_tip_nodes = false;
            for (let node of this.tip_node_list) { node.destroy(); }
            this.tip_node_list = [];
            let pos = this.tiles_layout.convertToNodeSpaceAR(event.getLocation());
            for (let bubble_data of this.merge_data.bubble_list) {
                if (pos.sub(bubble_data.node.position).mag() < 80) {
                    this.choose_bubble = bubble_data;
                    break;
                }
            }
            for (let bubble_data of this.merge_data.tmp_bubble_list) {
                if (pos.sub(bubble_data.node.position).mag() < 80) {
                    this.choose_tmpbubble = bubble_data;
                    if (this.choose_tmpbubble && cc.isValid(this.choose_tmpbubble.node)) {
                        this.choose_tmpbubble.node.stopAllActions();
                    } 
                    break;
                }
            }

            if (this.choose_bubble) {
                this.choose_cell = null;
                this.showChooseCell(this.choose_cell);
                this.slide_map.lockSlide(true);
            }
            else if (this.choose_tmpbubble) {
                this.choose_cell = null;
                this.showChooseCell(this.choose_cell);
                this.slide_map.lockSlide(true);
            }
            else {
                let tile_pos = this.positionToTile(pos);
                let choose_cell = this.getElementCell(tile_pos);
                this.pre_choose_cell = this.choose_cell;
                if (choose_cell && choose_cell.tile_data.light && choose_cell.tile_data.unlock && choose_cell.element_node) {
                    this.choose_cell = choose_cell;
                    choose_cell.element_node.zIndex = COL*ROW;
                    let tip_node = cc.instantiate(this.tip_prefab);
                    tip_node.parent = this.tip_layout_node;
                    tip_node.setPosition(choose_cell.tile_data.pos_x, choose_cell.tile_data.pos_y);
                    this.tip_node_list.push(tip_node);
                    this.slide_map.lockSlide(true);
                    let json_data = this._json_manager.getJsonData(this._json_name.ELE, choose_cell.element);
                    let type = json_data.type;
                    if (type == 104) { // 拆分器
                        this.showCanSplitElement(Number(json_data.use_value));
                    }
                    else if (type == 105) { // 复制器
                        this.showCanCopyElement(Number(json_data.use_value));
                    }
                }
                else {
                    this.choose_cell = null;
                    this.showChooseCell(this.choose_cell);
                    this.slide_map.lockSlide(false);
                }
            }
            this.show_magnet = { magenet: false, index: null, };
            this.pre_move_tile = null;
        }
        this.touch_point_count ++;
        if (!this._guide_manager.getGuideFinish()) { // 禁止滑动
            this.slide_map.lockSlide(true);
        }
        return true;
    }

    private showCanCopyElement (lv:number) {
        for (let cell_data of this.merge_data.cell_data_list) {
            if (cell_data && cell_data.element && cell_data.tile_data.light && cell_data.tile_data.unlock && cell_data != this.choose_cell) {
                let json_data = this._json_manager.getJsonData(this._json_name.ELE, cell_data.element);
                if (json_data.item_level <= lv) {
                    let node = cc.instantiate(this.copytile_effect_prefab);
                    node.parent = cell_data.element_node;
                    node.zIndex = -1;
                    node.setPosition(0, 0);
                    this.copy_effect_node_list.push(node);
                }
            }
        }
    }

    private showCanSplitElement (lv:number) {
        for (let cell_data of this.merge_data.cell_data_list) {
            if (cell_data && cell_data.element && cell_data.tile_data.light && cell_data.tile_data.unlock && cell_data != this.choose_cell) {
                let json_data = this._json_manager.getJsonData(this._json_name.ELE, cell_data.element);
                if (json_data.item_level <= lv && json_data.item_level > 1) {
                    let node = cc.instantiate(this.copytile_effect_prefab);
                    node.parent = cell_data.element_node;
                    node.zIndex = -1;
                    node.setPosition(0, 0);
                    this.copy_effect_node_list.push(node);
                }
            }
        }
    }

    private unshowCanCopyElement () {
        for (let node of this.copy_effect_node_list) {
            if (cc.isValid(node)) { node.destroy(); }
        }
        this.copy_effect_node_list = [];
    }

    private touchMove (event: cc.Event.EventTouch): boolean {
        if (this.touch_point_count == 1 && this.choose_cell && this.choose_cell.element_node) {
            this.addTipNodes(this.choose_cell, event);
            let pos = event.getLocation();
            this.moveCellElement(pos);
            let guide_finish = this._guide_manager.getGuideFinish();
            let delta_x = event.getDeltaX();
            if (pos.x < cc.visibleRect.width*SLIPE_EDG && guide_finish) {
                if (delta_x < 0) {
                    this.slipe_to_edg = new cc.Vec2(4, 0);
                    this.slipe_touch_point = event.getLocation();
                }
                else if (delta_x > 0) {
                    this.slipe_to_edg = null;
                }
            }
            else if (pos.x > cc.visibleRect.width*(1-SLIPE_EDG)  && guide_finish) {
                if (delta_x > 0) {
                    this.slipe_to_edg = new cc.Vec2(-4, 0);
                    this.slipe_touch_point = event.getLocation();
                }
                else if (delta_x < 0) {
                    this.slipe_to_edg = null;
                }
            }
            else if (pos.x <= cc.visibleRect.width*(1-SLIPE_EDG) && pos.x >= cc.visibleRect.width*SLIPE_EDG) {
                this.slipe_to_edg = null;
            }
        }
        if (this.touch_point_count == 1 && this.choose_bubble) {
            let n_pos = this.tiles_layout.convertToNodeSpaceAR(event.getLocation());
            this.choose_bubble.node.setPosition(n_pos);
        }
        else if (this.touch_point_count == 1 && this.choose_tmpbubble) {
            let n_pos = this.tiles_layout.convertToNodeSpaceAR(event.getLocation());
            if (cc.isValid(this.choose_tmpbubble.node)) {
                this.choose_tmpbubble.node.setPosition(n_pos);
            }
        }
        // TEST 触摸棋盘禁止移动
        // let tile_pos = this.positionToTile(this.tiles_layout.convertToNodeSpaceAR(event.getStartLocation()));
        // if (this.getElementCell(tile_pos)) {
        //     return false;
        // }

        return true;
    }

    private touchEnd (event: cc.Event.EventTouch) {
        this.unshowCanCopyElement();
        this.merge_data.startPlayMergeTipAnimal();
        if (this.touch_point_count == 0) { return; }
        this.touch_point_count --;
        this.slipe_to_edg = null;
        this.add_tip_nodes = false;
        for (let node of this.tip_node_list) { node.destroy(); }
        this.tip_node_list = [];
        let move_distance = event.getLocation().sub(event.getStartLocation()).mag();

        if (this.choose_tmpbubble && cc.isValid(this.choose_tmpbubble.node)) {
            cc.tween(this.choose_tmpbubble.node).repeatForever(
                cc.tween().by(1.5, { y: 20 }).by(1.5, { y: -20 })
            ).start();
        }
        if (this.choose_cell && this.choose_cell.element_node) {
            this.unshowMagnet();
            this.choose_cell.element_node.zIndex = COL*ROW-this.choose_cell.tile_data.tile_y*COL-this.choose_cell.tile_data.tile_x;
            let occupy_cell = (this.show_magnet.index == null)? this.choose_cell:this.getElementCell(this.show_magnet.index);
            let guide_id = this._guide_manager.getGuideId();
            if (guide_id == 2) {
                this.choose_cell = this.getElementCell(new cc.Vec2(3, 2));
                occupy_cell = this.getElementCell(new cc.Vec2(4, 2));
            }
            else if (guide_id == 3 || guide_id == 4) {
                // this.merge_data.refrushCell(this.choose_cell);
                occupy_cell = this.choose_cell;
            }
            else if (guide_id == 5) {
                this.choose_cell = this.getElementCell(new cc.Vec2(3, 2));
                occupy_cell = this.getElementCell(new cc.Vec2(2, 2));
            }
            else if (guide_id == 20) {
                this.choose_cell = this.getElementCell(new cc.Vec2(3, 1));
                occupy_cell = this.getElementCell(new cc.Vec2(4, 1));
            }
            // if (!this.checkGuideCanMove(this.choose_cell, occupy_cell)) {
            //     this.merge_data.refrushCell(this.choose_cell);
            // }
            // else 
            if (!occupy_cell.tile_data.light || !occupy_cell.tile_data.unlock) {
                this.merge_data.refrushCell(this.choose_cell);
                let list = [];
                if (this._json_manager.getJsonData(this._json_name.ELE, this.choose_cell.element).com_next) {
                    list = this.merge_data.getNearSameElements(this.choose_cell.tile_data.tile_x, this.choose_cell.tile_data.tile_y, this.choose_cell.element);
                }
                let light_element = false;
                if (list.length >= 3) {
                    for (let p of list) {
                        if (!this.getElementCell(p).tile_data.light) {
                            light_element = true;
                        }
                    }
                }
                if (light_element) {
                    let has_merge = this.merge_data.moveElement(this.choose_cell, this.choose_cell);
                    // this.showChooseCell(has_merge? null:occupy_cell);
                    this.showChooseCell(occupy_cell);
                }
                else {
                    this.showChooseCell(this.choose_cell);
                }
            }
            else {
                if (event.getStartLocation().sub(event.getLocation()).mag() > 10) {
                    let is_copy = this.merge_data.moveCopyElement(occupy_cell, this.choose_cell);
                    let is_split = !is_copy && this.merge_data.moveSplitElement(occupy_cell, this.choose_cell);
                    if (!is_copy && !is_split) {
                        let has_merge = this.merge_data.moveElement(occupy_cell, this.choose_cell);
                        let guide_id = this._guide_manager.getGuideId();
                        if (guide_id == 2 || guide_id == 5 || guide_id == 20) {
                            this._guide_manager.closeGuideDialog(guide_id);
                            this._guide_manager.setGuideMask(true);
                            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                            this.scheduleOnce(() => {
                                this._guide_manager.triggerGuide();
                            }, MOVE_DURATION);
                        }
                        this.showChooseCell(has_merge? null:occupy_cell);
                    }
                }
                else {
                    this.merge_data.refrushCell(this.choose_cell);
                    this.showChooseCell(this.choose_cell);
                    this.playElementJump(this.choose_cell);
                }
            }
        }
        else if (!this.choose_cell) {
            let has_use_bubble = false;
            if (!this.choose_cell && move_distance < 10 && this.merge_data.bubble_list.length+this.merge_data.tmp_bubble_list.length  > 0) {
                let pos = this.bubble_layout.convertToNodeSpaceAR(event.getLocation());
                for (let i = 0; i < this.merge_data.bubble_list.length && !has_use_bubble; ++i) {
                    let bubble_data = this.merge_data.bubble_list[i];
                    if (pos.sub(bubble_data.node.position).mag() < 80) {
                        this.useBubble(bubble_data);
                        has_use_bubble = true;
                    }
                }
                for (let i = 0; i < this.merge_data.tmp_bubble_list.length && !has_use_bubble; ++i) {
                    let bubble_data = this.merge_data.tmp_bubble_list[i];
                    if (pos.sub(bubble_data.node.position).mag() < 80) {
                        has_use_bubble = true;
                        this.chooseCopyNode(bubble_data);
                    }
                }
            }
            if (!has_use_bubble) {
                let tile = this.positionToTile(this.tiles_layout.convertToNodeSpaceAR(event.getLocation()));
                let cell_data = this.getElementCell(tile);
                if (cell_data && !cell_data.tile_data.unlock && event.getLocation().sub(event.getStartLocation()).mag() < 10) {
                    let list = [], can_unlock = false;
                    for (let item of this.merge_data.cell_data_list) {
                        if (item && item.tile_data.area == cell_data.tile_data.area) { list.push(item); }
                    }
                    if (cell_data.tile_data.unlock_condition == 101) {
                        can_unlock = (Number(cell_data.tile_data.unlock_para) <= this.merge_data.map_data.level);
                    }
                    else if (cell_data.tile_data.unlock_condition == 102) {
                        can_unlock = false;
                    }
                    if (can_unlock) {
                        this.unlockArea(list);
                    }
                    else {
                        let data = {
                            cell_data: cell_data,
                            map_data: this.merge_data.map_data,
                            list: list,
                            callback: () => {
                                this.unlockArea(list);
                            },
                        };
                        if (this._guide_manager.getGuideFinish()) {
                            this._dialog_manager.openDialog(this._dialog_name.MergeUnlockTipDialog, data);
                        }
                    }
                }
                if (this.pre_choose_cell && this.pre_choose_cell.element && cell_data && !cell_data.element && cell_data.tile_data.light &&
                    cell_data.tile_data.unlock && event.getLocation().sub(event.getStartLocation()).mag() < 10) {
                    this.merge_data.moveElement(cell_data, this.pre_choose_cell);
                    this.showChooseCell(null);
                }
            }
        }
        let guide_id = this._guide_manager.getGuideId();
        if ((guide_id == 3 || guide_id == 4 || this.choose_cell == this.pre_choose_cell) && this.choose_cell != null && move_distance < 10) {
            this.doubleClickCell(this.choose_cell);
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
        else if (guide_id == 3 || guide_id == 4) {
            return false;
        }
        else if (guide_id == 5) {
            if (choose_cell && choose_cell.tile_data.tile_x == 3 && choose_cell.tile_data.tile_y == 2 &&
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
            let cell_json = this._json_manager.getJsonData(this._json_name.ELE, cell_data.element);
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
                        this._audio_manager.playEffect(this._audio_name.MERGE_APPEAR);
                        new_cell.element = result_list[0];
                        this.merge_data.recordNewElement(new_cell.element, true, true);
                        let json_data = this._json_manager.getJsonData(this._json_name.ELE, new_cell.element);
                        new_cell.icon = json_data.icon;
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
                        cc.tween(new_cell.element_node)
                        .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
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
                    for (let node of this.tip_node_list) { node.destroy(); }
                    this.tip_node_list = [];
                }
                this.merge_data.refrushCell(cell_data);
                this.showChooseCell(cell_data);

                this.merge_data.refrushOrderPanel(true);
                this.merge_data.saveMergeData();
            }
        }
        else if (cell_data.element && cell_data.tile_data.light && cell_data.tile_data.unlock) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, cell_data.element);
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
        if (guide_id == 3 || guide_id == 4) {
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideMask(true);
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.triggerGuide();
        }
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
            for (let node of this.tip_node_list) { node.destroy(); }
            this.tip_node_list = [];
            this.pack_button1.active = true;
            this.pack_button2.active = false;
        }
        else {
            this.pack_button1.active = false;
            this.pack_button2.active = true;
            let tip_node = cc.instantiate(this.tip_prefab);
            tip_node.parent = this.tip_layout_node;
            tip_node.setPosition(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
            this.tip_node_list.push(tip_node);
        }
        this.merge_bottom.setData(cell_data);
    }

    private chooseCopyNode (tmp_bubble_data: TmpBubbleData) {
        for (let node of this.tip_node_list) { node.destroy(); }
        this.tip_node_list = [];
        this.pack_button1.active = true;
        this.pack_button2.active = false;
        this.merge_bottom.setCopyData(tmp_bubble_data);
    }

    private addTipNodes (choose_cell: CellData, event: cc.Event.EventTouch) {
        let com_next = this._json_manager.getJsonData(this._json_name.ELE, choose_cell.element).com_next;
        if (com_next && !this.add_tip_nodes && event.getLocation().sub(event.getStartLocation()).mag() > 5) {
            this.add_tip_nodes = true;
            for (let cell_data of this.merge_data.cell_data_list) {
                if (cell_data && cell_data != choose_cell && cell_data.tile_data.unlock && cell_data.tile_data.light && cell_data.element == choose_cell.element) {
                    let tip_node = cc.instantiate(this.tip_prefab);
                    tip_node.parent = this.tip_layout_node;
                    tip_node.setPosition(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
                    this.tip_node_list.push(tip_node);
                }
            }
        }
    }

    public refrushMap (map_data: MapData) {
        this.level_label.string = map_data.level.toString();
        this.stage_label.string = map_data.stage_name;
        const max_area = 8;
        for (let i = 1; i <= max_area; ++i) {
            let lock_node = cc.find("LockLayout/LockItem"+i, this.map_node);
            if (map_data.unlock_area.indexOf(i) != -1) {
                lock_node.active = false;
            }
            else {
                lock_node.active = true;
                let tile = this.positionToTile(lock_node.getPosition());
                let cell_data = this.merge_data.cell_data_list[tile.x+tile.y*COL];
                if (cell_data.tile_data.unlock_condition == 101) { // 等级
                    if (map_data.level >= Number(cell_data.tile_data.unlock_para)) {
                        cc.find("Lock", lock_node).active = false;
                        cc.find("Unlock", lock_node).active = true;
                        cc.find("Label", lock_node).active = false;
                    }
                    else {
                        cc.find("Lock", lock_node).active = true;
                        cc.find("Unlock", lock_node).active = false;
                        cc.find("Label", lock_node).active = true;
                        cc.find("Label", lock_node).getComponent(cc.Label).string = "流浪猫."+cell_data.tile_data.unlock_para;
                    }
                }
                else if (cell_data.tile_data.unlock_condition == 102) { // 道具解锁
                    let cost_id: any = null, cost_count: any = null;
                    [cost_id, cost_count] = cell_data.tile_data.unlock_para.split(":");
                    cost_id = Number(cost_id), cost_count = Number(cost_count);
                    let count = this._utils.getMyNumByItemId(Number(cost_id));
                    if (count >= cost_count) {
                        cc.find("Lock", lock_node).active = false;
                        cc.find("Unlock", lock_node).active = true;
                        cc.find("Label", lock_node).active = false;
                    }
                    else {
                        cc.find("Lock", lock_node).active = true;
                        cc.find("Unlock", lock_node).active = false;
                        cc.find("Label", lock_node).active = true;
                        let name = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_id).name;
                        cc.find("Label", lock_node).getComponent(cc.Label).string = name+cost_count;
                    }
                }
                else if (cell_data.tile_data.unlock_condition == 103) { // 人民币
                    cc.find("Lock", lock_node).active = true;
                    cc.find("Unlock", lock_node).active = false;
                    cc.find("Label", lock_node).active = true;
                    cc.find("Label", lock_node).getComponent(cc.Label).string = "";
                }
                else {
                    lock_node.active = false;
                }
            }
        }
    }

    /**
     * 刷新气泡
     */
    public refrushBubble (bubble_list: BubbleData[]) {
        for (let item of bubble_list) {
            item.node = this.generateBubbleNode(item.id);
        }
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
                let json_data = this._json_manager.getJsonData(this._json_name.ELE, item.id);
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
     * 刷新无尽体力
     */
    public refrushEndlessStrength () {
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
            if (p.x > 0 && p.y >= 0) { // magic
                return this.merge_data.cell_data_list[p.x+p.y*COL];
            }
            else {
                return null;
            }
        }
    }

    /**
     * 转换瓦片位置在地图上实际位置
     * param p cc.Vec2
     */
    private tileToPosition (p: cc.Vec2): cc.Vec2 {
        let sx = (p.x-p.y)*TWIDTH/2;
        let sy = (p.x+p.y+1)*THEIGHT/2;
        return new cc.Vec2(sx, sy);
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
        let y = Math.floor(pos.y/THEIGHT-pos.x/TWIDTH);
        let x = Math.floor(pos.y/THEIGHT+pos.x/TWIDTH);
        return new cc.Vec2(x, y);
    }

    /**
     * 判断超出边界
     */
    private outEdg (): boolean {
        let w_distance = (cc.visibleRect.width-this.map_node.width*this.map_node.scaleX)/2;
        let h_distance = (cc.visibleRect.height-this.map_node.height*this.map_node.scaleY)/2;
        if (this.map_node.x-this.map_node.width*this.map_node.scaleX/2 > -cc.visibleRect.width/2 ||
            this.map_node.x+this.map_node.width*this.map_node.scaleX/2 < cc.visibleRect.width/2) {
            return true;
        }
    }

    /**
     * 解锁区域
     * param list
     */
    private unlockArea (list: CellData[]) {
        let area = list[0].tile_data.area;
        cc.find("LockLayout/LockItem"+area, this.map_node).active = false;
        for (let cell_data of list) {
            cell_data.tile_data.unlock = true;
            this.merge_data.refrushTile(cell_data.tile_data);
            let element_node = cc.instantiate(this.element_prefab);
            element_node.parent = this.elments_layout;
            cell_data.element_node = element_node;
            this.merge_data.refrushCell(cell_data);
            this.merge_data.recordNewElement(cell_data.element, false, false);
        }
        this.merge_data.map_data.unlock_area.push(area);
        this.merge_data.saveMergeData();
        this._audio_manager.playEffect(this._audio_name.MERGE_UNLOCK);
    }

    /**
     * 打开商店
     */
    private clickShop () {
        this._dialog_manager.openDialog(this._dialog_name.MergeShopDialog, this.merge_data.map_data);
    }

    private clickPack () {
        if (this.pack_button2.active) {
            if (this.choose_cell && cc.isValid(this.choose_cell.element_node)) {
                let pack_data = this.merge_data.pack_data;
                if (pack_data.pack_list.length >= pack_data.own) {
                    let tip = this._json_manager.getJsonData(this._json_name.TIPS, 20004).tip;
                    this._dialog_manager.showTipMsg(tip);
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
                    this.merge_data.refrushOrderPanel(true);
                }
            }
        }
        else {
            this._dialog_manager.openDialog(this._dialog_name.MergePackDialog);
        }
    }

    private showMagnet () {
        if (!this.show_magnet.magenet) {
            this.show_magnet.magenet = true;
            let occupy_cell = this.getElementCell(this.show_magnet.index);
            if (occupy_cell && occupy_cell.tile_data) {
                this.merge_data.showMagnetEffect(occupy_cell.tile_data.tile_x, occupy_cell.tile_data.tile_y, this.choose_cell);
            }
        }
    }

    private unshowMagnet () {
        if (this.show_magnet.magenet) {
            this.show_magnet.magenet = false;
            let occupy_cell = this.getElementCell(this.show_magnet.index);
            if (occupy_cell && occupy_cell.tile_data) {
                this.merge_data.stopMagnetEffect(occupy_cell.tile_data.tile_x, occupy_cell.tile_data.tile_y, this.choose_cell);
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
            this._dialog_manager.openDialog(this._dialog_name.MergeElementDialog, {
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
            this.tip_node_list[0].stopAllActions();
            this.tip_node_list[0].getComponent(cc.Sprite).spriteFrame = occupy_cell.tile_data.light? this.tip_spriteframes[0]:this.tip_spriteframes[1];
            cc.tween(this.tip_node_list[0])
                .to(tm, { x: end_pos.x, y: end_pos.y }/* , { easing: "sineInOut" } */)
                .start();
            this.unshowMagnet();
            this.show_magnet.index = tile_index;
            this.choose_cell.element_node.stopAllActions();
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, this.choose_cell.element);
            let type = json_data.type;
            if ([104, 105].indexOf(type) == -1) {
                cc.tween(this.choose_cell.element_node)
                    .to(tm, { x: end_pos.x, y: end_pos.y }/* , { easing: "sineInOut" } */)
                    .call(() => { this.showMagnet(); })
                    .start();
            }
            else {
                cc.tween(this.choose_cell.element_node)
                    .to(tm, { x: end_pos.x, y: end_pos.y }/* , { easing: "sineInOut" } */)
                    .start();
            }
        }
    }

    update (dt) {
        if (this.slipe_to_edg) {
            this.map_node.x += this.slipe_to_edg.x;
            if (this.outEdg()) {
                this.map_node.x -= this.slipe_to_edg.x;
            }
            else {
                this.moveCellElement(this.slipe_touch_point);
            }
        }
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

    private tmpBubbleBroken (tmp_bubble_data: TmpBubbleData) {
        let json_data = this._json_manager.getJsonData(this._json_name.ELE, tmp_bubble_data.id);
        let [id, num] = json_data.copyturn.split(":");
        let new_cell = this.merge_data.getEmptyElement();
        if (new_cell) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, id);
            new_cell.element = Number(id);
            new_cell.icon = json_data.icon;
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
            let effect = cc.instantiate(this.bubble_effect);
            effect.parent = new_cell.element_node;
            effect.setPosition(0, 0);
            cc.tween(new_cell.element_node)
                .delay(0.5)
                .call(() => {
                    if (cc.isValid(effect)) effect.destroy();
                })
                .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
                .call(() => {
                    this.playNewElementEffect(new_cell);
                })
                .start();
            this.merge_data.refrushOrderPanel(true);
            this.merge_data.recordNewElement(new_cell.element, true, true);
            tmp_bubble_data.node.destroy();
            this.merge_data.saveMergeData();
        }
        else {
            let node = this.generateBubbleNode(Number(id));
            let end_pos = node.getPosition();
            let bubble_data = {
                id: Number(id),
                node: node,
            };
            node.setPosition(tmp_bubble_data.node.x, tmp_bubble_data.node.y);
            cc.tween(node).to(MOVE_DURATION, { x: end_pos.x, y: end_pos.y }).start();
            this.merge_data.bubble_list.push(bubble_data);
            tmp_bubble_data.node.destroy();
            this.merge_data.saveMergeData();
        }
        // TODO
        // let data = {
        //     pos_w: tmp_bubble_data.node.parent.convertToWorldSpaceAR(tmp_bubble_data.node.position),
        //     item_id: Number(id),
        //     item_num: Number(num),
        // };
        // this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
        // this._utils.addResNum(Number(id), Number(num));
        // tmp_bubble_data.node.destroy();
        // this.merge_data.saveMergeData();
    }

    private onSoldElement () {
        this.showChooseCell(null);
        this.merge_data.refrushOrderPanel(true);
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
                    node: this.generateBubbleNode(data.reward),
                };
                this.merge_data.bubble_list.push(bubble_data);
            }
            this.merge_data.saveMergeData();
        }
    }

    public generateBubbleNode (ele_id: number): cc.Node {
        let pos_list = [
            new cc.Vec2(0, 0), new cc.Vec2(0, 1), new cc.Vec2(0, 2), new cc.Vec2(0, 3),
            new cc.Vec2(0, 4), new cc.Vec2(1, 0), new cc.Vec2(2, 0), new cc.Vec2(3, 0),
            new cc.Vec2(4, 0),
        ];
        let json_data = this._json_manager.getJsonData(this._json_name.ELE, ele_id);
        let node = cc.instantiate(this.bubble_prefab);
        node.parent = this.bubble_layout;
        let pos = this.tileToPosition(pos_list[Math.floor(Math.random()*pos_list.length)]);
        pos.x += 30-60*Math.random(); pos.y += 30-60*Math.random()-100;
        node.setPosition(pos);
        // cc.tween(node).repeatForever(
        //     cc.tween().by(1.5, { y: 20 }).by(1.5, { y: -20 })
        // ).start();
        this._resource_manager.get(`merge/ele/${json_data.icon}`, cc.SpriteFrame).then((sprite_frame) => {
            if (cc.isValid(node)) {
                cc.find("Icon", node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
            }
        });
        return node;
    }

    private useBubble (bubble_data: BubbleData) {
        let new_cell = this.merge_data.getEmptyElement();
        if (new_cell) {
            let index = this.merge_data.bubble_list.indexOf(bubble_data);
            this.merge_data.bubble_list.splice(index, 1);
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, bubble_data.id);
            new_cell.element = bubble_data.id;
            new_cell.icon = json_data.icon;
            new_cell.use = (json_data.is_use)? {
                is_use: json_data.is_use,
                tm: Date.now(),
                count: (json_data.is_use == 2)? 0:json_data.ues_time,
                max_count: json_data.ues_time,
                cd: json_data.cd,
                runing: (json_data.is_use == 2)? 0:1,
            }:null;
            this.merge_data.refrushCell(new_cell);
            new_cell.element_node.setPosition(bubble_data.node.position);
            let effect = cc.instantiate(this.bubble_effect);
            effect.parent = new_cell.element_node;
            effect.setPosition(0, 0);
            cc.tween(new_cell.element_node)
            .delay(0.5)
            .call(() => {
                if (cc.isValid(effect)) effect.destroy();
            })
            .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
            .call(() => {
                this.playNewElementEffect(new_cell);
            })
            .start();
            bubble_data.node.destroy();
            this.merge_data.refrushOrderPanel(true);
            this.merge_data.recordNewElement(new_cell.element, true, true);
        }
        else {
            let tip = this._json_manager.getJsonData(this._json_name.TIPS, 20003).tip;
            this._dialog_manager.showTipMsg(tip);
        }
    }

    public useTmpBubble (tmp_bubble_data: TmpBubbleData) {
        let index = this.merge_data.tmp_bubble_list.indexOf(tmp_bubble_data);
        this.merge_data.tmp_bubble_list.splice(index, 1);
        let new_cell = this.merge_data.getEmptyElement();
        if (new_cell) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, tmp_bubble_data.id);
            new_cell.element = tmp_bubble_data.id;
            new_cell.icon = json_data.icon;
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
            let effect = cc.instantiate(this.bubble_effect);
            effect.parent = new_cell.element_node;
            effect.setPosition(0, 0);
            cc.tween(new_cell.element_node)
                .delay(0.5)
                .call(() => {
                    if (cc.isValid(effect)) effect.destroy();
                })
                .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
                .call(() => {
                    this.playNewElementEffect(new_cell);
                })
                .start();
            this.merge_data.refrushOrderPanel(true);
            this.merge_data.recordNewElement(new_cell.element, true, true);
        }
        else {
            let node = this.generateBubbleNode(tmp_bubble_data.id);
            let end_pos = node.getPosition();
            node.setPosition(tmp_bubble_data.node.getPosition());
            cc.tween(node)
                .to(MOVE_DURATION, { x: end_pos.x, y: end_pos.y })
                .start();
            let bubble_data: BubbleData = {
                id: tmp_bubble_data.id,
                node: node,
            };
            this.merge_data.bubble_list.push(bubble_data);
            this.merge_data.saveMergeData();
        }
        tmp_bubble_data.node.destroy();
    }

    public generateCopyNode (cell_data: CellData, is_new: boolean) {
        let element = cell_data.element;
        let json_data = this._json_manager.getJsonData(this._json_name.ELE, element);
        let node = cc.instantiate(this.tmpbubble_prefab);
        node.parent = this.bubble_layout;
        node.setPosition(cell_data.tile_data.pos_x+50, cell_data.tile_data.pos_y+50);
        cc.tween(node).repeatForever(
            cc.tween().by(1.5, { y: 20 }).by(1.5, { y: -20 })
        ).start();
        this._resource_manager.get(`merge/ele/${json_data.icon}`, cc.SpriteFrame).then((sprite_frame) => {
            if (cc.isValid(node)) {
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
        let tmp_pack_cell_list = MergeData.instance.tmp_pack_cell_list;
        while (tmp_pack_cell_list.length > 0) {
            let pack_cell_data = tmp_pack_cell_list.pop();
            let new_cell = this.merge_data.getEmptyElement();
            if (new_cell) {
                let pack_list = this.merge_data.pack_data.pack_list;
                new_cell.element = pack_cell_data.element;
                new_cell.icon = pack_cell_data.icon;
                new_cell.use = pack_cell_data.use;
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
        this.merge_data.saveMergeData();
        this.merge_data.refrushOrderPanel(true);
    }

    /**
     * 元素跳动效果
     */
    public playElementJump (cell_data: CellData) {
        if (cc.isValid(cell_data.element_node)) {
            let icon_node = cc.find("Sprite", cell_data.element_node);
            cc.tween(icon_node)
                .to(15/120, { scale: 1.08, })
                .to(15/120, { scale: 1, })
                .to(15/120, { scale: 1.08, })
                .to(25/120, { scale: 1, })
                .start();
        }
    }

    /**
     * 测试给订单中的元素
     */
    private testAddOrderElement () {
        this.scheduleOnce(() => {
            let order_list = this.merge_data.map_data.order_list;
            for (let order_data of order_list) {
                let json_data = this._json_manager.getJsonData(this._json_name.ORDER, order_data.id);
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
