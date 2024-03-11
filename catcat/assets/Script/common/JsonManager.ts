/*
 * json数据管理
 */
import ResourceManager from "./ResourceManager"

export default class JsonManager {
    public static _json_name = {
        UI_JUMP: "ui_jump",
        ROOM: "room",
        BOARD: "board",
        BOARD_2D: "board_2d",
        ELE: "ele",
        ELE_2D: "ele_2d",
        ELE_SHOP_BASE: "ele_shop_base",
        ELE_SHOP_BASE_2D: "ele_shop_base_2d",
        ELE_SHOP_POOL: "ele_shop_pool",
        ELE_SHOP_POOL_2D: "ele_shop_pool_2d",
        MERGE_DAILY_REWORD: "merge_daily_reword",
        FACILITY: "facility",
        ITEM_BASE: "item_base",
        COM_LV: "com_lv",
        COM_LV_2D: "com_lv_2d",
        COM_NUM: "com_num",
        COM_BAG: "com_bag",
        MISSION: "mission",
        PLAYER_LV: "player_lv",
        STRENGTH_GET: "strength_get",
        STRENGTH_GET_2D: "strength_get_2d",
        CONST_PARAMETER: "const_parameter",
        DROP: "drop",
        ORDER: "order",
        ORDER_2D: "order_2d",
        TIPS: "tips",
        PROFILE_PHOTO: "profile_photo",
        SCENE_BUILD_BASE: "scene_build_base",
        SCENE_BUILD_LV: "scene_build_lv",
        FACILITY_SKIN: "facility_skin",
        PLAYER_INIT: "player_init",
        PLAYER_INIT_2D: "player_init_2d",
        CUSTOMER_BASE: "customer_base",
        CUSTOMER_BEHAVIOR: "customer_behavior",
        CUSTOMER_WEIGHT: "customer_weight",
        HANDBOOK: "handbook",
        HANDBOOK_2D: "handbook_2d",
        SEVEN_DAY: "activity_7day",
        EVENT_GIFT: "event_gift",
        STORY_TEXT: "story_text",
        STORY_INDEX: "story_index",
        DAILY_AD: "daily_ad",
        RAFFLE: "raffle",
        RAFFLE_START: "raffle_start",
        HAND_UP_REWARD: "hang_up_reward",
        HAND_UP_POOL: "hang_up_pool",
        FACILITY_SKIN_GROUP: "facility_skin_group",
        SENSITIVE: "sensitive",
        MONTH_CARD: "month_card",
        MONTH_CARD_PAY: "month_card_pay",
        WORD_BUBBLE: "word_bubble",
        SCENE_RUBBISH: "scene_rubbish",
        ENTRUST_INDEX: "entrust_index",
        ENTRUST: "entrust",
        PICK_ELE: "pick_ele",
        EXPLOER_BASE: "exploer_base",
        EXPLOER_REWORD: "exploer_reword",
        GAME_ELE_START: "game_ele_start",
        GAME_ELE_REWARD: "game_ele_reword",
        PAY_GIFT: "pay_gift",
        PAY_SHOP: "pay_shop",
        NEW_HAND_REWARD: "new_hand_reward",
        NOTICE: "notice",
    };
    private static bundle: cc.AssetManager.Bundle = null;
    private static _json_list = {};

    public static init (fn?: Function) {
        // let dir: string[] = [];
        // for (let key in this._json_name) {
        //     dir.push("jsons/"+this._json_name[key]);
        // }
        // cc.resources.loadDir("jsons", (err, jsons: cc.JsonAsset[]) => {
        //     for (let item of jsons) {
        //         this._json_list[item.name] = item.json;
        //     }
        //     this._inited = true;
        // });
        ResourceManager.loadBundle("jsons").then((bundle) => {
            this.bundle = bundle;
            for (let key in this._json_name) {
                let name = this._json_name[key];
                bundle.load(name, cc.JsonAsset, (err, asset: cc.JsonAsset) => {
                    if (!err) {
                        this._json_list[name] = asset.json;
                    }
                });
            }
        });
    }

    public static getInited (): boolean {
        return !!this.bundle;
    }

    public static getJsonData (name: string, id: number|string): any {
        return this._json_list[name][id];
    }

    public static getJson (name: string): any {
        return this._json_list[name];
    }
}
