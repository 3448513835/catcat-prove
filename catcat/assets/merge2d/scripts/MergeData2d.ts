/*
 * 合成数据管理
 */
import MyComponent from "../../Script/common/MyComponent"
import GameConstant from "../../Script/common/GameConstant"
import MergeDialog from "./MergeDialog2d"
import MergeOrder from "./MergeOrder2d"
import { COL, ROW, TWIDTH, THEIGHT, TILE_MOVE_SPEED, UseData, CellData, TileData, MapData, MOVE_DURATION, BubbleData, TmpBubbleData, PackData, PackCellData, MergeDailyRewardData } from "./MergeDataInterface2d"

const LOCAL_KEY = "MERGE_DATA2"; // 本地KEY
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

        let fn_list = [
            () => { this.merge_dialog.refrushMap(this.map_data); },
            () => { this.refrushOrderPanel(); },
            () => { this.merge_dialog.refrushBubble(this.bubble_list); },
            () => { this.merge_dialog.refrushTmpBubble(this.tmp_bubble_list); },
            () => { this.startPlayMergeTipAnimal(); },
        ];
        this.schedule(() => { fn_list.pop()(); }, 0, fn_list.length-1);

        // this.scheduleOnce(() => {
        //     this.merge_dialog.refrushMap(this.map_data);
        //     this.refrushOrderPanel();
        //     this.merge_dialog.refrushBubble(this.bubble_list);
        //     this.startPlayMergeTipAnimal();
        // }, 0);
    }

    private scheduleSetHasLimit () {
        this.has_limit_element = false;
    }

    public refrushOrderPanel () {
        this.refrushCellCountList();
        this.sortOrderList();
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
        let order_list = [], element_list = {}, finish_count = 0;
        for (let order_data of this.map_data.order_list) {
            let json_data = this._json_manager.getJsonData(this._json_name.ORDER_2D, order_data.id);
            order_data.finish = false;
            order_data.complete = 0;
            let order_info_list = json_data.order_info.split(",");
            for (let order_info of order_info_list) {
                let [ele_id, ele_count] = order_info.split(":");
                element_list[ele_id] = true;
                if (this.cell_count_list[ele_id] && this.cell_count_list[ele_id].length >= ele_count) {
                    order_data.complete ++;
                }
            }
            order_data.finish = (order_data.complete == order_info_list.length);
        }
        for (let cell_data of this.cell_data_list) {
            if (cell_data && cell_data.element && cell_data.tile_data.unlock && cell_data.tile_data.light) {
                cell_data.element_node.getChildByName("Tip").active = element_list[cell_data.element]
            }
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
    }

    private refrushCellCountList () {
        this.cell_count_list = {};
        // let cell_data_list = this.cell_data_list;
        for (let item of this.cell_data_list) {
            if (item && item.tile_data.light && item.tile_data.unlock && item.element) {
                if (!this.cell_count_list[item.element]) {
                    this.cell_count_list[item.element] = [item];
                }
                else {
                    this.cell_count_list[item.element].push(item);
                }
            }
        }
    }

    /**
     * 初始化地图数据
     */
    private initMapData () {
        let board_json = this._json_manager.getJson(this._json_name.BOARD_2D);
        let ele_json = this._json_manager.getJson(this._json_name.ELE_2D);
        let element_record = [];
        let tm = Date.now();
        for (let key in board_json) {
            let value = board_json[key];
            let tile_x = value.place_x;
            let tile_y = value.place_y;
            let local_pos = this.tileToPosition(new cc.Vec2(tile_x, tile_y));
            let tile: TileData = {
                tile_x: tile_x,
                tile_y: tile_y,
                pos_x: local_pos.x,
                pos_y: local_pos.y,
                unlock: value.unlock_first,
                light: value.light_first,
                area: 0,
                unlock_condition: 0,
                unlock_para: null,
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
                com_next: ele_json[value.ele].com_next,
            };
            if (tile.light && tile.unlock && cell.element && element_record.indexOf(cell.element) == -1) {
                element_record.push(cell.element);
                this.element_reward_list.push(cell.element);
            }
            this.tile_data_list[tile_x+tile_y*COL] = tile;
            this.cell_data_list[tile_x+tile_y*COL] = cell;
            // if (tile.light) { this.unlockNearTileData(tile); }
        }
        this._user.setElementRewwardList(this.element_reward_list);
        let lv_json = this._json_manager.getJson(this._json_name.COM_LV_2D);
        let order_json = this._json_manager.getJson(this._json_name.ORDER_2D);
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
     * 解锁附近的tile
     */
    private unlockNearTileData (tile_data: TileData) {
        let pos_list = [1, -1, COL, -COL];
        for (let pos of pos_list) {
            if (tile_data.tile_x == 0 && pos == -1) {
                continue;
            }
            else if (tile_data.tile_x+1 == COL && pos == 1) {
                continue;
            }
            let index = tile_data.tile_x+tile_data.tile_y*COL+pos;
            let cell_data = this.cell_data_list[index];
            if (cell_data && !cell_data.tile_data.unlock) {
                cell_data.tile_data.unlock = true;
                this.refrushCell(cell_data);
                this.refrushTile(cell_data.tile_data);
                this.showBoxOpenAnimal(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
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
        this.stopPlayMergeTipAnimal();
        this.startPlayMergeTipAnimal();
        let order_id = data.order_data.id;
        let index = -1;
        for (let i = 0; i < this.map_data.order_list.length; ++i) {
            if (this.map_data.order_list[i].id == order_id) {
                index = i; break;
            }
        }
        if (index == -1) { return; }
        let json = this._json_manager.getJson(this._json_name.ORDER_2D);
        let json_data = this._json_manager.getJsonData(this._json_name.ORDER_2D, order_id);
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
                    this.refrushOrderPanel();
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
        this.refrushOrderPanel();
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
            let lv_json = this._json_manager.getJson(this._json_name.COM_LV_2D);
            let json_data = null;
            let order_json = this._json_manager.getJson(this._json_name.ORDER_2D);
            for (let key in lv_json) {
                if (this.map_data.cur_exp < this.map_data.next_exp) { break; }
                let value = lv_json[key];
                if (value.stage == this.map_data.stage && value.lv == this.map_data.level) {
                    json_data = this._json_manager.getJsonData(this._json_name.COM_LV_2D, value.next_lv);
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
        let ele_json = this._json_manager.getJsonData(this._json_name.ELE_2D, cell_data.element);
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
        this.refrushOrderPanel();
        this.saveMergeData();
    }

    /**
     * 复制元素
     */
    public moveCopyElement (occupy_element: CellData, element: CellData): boolean {
        if (occupy_element && element && occupy_element.element != element.element && occupy_element.element && element.element) {
            let occupy_json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, occupy_element.element);
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, element.element);
            if (json_data.type == 105) { // 复制器
                if (json_data.use_value >= occupy_json_data.item_level) {
                    element.element = 0;
                    let start_pos = element.element_node.getPosition();
                    this.refrushCell(element);
                    let new_cell = this.getEmptyElement();
                    new_cell.element = occupy_element.element;
                    new_cell.icon = occupy_element.icon;
                    new_cell.com_next = occupy_element.com_next;
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
            let occupy_json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, occupy_element.element);
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, element.element);
            if (json_data.type == 104) { // 拆分器
                if (occupy_json_data.item_level == 1) {
                    this._dialog_manager.showTipMsg(`一级元素不能拆分！`);
                    this.refrushCell(element);
                }
                else if (json_data.use_value >= occupy_json_data.item_level) {
                    let split_json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, occupy_element.element-1);
                    element.element = 0;
                    element.com_next = split_json_data.com_next;
                    let start_pos = element.element_node.getPosition();
                    this.refrushCell(element);
                    let new_cell = this.getEmptyElement();
                    if (new_cell) {
                        new_cell.element = occupy_element.element-1;
                        new_cell.icon = split_json_data.icon;
                        new_cell.com_next = split_json_data.com_next;
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
                    this.refrushOrderPanel();
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
    public moveElement (occupy_cell: CellData, origin_cell: CellData): boolean {
        if (occupy_cell.element && occupy_cell.element == origin_cell.element && origin_cell.com_next) {
            origin_cell.element_node.stopAllActions();
            // this.showUpEffect(origin_cell);
            origin_cell.element = 0;
            origin_cell.icon = null;
            cc.tween(origin_cell.element_node)
                .to(0.05, { x: occupy_cell.tile_data.pos_x, y: occupy_cell.tile_data.pos_y, scale: 1, })
                .call(() => {
                    this.refrushCell(origin_cell);
                    this.refrushTile(origin_cell.tile_data);
                })
                .start();
            // this.showUpEffect(occupy_cell);
            // this.scheduleOnce(() => {
                if (this.has_limit_element) {
                    if (origin_cell.use && origin_cell.use.is_use == 2 && origin_cell.use.runing) {
                        this.has_limit_element = false;
                    }
                    else if (occupy_cell.use && occupy_cell.use.is_use == 2 && occupy_cell.use.runing) {
                        this.has_limit_element = false;
                    }
                }
                let ele_next = origin_cell.com_next;
                let ele_json = this._json_manager.getJsonData(this._json_name.ELE_2D, ele_next);
                occupy_cell.element = ele_next;
                occupy_cell.com_next = ele_json.com_next;
                occupy_cell.icon = ele_json.icon;
                occupy_cell.tile_data.light = true;
                occupy_cell.use = (ele_json.is_use)? {
                    is_use: ele_json.is_use,
                    tm: Date.now(),
                    count: (ele_json.is_use == 2)? 0:ele_json.ues_time,
                    max_count: ele_json.ues_time,
                    cd: ele_json.cd,
                    runing: (ele_json.is_use == 2)? 0:1,
                }:null;
                if (ele_json.copyrate > 0 && Math.random() < ele_json.copyrate/100) {
                    this.merge_dialog.generateCopyNode(occupy_cell, true);
                }
                let audio_level = ele_json.item_level;
                if (audio_level >= 9) { audio_level = 9; }
                let audio_url = this._audio_name["MERGE"+audio_level];
                this._audio_manager.playEffect(audio_url);
                this.refrushCell(occupy_cell);
                this.refrushTile(occupy_cell.tile_data);
                this.unlockNearTileData(occupy_cell.tile_data);
                this.showComboEffect(occupy_cell);
                if (ele_json.com_reward) {
                    let reward = ele_json.com_reward.split(":");
                    let data = {
                        pos_w: occupy_cell.element_node.parent.convertToWorldSpaceAR(occupy_cell.element_node.position),
                        item_id: reward[0],
                        item_num: reward[1],
                    };
                    this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
                }

                this.checkLevelUp();
                this.refrushOrderPanel();
                this.recordNewElement(ele_next, true, true);
            // }, 0.05);
            return true;
        }
        else {
            if (Math.abs(occupy_cell.tile_data.tile_x-origin_cell.tile_data.tile_x)+Math.abs(occupy_cell.tile_data.tile_y-origin_cell.tile_data.tile_y) == 1) {
                this.swapElementCell(occupy_cell, origin_cell, true);
            }
            else {
                let null_cell = this.getNearEmptyElement(occupy_cell.tile_data.tile_x, occupy_cell.tile_data.tile_y, origin_cell);
                if (null_cell == origin_cell) {
                    this.swapElementCell(occupy_cell, origin_cell, true);
                }
                else {
                    this.swapElementCell(null_cell, occupy_cell, true);
                    this.swapElementCell(occupy_cell, origin_cell, true);
                }
            }
            // this.refrushOrderPanel();
            this.sortOrderList();
            this.saveMergeData();
            return false;
        }
    }

    /**
     * 显示合成效果
     */
    private showComboEffect (cell_data: CellData) {
        let pos = new cc.Vec2(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
        pos = this.merge_dialog.tiles_layout.convertToWorldSpaceAR(pos);
        pos = this.node.convertToNodeSpaceAR(pos);
        let new_effect_node = cc.find("MergeElementNewEffect", cell_data.element_node);
        if (cc.isValid(new_effect_node)) {
            new_effect_node.destroy();
        }
        let combo_effect_node = cc.find("MergeComboEffect", cell_data.element_node);
        if (cc.isValid(combo_effect_node)) {
            combo_effect_node.destroy();
        }
        let node = cc.instantiate(this.merge_dialog.combo_effect_prefab);
        node.parent = cell_data.element_node;
        let icon_sprite = cc.find("Node/ele_11", node).getComponent(cc.Sprite);
        let element_sprite = cc.find("Sprite", cell_data.element_node).getComponent(cc.Sprite);
        element_sprite.enabled = false;
        this._resource_manager.getSpriteFrame(`merge2d/ele/${cell_data.icon}`).then((sprite_frame) => {
            if (cc.isValid(icon_sprite)) {
                this.addSpriteFrameRef(sprite_frame);
                element_sprite.spriteFrame = sprite_frame;
                icon_sprite.spriteFrame = sprite_frame;
            }
        });
        // this.scheduleOnce(() => {
        //     if (cc.isValid(icon_sprite) && cc.isValid(element_sprite)) {
        //         icon_sprite.spriteFrame = element_sprite.spriteFrame;
        //     }
        // }, 20/60*1/1.5);
        node.setPosition(0, 0);
        this.scheduleOnce(() => {
            if (cc.isValid(cell_data.element_node)) {
                element_sprite.enabled = true;
            }
            if (cc.isValid(node)) {
                node.destroy();
            }
        }, 1.3);
    }

    /**
     * 显示升级效果
     * param cell_data
     */
    public showUpEffect (cell_data: CellData) {
        let tile_up_node = cc.instantiate(this.merge_dialog.tile_up_prefab);
        tile_up_node.parent = cell_data.tile_data.tile_node;
        tile_up_node.setPosition(0, 0);
        let element_up_node = cc.instantiate(this.merge_dialog.element_up_prefab);
        element_up_node.parent = cc.isValid(cell_data.element_node)? cell_data.element_node:cell_data.tile_data.tile_node;
        // element_up_node.parent = cell_data.tile_data.tile_node;
        // element_up_node.setPosition(0, 0);
        this.scheduleOnce(() => { 
            if (cc.isValid(element_up_node)) element_up_node.destroy();
            if (cc.isValid(tile_up_node)) tile_up_node.destroy();
        }, 1);
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
        [element1.com_next, element2.com_next] = [element2.com_next, element1.com_next];
        for (let node of [element1.element_node, element2.element_node]) {
            if (cc.isValid(node)) {
                let combo_effect = cc.find("MergeComboEffect", node);
                if (cc.isValid(combo_effect)) { combo_effect.destroy(); }
                let icon_sprite = cc.find("Sprite", node).getComponent(cc.Sprite);
                icon_sprite.enabled = true;
            }
        }
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
            if (!tile_data.tile_node) {
                tile_data.tile_node = cc.instantiate(this.merge_dialog.tile_prefab);
                tile_data.tile_node.parent = this.merge_dialog.tiles_layout;
                tile_data.tile_node.setPosition(tile_data.pos_x, tile_data.pos_y);
                tile_data.tile_node.getComponent(cc.Sprite).spriteFrame = this.merge_dialog.land_spritefrmaes[(tile_data.tile_x+tile_data.tile_y)%2];
            }
            if ((tile_data.light && tile_data.unlock) || !tile_data.unlock) {
                if (cc.isValid(tile_data.cloud_node)) {
                    tile_data.cloud_node.destroy();
                    tile_data.cloud_node = null;
                }
            }
            else 
                if (!cc.isValid(tile_data.cloud_node)) {
                    tile_data.cloud_node = cc.instantiate(this.merge_dialog.cloud_prefab);
                    tile_data.cloud_node.parent = this.merge_dialog.elments_layout;
                    tile_data.cloud_node.zIndex = 1;
                    tile_data.cloud_node.setPosition(tile_data.pos_x, tile_data.pos_y);
                }
        }
    }

    private showBoxOpenAnimal (pos_x: number, pos_y: number) {
        let node = cc.instantiate(this.merge_dialog.boxopen_prefab);
        node.parent = this.merge_dialog.cloud_layout;
        node.setPosition(pos_x, pos_y);
        cc.tween(node).delay(35/60).removeSelf().start();
    }

    /**
     * 刷新element
     * param cell_data
     */
    public refrushCell (cell_data: CellData) {
        if (cell_data) {
            if (cell_data.element && cell_data.icon) { // && cell_data.tile_data.unlock) {
                let sub = false;
                if (!cc.isValid(cell_data.element_node)) {
                    cell_data.element_node = cc.instantiate(this.merge_dialog.element_prefab);
                    cell_data.element_node.parent = this.merge_dialog.elments_layout;
                    cell_data.element_node.zIndex = 0;
                }
                else {
                    sub = true;
                }
                let lock_node = cc.find("Lock", cell_data.element_node);
                lock_node.active = false;
                lock_node.zIndex = 1;
                let tip_node = cc.find("Tip", cell_data.element_node);
                tip_node.zIndex = 1;
                cell_data.element_node.stopAllActions();
                cell_data.element_node.setPosition(cell_data.tile_data.pos_x, cell_data.tile_data.pos_y);
                cell_data.element_node.scale = 1;
                let icon_node = cc.find("Sprite", cell_data.element_node);
                icon_node.opacity = 255;
                if (cell_data.tile_data.unlock) {
                    let icon_sprite = icon_node.getComponent(cc.Sprite);
                    let material = cell_data.tile_data.light? cc.Material.getBuiltinMaterial("2d-sprite"):this.merge_dialog.mask_material;
                    icon_sprite.setMaterial(0, material);
                    cell_data.icon = this._json_manager.getJsonData(this._json_name.ELE_2D, cell_data.element).icon;
                    this._resource_manager.getSpriteFrame(`merge2d/ele/${cell_data.icon}`).then((sprite_frame) => {
                        if (cc.isValid(icon_sprite)) {
                            this.addSpriteFrameRef(sprite_frame);
                            // if (sub) { icon_sprite.spriteFrame.decRef(); }
                            icon_sprite.spriteFrame = sprite_frame;
                        }
                    });
                }
                let light_node = cc.find("MergeLightEffect", cell_data.element_node);
                let use_node = cc.find("MergeUsePrefab", cell_data.element_node);

                // 添加母体效果
                if (cell_data.tile_data.light && cell_data.tile_data.unlock && cell_data.use) { 
                    let use_data = cell_data.use;
                    if (!cc.isValid(use_node)) {
                        use_node = cc.instantiate(this.merge_dialog.use_prefab);
                        use_node.parent = cell_data.element_node;
                        use_node.zIndex = 2;
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
                            light_node.parent = cell_data.element_node;
                            light_node.zIndex = 1;
                            light_node.setPosition(0, 0);
                        }
                        if (use_data.is_use == 2) {
                            cc.find("guang/tili", light_node).active = false;
                        }
                        cell_data.icon = this._json_manager.getJsonData(this._json_name.ELE_2D, cell_data.element).icon;
                        this._resource_manager.getSpriteFrame(`merge2d/ele/${cell_data.icon}`).then((sprite_frame) => {
                            if (cc.isValid(light_node) && use_data.count > 0) {
                                this.addSpriteFrameRef(sprite_frame);
                                cc.find("guang/ele_11", light_node).getComponent(cc.Sprite).spriteFrame = sprite_frame;
                                icon_node.opacity = 0;
                            }
                        });
                        count_node.active = false;
                        clock_node.active = false;
                        cc.find("Label", count_node).getComponent(cc.Label).string = use_data.count.toString();
                    }
                    else  {
                        icon_node.opacity = 255;
                        if (cc.isValid(light_node)) { light_node.destroy(); }
                        count_node.active = false;
                        clock_node.active = false;
                        if (use_data.runing) {
                            clock_node.active = true;
                            if (use_data.is_use == 2) {
                                this.unschedule(this.scheduleSetHasLimit);
                                this.has_limit_element = true;
                            }
                            let sec = use_data.cd-(Date.now()-use_data.tm)/1000;
                            let circle = cc.find("Circle", clock_node).getComponent(cc.Sprite);
                            circle.fillRange = 1-sec/use_data.cd;
                            let fn = () => {
                                let sec = use_data.cd-(Date.now()-use_data.tm)/1000;
                                circle.fillRange = sec/use_data.cd;
                                if (sec <= 0) {
                                    if (use_data.is_use == 2) {
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
                            // let lock_node = cc.find("Lock", cell_data.element_node);
                            lock_node.active = true;
                        }
                    }
                }
                else {
                    if (cc.isValid(light_node)) { light_node.destroy(); }
                    if (cc.isValid(use_node)) { use_node.destroy(); }
                }
            }
            else {
                if (cc.isValid(cell_data.element_node)) {
                    let icon = cc.find("Sprite", cell_data.element_node).getComponent(cc.Sprite);
                    // icon.spriteFrame.decRef();
                    cell_data.element_node.destroy();
                }
                cell_data.element_node = null;
                cell_data.com_next = 0;
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
        return new cc.Vec2(
            p.x*TWIDTH+TWIDTH/2,
            p.y*THEIGHT+THEIGHT/2
        );
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
            let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, element);
            let level = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1011).int_para;
            if (pop && this._guide_manager.getGuideFinish() && json_data.item_level >= level) {
                this._dialog_manager.openDialog(this._dialog_name.MergeNewElementDialog2d, element);
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
            com_next: cell_data.com_next,
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
                // com_next: this.cell_data_list[i].tile_data.com_next,
            };
            cell_data_list[i] = {
                element: this.cell_data_list[i].element,
                icon: this.cell_data_list[i].icon,
                use: this.cell_data_list[i].use,
                com_next: this.cell_data_list[i].com_next,
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

    private playMergeTipAnimal () {
        let cell_count_list = {}, list = null;
        for (let item of this.cell_data_list) {
            if (item && item.com_next && item.tile_data.unlock && cc.isValid(item.element_node) && (!item.use || item.use.count == 0)) {
                if (!cell_count_list[item.element]) {
                    cell_count_list[item.element] = [item];
                }
                else {
                    if (cell_count_list[item.element][0].tile_data.light || item.tile_data.light) {
                        cell_count_list[item.element].push(item);
                        list = cell_count_list[item.element];
                        break;
                    }
                }
            }
        }
        if (list) {
            for (let i = 0; i < 2; ++i) {
                let cell_data: CellData = list[i];
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
                let start_pos = null, end_pos = null;
                if (list[0].tile_data.unlock && list[0].tile_data.light) {
                    start_pos = new cc.Vec2(list[0].tile_data.pos_x+60, list[0].tile_data.pos_y-85);
                    end_pos = new cc.Vec2(list[1].tile_data.pos_x+60, list[1].tile_data.pos_y-85);
                }
                else {
                    start_pos = new cc.Vec2(list[1].tile_data.pos_x+60, list[1].tile_data.pos_y-85);
                    end_pos = new cc.Vec2(list[0].tile_data.pos_x+60, list[0].tile_data.pos_y-85);
                }
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
                if (cell_data.tile_data.unlock && cell_data.tile_data.light && cell_data.element && cell_data.use && cell_data.use.count) {
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

    public getHasLimitElement (): boolean {
        return this.has_limit_element;
    }

    public setHasLimitElement (limit: boolean) {
        this.has_limit_element = limit;
    }

    private onTriggerGuide () {
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 117) {
            this._guide_manager.setGuideMask(false);
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.triggerGuide();
            this.hand_tip_count = 3;
            this.stopPlayMergeTipAnimal();
            this.startPlayMergeTipAnimal();
            // this.playMergeTipAnimal();
        }
    }

    /**
     * 小手提示
     * param data.show 是否显示
     * param data.level 优先级
     * param data.node 触发的node
     */
    private onHandTip (data) {
        let level = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1013).int_para;
        if (data.clear) {
            this.startPlayMergeTipAnimal();
        }
        else if (data.show && this._user.getLevel() < level) {
            this.stopPlayMergeTipAnimal();
        }
        else if (!data.show && this._guide_manager.getHandTipLevel() == data.level) {
            this.startPlayMergeTipAnimal();
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

    public getDailyRewardData (): MergeDailyRewardData {
        const key = "DAILY_REWARD_DATA";
        // let data = cc.sys.localStorage.getItem(key);
        let data = this._user.getItem(key);
        if (!data) {
            data = {
                tm: this._utils.getDayEndTm(),
                poped: false,
                list: this.getDailyRewardList(),
            }
        }
        else {
            data = JSON.parse(data) as MergeDailyRewardData;
            if (data.tm < Date.now()) {
                data = {
                    tm: this._utils.getDayEndTm(),
                    poped: false,
                    list: this.getDailyRewardList(),
                }
            }
        }
        return data;
    }

    private getDailyRewardList (): any[] {
        let json = this._json_manager.getJson(this._json_name.MERGE_DAILY_REWORD);
        let type_list1 = [], type_list2 = [], type_list3 = [], list = [];
        for (let key in json) {
            let value = json[key];
            if (value.stytle == 1) {
                type_list1.push(value);
            }
            else if (value.stytle == 2) {
                type_list2.push(value);
            }
            else if (value.stytle == 3) {
                type_list3.push(value);
            }
        }
        list.push(type_list1[Math.floor(type_list1.length*Math.random())]);
        list.push(type_list2[Math.floor(type_list2.length*Math.random())]);
        list.push(type_list3[Math.floor(type_list3.length*Math.random())]);
        return list;
    }
}

export { MergeData, CellData, TileData, MapData }
