/*
 * 合成数据管理
 */
import MyComponent from "../../Script/common/MyComponent"
import GameConstant from "../../Script/common/GameConstant"
import MergeDialog from "./MergeDialog"
import MergeOrder from "./MergeOrder"
import { 
    TILE_MOVE_SPEED,
    UseData,
    CellData,
    TileData,
    MapData,
    MOVE_DURATION,
    BubbleData,
    TmpBubbleData,
    PackData,
    PackCellData 
} from "./MergeDataInterface"

const COL = 12;
const ROW = 10;
const TWIDTH = 272;
const THEIGHT = 140;
const LOCAL_KEY = "MERGE_DATA"; // 本地KEY
const MERGE_TIP_DURATION = 5;

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeData extends MyComponent {
    public merge_dialog: MergeDialog = null;
    public cell_data_list: CellData[] = [];
    public tile_data_list: TileData[] = [];
    public map_data: MapData = null;
    public cell_count_list = {};
    public bubble_list: BubbleData[] = [];
    public tmp_bubble_list: TmpBubbleData[] = [];
    public pack_data: PackData = null;
    public tmp_pack_cell_list: PackCellData[] = null;
    public element_reward_list: number[] = [];
    public static instance: MergeData = null;
    private has_limit_element: boolean = false; // 限制只能解锁一个的元素
    private merge_tip_node_list: cc.Node[] = [];
    private hand_tip_count: number = 0;
    public endless_strength_tm: number = 0;

    onLoad () {
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_MERGE_FINISH_ORDER, this.onFinishOrder, this);
        this.listen(this._event_name.EVENT_MERGE_CHANGE_ORDER, this.onChangeOrder, this);
        this.listen(this._event_name.SOCKET_MERGE_REWARD, this.onMergeReward, this);
        this.listen(this._event_name.EVENT_MERGE_SOLD_ELEMENT, this.onSoldElement, this);
        this.listen(this._event_name.EVENT_MERGE_TMP_PACK, this.onTmpPack, this);
        this.listen(this._event_name.EVENT_MERGE_ADD_PACK, this.onAddPack, this);
        this.listen(this._event_name.EVENT_TRIGGER_GUIDE, this.onTriggerGuide, this);
        this.listen(this._event_name.EVENT_HAND_TIP, this.onHandTip, this);
        this.merge_dialog = this.node.getComponent(MergeDialog);
        MergeData.instance = this;
    }

    start () {
        // let merge_data_json = cc.sys.localStorage.getItem(LOCAL_KEY);
        let merge_data_json = this._user.getItem(LOCAL_KEY);
        this.initMergeBoard({ board_json: merge_data_json, });
        this.schedule(() => { // 解锁可点击元素提示
            if (!this.has_limit_element) {
                for (let cell of this.cell_data_list) {
                    if (cell && cell.element_node && cell.use && cell.use.is_use == 2 && !cell.use.runing) {
                        cell.element_node.stopAllActions();
                        cc.tween(cell.element_node)
                            .to(0.15, { scale: 1.15 })
                            .to(0.15, { scale: 1.0 })
                            .to(0.15, { scale: 1.15 })
                            .to(0.15, { scale: 1.0 })
                            .start();
                        break;
                    }
                }
            }
        }, 5);
    }

    /**
     * 棋盘数据
     * param data
     */
    private initMergeBoard (data) {
        if (!data.board_json) {
            this.initMapData();
        }
        else {
             let p_data = JSON.parse(data.board_json);
             this.cell_data_list = p_data.cell_data_list;
             this.tile_data_list = p_data.tile_data_list;
             this.map_data = p_data.map_data;
             this.bubble_list = p_data.bubble_list;
             this.tmp_bubble_list = p_data.tmp_bubble_list || [];
             this.tmp_pack_cell_list = p_data.tmp_pack_cell_list;
             this.pack_data = p_data.pack_data;
             this.endless_strength_tm = p_data.endless_strength_tm || 0;
             if (this.tmp_pack_cell_list.length > 0) {
                 this.pack_data.pack_list = this.pack_data.pack_list.concat(this.tmp_pack_cell_list);
                 this.tmp_pack_cell_list = [];
             }
             this.element_reward_list = this._user.getElementRewwardList();
             for (let cell of this.pack_data.pack_list) {
                 if (cell.use && cell.use.is_use == 2 && cell.use.runing) {
                     let tm = cell.use.cd-(Date.now()-cell.use.tm)/1000;
                     if (tm > 0) {
                         this.has_limit_element = true;
                         this.scheduleOnce(this.scheduleSetHasLimit, tm);
                         break;
                     }
                 }
             }
        }
        for (let i = 0; i < COL*ROW; ++i) {
            let cell_data = this.cell_data_list[i];
            let tile_data = this.tile_data_list[i];
            if (!cell_data || !tile_data) { continue; }
            cell_data.tile_data = tile_data;
            this.refrushCell(cell_data);
            this.refrushTile(tile_data);
        }
        let fn_list =[
            () => { this.merge_dialog.refrushMap(this.map_data); },
            () => { this.refrushOrderPanel(true); },
            () => { this.merge_dialog.refrushBubble(this.bubble_list); },
            () => { this.merge_dialog.refrushTmpBubble(this.tmp_bubble_list); },
            () => { this.startPlayMergeTipAnimal(); },
        ];

        this.schedule(() => { fn_list.pop()(); }, 0, fn_list.length-1);
    }

    private scheduleSetHasLimit () {
        this.has_limit_element = false;
    }

    public refrushOrderPanel (sort:boolean) {
        this.refrushCellCountList();
        let element_list = this.sortOrderList();
        for (let cell_data of this.cell_data_list) {
            if (cell_data && cell_data.element && cell_data.tile_data.unlock && cell_data.tile_data.light) {
                let tip_node = cc.find("Tip", cell_data.element_node);
                if (element_list[cell_data.element]) {
                    tip_node.active = true;
                }
                else {
                    tip_node.active = false;
                }
            }
        }
        this._event_manager.dispatch(this._event_name.EVENT_MERGE_REFRUSH_ORDER, {
            list: this.map_data.order_list,
            cell_count_list: this.cell_count_list,
            map_data: this.map_data,
        });
    }

    private refrushOrderFinish () {
        this.refrushCellCountList();
        this._event_manager.dispatch(this._event_name.EVENT_MERGE_REFRUSH_ORDER, {
            cell_count_list: this.cell_count_list,
            map_data: this.map_data,
        });
    }

    private sortOrderList () {
        let order_list = [], finish_count = 0, element_list = {};
        for (let order_data of this.map_data.order_list) {
            let json_data = this._json_manager.getJsonData(this._json_name.ORDER, order_data.id);
            order_data.finish = false;
            order_data.complete = 0;
            let order_info_list = json_data.order_info.split(",");
            for (let order_info of order_info_list) {
                let [ele_id, ele_count] = order_info.split(":");
                if (this.cell_count_list[ele_id] && this.cell_count_list[ele_id] >= ele_count) {
                    order_data.complete ++;
                }
                element_list[ele_id] = 1;
            }
            order_data.finish = (order_data.complete == order_info_list.length);
        }
        this.map_data.order_list.sort((a, b) => {
            if (a.finish == b.finish) {
                if (a.complete > 0 && b.complete == 0) {
                    return -1;
                }
                else if (b.complete > 0 && a.complete == 0) {
                    return 1;
                }
                else {
                    return a.id-b.id;
                }
            }
            else if (a.finish) {
                return -1;
            }
            else {
                return 1;
            }
        });
        return element_list;
    }

    private refrushCellCountList () {
        this.cell_count_list = {};
        // let cell_data_list = this.cell_data_list;
        for (let item of this.cell_data_list) {
            if (item && item.tile_data.light && item.tile_data.unlock && item.element) {
                if (!this.cell_count_list[item.element]) {
                    this.cell_count_list[item.element] = 1;
                }
                else {
                    ++ this.cell_count_list[item.element];
                }
            }
        }
    }

    /**
     * 初始化地图数据
     */
    private initMapData () {
        let board_json = this._json_manager.getJson(this._json_name.BOARD);
        let ele_json = this._json_manager.getJson(this._json_name.ELE);
        let element_record = [];
        let tm = Date.now();
        for (let key in board_json) {
            let value = board_json[key];
            let pos = value.place.split(",");
            let tile_x = Number(pos[0]);
            let tile_y = Number(pos[1]);
            let local_pos = this.tileToPosition(new cc.Vec2(tile_x, tile_y));
            let tile: TileData = {
                tile_x: tile_x,
                tile_y: tile_y,
                pos_x: local_pos.x,
                pos_y: local_pos.y,
                unlock: !value.unlock_condition,
                light: value.light_first,
                area: value.area,
                unlock_condition: value.unlock_condition,
                unlock_para: value.unlock_para,
                com_next: value.com_next,
                tile_node: null,
                cloud_node: null,
            };
            let use: UseData = (ele_json[value.ele].is_use == 0)? null:{
                is_use: ele_json[value.ele].is_use,
                tm: tm,
                count: (ele_json[value.ele].is_use == 2)? 0:ele_json[value.ele].ues_time,
                max_count: ele_json[value.ele].ues_time,
                cd: ele_json[value.ele].cd,
                runing: (ele_json[value.ele].is_use == 2)? 0:1,
            };
            let cell: CellData = {
                tile_data: tile,
                element: value.ele,
                icon: ele_json[value.ele].icon,
                element_node: null,
                use: use,
            };
            if (tile.light && tile.unlock && cell.element && element_record.indexOf(cell.element) == -1) {
                element_record.push(cell.element);
                this.element_reward_list.push(cell.element);
            }
            this.tile_data_list[tile_x+tile_y*COL] = tile;
            this.cell_data_list[tile_x+tile_y*COL] = cell;
        }
        this._user.setElementRewwardList(this.element_reward_list);
        let lv_json = this._json_manager.getJson(this._json_name.COM_LV);
        let order_json = this._json_manager.getJson(this._json_name.ORDER);
        let order_list = [];
        for (let key in order_json) {
            let value = order_json[key];
            if (value.stage == 1 && value.level_start == 1 && !value.pre_order) {
                order_list.push({id: value.id, finish: false, complete: 0, });
            }
        }
        this.map_data = {
            stage: 1,
            stage_name: "",
            stage_icon_eff: "",
            level: 1,
            unlock_area: [1],
            total_exp: 0,
            cur_exp: 0,
            next_exp: 0,
            order_list: order_list,
            element_record: element_record,
        };
        for (let key in lv_json) {
            let value = lv_json[key];
            if (value.stage == 1 && value.lv == 1) {
                this.map_data.next_exp = value.exp;
                this.map_data.stage_name = value.stage_name;
                this.map_data.stage_icon_eff = value.stage_icon_eff;
            }
        }
        this.pack_data = { own: 0, pack_list: [], };
        this.tmp_pack_cell_list = [];
        let bag_json = this._json_manager.getJson(this._json_name.COM_BAG);
        for (let key in bag_json) {
            if (!bag_json[key].unlock_condition) {
                ++ this.pack_data.own;
            }
        }
    }

    /**
     * 完成订单
     * param data.order_data
     * param data.order_info
     * param data.reward_node
     */
    private onFinishOrder (data) {
        let order_id = data.order_data.id;
        let index = -1;
        for (let i = 0; i < this.map_data.order_list.length; ++i) {
            if (this.map_data.order_list[i].id == order_id) {
                index = i; break;
            }
        }
        if (index == -1) { return; }
        let json = this._json_manager.getJson(this._json_name.ORDER);
        let json_data = this._json_manager.getJsonData(this._json_name.ORDER, order_id);
        let order_info_list = json_data.order_info.split(",");
        for (let item of data.order_info) {
            for (let cell_data of this.cell_data_list) {
                if (cell_data && cell_data.tile_data.light && cell_data.tile_data.unlock && cell_data.element == item.ele_id) {
                    cell_data.element = 0;
                    cell_data.icon = null;
                    this.playOrderDeletElementAnimal(
                        item.node,
                        item.node.parent.convertToWorldSpaceAR(item.node.position),
                        cell_data.element_node.parent.convertToWorldSpaceAR(cell_data.element_node.position)
                    );
                    this.refrushCell(cell_data);
                    -- item.ele_count;
                    if (item.ele_count == 0) { break; }
                }
            }
        }
        this.refrushOrderFinish();

        let add_exp = 0, add_fish = 0;
        let order_reward_list = json_data.order_reward.split(",");
        for (let order_reward of order_reward_list) {
            let [item_id, item_count] = order_reward.split(":");
            if (item_id == 100007) {
                add_exp = Number(item_count);
            }
            else if (item_id == 100006) {
                add_fish = Number(item_count);
            }
        }
        this._user.setFish(this._user.getFish()+add_fish, false);
        this.map_data.cur_exp += add_exp;
        this.map_data.total_exp += add_exp;
        this.checkLevelUp();
        // this.refrushOrderPanel(false);

        let reward_node = data.reward_node;
        let tmp_reward_node = cc.instantiate(reward_node);
        tmp_reward_node.parent = this.node;
        tmp_reward_node.position = tmp_reward_node.parent.convertToNodeSpaceAR(
            reward_node.parent.convertToWorldSpaceAR(reward_node.position)
        );
        tmp_reward_node.active = false;
        this.scheduleOnce(() => {
            let end_pos = this.merge_dialog.task_node.parent.convertToWorldSpaceAR(
                this.merge_dialog.task_node.position
            );
            end_pos = this.node.convertToNodeSpaceAR(end_pos);
            this._audio_manager.playEffect(this._audio_name.MERGE_GOLD);
            tmp_reward_node.active = true;
            cc.tween(tmp_reward_node)
                .to(0.1, { scale: 2 })
                .to(0.1, { scale: 1.875 })
                .to(0.2, { x: end_pos.x, y: end_pos.y, scale: 1.875, })
                .to(0.1, { scale: 2 })
                .to(0.1, { scale: 1.875 })
                .removeSelf()
                .call(() => {
                    this.refrushOrderPanel(false);
                    this._user.setFish(this._user.getFish());
                })
                .start();
        }, 1.0);

        this.saveMergeData();
    }

    /**
     * 订单变化
     * param add_order_data
     * param del_order_data
     */
    private onChangeOrder (data) {
        for (let i = this.map_data.order_list.length-1; i >= 0; --i) {
            if (this.map_data.order_list[i].id == data.del_order_data.id) {
                this.map_data.order_list.splice(i, 1);
            }
        }
        for (let item of data.add_order_data) {
            this.map_data.order_list.push(item);
        }
        this.saveMergeData();
        this.refrushOrderPanel(true);
    }

    /**
     * 订单删除元素动画
     */
    private playOrderDeletElementAnimal (node: cc.Node, end_pos: cc.Vec2, start_pos: cc.Vec3) {
        let tmp_node = cc.instantiate(node);
        tmp_node.parent = this.node;
        tmp_node.position = tmp_node.parent.convertToNodeSpaceAR(start_pos);
        end_pos = tmp_node.parent.convertToNodeSpaceAR(end_pos);
        let offx = (tmp_node.x <= node.x)? 100:-100;
        let offy = 50;
        cc.tween(tmp_node)
            .to(0.1, { scale: 0.8, y: tmp_node.position.y+offy })
            .to(0.1, { scale: 1.2 })
            .bezierTo(
                0.7,
                new cc.Vec2(tmp_node.position.x+offx, tmp_node.position.y+offy),
                new cc.Vec2(end_pos.x+offx, end_pos.y),
                end_pos
            )
            .to(0.1, { scale: 1 })
            .removeSelf()
            .start();
    }

    private checkLevelUp (): boolean {
        let has_new = false;
        if (this.map_data.cur_exp >= this.map_data.next_exp) {
            let lv_json = this._json_manager.getJson(this._json_name.COM_LV);
            let json_data = null;
            let order_json = this._json_manager.getJson(this._json_name.ORDER);
            for (let key in lv_json) {
                if (this.map_data.cur_exp < this.map_data.next_exp) { break; }
                let value = lv_json[key];
                if (value.stage == this.map_data.stage && value.lv == this.map_data.level) {
                    json_data = this._json_manager.getJsonData(this._json_name.COM_LV, value.next_lv);
                    this.map_data.cur_exp -= this.map_data.next_exp;
                    this.map_data.level = json_data.lv;
                    this.map_data.stage = json_data.stage;
                    this.map_data.next_exp = json_data.exp;
                    this.map_data.stage_name = json_data.stage_name;
                    for (let key in order_json) {
                        let value = order_json[key];
                        if (value.stage == this.map_data.stage && value.level_start == this.map_data.level && !value.pre_order) {
                            this.map_data.order_list.push(value.id);
                            has_new = true;
                        }
                    }
                }
            }
            this.node.getComponent(MergeDialog).refrushMap(this.map_data);
            this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
                type: 101,
                args: [this.map_data.level],
            });
            this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
                type: 1002,
                args: [this.map_data.stage, this.map_data.level],
            });
        }
        return has_new;
    }

    /**
     * 合成奖励
     */
    private onMergeReward (data) {
        /* null */
    }

    private onSoldElement (cell_data: CellData) {
        let ele_json = this._json_manager.getJsonData(this._json_name.ELE, cell_data.element);
        let reward = ele_json.price.split(":");
        let data = {
            pos_w: cell_data.element_node.parent.convertToWorldSpaceAR(cell_data.element_node.position),
            item_id: reward[0],
            item_num: reward[1],
        };
        this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
        cell_data.element = null;
        cell_data.icon = null;
        this.refrushCell(cell_data);
        this.refrushOrderPanel(true);
        this.saveMergeData();
    }

    /**
     * 复制元素
     */
    public moveCopyElement (occupy_element: CellData, element: CellData): boolean {
        if (occupy_element && element && occupy_element.element != element.element && occupy_element.element && element.element) {
            let occupy_json_data = this._json_manager.getJsonData(this._json_name.ELE, occupy_element.element);
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, element.element);
            if (json_data.type == 105) { // 复制器
                if (json_data.use_value >= occupy_json_data.item_level) {
                    element.element = 0;
                    let start_pos = element.element_node.getPosition();
                    this.refrushCell(element);
                    let new_cell = this.getEmptyElement();
                    new_cell.element = occupy_element.element;
                    new_cell.use = this._utils.clone(occupy_element.use);
                    this.refrushCell(new_cell);
                    new_cell.element_node.setPosition(start_pos);
                    cc.tween(new_cell.element_node)
                        .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
                        .call(() => {
                            let effect_node = cc.instantiate(this.merge_dialog.speedup_effect_prefab);
                            effect_node.parent = new_cell.element_node;
                            effect_node.setPosition(0, 0);
                            effect_node.zIndex = -1;
                            this.scheduleOnce(() => {
                                if (cc.isValid(effect_node)) { effect_node.destroy(); }
                            }, 1);
                        })
                        .start();
                    this.saveMergeData();
                }
                else {
                    this.refrushCell(element);
                    this._dialog_manager.showTipMsg(`仅能复制${json_data.use_value}等级元素！`);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * 拆分元素
     */
    public moveSplitElement (occupy_element: CellData, element: CellData): boolean {
        if (occupy_element && element && occupy_element.element != element.element && occupy_element.element && element.element) {
            let occupy_json_data = this._json_manager.getJsonData(this._json_name.ELE, occupy_element.element);
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, element.element);
            if (json_data.type == 104) { // 拆分器
                if (occupy_json_data.item_level == 1) {
                    this._dialog_manager.showTipMsg(`一级元素不能拆分！`);
                    this.refrushCell(element);
                }
                else if (json_data.use_value >= occupy_json_data.item_level) {
                    let split_json_data = this._json_manager.getJsonData(this._json_name.ELE, occupy_element.element-1);
                    element.element = 0;
                    let start_pos = element.element_node.getPosition();
                    this.refrushCell(element);
                    for (let i = 0; i < 2; ++i) {
                        let new_cell = this.getEmptyElement();
                        if (new_cell) {
                            new_cell.element = occupy_element.element-1;
                            new_cell.icon = split_json_data.icon;
                            new_cell.use = (split_json_data.is_use)? {
                                is_use: split_json_data.is_use,
                                tm: Date.now(),
                                count: (split_json_data.is_use == 2)? 0:split_json_data.ues_time,
                                max_count: split_json_data.ues_time,
                                cd: split_json_data.cd,
                                runing: (split_json_data.is_use == 2)? 0:1,
                            }:null;
                            this.refrushCell(new_cell);
                            new_cell.element_node.setPosition(start_pos);
                            cc.tween(new_cell.element_node)
                                .to(MOVE_DURATION, { x: new_cell.tile_data.pos_x, y: new_cell.tile_data.pos_y })
                                .call(() => {
                                    let effect_node = cc.instantiate(this.merge_dialog.speedup_effect_prefab);
                                    effect_node.parent = new_cell.element_node;
                                    effect_node.setPosition(0, 0);
                                    effect_node.zIndex = -1;
                                    this.scheduleOnce(() => {
                                        if (cc.isValid(effect_node)) { effect_node.destroy(); }
                                    }, 1);
                                })
                                .start();
                        }
                        else {
                            let node = this.merge_dialog.generateBubbleNode(occupy_element.element-1);
                            let end_pos = node.getPosition();
                            node.setPosition(start_pos);
                            cc.tween(node)
                                .to(MOVE_DURATION, { x: end_pos.x, y: end_pos.y })
                                .start();
                            let bubble_data: BubbleData = {
                                id: occupy_element.element-1,
                                node: node,
                            };
                            this.bubble_list.push(bubble_data);
                        }
                    }
                    occupy_element.element = occupy_element.element-1;
                    occupy_element.use = (split_json_data.is_use)? {
                        is_use: split_json_data.is_use,
                        tm: Date.now(),
                        count: (split_json_data.is_use == 2)? 0:split_json_data.ues_time,
                        max_count: split_json_data.ues_time,
                        cd: split_json_data.cd,
                        runing: (split_json_data.is_use == 2)? 0:1,
                    }:null;
                    this.refrushCell(occupy_element);
                    let effect_node = cc.instantiate(this.merge_dialog.speedup_effect_prefab);
                    effect_node.parent = occupy_element.element_node;
                    effect_node.setPosition(0, 0);
                    effect_node.zIndex = -1;
                    this.scheduleOnce(() => {
                        if (cc.isValid(effect_node)) { effect_node.destroy(); }
                    }, 1);
                    this.refrushOrderPanel(true);
                    this.saveMergeData();
                }
                else {
                    this.refrushCell(element);
                    this._dialog_manager.showTipMsg(`仅能拆分${json_data.use_value}等级以下元素！`);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * 移动元素
     * param occupy_element 移动种植位置元素
     * param element 移动的元素
     * return 是否有元素合成
     */
    public moveElement (occupy_element: CellData, element: CellData): boolean {
        let has_merge = true, list: cc.Vec2[] = null; 
        let merge_list = [], up_list = [], unlock_list = [];
        let com_next = this._json_manager.getJsonData(this._json_name.ELE, element.element).com_next;
        if (occupy_element == element) {
            if (element.element && !com_next) {
                list = [];
            }
            else {
                list = this.getNearSameElements(occupy_element.tile_data.tile_x, occupy_element.tile_data.tile_y, element.element);
            }
            let json_data = this._json_manager.getJsonData(this._json_name.COM_NUM, list.length);
            if (!json_data || json_data.com_num == 0) {
                this.refrushCell(element);
                has_merge = false;
            }
            else {
                up_list = list.slice(0, json_data.com_num);
                merge_list = list.slice(json_data.com_num, list.length-json_data.res_num);
                unlock_list = list.slice(list.length-json_data.res_num, list.length);
            }
        }
        else {
            if (element.element && !com_next) {
                list = [];
            }
            else {
                list = this.getNearSameElements(occupy_element.tile_data.tile_x, occupy_element.tile_data.tile_y, element.element, element.tile_data.tile_x+element.tile_data.tile_y*COL);
                let p = new cc.Vec2(element.tile_data.tile_x, element.tile_data.tile_y);
                list.splice(2, 0, p);
            }
            let json_data = this._json_manager.getJsonData(this._json_name.COM_NUM, list.length);
            if (!json_data || json_data.com_num == 0) {
                if (Math.abs(occupy_element.tile_data.tile_x-element.tile_data.tile_x)+Math.abs(occupy_element.tile_data.tile_y-element.tile_data.tile_y) == 1) {
                    this.swapElementCell(occupy_element, element, true);
                }
                else {
                    let null_cell = this.getNearEmptyElement(occupy_element.tile_data.tile_x, occupy_element.tile_data.tile_y, element);
                    if (null_cell == element) {
                        this.swapElementCell(occupy_element, element, true);
                    }
                    else {
                        this.swapElementCell(null_cell, occupy_element, true);
                        this.swapElementCell(occupy_element, element, true);
                    }
                }
                has_merge = false;
            }
            else {
                if (occupy_element.element == element.element || occupy_element.element != 0) {
                    up_list = list.slice(0, json_data.com_num);
                    merge_list = list.slice(json_data.com_num, list.length-json_data.res_num);
                    unlock_list = list.slice(list.length-json_data.res_num, list.length);
                }
                else {
                    let p = new cc.Vec2(occupy_element.tile_data.tile_x, occupy_element.tile_data.tile_y);
                    list.splice(0, 0, p);
                    up_list = list.slice(0, json_data.com_num);
                    merge_list = list.slice(json_data.com_num, list.length-json_data.res_num);
                    unlock_list = list.slice(list.length-json_data.res_num, list.length);
                }
            }
        }
        let move_duration = MOVE_DURATION;
        if (has_merge) {
            let up_effect_node_list = [];
            for (let i = 0; i < list.length; ++i) {
                let cell_data = this.cell_data_list[list[i].x+list[i].y*COL];
                if (cc.isValid(cell_data.element_node)) {
                    if (this.has_limit_element && cell_data.use && cell_data.use.is_use == 2 && cell_data.use.runing) {
                        this.has_limit_element = false;
                    }
                    cell_data.element_node.stopAllActions();
                    let node_list = this.showUpEffect(cell_data);
                    up_effect_node_list.push(node_list[0]);
                    up_effect_node_list.push(node_list[1]);
                    cc.tween(cell_data.element_node)
                        .to(move_duration, { x: occupy_element.tile_data.pos_x, y: occupy_element.tile_data.pos_y, scale: 1, })
                        .start();
                }
            }
            this.scheduleOnce(() => {
                for (let node of up_effect_node_list) {
                    if (cc.isValid(node)) node.destroy();
                }
            }, 1);
            this.scheduleOnce(() => {
                this._audio_manager.playEffect((up_list.length == 2)? this._audio_name.MERGE_FIVE:this._audio_name.MERGE_THREE);
                let ele_next = this._json_manager.getJsonData(this._json_name.ELE, element.element).com_next;
                let ele_json = this._json_manager.getJsonData(this._json_name.ELE, ele_next);
                for (let i = 0; i < merge_list.length; ++i) {
                    let cell_data = this.cell_data_list[merge_list[i].x+merge_list[i].y*COL];
                    cell_data.element = 0;
                    cell_data.icon = null;
                    cell_data.tile_data.light = true;
                    this.refrushCell(cell_data);
                    this.refrushTile(cell_data.tile_data);
                }
                let has_copy_element = false;
                for (let i = 0; i < up_list.length; ++i) {
                    let cell_data = this.cell_data_list[up_list[i].x+up_list[i].y*COL];
                    cell_data.element = ele_next;
                    cell_data.icon = ele_json.icon;
                    cell_data.tile_data.light = true;
                    cell_data.use = (ele_json.is_use)? {
                        is_use: ele_json.is_use,
                        tm: Date.now(),
                        count: (ele_json.is_use == 2)? 0:ele_json.ues_time,
                        max_count: ele_json.ues_time,
                        cd: ele_json.cd,
                        runing: (ele_json.is_use == 2)? 0:1,
                    }:null;
                    this.refrushCell(cell_data);
                    this.refrushTile(cell_data.tile_data);
                    cell_data.element_node.stopAllActions();
                    cell_data.element_node.setPosition(occupy_element.tile_data.pos_x, occupy_element.tile_data.pos_y); 
                    cc.tween(cell_data.element_node)
                        .to(move_duration, { x: cell_data.tile_data.pos_x, y: cell_data.tile_data.pos_y, scale: 1, })
                        .to(0.1, { scale: 1.2 })
                        .to(0.1, { scale: 0.9 })
                        .to(0.1, { scale: 1.1 })
                        .to(0.1, { scale: 1 })
                        .call(() => {
                            if (ele_json.copyrate > 0 && Math.random() < ele_json.copyrate/100) {
                                this.merge_dialog.generateCopyNode(cell_data, true);
                                has_copy_element = true;
                            }
                        })
                        .start();
                    if (ele_json.com_reward) {
                        let reward = ele_json.com_reward.split(":");
                        let data = {
                            pos_w: cell_data.element_node.parent.convertToWorldSpaceAR(cell_data.element_node.position),
                            item_id: reward[0],
                            item_num: reward[1],
                        };
                        this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
                    }
                }
                this.showComboEffect(up_list.length, occupy_element);
                for (let i = 0; i < unlock_list.length; ++i) {
                    let cell_data = this.cell_data_list[unlock_list[i].x+unlock_list[i].y*COL];
                    cell_data.tile_data.light = true;
                    this.refrushCell(cell_data);
                    this.refrushTile(cell_data.tile_data);
                    cell_data.element_node.stopAllActions();
                    cell_data.element_node.setPosition(occupy_element.tile_data.pos_x, occupy_element.tile_data.pos_y);
                    cc.tween(cell_data.element_node)
                        .to(move_duration, { x: cell_data.tile_data.pos_x, y: cell_data.tile_data.pos_y })
                        .start();
                }
                this.recordNewElement(ele_next, true, true);
                this.scheduleOnce(() => {
                    if (has_copy_element) { this.saveMergeData(); }
                }, 0.5+move_duration);
                this.checkLevelUp();
                this.refrushOrderPanel(true);
            }, move_duration);
        }
        else {
            this.refrushOrderPanel(false);
            this.saveMergeData();
        }
        return has_merge;
    }

    /**
     * 显示合成效果
     * param count 合成元素的数量
     */
    private showComboEffect (count: number, cell_data: CellData) {
        if (count >= 2) {
            let pos = new cc.Vec2(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
            pos = this.merge_dialog.tiles_layout.convertToWorldSpaceAR(pos);
            pos = this.node.convertToNodeSpaceAR(pos);
            pos.y += 120;
            let node = cc.instantiate(this.merge_dialog.combo_effect_prefab);
            node.parent = this.node;
            node.setPosition(pos);
            this.scheduleOnce(() => {
                if (cc.isValid(node)) {
                    node.destroy();
                }
            }, 1.3);
            this._audio_manager.playEffect(this._audio_name.MERGE_GREAT);
        }
    }

    /**
     * 显示升级效果
     * param cell_data
     */
    public showUpEffect (cell_data: CellData): cc.Node[] {
        let tile_up_node = cc.instantiate(this.merge_dialog.tile_up_prefab);
        tile_up_node.parent = cell_data.tile_data.tile_node;
        tile_up_node.setPosition(0, 0);
        let element_up_node = cc.instantiate(this.merge_dialog.element_up_prefab);
        element_up_node.parent = cc.isValid(cell_data.element_node)? cell_data.element_node:cell_data.tile_data.tile_node;
        return [element_up_node, tile_up_node];
    }

    /**
     * 交换两个元素
     */
    public swapElementCell (element1: CellData, element2: CellData, animal?: boolean) {
        let pos1 = new cc.Vec2(element1.tile_data.pos_x, element1.tile_data.pos_y);
        let pos2 = new cc.Vec2(element2.tile_data.pos_x, element2.tile_data.pos_y);
        let speed = TILE_MOVE_SPEED;
        if (animal) {
            if (cc.isValid(element1.element_node)) {
                pos2 = element1.element_node.getPosition();
            }
            if (cc.isValid(element2.element_node)) {
                pos1 = element2.element_node.getPosition();
            }
        }
        [element1.icon, element2.icon] = [element2.icon, element1.icon];
        [element1.element, element2.element] = [element2.element, element1.element];
        [element1.use, element2.use] = [element2.use, element1.use];
        this.refrushCell(element1);
        this.refrushCell(element2);
        if (animal) {
            if (cc.isValid(element1.element_node)) {
                let pos = new cc.Vec2(element1.tile_data.pos_x, element1.tile_data.pos_y)
                let tm = pos.sub(pos1).mag()/speed;
                element1.element_node.stopAllActions();
                element1.element_node.setPosition(pos1.x, pos1.y);
                cc.tween(element1.element_node)
                    .to(tm, { x: pos.x, y: pos.y })
                    .start();
            }
            if (cc.isValid(element2.element_node)) {
                let pos = new cc.Vec2(element2.tile_data.pos_x, element2.tile_data.pos_y)
                let tm = pos.sub(pos2).mag()/speed;
                element2.element_node.stopAllActions();
                element2.element_node.setPosition(pos2.x, pos2.y);
                cc.tween(element2.element_node)
                    .to(tm, { x: pos.x, y: pos.y })
                    .start();
            }
        }
    }

    /**
     * 获取相邻的相同元素
     * param tile_x
     * param tile_y
     * param element 元素类型
     * param except 排除元素
     */
    public getNearSameElements (tile_x: number, tile_y: number, element: number, except?: number): cc.Vec2[] {
        let open_list = [tile_x+tile_y*COL], close_list = [], result_list = [];
        while (open_list.length > 0/*  && result_list.length < 5 */) {
            let index = open_list.shift();
            close_list.push(index);
            let cell_data = this.cell_data_list[index];
            if (cell_data.element == element) { result_list.push(index); }
            else if (close_list.length > 1) { continue; }
            if (index+1 != except && close_list.indexOf(index+1) == -1 && open_list.indexOf(index+1) == -1) {
                cell_data = this.cell_data_list[index+1];
                if (cell_data && cell_data.tile_data.unlock && cell_data.element == element) { open_list.push(index+1); }
            }
            if (index-1 != except && close_list.indexOf(index-1) == -1 && open_list.indexOf(index-1) == -1) {
                cell_data = this.cell_data_list[index-1];
                if (cell_data && cell_data.tile_data.unlock && cell_data.element == element) { open_list.push(index-1); }
            }
            if (index-COL != except && close_list.indexOf(index-COL) == -1 && open_list.indexOf(index-COL) == -1) {
                cell_data = this.cell_data_list[index-COL];
                if (cell_data && cell_data.tile_data.unlock && cell_data.element == element) { open_list.push(index-COL); }
            }
            if (index+COL != except && close_list.indexOf(index+COL) == -1 && open_list.indexOf(index+COL) == -1) {
                cell_data = this.cell_data_list[index+COL];
                if (cell_data && cell_data.tile_data.unlock && cell_data.element == element) { open_list.push(index+COL); }
            }
        }
        for (let i = 0; i < result_list.length; ++i) {
            let item = result_list[i];
            result_list[i] = new cc.Vec2(item%COL, Math.floor(item/COL));
        }
        return result_list;
    }

    /**
     * 刷新tile
     * param tile_data
     */
    public refrushTile (tile_data: TileData) {
        if (tile_data) {
            if (tile_data.light && cc.isValid(tile_data.tile_node)) {
                tile_data.tile_node.destroy();
                tile_data.tile_node = null;
            }
            else if (!tile_data.light && !cc.isValid(tile_data.cloud_node)) {
                tile_data.tile_node = cc.instantiate(this.merge_dialog.tile_prefab);
                tile_data.tile_node.parent = this.merge_dialog.tiles_layout;
                tile_data.tile_node.setPosition(tile_data.pos_x, tile_data.pos_y);
            }
            if (tile_data.unlock && cc.isValid(tile_data.cloud_node)) {
                let node = tile_data.cloud_node;
                let pos = node.position.add(node.parent.position);
                node.parent = this.merge_dialog.tiles_layout.parent;
                node.position = pos;
                cc.tween(tile_data.cloud_node)
                    .delay(0.3)
                    .to(0.8, { opacity: 0 })
                    .removeSelf()
                    .start();
                tile_data.cloud_node = null;
            }
            else if (!tile_data.unlock && !cc.isValid(tile_data.cloud_node)) {
                tile_data.cloud_node = cc.instantiate(this.merge_dialog.cloud_prefab);
                tile_data.cloud_node.parent = this.merge_dialog.cloud_layout;
                tile_data.cloud_node.setPosition(tile_data.pos_x, tile_data.pos_y);
                tile_data.cloud_node.getComponent(cc.Sprite).spriteFrame = this.merge_dialog.cloud_spritefrmaes[(tile_data.area >= 7)? 1:0];
            }
        }
    }

    /**
     * 刷新element
     * param cell_data
     */
    public refrushCell (cell_data: CellData) {
        if (cell_data) {
            if (cell_data.element /* && cell_data.icon */ && cell_data.tile_data.unlock) {
                if (!cc.isValid(cell_data.element_node)) {
                    cell_data.element_node = cc.instantiate(this.merge_dialog.element_prefab);
                    cell_data.element_node.parent = this.merge_dialog.elments_layout;
                }
                let lock_node = cc.find("Lock", cell_data.element_node);
                lock_node.active = false;
                lock_node.zIndex = 1;
                let tip_node = cc.find("Tip", cell_data.element_node);
                tip_node.zIndex = 1;
                cell_data.element_node.zIndex = COL*ROW-cell_data.tile_data.tile_y*COL-cell_data.tile_data.tile_x;
                cell_data.element_node.stopAllActions();
                cell_data.element_node.setPosition(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
                cell_data.element_node.scale = 1;
                let icon_node = cc.find("Sprite", cell_data.element_node);
                let icon_sprite = icon_node.getComponent(cc.Sprite);
                icon_sprite.setMaterial(
                    0,
                    cc.Material.getBuiltinMaterial(cell_data.tile_data.light? "2d-sprite":"2d-gray-sprite")
                );
                cell_data.icon = this._json_manager.getJsonData(this._json_name.ELE, cell_data.element).icon;
                this._resource_manager.get(`merge/ele/${cell_data.icon}`, cc.SpriteFrame).then((sprite_frame) => {
                    if (cc.isValid(icon_sprite)) {
                        icon_sprite.spriteFrame = sprite_frame;
                    }
                });
                let light_node = cc.find("MergeLightPrefab", cell_data.element_node);
                let use_node = cc.find("MergeUsePrefab", cell_data.element_node);

                // 添加母体效果
                if (cell_data.tile_data.light && cell_data.tile_data.unlock && cell_data.use) { 
                    let use_data = cell_data.use;
                    if (!cc.isValid(use_node)) {
                        use_node = cc.instantiate(this.merge_dialog.use_prefab);
                        use_node.parent = icon_node.parent;
                        use_node.setPosition(0, 0);
                    }
                    let count_node = cc.find("Count", use_node);
                    let clock_node = cc.find("Clock", use_node);
                    use_node.stopAllActions();
                    if (use_data.cd && use_data.count == 0 && use_data.runing) {
                        if ((Date.now()-use_data.tm)/1000 >= use_data.cd) {
                            use_data.count = use_data.max_count;
                            use_data.tm = Date.now();
                        }
                    }
                    if (use_data.count > 0) {
                        if (!cc.isValid(light_node)) {
                            light_node = cc.instantiate(this.merge_dialog.light_prefab);
                            light_node.parent = icon_node.parent;
                            light_node.setPosition(0, 0);
                        }
                        icon_node.scale = 1;
                        icon_node.stopAllActions();
                        cc.tween(icon_node).repeatForever(
                            cc.tween()
                                .to(15/60, { scale: 1.08 })
                                .to(15/60, { scale: 1 })
                                .to(15/60, { scale: 1.08 })
                                .to(25/60, { scale: 1 })
                                .delay(50/60)

                        ).start();
                        light_node.scale = 0.7;
                        light_node.opacity = 0;
                        light_node.angle = 0;
                        light_node.stopAllActions();
                        cc.tween(light_node).repeatForever(
                            cc.tween()
                                .to(20/60, { scale: 0.775, opacity: 60 })
                                .to(30/60, { scale: 0.8875, opacity: 60 })
                                .to(30/60, { scale: 1, opacity: 0 })
                                .delay(40/60)
                        ).start();
                        light_node.runAction(cc.repeatForever(
                            cc.rotateBy(1, 30)
                        ));

                        count_node.active = false;
                        clock_node.active = false;
                        cc.find("Label", count_node).getComponent(cc.Label).string = use_data.count.toString();
                    }
                    else {
                        if (cc.isValid(light_node)) { light_node.destroy(); }
                        icon_node.scale = 1;
                        icon_node.stopAllActions();

                        count_node.active = false;
                        clock_node.active = false;
                        if (use_data.runing) {
                            clock_node.active = true;
                            if (use_data.is_use == 2) {
                                this.unschedule(this.scheduleSetHasLimit);
                                this.has_limit_element = true;
                            }
                            let label = cc.find("Label", clock_node).getComponent(cc.Label);
                            let sec = use_data.cd-(Date.now()-use_data.tm)/1000;
                            label.string = this._utils.convertTime(sec);
                            let fn = () => {
                                let sec = use_data.cd-(Date.now()-use_data.tm)/1000;
                                label.string = this._utils.convertTime(sec);
                                if (sec <= 0) {
                                    if (this.has_limit_element && cell_data.use.is_use == 2) {
                                        this.has_limit_element = false;
                                    }
                                    this.refrushCell(cell_data);
                                    this.unschedule(fn);
                                }
                            };
                            cc.tween(use_node).repeatForever(
                                cc.tween().call(fn).delay(1)
                            ).start();
                        }
                        else {
                            lock_node.active = true;
                        }
                    }
                }
                else {
                    icon_node.stopAllActions();
                    icon_node.scale = 1;
                    icon_node.setPosition(0, 0);
                    if (cc.isValid(light_node)) { light_node.destroy(); }
                    if (cc.isValid(use_node)) { use_node.destroy(); }
                }
            }
            else {
                if (cc.isValid(cell_data.element_node)) {
                    cell_data.element_node.destroy();
                }
                cell_data.element_node = null;
            }
        }
    }

    /**
     * 获取最近的空位
     * param tile_x
     * param tile_y
     * param contain 可以包含的非空元素
     */
    public getNearEmptyElement (tile_x: number, tile_y: number, contain?: CellData): CellData {
        let index = tile_x+tile_y*COL;
        let open_list = [];
        let close_list = [index];
        let off = [-1, 1, -COL, COL, -1+COL, -1-COL, 1+COL, 1-COL];
        for (let item of off) {
            if (this.cell_data_list[item+index]) {
                open_list.push(index+item);
            }
        }
        while (open_list.length > 0) {
            index = open_list.shift();
            let cell_data = this.cell_data_list[index];
            if (cell_data.tile_data.light && cell_data.tile_data.unlock && (!cell_data.element || cell_data == contain)) {
                return cell_data;
            }
            else {
                close_list.push(index);
                for (let item of off) {
                    if (this.cell_data_list[item+index] && open_list.indexOf(index+item) == -1 && close_list.indexOf(index+item) == -1) {
                        open_list.push(index+item);
                    }
                }
            }
        }
        return null;
    }

    public getEmptyElement (): CellData {
        for (let item of this.cell_data_list) {
            if (item && item.tile_data.light && item.tile_data.unlock && !item.element) {
                return item;
            }
        }
        return null;
    }

    public getEmptyElementCount (): number {
        let count = 0;
        for (let item of this.cell_data_list) {
            if (item && item.tile_data.light && item.tile_data.unlock && !item.element) {
                ++ count;
            }
        }
        return count;
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
     * 被选中长按时效果
     * param tile_x 移动的位置
     * param tile_y 移动的位置
     * param choose_cell 选中的元素
     */
    public showMagnetEffect (tile_x: number, tile_y: number, choose_cell: CellData) {
        let occupy_cell = this.cell_data_list[tile_x+tile_y*COL];
        let index = choose_cell.tile_data.tile_x+choose_cell.tile_data.tile_y*COL;
        if (occupy_cell != choose_cell && occupy_cell.tile_data.light && occupy_cell.tile_data.unlock) {
            if (cc.isValid(occupy_cell.element_node)) {
                occupy_cell.element_node.stopAllActions();
                cc.tween(occupy_cell.element_node)
                    .to(0.1, { x: occupy_cell.tile_data.pos_x-90 })
                    .start();
            }
        }
        let com_next = this._json_manager.getJsonData(this._json_name.ELE, choose_cell.element).com_next;
        if (occupy_cell.tile_data.light && occupy_cell.tile_data.unlock && com_next) {
            let list = this.getNearSameElements(tile_x, tile_y, choose_cell.element, index);
            let cell_data_list: CellData[] = [];
            for (let p of list) {
                let cell_data = this.cell_data_list[p.x+p.y*COL];
                if (cell_data.tile_data.unlock && cell_data != choose_cell) {
                    cell_data_list.push(cell_data);
                }
            }
            if (cell_data_list.length >= 2) {
                let end_pos = new cc.Vec2(occupy_cell.tile_data.pos_x, occupy_cell.tile_data.pos_y);
                for (let cell_data of cell_data_list) {
                    let start_pos = new cc.Vec2(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
                    if (start_pos.x != end_pos.x || start_pos.y != end_pos.y) {
                        let v = end_pos.sub(start_pos);
                        let distance = v.mag();
                        v.x /= distance/30; v.y /= distance/30;
                        cell_data.element_node.stopAllActions();
                        cell_data.element_node.setPosition(start_pos);
                        cell_data.element_node.zIndex = 1;
                        cc.tween(cell_data.element_node).repeatForever(
                            cc.tween()
                            .to(0.8, { x: start_pos.x+v.x, y: start_pos.y+v.y }, { easing: 'sineIn' })
                            .to(0.8, { x: start_pos.x, y: start_pos.y }, { easing: 'sineOut' })
                        ).start();
                    }
                    else {
                        cell_data.element_node.stopAllActions();
                        cell_data.element_node.setPosition(start_pos);
                    }
                }
            }
        }
    }

    /**
     * 被选中长按时效果
     * param tile_x 移动的位置
     * param tile_y 移动的位置
     * param choose_cell 选中的元素
     */
    public stopMagnetEffect (tile_x: number, tile_y: number, choose_cell: CellData) {
        let occupy_cell = this.cell_data_list[tile_x+tile_y*COL];
        let index = choose_cell.tile_data.tile_x+choose_cell.tile_data.tile_y*COL;
        let list = this.getNearSameElements(tile_x, tile_y, choose_cell.element, index);
        if (cc.isValid(occupy_cell.element_node) && occupy_cell != choose_cell) {
            occupy_cell.element_node.stopAllActions();
            cc.tween(occupy_cell.element_node)
                .to(0.1, { x: occupy_cell.tile_data.pos_x })
                .start();
        }
        if (list.length >= 2 && occupy_cell.tile_data.light && occupy_cell.tile_data.unlock) {
            for (let p of list) {
                let cell_data = this.cell_data_list[p.x+p.y*COL];
                if (cell_data == choose_cell) { continue; }
                if (cc.isValid(cell_data.element_node)) {
                    cell_data.element_node.stopAllActions();
                    cell_data.element_node.zIndex = 0;
                    cc.tween(cell_data.element_node)
                        .to(0.1, { x: cell_data.tile_data.pos_x, y: cell_data.tile_data.pos_y })
                        .start();
                }
            }
        }
    }

    /**
     * 获取cell_index
     */
    public getCellIndex (cell_data: CellData): number {
        return cell_data.tile_data.tile_x+cell_data.tile_data.tile_y*COL;
    }

    /**
     * 记录新元素
     * param element
     * param save 是否保存
     * param pop 弹出新元素弹窗
     */
    public recordNewElement (element: number, save, pop) {
        element = Number(element);
        if (this.map_data.element_record.indexOf(element) == -1) {
            this.map_data.element_record.push(element);
            this.element_reward_list.push(element);
            this._user.setElementRewwardList(this.element_reward_list);
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, element);
            let level = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1012).int_para;
            if (pop && this._guide_manager.getGuideFinish() && json_data.item_level >= level) {
                this._dialog_manager.openDialog(this._dialog_name.MergeNewElementDialog, element);
            }
            this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
                type: 1003,
                args: [element],
            });
            this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
                type: 1004,
                args: [this.map_data.element_record.length],
            });
        }
        if (save) { this.saveMergeData(); }
    }

    private onTmpPack (pack_cell_data: PackCellData) {
        if (this.tmp_pack_cell_list.length < this.getEmptyElementCount()) {
            this.tmp_pack_cell_list.push(pack_cell_data);
            let index = this.pack_data.pack_list.indexOf(pack_cell_data);
            if (index != -1) { this.pack_data.pack_list.splice(index, 1); }
            this.saveMergeData();
        }
        else {
            let tip = this._json_manager.getJsonData(this._json_name.TIPS, 20003).tip;
            this._dialog_manager.showTipMsg(tip);
        }
    }

    private onAddPack () {
        this.pack_data.own ++;
        this.saveMergeData();
    }

    public addPackCellData (cell_data: CellData) {
        let pack_cell_data: PackCellData = {
            element: cell_data.element,
            icon: cell_data.icon,
            use: cell_data.use,
        };
        this.pack_data.pack_list.push(pack_cell_data);
        this.saveMergeData();
    }

    public saveMergeData () {
        // console.log("saveMergeData");
        let cell_data_list = [];
        let tile_data_list = [];
        let bubble_list = [];
        let tmp_bubble_list = [];
        for (let i = 0; i < this.cell_data_list.length; ++i) {
            if (!this.cell_data_list[i]) continue;
            tile_data_list[i] = {
                tile_x: this.cell_data_list[i].tile_data.tile_x,
                tile_y: this.cell_data_list[i].tile_data.tile_y,
                pos_x: this.cell_data_list[i].tile_data.pos_x,
                pos_y: this.cell_data_list[i].tile_data.pos_y,
                unlock: this.cell_data_list[i].tile_data.unlock,
                light: this.cell_data_list[i].tile_data.light,
                area: this.cell_data_list[i].tile_data.area,
                unlock_condition: this.cell_data_list[i].tile_data.unlock_condition,
                unlock_para: this.cell_data_list[i].tile_data.unlock_para,
                com_next: this.cell_data_list[i].tile_data.com_next,
            };
            cell_data_list[i] = {
                element: this.cell_data_list[i].element,
                icon: this.cell_data_list[i].icon,
                use: this.cell_data_list[i].use,
            };
        }
        for (let i = 0; i < this.bubble_list.length; ++i) {
            bubble_list[i] = { id: this.bubble_list[i].id };
        }
        for (let i = 0; i < this.tmp_bubble_list.length; ++i) {
            let item = this.tmp_bubble_list[i];
            tmp_bubble_list[i] = {
                id: item.id,
                tm: item.tm,
                x: item.x,
                y: item.y,
            };
        }
        let json = JSON.stringify({
            cell_data_list: cell_data_list,
            tile_data_list: tile_data_list,
            map_data: this.map_data,
            bubble_list: bubble_list,
            tmp_bubble_list: tmp_bubble_list,
            pack_data: this.pack_data,
            tmp_pack_cell_list: this.tmp_pack_cell_list,
            endless_strength_tm: this.endless_strength_tm,
        });
        // cc.sys.localStorage.setItem(LOCAL_KEY, json);
        this._user.setItem(LOCAL_KEY, json);
    }

    public getHasLimitElement (): boolean {
        return this.has_limit_element;
    }

    public setHasLimitElement (limit: boolean) {
        this.has_limit_element = limit;
    }

    private playMergeTipAnimal () {
        let refer_list = [
            { m: new cc.Vec2(0, 0), n: new cc.Vec2(-1, 0), },
            { m: new cc.Vec2(0, 0), n: new cc.Vec2(1, 0), },
            { m: new cc.Vec2(0, 0), n: new cc.Vec2(0, -1), },
            { m: new cc.Vec2(0, 0), n: new cc.Vec2(0, 1), },

            { m: new cc.Vec2(-1, 0), n: new cc.Vec2(1, 0), },
            { m: new cc.Vec2(-1, 0), n: new cc.Vec2(-2, 0), },
            { m: new cc.Vec2(-1, 0), n: new cc.Vec2(-1, -1), },
            { m: new cc.Vec2(-1, 0), n: new cc.Vec2(-1, 1), },

            { m: new cc.Vec2(1, 0), n: new cc.Vec2(-1, 0), },
            { m: new cc.Vec2(1, 0), n: new cc.Vec2(2, 0), },
            { m: new cc.Vec2(1, 0), n: new cc.Vec2(1, -1), },
            { m: new cc.Vec2(1, 0), n: new cc.Vec2(1, 1), },

            { m: new cc.Vec2(0, 1), n: new cc.Vec2(0, -1), },
            { m: new cc.Vec2(0, 1), n: new cc.Vec2(0, 2), },
            { m: new cc.Vec2(0, 1), n: new cc.Vec2(-1, 1), },
            { m: new cc.Vec2(0, 1), n: new cc.Vec2(1, 1), },

            { m: new cc.Vec2(0, -1), n: new cc.Vec2(0, 1), },
            { m: new cc.Vec2(0, -1), n: new cc.Vec2(0, -2), },
            { m: new cc.Vec2(0, -1), n: new cc.Vec2(-1, -1), },
            { m: new cc.Vec2(0, -1), n: new cc.Vec2(1, -1), },

            { m: new cc.Vec2(-1, -1), n: new cc.Vec2(-1, 0), },
            { m: new cc.Vec2(-1, -1), n: new cc.Vec2(0, -1), },

            { m: new cc.Vec2(1, -1), n: new cc.Vec2(1, 0), },
            { m: new cc.Vec2(1, -1), n: new cc.Vec2(0, -1), },

            { m: new cc.Vec2(1, 1), n: new cc.Vec2(1, 0), },
            { m: new cc.Vec2(1, 1), n: new cc.Vec2(0, 1), },

            { m: new cc.Vec2(-1, 1), n: new cc.Vec2(-1, 0), },
            { m: new cc.Vec2(-1, 1), n: new cc.Vec2(0, 1), },
        ];
        let element_list = {};
        for (let element of this.cell_data_list) {
            if (element && element.element && element.tile_data.unlock && element.tile_data.light) {
                element_list[element.element] = element_list[element.element] || [];
                element_list[element.element].push(element);
            }
        }
        // TODO
        let list = null;
        for (let cell_data of this.cell_data_list) {
            list = this.getCanMergeList(cell_data, refer_list, element_list);
            if (list) { break; }
        }
        if (list) {
            // for (let i = 0; i < 2; ++i) {
            for (let cell_data of [list.c, list.n, list.s]) {
                // let cell_data: CellData = list[i];
                if (cell_data && cc.isValid(cell_data.element_node)) {
                    let icon_node = cc.find("Sprite", cell_data.element_node);
                    cc.tween(icon_node).repeatForever(
                        cc.tween()
                            .to(25/60, { scale: 1.2 })
                            .to(10/60, { scale: 0.92 })
                            .to(10/60, { scale: 1.1 })
                            .to(10/60, { scale: 0.95 })
                            .to(10/60, { scale: 1 })
                            .delay(115/60)
                    ).start();
                    this.merge_tip_node_list.push(icon_node);
                }
            }
            // if (this.hand_tip_count > 0) {
                -- this.hand_tip_count;
                let start_pos = new cc.Vec2(list.s.element_node.x+60, list.s.element_node.y-85);
                let end_pos = new cc.Vec2(list.m.tile_data.pos_x+60, list.m.tile_data.pos_y-85);
                let hand_node = this.merge_dialog.guide_hand_node;
                hand_node.stopAllActions();
                cc.tween(hand_node).repeatForever(
                    cc.tween()
                        .to(0, { x: start_pos.x, y: start_pos.y, opacity: 255 })
                        .to(0.5, { x: end_pos.x, y: end_pos.y })
                        .to(0, { opacity: 0})
                        .delay(1.3)
                ).start();
            // }
        }
        else /* if (this.hand_tip_count > 0) */ {
            for (let cell_data of this.cell_data_list) {
                if (cell_data && cell_data.tile_data.unlock && cell_data.tile_data.light && cell_data.element && cell_data.use && cell_data.use.count) {
                    let hand_node = this.merge_dialog.guide_hand_node;
                    hand_node.opacity = 255;
                    hand_node.stopAllActions();
                    let list = [this.merge_dialog.guide_spriteframes[1], this.merge_dialog.guide_spriteframes[2]];
                    this._utils.addAnimationBySpriteFrames(hand_node, list, cc.WrapMode.Loop, 1);
                    hand_node.setPosition(cell_data.tile_data.pos_x+60, cell_data.tile_data.pos_y-85);
                    -- this.hand_tip_count;
                    break;
                }
            }
        }
    }

    private getCanMergeList (cell_data: CellData, refer_list, element_list) {
        if (cell_data && cell_data.element && cell_data.tile_data.unlock) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, cell_data.element);
            if (!json_data.com_next) { return null; }
            let combo_list: CellData[] = []; 
            for (let item of refer_list) {
                let m_cell_data = this.cell_data_list[cell_data.tile_data.tile_x+item.m.x+COL*(cell_data.tile_data.tile_y+item.m.y)];
                let n_cell_data = this.cell_data_list[cell_data.tile_data.tile_x+item.n.x+COL*(cell_data.tile_data.tile_y+item.n.y)];
                if (m_cell_data && m_cell_data.tile_data.unlock && m_cell_data.tile_data.light && n_cell_data && n_cell_data.tile_data.unlock && n_cell_data.element == cell_data.element) {
                    let list = element_list[cell_data.element];
                    if (!list) { continue; }
                    for (let element of list) {
                        if (element != cell_data && element != n_cell_data) {
                            return {
                                c: cell_data, // 当前的元素
                                m: m_cell_data, // 中间的元素
                                n: n_cell_data, // 尾端的元素
                                s: element, // 移动的元素
                            };
                        }
                    }
                }
            }
        }
        return null;
    }

    public startPlayMergeTipAnimal () {
        if (this._guide_manager.getGuideFinish() && this._guide_manager.getHandTipLevel() == 0) {
            this.scheduleOnce(this.playMergeTipAnimal, (this.hand_tip_count > 0)? 1:MERGE_TIP_DURATION);
        }
    }

    public stopPlayMergeTipAnimal () {
        for (let node of this.merge_tip_node_list) {
            if (cc.isValid(node)) { node.stopAllActions(); }
        }
        this.merge_tip_node_list = [];
        let hand_node = this.merge_dialog.guide_hand_node;
        hand_node.stopAllActions();
        hand_node.opacity = 0;
        this.unschedule(this.playMergeTipAnimal);
    }

    private onTriggerGuide () {
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 200) {
            this._guide_manager.setGuideMask(false);
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.triggerGuide();
            this.hand_tip_count = 3;
            this.stopPlayMergeTipAnimal();
            this.startPlayMergeTipAnimal();
            // this.playMergeTipAnimal();
        }
    }

    public onUseTool (type, use_value): boolean {
        let has_use: boolean = false;
        let list = [];
        if (type == 102) { // 加速器
            for (let cell_data of this.cell_data_list) {
                if (cell_data && cell_data.tile_data.light && cell_data.tile_data.unlock && cell_data.use) {
                    let use_data = cell_data.use;
                    if (use_data.count == 0 && use_data.runing) {
                        use_data.tm -= use_value*60*1000;
                        has_use = true;
                        let node = cc.instantiate(this.merge_dialog.speedup_effect_prefab);
                        node.parent = cell_data.element_node;
                        list.push(node);
                        let sprite_node = cc.find("Sprite", cell_data.element_node);
                        cc.tween(sprite_node)
                            .delay(0.2)
                            .to(0.25, { y: 50 })
                            .to(0.25, { y: 0 })
                            .start();
                    }
                }
            }
            this.scheduleOnce(() => {
                for (let node of list) {
                    if (cc.isValid(node)) {
                        node.destroy();
                    }
                }
            }, 1.0);
        }
        else if (type == 103) { // 无限能量
        }
        else if (type == 104) { // 拆分器
            /* null */
        }
        return has_use;
    }

    /**
     * 小手提示
     * param data.show 是否显示
     * param data.level 优先级
     * param data.node 触发的node
     */
    private onHandTip (data) {
        if (data.clear) {
            this.startPlayMergeTipAnimal();
        }
        else if (data.show) {
            this.stopPlayMergeTipAnimal();
        }
        else if (!data.show && this._guide_manager.getHandTipLevel() == data.level) {
            this.startPlayMergeTipAnimal();
        }
    }
}

export { MergeData, CellData, TileData, MapData }
