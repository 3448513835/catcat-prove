/** 
 * 全局事件
 */

export default class EventManager {
    public static _event_name = {

        SOCKET_CONNECT:    "socket_connect",        // socket连接
        SOCKET_RECONNECT:  "User/reconnection",
        SOCKET_CONNECTING: "socket_connecting",
        SOCKET_CLOSE:      "socket_close",
        SOCKET_HEART:      "User/heartbeat",

        SOCKET_LOGIN: "User/login",
        SOCKET_USER_DATA: "User/user_data",
        SOCKET_USER_LEVEL_UP: "User/click_up_level", //升级
        SOCKET_USER_STAMINA_RESTORE: "User/trigger_restore_stamina", //触发体力恢复逻辑
        SOCKET_USER_STAMINA_RECOVERY: "User/automatic_recovery", //增加/减少体力
        SOCKET_USER_CHANGE_NAME: "Set/edit_nickname", // 修改名字

        SOCKET_ROOM_INIT: "Room/init", //初始化房间列表信息
        SOCKET_ROOM_UNLOCK_ROOM: "Room/unlock_room", //解锁房间
        SOCKET_ROOM_UNLOCK_FACILITY: "Room/unlock_facility", //解锁设施
        SOCKET_ROOM_UNLOCK_UNIT: "Room/unlock_unit", //解锁场景建筑
        SOCKET_ROOM_FAC_UNLOCK_SKIN: "Room/unlock_facility_skin", //购买皮肤
        SOCKET_ROOM_FAC_USE_SKIN: "Room/use_skin", //使用皮肤
        SOCKET_ROOM_CLEAN_RUBBISH: "Room/clean_rubbish", //清理垃圾

        SOCKET_BAG_MY_BAG: "Bag/my_bag", //获取背包列表

        SOCKET_TASK_LIST: "Task/list_data", //获取任务列表
        SOCKET_TASK_REWARD: "Task/reward", //领取阶段奖励

        SOCKET_BUY_STAMINA: "User/buy_stamina", //广告，道具购买体力
        SOCKET_STAMINA_SOURCE_DATA: "User/stamina_source_data", //广告，道具触发次数

        SOCKET_VIDEO_DATA: "Video/video_data", //视频站今日次数次数
        SOCKET_VIDEO_GET_MONEY: "Video/get_money", //视频站获取道具

        SOCKET_MERGE_BOARD: "Synthesis/board_data", // 合成棋盘信息
        SOCKET_MERGE_BOARD_SAVE: "Synthesis/add_board", // 保存合成棋盘
        SOCKET_MERGE_REWARD: "Synthesis/synthetic_reward", // 合成奖励

        SOCKET_MAIL_LIST: "Mail/mail_list", // 邮件列表
        SOCKET_DEL_MAIL: "Mail/del_mail", // 删除邮件
        SOCKET_READ_MAIL: "Mail/read", // 读取邮件
        SOCKET_GET_MAIL_ARWARD: "Mail/get_award", // 标记已领取奖励

        SOCKET_TABLOG: "", // 打点记录

        SOCKET_USER_LV_RECODE: "User/jl_lv", // 记录当前等级

        SOCKET_CHARGE_ORDER_LIST: "Order/info", // 充值列表
        SOCKET_PAY_CHECKCALLBACK_URL: "pay/checkcallback_url", // 支付成功 回调推送

        EVENT_SHOW_TIP: "event_show_tip", // 显示提示
        EVENT_USER_UPDATE: "event_user_update", // 更新用户数据
        EVENT_CLICK_SCREEN: "event_click_screen", // 点击屏幕
        EVENT_RED_TIP: "event_red_tip", // 红点提示
        EVENT_LV_TIP: "event_lv_tip", // 等级小手指印提示

        EVENT_MERGE_REFRUSH_ORDER: "event_merge_refrush_order", // 显示订单
        EVENT_MERGE_FINISH_ORDER: "event_merge_finish_order",   // 完成订单
        EVENT_MERGE_CHANGE_ORDER: "event_merge_change_order",   // 订单变动
        EVENT_MERGE_SOLD_ELEMENT: "event_merge_sold_element",   // 售卖元素
        EVENT_MERGE_SPEED_ELEMENT: "event_merge_speed_element", // 加速元素
        EVENT_MERGE_VIDEO_CD: "event_merge_video_cd",           // 看视频加速元素
        EVENT_MERGE_SHOP_BUY: "event_merge_shop_buy",           // 购买
        EVENT_MERGE_SHOP_MSG: "event_merge_shop_msg",           // 显示物品详细信息
        EVENT_MERGE_SHOP_USE: "event_merge_shop_use",           // 使用购买的物品
        EVENT_MERGE_SHOP_REFRUSH: "event_merge_shop_refrush",   // 刷新商店
        EVENT_MERGE_TMP_PACK: "event_merge_tmp_pack",           // 临时取出元素
        EVENT_MERGE_USE_PACK: "event_merge_use_pack",           // 使用背包元素
        EVENT_MERGE_ADD_PACK: "event_merge_add_pack",           // 购买背包
        EVENT_SHOP_ORDER_FINISH: "event_shop_order_finish",     // 订单完成
        // EVENT_MERGE_USE_TOOL: "event_merge_use_tool",           // 使用特殊道具

        EVENT_CLOSE_GUIDE_DIALOG: "event_close_guide_dialog", // 关闭新手对话框
        EVENT_TRIGGER_GUIDE:      "event_trigger_guide",      // 触发新手
        EVENT_OPENED_DIALOG:      "event_opened_dialog",      // 打开了界面
        EVENT_HAND_TIP:           "event_hand_tip",           // 弱提示小手
        EVENT_VIDEO_CARD:         "event_video_card",         // 视频卡券变化

        EVENT_MOVE_MAP_TO_POS: "event_move_map_to_pos",
        EVENT_ADD_ITEM: "event_add_item",
        EVENT_PACK_DATA_CHANGE: "event_pack_data_change", //背包数据变化
        EVENT_TASK_MOVE_MAP_TO_POS: "event_task_move_to_pos", //移动到任务要解锁的设施
        EVENT_SHOW_REWARD_ITEM_INFO: "event_show_reward_item_info", //奖励详情
        EVENT_SHOW_MAIN_BUILD_LV_UP: "event_show_main_build_lv_up", //主建筑升级

        EVENT_ADD_FAC_SKIN_VIEW: "event_add_fac_skin_view", //增加皮肤界面
        EVENT_REMOVE_FAC_SKIN_VIEW: "event_remove_fac_skin_view", //移除皮肤界面
        EVENT_REMOVE_FAC_SKIN_BTN: "event_remove_fac_skin_btn", //移除皮肤按钮
        EVENT_ADD_FAC_SKIN_BTN: "event_add_fac_skin_btn", //add皮肤按钮
        EVENT_CLICK_SKIN_ITEM: "event_click_skin_item", //点击皮肤item
        EVENT_REFRESH_CUR_SKIN_DATA: "event_refresh_cur_skin_data", //刷新当前皮肤数据
        EVENT_UNLOCK_FAC_FISH_ANI: "event_unlock_fac_fish_ani", //解锁消耗鱼干动画
        EVENT_CHANGE_FAC_SKIN: "event_change_fac_skin", //切换皮肤
        EVENT_SHOW_SINGLE_SKIN_ITEM: "show_single_skin_item", //单个皮肤套装
        EVENT_REFRESH_CUR_GROUP_SKIN_DATA: "event_refresh_cur_group_skin_data", //刷新当前皮肤套装数据
        EVENT_SKIN_SHOW_UI: "event_skin_show_ui", //皮肤ui显示

        EVENT_POWER_COUNT_DOWN: "event_power_count_down", //体力倒计时
        EVENT_CAN_LOCK_FAC: "event_can_lock_fac", //鱼干数量可以解锁房间设施

        EVENT_RANDOM_BEHAVIOR_CUSTOMER: "event_random_behavior_customer", //增加闲逛顾客

        EVENT_EVENT_GIFT_DATA: "event_event_gift_data", //礼包时间数据
        EVENT_REMOVE_EVENT_GIFT: "event_remove_event_gift", //移除礼包

        EVENT_MAIL_INFO: "event_mail_info", //邮件详情
        EVENT_MAIL_DEL_MAIL: "event_del_mail", //删除邮件

        EVENT_EXPLORE_FINISH: "event_explore_finish", // 探索完成

        EVENT_CONDITION: "event_condition", // 触发条件

        EVENT_SET_IS_CAN_CLICK_LV: "event_set_is_can_click_lv", //是否可以点击等级

        EVENT_CHECK_NEW_GIFT: "event_check_new_gift", //检查新手礼包
        EVENT_GET_DIALY_AD_REWARD: "event_get_dialy_ad_reward", //领取免费福利奖励
        EVENT_USER_LV_UP: "event_user_lv_up", //等级升级
        EVENT_NIUDAN_RED: "event_niudan_red", //扭蛋红点
        EVENT_CHECK_RED: "event_check_red", //检查红点
        EVENT_CHANGE_UI_TOP_RES: "event_change_ui_top_res", //切换ui资源显示
        EVENT_HIDE_WELCOME_CAT: "event_hide_welcome_cat", //隐藏欢迎猫

        EVENT_CHECK_NEXT_POP_VIEW: "event_check_next_pop_view", //检测下一个弹框

        EVENT_ON_PAY_SUCCESS_CALLBACK: "event_on_pay_success_callback", //支付成功回调

        EVENT_ONLINE_IS_HAVE_REWARD: "event_online_is_have_reward", //在线奖励是否有奖励领取
    };
    private static _event_list = {};

    public static listen (event_name: string, fn: Function, target: cc.Component) {
        this._event_list[event_name] = this._event_list[event_name] || [];
        this._event_list[event_name].push({ fn: fn, target: target, });
    }

    public static dispatch (event_name: string, data?: any) {
        if (this._event_list[event_name]) {
            for (let i = 0; i < this._event_list[event_name].length; ++i) {
                let item = this._event_list[event_name][i];
                if (cc.isValid(item.target)) {
                    item.fn.call(item.target, data);
                }
                else {
                    let len = this._event_list[event_name].length;
                    this._event_list[event_name][i] = this._event_list[event_name][len-1];
                    this._event_list[event_name].length = len-1;
                    --i;
                }
            }
        }
    }

    public static remove (event_name: string, target: cc.Component) {
        if (this._event_list[event_name]) {
            for (let i = this._event_list[event_name].length-1; i >= 0; --i) {
                if (this._event_list[event_name][i].target == target) {
                    // this._event_list[event_name].splice(i, 1);
                    let len = this._event_list[event_name].length;
                    this._event_list[event_name][i] = this._event_list[event_name][len-1];
                    this._event_list[event_name].length = len-1;
                }
            }
        }
    }

    public static getEventListenCount (): number {
        let count = 0;
        for (let key in this._event_list) {
            count += this._event_list[key].length;
        }
        return count;
    }
}

