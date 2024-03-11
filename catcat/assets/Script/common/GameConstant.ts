import { User } from "./User";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GameConstant  {
    public static USER_DATA: string                  = "user_data"                  // 用户数据
    public static TASK_LOCAL_VALUE_STR: string       = "task_local_value_str"       // 任务数据
    public static USER_HEAD_DATA: string             = "user_head_data"             // 头像数据
    public static USE_HEAD_ID: string                = "use_head_id"                // 使用的头像id
    public static USER_NAME: string                  = "user_name"                  // 用户名字
    public static CHANGE_NAME_NUM: string            = "change_name_num"            // 修改名字次数
    public static POWER_VIEW_AD_NUM: string          = "power_view_ad_num"          // 体力界面观看视频次数
    public static POWER_VIEW_BUY_NUM: string         = "power_view_buy_num"         // 体力界面购买体力次数
    public static RECORD_GAME_TIME: string           = "record_game_time"           // 记录时间
    public static RECORD_POWER_RESIDUE_TIME: string  = "record_power_residue_time"  // 本次体力恢复倒计时时间
    public static MAX_POWER_NUM: number              = 100
    public static POWER_RECOVER_TIME: number         = 120
    public static POKEDEX_CUSTOMER_LOCK_INFO: string = "pokedex_customer_lock_info" // 图鉴顾客信息
    public static CUSTOMER_UNLOCK_LIST: string       = "customer_unlock_list"       // 顾客解锁列表
    public static DEFAULT_RES: number                = 999
    public static POWER_AD_GET_NUM: string           = "power_ad_get_num"           // 观看广告获取体力次数
    public static POWER_AD_RECOVER_TIME: string      = "power_ad_recover_time"      // 体力广告观看次数时间
    public static SEVENT_DAY_DATA: string            = "seven_day_data"             // 七天登录
    public static SEVENT_DAY_RECOVER_TIME: string    = "seven_day_recover_time"     // 七天登录重置天数
    public static EVENT_GIFT_LOCAL_DATA: string      = "event_gift_local_data"      // 礼包本地数据
    public static POKDEX_PAGE_INDEX: string          = "pokdex_page_index"          // 图鉴记录选中标签页
    public static NEW_GIFT_IS_GET: string            = "new_gift_is_get"            // 新手礼包是否领取
    public static DIALY_AD_RECOVER_TIME: string      = "dialy_ad_recover_time"      // 免费福利重置时间
    public static DIALY_AD_GET_DATA: string          = "dialy_ad_get_data"          // 免费福利领取信息
    public static ROLE_ENTER_ROOM_DATA: string       = "role_enter_room_data"       // 顾客进入房间信息
    public static ONLINE_TOTAL_TIME: string          = "online_total_time"          // 在线累计时间
    public static ONLINE_IS_HAVE_REWARD: string      = "online_is_have_reward"      // 在线是否有未领取奖励
    public static ONLINE_REWARD_STAGE: string        = "online_reward_stage"        // 在线奖励阶段
    public static ONLINE_RECOVER_TIME: string        = "online_recover_time"        // 在线奖励重置时间
    public static SKIN_GROUP_REWARD: string          = "skin_group_reward"          // 皮肤套装奖励情况
    public static MONTH_CARD_DATA: string            = "month_card_data"            // 月卡数据
    public static ALY_CLEAR_SCENE_RUBBISH: string    = "aly_clear_scene_rubbish"    // 已经清理的场景垃圾数据
    public static ENTRUST_DATA: string               = "entrust_data"    // 委托数据
    public static TODAY_PICK_GAME_NUM: string        = "today_pick_game_num"    // 今日玩分拣游戏次数
    public static PICK_RECOVER_TIME: string          = "pick_recover_time"      // 分拣游戏次数重置时间
    public static PICK_IS_GUIDE: string              = "pick_is_guide"      // 分拣游戏新手是否
    public static NIU_DAN_NUM: string                = "niu_dan_num"      // 扭蛋次数
    public static TODAY_NIU_DAN_NUM: string                = "today_niu_dan_num"      // 今日扭蛋次数
    public static NIU_DAN_RECOVER_TIME: string      = "niu_dan_recover_time"      // 扭蛋重置时间

    public static ONLINE_REWARD_GET_LIST: string        = "online_reward_get_list"      // 在线奖励奖励领取列表

    /**顾客道具id */
    public static customer_item_id_list: Set<number> = new Set([120001, 120002, 120003])

    public static res_id = {
        coin:    100001,
        diamond: 100002,
        crystal: 100003,
        exp:     100004,
        stamina: 100005,
        yugan:   100006,
        video:   100008,
        trave:   120004,
    }
}
