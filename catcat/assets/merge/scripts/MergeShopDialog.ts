import MyComponent from "../../Script/common/MyComponent"
import { ShopData, ShopItem, MapData, SpecialElementTypes } from "./MergeDataInterface"
import MergeShopItem from "./MergeShopItem"
import GameConstant from "../../Script/common/GameConstant"


const LOCAL_KEY = "MERGE_SHOP_DATA"; // _230822"; // 本地KEY
const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeShopDialog extends MyComponent {
    @property(cc.Prefab)
    private shop_prefab: cc.Prefab = null;
    @property(cc.Label)
    private clock_label: cc.Label = null;
    @property(cc.Node)
    private content_node: cc.Node = null;
    @property(cc.Node)
    private msg_panel_node: cc.Node = null;
    @property([cc.SpriteFrame])
    private video_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    private refrush_video_sprite: cc.Sprite = null;
    @property(cc.Node)
    private refrush_video_node: cc.Node = null;

    private map_data: MapData = null;
    private shop_data: ShopData = null;

    onLoad () {
        // cc.sys.localStorage.removeItem("MERGE_SHOP_DATA");
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_MERGE_SHOP_BUY, this.onShopBuy, this);
        this.listen(this._event_name.EVENT_MERGE_SHOP_MSG, this.onShopMsg, this);
        this.listen(this._event_name.EVENT_CLICK_SCREEN, this.onClickScreen, this);
        this.listen(this._event_name.EVENT_VIDEO_CARD, this.onVideoCard, this);
        this.map_data = this.getDialogData();
        this.initData();
        this.refrush_video_sprite.spriteFrame = this.video_spriteframes[
            (this._user.getVideo() > 0)? 1:0
        ];
    }

    private initData () {
        // let str = cc.sys.localStorage.getItem(LOCAL_KEY);
        let str = this._user.getItem(LOCAL_KEY);
        let refrush_duration = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1006).int_para*3600*1000;
        let video_count = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1008).int_para;
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
            this.saveData();
        }
        this.unscheduleAllCallbacks();
        let rest_tm1 = (this.shop_data.refrush_tm-now_tm)/1000;
        let rest_tm2 = (this.shop_data.video_tm-now_tm)/1000;
        this.scheduleOnce(() => { this.initData(); }, rest_tm1+1);
        this.scheduleOnce(() => { this.initData(); }, rest_tm2+1);
        this.refrushPanel();
    }

    private refrushData () {
        let refrush_duration = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1006).int_para*3600*1000;
        let video_count = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1008).int_para;
        let now_tm = Date.now();
        if (now_tm >= this.shop_data.refrush_tm) {
            this.shop_data.list = this.generateNewShopList();
            this.shop_data.refrush_tm = now_tm+refrush_duration;
        }
        if (this.shop_data.video_count == null || now_tm >= this.shop_data.video_tm) {
            this.shop_data.video_count = video_count;
            this.shop_data.video_tm = this.getDayEndTm();
        }
        this.saveData();
        this.unscheduleAllCallbacks();
        let rest_tm1 = (this.shop_data.refrush_tm-now_tm)/1000;
        let rest_tm2 = (this.shop_data.video_tm-now_tm)/1000;
        this.scheduleOnce(() => { this.initData(); }, rest_tm1+1);
        this.scheduleOnce(() => { this.initData(); }, rest_tm2+1);
        this.refrushPanel();
    }

    private refrushPanel () {
        this._event_manager.dispatch(this._event_name.EVENT_MERGE_SHOP_REFRUSH);
        for (let i = 0; i < this.content_node.children.length; ++i) {
            this.content_node.children[i].active = false;
        }
        let count = this.shop_data.list.length;
        let index = 0;
        this.schedule(() => {
            let item = this.shop_data.list[index];
            if (item) {
                let node = this.content_node.children[index];
                if (!cc.isValid(node)) {
                    node = cc.instantiate(this.shop_prefab);
                    node.parent = this.content_node;
                }
                node.getComponent(MergeShopItem).setData(item, this.video_spriteframes);
                node.active = true;
            }
            ++index;
        }, 0, count-1);
        this.refrush_video_node.active = (this.shop_data.video_count > 0);
    }

    private clickVideoRefrush () {
        if (this._user.getVideo() > 0) {
            this._utils.addResNum(GameConstant.res_id.video, -1);
            this.shop_data.video_count -= 1;
            this.shop_data.refrush_tm = 0;
            this.refrushData();
        }
        else {
            this._ad_manager.setAdCallback(() => {
                this._net_manager.requestTablog(this._config.statistic.MERGE_SHOP1);
                // cc.sys.localStorage.removeItem(LOCAL_KEY);
                this.shop_data.video_count -= 1;
                this.shop_data.refrush_tm = 0;
                this.refrushData();
            });
            this._net_manager.requestTablog(this._config.statistic.MERGE_SHOP0);
            this._ad_manager.showAd();
        }
    }

    private getDayEndTm (): number {
        let day = 24*3600*1000;
        let refrush_tm = day-(Date.now()+8*3600*1000)%day+Date.now();
        return refrush_tm;
    }

    private generateNewShopList (): ShopItem[] {
        let list = [];
        let choose_pool_msg = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1010).str_para.split(",");
        let pool_list = {}, ele_shop_pool_2d = this._json_manager.getJson(this._json_name.ELE_SHOP_POOL);
        let shop_base_json = this._json_manager.getJson(this._json_name.ELE_SHOP_BASE);
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

    private saveData () {
        // cc.sys.localStorage.setItem(LOCAL_KEY, JSON.stringify(this.shop_data));
        this._user.setItem(LOCAL_KEY, JSON.stringify(this.shop_data));
    }

    private onShopBuy (data: ShopItem) {
        this.saveData();
    }

    private onShopMsg (data) {
        let pos = this.node.convertToNodeSpaceAR(data.pos);
        let shop_data: ShopItem = data.shop_data;
        if (shop_data.reward_type == 1) {
            let json_data = this._json_manager.getJsonData(this._json_name.ELE, shop_data.reward);
            if (!json_data.output_way && SpecialElementTypes.indexOf(json_data.type) == -1) {
                this.msg_panel_node.active = true;
                let name_label = cc.find("Name", this.msg_panel_node).getComponent(cc.Label);
                let desc_label = cc.find("Desc", this.msg_panel_node).getComponent(cc.Label);
                let icon_sprite = cc.find("Item/Icon", this.msg_panel_node).getComponent(cc.Sprite);
                name_label.string = json_data.name + " " + json_data.item_level+"级";
                desc_label.string = json_data.description;
                this._resource_manager.getSpriteFrame("merge/ele/"+json_data.icon).then((sprite_frame) => {
                    if (cc.isValid(icon_sprite)) {
                        icon_sprite.spriteFrame = sprite_frame;
                    }
                });
                let layout = cc.find("From/Layout", this.msg_panel_node);
                let drop_json = this._json_manager.getJsonData(this._json_name.DROP, json_data.use_value);
                let reward_ele_list = drop_json.reward_ele.split(",");
                for (let i = 0; i < reward_ele_list.length; ++i) {
                    let [id, _] = reward_ele_list[i].split(":");
                    let node = layout.children[i];
                    let data = reward_ele_list[i];
                    if (!node) {
                        node = cc.instantiate(layout.children[0]);
                        node.parent = layout;
                    }
                    node.active = true;
                    let sprite = cc.find("Icon", node).getComponent(cc.Sprite);
                    let icon = this._json_manager.getJsonData(this._json_name.ELE, id).icon;
                    this._resource_manager.getSpriteFrame(`merge/ele/${icon}`).then((sprite_frame) => {
                        if (cc.isValid(sprite)) {
                            sprite.spriteFrame = sprite_frame;
                        }
                    });
                }
                if (reward_ele_list.length > 4) {
                    layout.getComponent(cc.Layout).type = cc.Layout.Type.GRID;
                }
                else {
                    layout.getComponent(cc.Layout).type = cc.Layout.Type.HORIZONTAL;
                }
                for (let i = reward_ele_list.length; i < layout.children.length; ++i) {
                    layout.children[i].active = false;
                }
                let line = Math.floor((reward_ele_list.length-1)/4);
                layout.parent.height = 235+line*170;
                this.msg_panel_node.height = 530+line*170;
                let arrow_node = cc.find("Arrow", this.msg_panel_node);
                arrow_node.x = pos.x;
                arrow_node.y = -this.msg_panel_node.height+5;
                this.msg_panel_node.y = this.msg_panel_node.height+pos.y+80;
            }
            else {
                this.msg_panel_node.active = false;
                this._dialog_manager.openDialog(this._dialog_name.MergeElementDialog, { element_id: shop_data.reward, });
            }
        }
        else if (shop_data.reward_type == 2) { // 道具
            this.msg_panel_node.active = false;
        }
    }

    private onClickScreen (data) {
        let event: cc.Event.EventTouch = data.event;
        let pos = event.getLocation();
        if (this.msg_panel_node.active) {
            let n_pos = this.msg_panel_node.convertToNodeSpaceAR(pos);
            if (Math.abs(n_pos.x) > this.msg_panel_node.width/2 || n_pos.y < -this.msg_panel_node.height || n_pos.y > 0) {
                this.msg_panel_node.active = false;
            }
        }
    }

    private onVideoCard () {
        for (let node of this.content_node.children) {
            let component = node.getComponent(MergeShopItem);
            component.refrushVideoCard(this.video_spriteframes);
        }
        this.refrush_video_sprite.spriteFrame = this.video_spriteframes[
            (this._user.getVideo() > 0)? 1:0
        ];
    }

    update () {
        let rest_tm = (this.shop_data.refrush_tm-Date.now())/1000;
        if (rest_tm < 0) {
            this.clock_label.string = "00:00";
            this.initData();
        }
        else {
            this.clock_label.string = this._utils.convertTime(rest_tm);
        }
    }
}
