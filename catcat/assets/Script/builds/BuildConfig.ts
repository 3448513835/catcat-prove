export enum SceneBuildId {
    unknown = 0,
    chuanwu = 10001,
    penquan = 10003,
}

export default class BuildConfig {

    /** 格子x坐标数量*/
    public static tileWidthNum = 120
    /** 格子y坐标数量*/
    public static tileHeightNum = 120

    public static max_zIndex = cc.macro.MAX_ZINDEX

    public static data_json_name = "build_data_to_json"
    public static scene_build_data_json_name = "scene_build_data_to_json"
    public static fac_skin_data = "fac_skin_data"

    public static scene_build_id_list: Set<number> = new Set([10001])
    public static fac_unlock_hide_list: Set<number> = new Set([6010, 6012, 8009, 8010, 8024, 8029, 8031])

    public static room_prefab_name = {
        101: "YuTang",
        102: "FishFactory",
        103: "GuoYuan",
        104: "GuoYuan2",
        105: "NaiCha",
        106: "JianShenFang",
        107: "QiPaiShi",
        108: "YouLeChang",
        109: "KuaiCanChe",
        10001: "ChuanWu",
        10003: "PenQuan",
        10004: "DiaoXiang",
        10005: "XuanChuanLan",
        10006: "WeiTuoLan",
        10007: "ReQiQiu",
        10008: "LuDeng",  //路灯1
        10009: "LuDeng",
        10010: "LuDeng",
        10011: "LuDeng",
        10012: "LuDeng",
        10013: "LuDeng",
        10014: "LuDeng",
        10015: "LuDeng",  //路灯8
        10016: "QiuQian",  //秋千1
        10017: "QiuQian",  //秋千2
        10018: "YouXiang",
        10019: "HuaLan",
        10020: "MaoZhuangShiTou",
        10021: "ZhangPeng",  //帐篷1
        10022: "ZhangPeng",
        10023: "ZhangPeng",  //帐篷3
    }

    public static scene_build_config = {
        10001: { pos: cc.v2(-1968, 456), },
        10003: { pos: cc.v2(-1898, -1342), },
        10004: { pos: cc.v2(2302, 51), },
        10005: { pos: cc.v2(850, 5), },
        10006: { pos: cc.v2(2090, 891), },
        10007: { pos: cc.v2(-427, -214), },
        10008: { pos: cc.v2(-1431, 155), scale: 0.6, },
        10009: { pos: cc.v2(1825, 651), scale: 0.6, flipX: true },
        10010: { pos: cc.v2(552, 182), scale: 0.6, },
        10011: { pos: cc.v2(195, 1710), scale: 0.6, },
        10012: { pos: cc.v2(990, 1286), scale: 0.6, },
        10013: { pos: cc.v2(1688, -335), scale: 0.6, },
        10014: { pos: cc.v2(-1703, 3), scale: 0.6, isHide: true },
        10015: { pos: cc.v2(-2008, -1015), scale: 0.6, isHide: true },
        10016: { pos: cc.v2(940, -486), scale: 0.5, },
        10017: { pos: cc.v2(710, 376), scale: 0.5, isHide: true },
        10018: { pos: cc.v2(1134, -14), scale: 0.5, },
        10019: { pos: cc.v2(1197, -310), scale: 0.8, },
        10020: { pos: cc.v2(1980, -1500), scale: 0.8, },
        10021: { pos: cc.v2(1809, -593), scale: 0.5, },
        10022: { pos: cc.v2(2031, -744), scale: 0.5, },
        10023: { pos: cc.v2(2260, -902), scale: 0.5, },
    }

    public static room_fac_rubbish_id = {
        102: [2001, 2002],
    }

    public static room_fac_icon_frames_name = {
        101: "yutang",
        102: "fish_factory",
        103: "guoyuan",
        104: "guoyuan2",
        105: "naicha",
        106: "jianshenfang",
        107: "qipaishi",
        108: "youlechang",
        109: "kuaicanche",
        10001: "chuanwu",
        10003: "penquan",
        10004: "diaoxiang",
        10005: "xuanchuanlan",
        10006: "weituolan",
        10007: "reqiqiu",
        10008: "ludeng",  //路灯1
        10009: "ludeng",
        10010: "ludeng",
        10011: "ludeng",
        10012: "ludeng",
        10013: "ludeng",
        10014: "ludeng",
        10015: "ludeng",  //路灯8
        10016: "qiuqian",  //秋千1
        10017: "qiuqian",  //秋千2
        10018: "youxiang",
        10019: "hualan",
        10020: "maozhuashitou",
        10021: "zhangpeng",  //帐篷1
        10022: "zhangpeng",
        10023: "zhangpeng",  //帐篷3
    }

    public static room_zindex = {
        0: 5500,
        101: 2000,
        102: 1000,
        103: 1000,
        104: 1100,
        105: 6000,
        106: 5000,
        107: 9000,
        108: 12000,
        109: 2600,
        10001: 2500,
        10003: 13000,
        10006: 1500,
        10008: 6100,
        10009: 2600,
        10010: 8300,
        10012: 1500,
        10013: 13000,
        10014: 9200,
        10015: 13000,
        10017: 5200,
    }

    public static room_scale = {
        101: 1.2,
        102: 1,
        103: 1,
        104: 1,
        105: 1,
        106: 1,
        107: 1,
        108: 1,
        109: 1,
    }

    public static room_fac_skin_dragon_name = {
        101: {
            1: "diaoyu",
            2: "diaoyu",
            3: "diaoyu_mofa",
        },
        102: {
            1: "yujiagong",
            2: "yujiagong",
            3: "yujiagong_mofa",
        },
        103: {
            1: "guoyuan",
            2: "guoyuan",
            3: "guoyuan_mofa",  //现在没有动画
        },
    }

    public static room_fac_dragon_name = {
        101: {
            1002: "yu",
            1003: "diaoyu",
            1005: "hehua",
            1006: "diaoxaing",
            1009: "maiyum",
            1010: "guo",
            1014: "deng",
            1016: "huatan",
        },
        102: {
            2004: "chuansongdai",
            2007: "lazhu",
            2008: "bilu",
            2009: "ban",
            2010: "da",
            2011: "kao",
            2012: "qie",
            2013: "dabao",
            2014: "jishu",
            2006: "tuiche",
            2015: "fengshan",
            2016: "huatan",
        },
        103: {
            3003: "guoshu",
            3004: "guoshu",
            3005: "shu",
            3006: "shuwu",
            3007: "qiuqian",
            3008: "dijiao",
            3009: "zhaiguozi",
            3011: "hecha",
            3013: "fengche",
        },
        104: {
            4007: "chigua",
            4009: "taoshu",
            4012: "dadishu",
            4013: "choushuiji",
            4014: "dazuihua",
            4017: "caizhai",
        },
        105: {
            5002: "jiaoban",
            5003: "zhizuo",
            5005: "luzi",
            5006: "shouyin",
        },
        108: {
            8004: "damen",
            8006: "menkouqiqiu",
            8008: "shutiaodian",
            8009: "motianlun",
            8012: "xiangchang",
            8014: "wawadian",
            8016: "naichadian",
            8022: "shuichi",
            8028: "guoshanche",
            8033: "huoche",
            8034: "qiqiuzhuangshi",
            8035: "zhangpeng",
        },
        109: {
            9002: "ding",
        }
    }

    public static room_grid_pos_round = {
        101: {
            x: [40, 51],
            y: [55, 65]
        },
        102: {
            x: [27, 36],
            y: [44, 63]
        },
        103: {
            x: [39, 52],
            y: [28, 41]
        },
        104: {
            x: [53, 65],
            y: [27, 41]
        },
    }

    public static fac_grid_pos = {
        101: {
            1000: [cc.v2(49, 62), cc.v2(49, 61), cc.v2(48, 61), cc.v2(48, 62), cc.v2(48, 63), cc.v2(48, 64), cc.v2(47, 64), cc.v2(47, 63), cc.v2(47, 62), cc.v2(47, 61), cc.v2(47, 60), cc.v2(47, 59), cc.v2(46, 59), cc.v2(45, 59), cc.v2(44, 59), cc.v2(44, 60), cc.v2(43, 61), cc.v2(43, 62), cc.v2(44, 62), cc.v2(45, 63), cc.v2(46, 63), cc.v2(43, 62),],
            1003: [cc.v2(44, 65), cc.v2(43, 65), cc.v2(43, 64), cc.v2(44, 64),],
            1004: [cc.v2(41, 63), cc.v2(42, 63), cc.v2(42, 62), cc.v2(41, 62), cc.v2(41, 61), cc.v2(40, 61), cc.v2(40, 62),],
            1005: [cc.v2(45, 62), cc.v2(46, 62), cc.v2(46, 61), cc.v2(45, 61), cc.v2(44, 61), cc.v2(46, 60),],
            1006: [cc.v2(43, 60), cc.v2(43, 59), cc.v2(42, 59), cc.v2(41, 58), cc.v2(41, 59), cc.v2(42, 58),],
            1007: [cc.v2(42, 65), cc.v2(42, 64), cc.v2(41, 65), cc.v2(41, 64), cc.v2(49, 65), cc.v2(48, 65), cc.v2(48, 64),],
            1008: [cc.v2(48, 59), cc.v2(49, 59), cc.v2(44, 58), cc.v2(45, 58), cc.v2(46, 58), cc.v2(47, 58), cc.v2(46, 57), cc.v2(45, 57), cc.v2(44, 57),],
            1009: [cc.v2(48, 58), cc.v2(49, 58), cc.v2(48, 57), cc.v2(49, 57), cc.v2(47, 57),],
            1010: [cc.v2(48, 56), cc.v2(49, 56), cc.v2(48, 55),],
            1011: [cc.v2(44, 56), cc.v2(45, 56), cc.v2(46, 56),],
            1012: [cc.v2(43, 57), cc.v2(42, 57), cc.v2(42, 56), cc.v2(43, 56),],
            1013: [cc.v2(47, 65), cc.v2(46, 65), cc.v2(45, 65), cc.v2(45, 64), cc.v2(46, 64),],
            1014: [cc.v2(50, 64), cc.v2(49, 64), cc.v2(50, 56), cc.v2(49, 55), cc.v2(50, 55),],
            1015: [cc.v2(41, 57), cc.v2(41, 56), cc.v2(41, 55),],
            1016: [cc.v2(42, 55), cc.v2(43, 55), cc.v2(44, 55), cc.v2(45, 55), cc.v2(46, 55), cc.v2(47, 55), cc.v2(47, 56),],
        },
        102: {
            2000: [cc.v2(32, 63), cc.v2(33, 63), cc.v2(34, 63), cc.v2(34, 61), cc.v2(34, 60), cc.v2(35, 61), cc.v2(35, 60), cc.v2(36, 60), cc.v2(36, 59), cc.v2(37, 60), cc.v2(37, 59), cc.v2(37, 58), cc.v2(37, 57), cc.v2(37, 56), cc.v2(37, 55), cc.v2(40, 58), cc.v2(37, 54), cc.v2(37, 54), cc.v2(37, 53), cc.v2(37, 52), cc.v2(37, 51), cc.v2(36, 52), cc.v2(36, 51), cc.v2(35, 51), cc.v2(35, 50), cc.v2(36, 50), cc.v2(30, 47), cc.v2(30, 47), cc.v2(30, 47), cc.v2(29, 48),],
            2003: [cc.v2(40, 61), cc.v2(41, 62), cc.v2(31, 56), cc.v2(31, 55), cc.v2(31, 54), cc.v2(31, 53), cc.v2(31, 52), cc.v2(30, 52), cc.v2(30, 53), cc.v2(30, 54), cc.v2(29, 54), cc.v2(29, 53), cc.v2(29, 52), cc.v2(29, 51),],
            2004: [cc.v2(34, 59), cc.v2(34, 58), cc.v2(34, 57), cc.v2(34, 56), cc.v2(34, 55), cc.v2(35, 55), cc.v2(36, 55), cc.v2(36, 54), cc.v2(36, 53), cc.v2(35, 52), cc.v2(34, 52), cc.v2(32, 51), cc.v2(32, 50), cc.v2(33, 49),],
            2005: [cc.v2(32, 62), cc.v2(32, 61), cc.v2(32, 60), cc.v2(31, 62), cc.v2(31, 61), cc.v2(31, 60), cc.v2(31, 59), cc.v2(30, 58), cc.v2(30, 59), cc.v2(30, 60), cc.v2(30, 61),],
            2006: [cc.v2(33, 62), cc.v2(33, 61), cc.v2(33, 60), cc.v2(33, 59),],
            2007: [cc.v2(36, 63), cc.v2(36, 62), cc.v2(37, 62), cc.v2(36, 61), cc.v2(37, 61),],
            2008: [cc.v2(32, 59), cc.v2(32, 58), cc.v2(31, 58), cc.v2(31, 57),],
            2009: [cc.v2(36, 49), cc.v2(35, 49), cc.v2(36, 48), cc.v2(34, 49),],
            2010: [cc.v2(34, 51), cc.v2(34, 50), cc.v2(33, 50),],
            2011: [cc.v2(35, 54), cc.v2(34, 54), cc.v2(34, 53), cc.v2(33, 53), cc.v2(33, 52),],
            2012: [cc.v2(32, 56), cc.v2(32, 55), cc.v2(33, 56), cc.v2(33, 55),],
            2013: [cc.v2(33, 57), cc.v2(32, 57), cc.v2(33, 58),],
            2014: [cc.v2(35, 58), cc.v2(36, 58), cc.v2(35, 57), cc.v2(36, 57),],
            2015: [cc.v2(32, 49), cc.v2(31, 48), cc.v2(32, 48),],
            2016: [cc.v2(32, 65), cc.v2(32, 64), cc.v2(33, 65), cc.v2(33, 64), cc.v2(37, 50), cc.v2(38, 50), cc.v2(37, 49), cc.v2(38, 49), cc.v2(37, 48), cc.v2(38, 48),],
            2017: [cc.v2(38, 53), cc.v2(38, 52), cc.v2(38, 51), cc.v2(36, 65), cc.v2(36, 64), cc.v2(35, 64), cc.v2(35, 65), cc.v2(34, 65), cc.v2(34, 64),],
            2018: [cc.v2(32, 54), cc.v2(32, 53), cc.v2(32, 52),],
            2019: [cc.v2(31, 50), cc.v2(31, 49), cc.v2(35, 48), cc.v2(35, 47), cc.v2(34, 47),],
            2020: [cc.v2(35, 63), cc.v2(35, 62), cc.v2(34, 62), cc.v2(34, 63),],
        },
        // 103: {
        //     3004: [cc.v2(39, 34), cc.v2(40, 35), cc.v2(40, 34), cc.v2(40, 33), cc.v2(40, 32), cc.v2(41, 32), cc.v2(41, 33), cc.v2(41, 34), cc.v2(41, 35), cc.v2(41, 36), cc.v2(41, 37), cc.v2(42, 37), cc.v2(42, 34), cc.v2(42, 33), cc.v2(43, 35),],
        //     3005: [cc.v2(50, 33), cc.v2(50, 32), cc.v2(49, 32), cc.v2(48, 32), cc.v2(48, 31), cc.v2(48, 29), cc.v2(47, 29), cc.v2(46, 29), cc.v2(46, 31), cc.v2(47, 32),],
        //     3006: [cc.v2(50, 30), cc.v2(49, 30), cc.v2(49, 31), cc.v2(48, 30), cc.v2(47, 30), cc.v2(47, 31), cc.v2(46, 30),],
        //     3007: [cc.v2(49, 33), cc.v2(48, 33), cc.v2(49, 34),],
        //     3008: [cc.v2(50, 38), cc.v2(49, 38), cc.v2(49, 37), cc.v2(50, 37), cc.v2(49, 36), cc.v2(50, 36),],
        //     3009: [cc.v2(46, 36), cc.v2(42, 36), cc.v2(42, 35), cc.v2(43, 37),],
        //     3010: [cc.v2(45, 30), cc.v2(44, 30), cc.v2(44, 29), cc.v2(43, 29), cc.v2(43, 30), cc.v2(42, 29), cc.v2(42, 30), cc.v2(43, 31),],
        //     3011: [cc.v2(45, 32), cc.v2(44, 32), cc.v2(44, 31), cc.v2(45, 31),],
        //     3012: [cc.v2(51, 36), cc.v2(51, 35), cc.v2(50, 35),],
        //     3013: [cc.v2(53, 36), cc.v2(52, 36), cc.v2(52, 35), cc.v2(53, 35),],
        //     3014: [cc.v2(48, 35), cc.v2(47, 34), cc.v2(47, 35), cc.v2(46, 35), cc.v2(46, 34), cc.v2(46, 33), cc.v2(45, 34), cc.v2(45, 33),],
        //     3015: [cc.v2(45, 39), cc.v2(46, 40), cc.v2(46, 39), cc.v2(47, 40), cc.v2(48, 40), cc.v2(47, 39),],
        //     3016: [cc.v2(44, 34), cc.v2(43, 34), cc.v2(43, 33),],
        //     3017: [cc.v2(45, 40), cc.v2(49, 40),],
        //     3018: [cc.v2(49, 39), cc.v2(50, 40),],
        //     3019: [cc.v2(42, 38), cc.v2(43, 39), cc.v2(44, 40), cc.v2(51, 39), cc.v2(52, 38), cc.v2(51, 38), cc.v2(52, 37), cc.v2(52, 33), cc.v2(51, 32),],
        // },
        // 104: {
        //     4003: [cc.v2(60, 37), cc.v2(60, 36), cc.v2(60, 35), cc.v2(60, 34), cc.v2(59, 34), cc.v2(59, 37), cc.v2(58, 37), cc.v2(57, 37), cc.v2(57, 36), cc.v2(58, 36), cc.v2(57, 35), cc.v2(57, 34), cc.v2(58, 34),],
        //     4006: [cc.v2(53, 32), cc.v2(53, 33), cc.v2(53, 34), cc.v2(54, 35), cc.v2(54, 34), cc.v2(54, 33), cc.v2(55, 37), cc.v2(54, 37),],
        //     4007: [cc.v2(55, 36), cc.v2(55, 35), cc.v2(55, 34),],
        //     4008: [cc.v2(55, 33), cc.v2(55, 32),],
        //     4009: [cc.v2(53, 28), cc.v2(53, 29), cc.v2(54, 28), cc.v2(53, 30), cc.v2(54, 29), cc.v2(55, 28), cc.v2(55, 29), cc.v2(54, 30), cc.v2(54, 31), cc.v2(55, 31), cc.v2(55, 30), cc.v2(56, 30), cc.v2(56, 29), cc.v2(56, 31), cc.v2(56, 32),],
        //     4010: [cc.v2(57, 29), cc.v2(58, 29), cc.v2(58, 30), cc.v2(59, 30), cc.v2(59, 31), cc.v2(60, 31),],
        //     4011: [cc.v2(61, 31), cc.v2(62, 31), cc.v2(61, 30),],
        //     4012: [cc.v2(61, 32), cc.v2(61, 33), cc.v2(60, 33), cc.v2(61, 34),],
        //     4013: [cc.v2(63, 36), cc.v2(63, 35), cc.v2(63, 34), cc.v2(64, 35), cc.v2(64, 34),],
        //     4014: [cc.v2(58, 40), cc.v2(57, 39), cc.v2(57, 38), cc.v2(58, 39),],
        //     4015: [cc.v2(55, 38), cc.v2(56, 39), cc.v2(61, 39), cc.v2(62, 39), cc.v2(63, 38), cc.v2(63, 37), cc.v2(64, 33), cc.v2(63, 32),],
        //     4016: [cc.v2(58, 35), cc.v2(59, 35), cc.v2(59, 36),],
        //     4017: [cc.v2(59, 33), cc.v2(59, 32), cc.v2(58, 32), cc.v2(58, 33),],
        //     4018: [cc.v2(57, 31), cc.v2(57, 30), cc.v2(58, 31),],
        //     4019: [cc.v2(61, 37), cc.v2(61, 36),],
        // },
        // 105: {
        //     5002: [cc.v2(43, 46), cc.v2(44, 46), cc.v2(44, 45), cc.v2(43, 45), cc.v2(42, 45), cc.v2(42, 44), cc.v2(43, 44),],
        //     5003: [cc.v2(47, 46), cc.v2(46, 46), cc.v2(45, 45),],
        //     5004: [cc.v2(45, 44), cc.v2(44, 44),],
        //     5005: [cc.v2(47, 46), cc.v2(47, 45), cc.v2(46, 45),],
        //     5006: [cc.v2(42, 48), cc.v2(43, 48), cc.v2(44, 48), cc.v2(44, 47),],
        //     5007: [cc.v2(45, 48),],
        //     5008: [cc.v2(46, 48),],
        //     5009: [cc.v2(48, 48), cc.v2(48, 47), cc.v2(47, 47), cc.v2(47, 48),],
        //     5010: [cc.v2(48, 50), cc.v2(48, 49), cc.v2(47, 49), cc.v2(47, 50),],
        //     5011: [cc.v2(45, 51), cc.v2(45, 50), cc.v2(46, 50), cc.v2(46, 51), cc.v2(47, 51),],
        //     5012: [cc.v2(42, 50), cc.v2(42, 49), cc.v2(41, 49), cc.v2(41, 48),],
        //     5013: [cc.v2(44, 51), cc.v2(44, 50), cc.v2(43, 50), cc.v2(43, 51),],
        // },
    }
}
