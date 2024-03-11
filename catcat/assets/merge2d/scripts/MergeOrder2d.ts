/*
 * 订单
 */
import MyComponent from "../../Script/common/MyComponent"
import MyScrollview from "../../Script/common/MyScrollView"
import MergeOrderItem from "./MergeOrderItem2d"
import { MergeData } from "./MergeData2d"
import { ShopData, ShopItem } from "./MergeDataInterface2d"
import { OrderData } from "./MergeDataInterface2d"

const ORDER_ITEM_WIDTH = 310;
const MOVE_SPEED = 0.3;

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeOrder extends MyComponent {
    @property(MergeData)
    private merge_data: MergeData = null;
    @property(cc.ScrollView)
    private my_scrollview: cc.ScrollView = null;
    @property(cc.Prefab)
    private order_item_prefab: cc.Prefab = null;

    private order_list: OrderData[] = [];
    private cell_count_list = null;
    private map_data = null;
    private finish_count = null;
    private shop_data: ShopData = null;
    private shop_list: Number[] = null;

    onLoad () {
        this.listen(this._event_name.EVENT_MERGE_REFRUSH_ORDER, this.onRefrushOrder, this);
        this.listen(this._event_name.EVENT_MERGE_SHOP_REFRUSH, this.onShopRefrush, this);
        this.my_scrollview.content.on(cc.Node.EventType.POSITION_CHANGED, () => {
            this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
                level: this._guide_manager.HandConfig.MERGE_ORDER,
                show: false,
            });
        });
        this.initShopData();
    }

    private clickOpenOrderDialog () {
        this._dialog_manager.openDialog(this._dialog_name.MergeOrderDialog2d, {
            map_data: this.merge_data.map_data,
            order_list: this.order_list,
            cell_count_list: this.cell_count_list,
        });
    }

    private onRefrushOrder (data) {
        this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
            level: this._guide_manager.HandConfig.MERGE_ORDER,
            show: false,
        });
        this.map_data = data.map_data;
        this.cell_count_list = data.cell_count_list;
        if (!data.list) { // 刷新finish按钮
            for (let node of this.my_scrollview.content.children) {
                let component = node.getComponent(MergeOrderItem);
                component.refrushCellCountList(this.cell_count_list, this.shop_list);
            }
        }
        else {
            this.order_list = data.list;
            this.playFinishAudio();
            this.my_scrollview.content.width = this.order_list.length*ORDER_ITEM_WIDTH;
            let tmp_list = [];
            for (let item of this.order_list) { tmp_list.push(item.id); }
            for (let node of this.my_scrollview.content.children) {
                let component = node.getComponent(MergeOrderItem);
                let index = tmp_list.indexOf(component.getOrderId());
                if (index != -1) {
                    tmp_list[index] = 0;
                    component.refrushCellCountList(this.cell_count_list, this.shop_list);
                    component.playMoveAnimation(this.getOrderItemPosition(index));
                }
                else {
                    node.destroy();
                }
            }

            for (let i = 0; i < tmp_list.length; ++i) {
                if (!tmp_list[i]) { continue; }
                let node = cc.instantiate(this.order_item_prefab);
                node.parent = this.my_scrollview.content;
                let component = node.getComponent(MergeOrderItem);
                component.setData(this.order_list[i], this.cell_count_list, this.map_data, this.shop_list);
                node.setPosition(this.getOrderItemPosition(i));
                component.playAppearAnimation();
            }
        }
    }

    private playFinishAudio () {
        let finish_count = 0;
        for (let item of this.order_list) {
            if (item.finish) { ++ finish_count; }
        }
        if (this.finish_count != null && finish_count > this.finish_count) {
            this._audio_manager.playEffect(this._audio_name.MERGE_ORDER);
        }
        this.finish_count = finish_count;
    }

    private getOrderItemPosition (index: number): cc.Vec2 {
        return new cc.Vec2(ORDER_ITEM_WIDTH/2+index*ORDER_ITEM_WIDTH, 0);
    }

    private initShopData () {
        const LOCAL_KEY = "MERGE_SHOP_DATA_2D_230822"; // 本地KEY
        // let str = cc.sys.localStorage.getItem(LOCAL_KEY);
        let str = this._user.getItem(LOCAL_KEY);
        let refrush_duration = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1005).int_para*3600*1000;
        let video_count = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1007).int_para;
        let now_tm = Date.now();
        if (str) {
            this.shop_data = JSON.parse(str);
            if (now_tm >= this.shop_data.refrush_tm) {
                this.shop_data.list = this.generateNewShopList();
                this.shop_data.refrush_tm = now_tm+refrush_duration;
            }
            if (this.shop_data.video_count == null || now_tm >= this.shop_data.video_tm) {
                this.shop_data.video_count = video_count;
                this.shop_data.video_tm = this.getDayEndTm();
            }
        }
        else {
            this.shop_data = {
                refrush_tm: now_tm+refrush_duration,
                list: this.generateNewShopList(),
                video_count: video_count,
                video_tm: this.getDayEndTm(),
            };
        }
        // cc.sys.localStorage.setItem(LOCAL_KEY, JSON.stringify(this.shop_data));
        this._user.setItem(LOCAL_KEY, JSON.stringify(this.shop_data));
        this.shop_list = [];
        for (let item of this.shop_data.list) {
            this.shop_list.push(item.reward);
        }
        let rest_tm1 = (this.shop_data.refrush_tm-now_tm)/1000;
        this.scheduleOnce(() => {
            this.initShopData();
            if (this.cell_count_list && this.map_data) {
                for (let node of this.my_scrollview.content.children) {
                    let component = node.getComponent(MergeOrderItem);
                    component.refrushCellCountList(this.cell_count_list, this.shop_list);
                }
            }
        }, rest_tm1+1);
    }

    private onShopRefrush () {
        this.unscheduleAllCallbacks();
        this.initShopData();
        for (let node of this.my_scrollview.content.children) {
            let component = node.getComponent(MergeOrderItem);
            component.refrushCellCountList(this.cell_count_list, this.shop_list);
        }
    }

    private getDayEndTm (): number {
        let day = 24*3600*1000;
        let refrush_tm = day-(Date.now()+8*3600*1000)%day+Date.now();
        return refrush_tm;
    }

    private generateNewShopList (): ShopItem[] {
        let list = [];
        let choose_pool_msg = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1009).str_para.split(",");
        let pool_list = {}, ele_shop_pool_2d = this._json_manager.getJson(this._json_name.ELE_SHOP_POOL_2D);
        let shop_base_json = this._json_manager.getJson(this._json_name.ELE_SHOP_BASE_2D);
        let level = this._user.getLevel(), pool_id = null;
        for (let key in shop_base_json) {
            let value = shop_base_json[key];
            if (level >= value.lv_min && level <= value.lv_max) {
                pool_id = value.pool_id;
                break;
            }
        }
        for (let key in ele_shop_pool_2d) {
            let value = ele_shop_pool_2d[key];
            if (value.pool_id != pool_id) {
                continue;
            }
            if (pool_list[value.rand_pool]) {
                pool_list[value.rand_pool].push(value);
            }
            else {
                pool_list[value.rand_pool] = [value];
            }
        }

        for (let item of choose_pool_msg) {
            let [pool_id, count] = item.split(":");
            count = Number(count);
            while (count > 0 && pool_list[pool_id] && pool_list[pool_id].length > 0) {
                -- count;
                let length = pool_list[pool_id].length;
                let index = Math.floor(Math.random()*length);
                let value = pool_list[pool_id][index];
                pool_list[pool_id][index] = pool_list[pool_id][length-1];
                pool_list[pool_id].length = length-1;
                list.push({
                    id:          value.id,
                    buy_count:   0,
                    pool_id:     value.pool_id,
                    reward_type: value.reward_type,
                    reward:      value.reward,
                    sum:         value.sum,
                    day_buy:     value.day_buy,
                    buy_type:    value.buy_type,
                    cost_sum:    value.cost_sum,
                });
            }
        }
        return list;
    }
}
