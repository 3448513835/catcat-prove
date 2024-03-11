/*
 * 新手引导
 */
import EventManager from "../common/EventManager"
import NetManager from "../common/NetManager"
import { Config } from "../common/Config"
import { User } from "../common/User"

interface IGuideConfig {
    id: number, // id
    type: number, // 类型 1全局高亮 2局部高亮 3滑动
    next: number, // 下一个id
    close: number, // 点击直接关闭
    cat: { x: number, y: number, widget: boolean, }, // 猫位置
    msg: string, // 文本信息
    unrecord?: boolean, // 记录
};

var GuideConfig: Map<number, IGuideConfig> = new Map();
GuideConfig[1]  = { id: 1,  type: 2, next: 2,  close: 0, cat: { x: 0, y: 175, },  msg: "喵呜~先点击这里去看看吧~", };
GuideConfig[2]  = { id: 2,  type: 3, next: 3,  close: 0, cat: { x: 0, y: 291, },  msg: "让我们先把这三个<color=#ff0000>冷藏箱</c>挪到一起", };
GuideConfig[3]  = { id: 3,  type: 2, next: 4,  close: 0, cat: { x: 0, y: 208, },  msg: "哇哦！合成了<color=#ff0000>冷冻盒</c>~点下它看看里面有什么吧！", };
GuideConfig[4]  = { id: 4,  type: 2, next: 5,  close: 0, cat: { x: 0, y: 208, },  msg: "还不够哦，再来一次~", };
GuideConfig[5]  = { id: 5,  type: 3, next: 6,  close: 0, cat: { x: 0, y: 411, },  msg: "把这5个杯子移动到一起", };
GuideConfig[6]  = { id: 6,  type: 1, next: 7,  close: 0, cat: { x: 0, y: 208, },  msg: "哇！5个相同物品能合成2个高级物品！这个秘诀要记下哦~", };
GuideConfig[7]  = { id: 7,  type: 2, next: 8,  close: 0, cat: { x: 0, y: -392, }, msg: "有订单完成了，提交订单可以获得小鱼干哦~", };
GuideConfig[8]  = { id: 8,  type: 2, next: 9,  close: 0, cat: { x: 0, y: -364, }, msg: "好像有东西可以建造了，快去看看吧~", };
GuideConfig[9]  = { id: 9,  type: 2, next: 10, close: 0, cat: { x: 0, y: 150, },  msg: "点击这里可以快速前往~", };
GuideConfig[10] = { id: 10, type: 2, next: 11, close: 0, cat: { x: 0, y: 300, },  msg: "有一片废弃的鱼塘，快消耗小鱼干来承包它吧~", };
GuideConfig[11] = { id: 11, type: 2, next: 12, close: 0, cat: { x: 0, y: 160, },  msg: "准备钓鱼！！先解锁一个渔具吧~", };
GuideConfig[12] = { id: 12, type: 2, next: 18, close: 0, cat: { x: 0, y: 0, },    msg: "", };
// GuideConfig[13] = { id: 13, type: 1, next: 14, close: 0, cat: { x: 0, y: 100, },  msg: "哇，搞定了！只是好像有点普通", };
// GuideConfig[14] = { id: 14, type: 2, next: 15, close: 0, cat: { x: 0, y: 180, },  msg: "<color=#ff0000>长按</c>渔夫这里试试看！", };
// GuideConfig[15] = { id: 15, type: 2, next: 16, close: 0, cat: { x: 0, y: 300, },  msg: "点击这里可以更换设施皮肤，这个一定要记得哦~", };
// GuideConfig[16] = { id: 16, type: 2, next: 17, close: 0, cat: { x: 0, y: 0, },    msg: "", };
// GuideConfig[17] = { id: 17, type: 2, next: 18, close: 0, cat: { x: 0, y: 160, },  msg: "点击这里保存修改~", };
GuideConfig[18] = { id: 18, type: 2, next: 19, close: 0, cat: { x: 0, y: 160, },  msg: "再来购买一个鱼竿架吧！", };
GuideConfig[19] = { id: 19, type: 2, next: 20, close: 0, cat: { x: 0, y: 300, },  msg: "诶，小鱼干不够了，让我们再去挣点小鱼干吧~", };
GuideConfig[20] = { id: 20, type: 3, next: 21, close: 0, cat: { x: 0, y: 291, },  msg: "让我们把这三个单手包也挪到一起~", };
GuideConfig[21] = { id: 20, type: 1, next: 200, close: 0, cat: { x: 0, y: 208, },  msg: "接下来就看你的了~加油去挣更多小鱼干吧~", };
GuideConfig[200] = { id: 200, type: 1, next: 22, close: 0, cat: { x: 0, y: 208, },  msg: "", };

if (Config.game_2d) {
    GuideConfig[1]  = { id: 1,  type: 2, next: 102,  close: 0, cat: { x: 0, y: 175, },  msg: "喵呜~先点击这里去看看吧~", };
    GuideConfig[102]  = { id: 102,  type: 1, next: 103,  close: 0, cat: { x: 0, y: 208, },  msg: "这是我的小宝库，来帮我整理一下吧~", };
    GuideConfig[103]  = { id: 103,  type: 3, next: 104,  close: 0, cat: { x: 0, y: 141, },  msg: "移动这两个相同的物品到一起可以提升等级~", };
    GuideConfig[104]  = { id: 104,  type: 3, next: 105,  close: 0, cat: { x: 0, y: 208, },  msg: "继续合成看看会有什么吧~", };
    GuideConfig[105]  = { id: 105,  type: 3, next: 106,  close: 0, cat: { x: 0, y: 141, },  msg: "还差一点点，再来一次！", };
    GuideConfig[106]  = { id: 106,  type: 2, next: 107,  close: 0, cat: { x: 0, y: 136, },  msg: "干的漂亮！点击看看里头有些什么", };
    GuideConfig[107]  = { id: 107,  type: 2, next: 108,  close: 0, cat: { x: 0, y: 136, },  msg: "这些可不够吃的，再来点！！！", };
    GuideConfig[108]  = { id: 108,  type: 2, next: 109,  close: 0, cat: { x: 0, y: 136, },  msg: "还是不够哦，再来点吧，辛苦你了！", };
    GuideConfig[109]  = { id: 109,  type: 3, next: 7,  close: 0, cat: { x: 0, y: 141, },  msg: "继续合成看看会有什么吧~", };
    GuideConfig[19] = { id: 19, type: 2, next: 110, close: 0, cat: { x: 0, y: 300, },  msg: "诶，小鱼干不够了，让我们再去挣点小鱼干吧~", };
    GuideConfig[110] = { id: 20, type: 2, next: 111, close: 0, cat: { x: 0, y: -386, },  msg: "解锁装饰可以获得升级经验，一起看看吧~", };
    GuideConfig[111] = { id: 20, type: 2, next: 112, close: 0, cat: { x: 0, y: 343, },  msg: "要记得经常来这里升级领奖励哦！", };
    GuideConfig[112] = { id: 20, type: 2, next: 113, close: 0, cat: { x: 0, y: -386, },  msg: "获得的礼包在这里哦~", };
    GuideConfig[113] = { id: 20, type: 2, next: 114, close: 0, cat: { x: 0, y: 141, },  msg: "这里是刚刚获得的奖励", };
    GuideConfig[114] = { id: 20, type: 2, next: 115, close: 0, cat: { x: 0, y: 184, },  msg: "点击这里解锁礼包~", };
    GuideConfig[115] = { id: 20, type: 1, next: 116, close: 0, cat: { x: 0, y: 300, },  msg: "等待解锁完成后就可以使用了哦~", };
    GuideConfig[116] = { id: 20, type: 1, next: 117, close: 0, cat: { x: 0, y: 300, },  msg: "好啦，喵喵先陪你到这里啦，加油合成完成更多订单吧~", };
    GuideConfig[117] = { id: 20, type: 1, next: 22, close: 0, cat: { x: 0, y: 300, },  msg: "", };

    /*################################################## 弱引导不记录 ##################################################*/
    GuideConfig[300] = { id: 300, type: 3, next: 301, close: 0, cat: { x: 0, y: 300, }, unrecord: true,  msg: "棋盘上满了，拖进背包试试吧~", };
    GuideConfig[301] = { id: 301, type: 2, next: 302, close: 0, cat: { x: 0, y: 300, }, unrecord: true, msg: "点击背包这里去看看吧", };
    GuideConfig[302] = { id: 302, type: 1, next: 303, close: 0, cat: { x: 0, y: 300, }, unrecord: true, msg: "存进来的物品放在这里哦，再次点击可以取出", };
    GuideConfig[303] = { id: 303, type: 2, next: 22, close: 0, cat: { x: 0, y: 140, }, unrecord: true, msg: "点击这里退出背包，喵喵就教到这里了，要记住哦~", };
}

const LOCAL_KEY = "GUIDE_ID";

export default class GuideManager {
    public static GuideConfig = GuideConfig;
    private static guide_id: number = 0;
    private static recovery_id: number = 0;
    private static hand_tip_level: number = 0;
    public static HandConfig = { // 手弱引导提示优先级
        USER_LEVEL: 9,
        MERGE_ORDER: 8,
        TASK: 7,
        ENTER_MERGE: 1,
        MERGE_BOARD: 0,
    };

    public static init () {
        if (Config.guide) {
            // let guide_id = cc.sys.localStorage.getItem(LOCAL_KEY);
            let guide_id = User.getItem(LOCAL_KEY);
            if (!guide_id) {
                NetManager.requestTablog(0);
                this.guide_id = 0;
                this.recovery_id = 0;
            }
            else {
                guide_id = Number(guide_id);
                this.recovery_id = guide_id;
                if (guide_id == 10) { guide_id = 9; }
                else if (guide_id == 12) { guide_id = 11; }
                else if (guide_id >= 13 && guide_id <= 16) { guide_id = 14; }
                else if (guide_id >= 17 && guide_id <= 19) { guide_id = 18; }
                this.guide_id = guide_id;
            }
        }
    }

    public static setGuideId (id: number) {
        this.guide_id = id;
        let cfg = this.GuideConfig[id];
        if (!cfg || (cfg && !cfg.unrecord)) {
            // cc.sys.localStorage.setItem(LOCAL_KEY, this.guide_id);
            User.setItem(LOCAL_KEY, this.guide_id);
        }
        NetManager.requestTablog(this.guide_id);
    }

    public static triggerGuide () {
        // console.log("triggerGuide", this.guide_id);
        let cfg: IGuideConfig = GuideConfig[this.guide_id];
        if (cfg) {
            EventManager.dispatch(EventManager._event_name.EVENT_TRIGGER_GUIDE);
        }
        else {
            this.setGuideMask(false);
        }
    }

    public static closeGuideDialog (id: number) {
        EventManager.dispatch(EventManager._event_name.EVENT_CLOSE_GUIDE_DIALOG, { guide_id: id, });
    }

    public static getGuideId (): number {
        if (Config.guide && !this.guide_id) {
            this.guide_id = 1;
            this.setGuideId(this.guide_id);
        }
        return this.guide_id;
    }

    public static getRecoveryId (): number {
        return this.recovery_id;
    }

    public static getGuideFinish (): boolean {
        return !GuideConfig[this.getGuideId()];
    }
    
    public static setGuideMask (use: boolean) {
        // console.log("setGuideMask", this.guide_id, use);
        let guide_node = this.getGuideNode();
        if (cc.isValid(guide_node)) {
            guide_node.getComponent(cc.BlockInputEvents).enabled = use;
        }
    }

    public static getGuideNode (): cc.Node {
        let guide_node = cc.find("Canvas/Guide", cc.director.getScene());
        return guide_node;
    }

    public static setHandTipLevel (level: number) {
        this.hand_tip_level = level;
    }

    public static getHandTipLevel (): number {
        return this.hand_tip_level;
    }
}

export { GuideManager, IGuideConfig }
