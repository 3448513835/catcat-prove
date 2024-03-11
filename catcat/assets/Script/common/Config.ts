export const DEBUG           = false; // 测试服
export const GUIDE           = true;  // 新手引导开关
export const ADVERTISE       = true;  // 广告开关
export const MAOQIU_WX       = true;  // 2D毛球微信
export const MIAOZHICHENG_WX = false; // 喵喵浮生记微信
export const MEISHIMIZHEN_WX = false; // 美食迷阵
export const BYTE            = false; // 2D字节跳动
export const SUPER           = false; // 超级账号
export const CLEAR           = false; // 清除账号
export const GAME_2D         = true;  // 是否2D游戏

export enum LanguageType {
    CHINESE = 1,
    ENGLISH = 2,
};

export const Config = {
    language: LanguageType.CHINESE,
    game_2d: GAME_2D,
    debug: DEBUG,
    super: SUPER,
    clear: CLEAR,
    wx_version: { version: "0.0.22", clear: false },
    maoqiu_wx: MAOQIU_WX,
    tt_appid: "tt3f0049bda03c2f0802",
    isAndroidPay: false,  //安卓支付
    socket: ((): string => {
        if (BYTE) { // 毛球抖音
            return DEBUG? "wss://cattwo.stygame.com/wss":"wss://tiktokcat.stygame.com/wss";
        }
        else if (typeof(wx) != "undefined") { // 微信
            if (DEBUG) {
                return "wss://cattwo.stygame.com/wss";
            }
            else if (MIAOZHICHENG_WX) { // 喵之城
                return "wss://hairball.stygame.com/wss";
                // return "wss://miaomiao.stygame.com/wss";
            }
            else if (MEISHIMIZHEN_WX) { // 美食迷阵
                return "wss://hairball.stygame.com/wss";
            }
            else if (MAOQIU_WX) { // 毛球微信
                return "wss://hairball.stygame.com/wss";
            }
        }
        else { // APK
            if (DEBUG) {
                return GAME_2D? "ws://116.62.240.118:2357":"ws://116.62.240.118:2356";
            }
            else {
                return GAME_2D? "ws://47.100.78.208:2401":"ws://47.100.78.208:2402";
            }
        }
    })(),
    http: ((): string => {
        if (DEBUG) {
            return GAME_2D? "https://cattwo.stygame.com":"https://cat.stygame.com";
        }
        else if (MAOQIU_WX) {
            return "https://hairball.stygame.com";
        }
        else if (MEISHIMIZHEN_WX) {
            return "https://hairball.stygame.com";
        }
        else if (MIAOZHICHENG_WX) {
            return "https://hairball.stygame.com";
            // return "https://miaomiao.stygame.com";
        }
        else if (BYTE) {
            return "https://tiktokcat.stygame.com";
        }
        else {
            return GAME_2D? "https://miaomiao.stygame.com":"https://finefood.stygame.com";
        }
    })(),
    Advertise: ADVERTISE, // 广告是否开启
    color: {
        brown: new cc.Color(0x95, 0x5b, 0x44),        // 棕色 955b44
        brown_light: new cc.Color(0xd2, 0x78, 0x43),  // 浅棕色 d27843
        brown_dark: new cc.Color(0x56, 0x17, 0x0A),  // 深棕色 56170A
        purple: new cc.Color(0x68, 0x45, 0x77),       // 紫色 684577
        purple_light: new cc.Color(0xbe, 0x90, 0x90), // 浅紫色 be9090
        gray: new cc.Color(0x74, 0x74, 0x74),         // 灰色 747474
        red: new cc.Color(0xbf, 0x2c, 0x2c),          // 红色 bf2c2c
        red_light: new cc.Color(0xff, 0x40, 0x37),  // 红色亮 ff4037
        green: new cc.Color(0x48, 0x8f, 0x25),        // 绿色 488f25
        green_light: new cc.Color(0xa1, 0xff, 0x26),  // 浅绿色 a1ff26
        white: new cc.Color(0xff, 0xff, 0xff),        // 白色 ffffff
        blue: new cc.Color(0x39, 0x71, 0xb9),         // 蓝色 3971b9
    },
    statistic: { // 统计
        ENTER_LOGIN_SCENE:  10000, // 进入登录界面
        LOGIN_SUCCESS:      10001, // 登录成功
        LOAD_MAIN_SCENE:    10002, // 加载片头场景完成
        ENTER_MAIN_SCENE:   10003, // 进入主场景
        GUIDE_MERGE_BUTTON: 10004, // 新手点击进入合成按钮
        ENTER_MERGE_SCENE:  10005, // 进入合成场景

        VIDEO_DIAMOND:      10006, // 开始钻石视频
        VIDEO_GOLD:         10007, // 开始金币视频
        VIDEO_STRENGTH:     10008, // 开始体力视频
        VIDEO_CRYSTAL:      10009, // 开始水晶视频

        VIDEO_DIAMOND2:     10010, // 钻石视频结束
        VIDEO_GOLD2:        10011, // 金币视频结束
        VIDEO_STRENGTH2:    10012, // 体力视频结束
        VIDEO_CRYSTAL2:     10013, // 水晶视频结束

        VIDEO_GACHA0:       10020, // 扭蛋视频开始
        VIDEO_GACHA1:       10021, // 扭蛋视频结束
        VIDEO_ONLINE0:      10022, // 在线奖励开始
        VIDEO_ONLINE1:      10023, // 在线奖励结束
        NEWGIFT0:           10024, // 新手奖励开始
        NEWGIFT1:           10025, // 新手奖励开始
        MONTH_CARD0:        10026, // 月卡视频开始
        MONTH_CARD1:        10027, // 月卡视频结束
        WEEK_CARD0:         10028, // 周卡视频开始
        WEEK_CARD1:         10029, // 周卡视频结束
        CATGIFT0:           10040, // 猫的馈赠视频开始
        CATGIFT1:           10041, // 猫的馈赠视频结束
        MERGE_CD:           10042, // 合成钻石减CD
        BUY_STRENGTH:       10043, // 商店钻石买体力
        BUY_GOLD:           10044, // 商店钻石买金币
        MERGE_VIDEO_CD0:    10045, // 合成看视频减CD开始
        MERGE_VIDEO_CD1:    10046, // 合成看视频减CD结束

        TRANS_ENTER:          10031, // 进入过场场景
        TRANS_ANIMAL_FINISH1: 10032, // 播放完动画1
        TRANS_ANIMAL_FINISH2: 10033, // 播放完动画2
        TRANS_ANIMAL_FINISH3: 10034, // 播放完动画3
        TRANS_ANIMAL_FINISH4: 10035, // 播放完动画4
        TRANS_GO:             10036, // 过场场景跳转
        TRANS_JUMP:           10037, // 点击跳过场景

        FINISH_ORDER0:        20000, // 完成订单0  20000~29999 为订单统计
        FINISH_ORDER1:        20001, // 完成订单1
        FINISH_ORDER2:        20002, // 完成订单2

        MERGE_SHOP0:          30000, // 合成商店开始观看视频 30000刷新商店开始
        MERGE_SHOP1:          31000, // 合成商店结束观看视频 31000刷新商店结束

        WELFARE0:             40000, // 福利开始观看视频
        WELFARE1:             41000, // 福利结束观看视频

        MAIN_TASK_BTN:       50000, // 任务按钮
        MAIN_SIGN_BTN:       50001, // 签到
        MAIN_NIUDAN_BTN:     50002, // 扭蛋
        MAIN_MONTHCARD_BTN:  50003, // 月卡
        MAIN_WELFARE_BTN:    50004, // 福利
        MAIN_GUIDE_BTN:      50005, // 新手礼包
        MAIN_TRAVEL_BTN:     50006, // 旅行
        MAIN_GAMECENTER_BTN: 50007, // 游戏中心
        MAIN_STRENGTH_BTN:   50008,   // 体力
        MAIN_GOLD_BTN:       50009,   // 金币
        MAIN_DIAMOND_BTN:    50010,   // 钻石
        MAIN_CRYSTAL_BTN:    50011,   // 水晶

        ONLINE_CLICK:    50012,   // 在线任务点击
        EVENT_GIFT_CLICK:    50013,   // 事件礼包点击

        EVENT_ONLINE_TIME:    50014,   // 在线超过500s
    },
    guide: GUIDE, // 是否开启新手引导
    QQ: (() => {
        if (MAOQIU_WX || BYTE) {
            return "863168266";
        }
        else if (GAME_2D) {
            return "861885703";
        }
        else {
           return "883604905";
        }
    })(), // qq群
};

export let UserDefault = {
    getItem: (key) => {
        return cc.sys.localStorage.getItem(key)
    },
    setItem: (key, value) => {
        cc.sys.localStorage.setItem(key, value)
    },
    removeItem: (key) => {
        cc.sys.localStorage.removeItem(key)
    },
}

