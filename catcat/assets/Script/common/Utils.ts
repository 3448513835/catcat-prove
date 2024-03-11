/*
 * 帮助
 */
import { Config, UserDefault, MIAOZHICHENG_WX, MEISHIMIZHEN_WX, MAOQIU_WX } from "./Config"
import GameConstant from "./GameConstant";
import EventManager from "./EventManager";
import DialogManager from "./DialogManager";
import JsonManager from "./JsonManager";
import NetManager from "./NetManager";
import { User } from "./User";

export default class Utils {
    private static _item_bg_spriteframes: cc.SpriteFrame[] = [];
    private static _button_spriteframes: cc.SpriteFrame[] = [];
    private static _tt_video = null;
    private static _tt_video_state = 0;
    private static _tt_token_schedule = null;

    public static setItemBgSpriteframes (frames: cc.SpriteFrame[]) {
        this._item_bg_spriteframes = frames;
    }

    public static setButtonSpriteframes (frames: cc.SpriteFrame[]) {
        this._button_spriteframes = frames;
    }

    /**
     * 获取item品质框
     * param quality 1~5
     */
    public static getItemQualityBgSpriteframe (quality: number): cc.SpriteFrame {
        return this._item_bg_spriteframes[quality];
    }

    /**
     * 获取按钮图片
     * param index 0灰色 1棕色 2蓝色
     */
    public static getButtonSpriteframe (index): cc.SpriteFrame {
        return this._button_spriteframes[index];
    }

    public static setSpriteFrame (sprite: cc.Sprite, sprite_url: string, fn?: Function) {
        cc.resources.load(sprite_url, cc.SpriteFrame, (err: Error, sprite_frame: cc.SpriteFrame) => {
            if (!err) {
                if (cc.isValid(sprite)) {
                    sprite.spriteFrame = sprite_frame;
                    fn && fn();
                }
            }
            else {
                cc.error(err);
            }
        });
    }

    public static getNodeTreeChildrenCount (node: cc.Node) {
        let count = 0, list = [];
        for (let child of node.children) { list.push(child); }
        while (list.length > 0) {
            ++ count;
            let node = list.shift();
            for (let child of node.children) { list.push(child); }
        }
        return count;
    }

    public static playJumpAnimal (node: cc.Node, jump_height: number, clear: boolean = true) {
        if (clear) { node.stopAllActions(); }
        let y = node.y, scale_y = node.scaleY;
        cc.tween(node).repeatForever(
            cc.tween()
                .to(0.5, { y: y+jump_height, scaleY: 1.1*scale_y })
                .to(0.5, { y: y, scaleY: scale_y})
                .delay(0.2)
        ).start();
    }

    public static playPopAnimal (node: cc.Node) {
        if (cc.director.getActionManager().getNumberOfRunningActionsInTarget(node) == 0) {
            let sample = 30, x = node.x, y = node.y;
            cc.tween(node).repeatForever(
                cc.tween()
                .to(8/sample, { scaleX: 1.1, scaleY: 0.9, y: y-9.4 })
                .to(12/sample, { scaleX: 0.92, scaleY: 1.08, y: y+24 })
                .to(3/sample, { scaleX: 0.9, scaleY: 1.1, y: y+16 })
                .to(9/sample, { scaleX: 1.1, scaleY: 0.9, y: y-9 })
                .to(6/sample, { scaleX: 0.98, scaleY: 1.02, y: y+2.4 })
                .to(7/sample, { scaleX: 1, scaleY: 1, y: y })
            ).start();
        }
    }

    public static convertTime (seconds: number): string {
        seconds = Math.floor(seconds);
        if (seconds < 0) { seconds = 0; }
        let hour: any = Math.floor(seconds/3600);
        hour = (hour < 10)? "0"+hour:""+hour;
        let minute: any = Math.floor(seconds/60)%60;
        minute = (minute < 10)? "0"+minute:""+minute;
        let second: any = seconds%60;
        second = (second < 10)? "0"+second:""+second;
        return (seconds >= 3600)? `${hour}:${minute}:${second}`:`${minute}:${second}`;
    }

    public static getRandomInt(min: number, max: number) {
        let r = Math.random();
        let rr = r * (max - min + 1) + min;
        return Math.floor(rr);
    }

    /**
     * 从n个数中获取m个随机数
     * @param {Number} n   总数
     * @param {Number} m    获取数
     * @returns {Array} array   获取数列
     */
    public static getRandomNFromM(n: number, m: number) {
        let array = [];
        let intRd = 0;
        let count = 0;

        while (count < m) {
            if (count >= n + 1) {
                break;
            }

            intRd = this.getRandomInt(0, n);
            let flag = 0;
            for (let i = 0; i < count; i++) {
                if (array[i] === intRd) {
                    flag = 1;
                    break;
                }
            }

            if (flag === 0) {
                array[count] = intRd;
                count++;
            }
        }

        return array;
    }

    /**
     * 根据剩余秒数格式化剩余时间 返回 HH:MM:SS
     * @param {Number} leftSec 
     */
    public static formatTimeForSecond(leftSec: number, withoutSeconds: boolean = false, isShowDay: boolean = false, isShowHour: boolean = false) {
        let timeStr = '';
        let sec = leftSec % 60;

        let leftMin = Math.floor(leftSec / 60);
        leftMin = leftMin < 0 ? 0 : leftMin;

        let hour = Math.floor(leftMin / 60);
        let min = leftMin % 60;

        if (isShowDay) {
            let day = Math.floor(hour / 24);
            hour = Math.floor(leftSec / 60 / 60 % 24);
            if (day > 0) {
                timeStr += day > 9 ? day.toString() : '0' + day;
                timeStr += ':';
            }
        }

        if (hour > 0) {
            timeStr += hour > 9 ? hour.toString() : '0' + hour;
            timeStr += ':';
        } else {
            if (isShowHour) {
                timeStr += '00:';
            }
        }

        timeStr += min > 9 ? min.toString() : '0' + min;

        if (!withoutSeconds) {
            timeStr += ':';
            timeStr += sec > 9 ? sec.toString() : '0' + sec;
        }

        return timeStr;
    }

    /**
     * 格式化时间
     * 默认：1970-01-19 15:58:41 type:6
     */
    public static formatDateTime(inputTime, type = null, join: string = "-", join2: string = ":") {
        var date = new Date(inputTime);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var m2 = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        var d2 = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        var h2 = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var minute2 = minute < 10 ? ('0' + minute) : minute;
        var second2 = second < 10 ? ('0' + second) : second;


        if (type == 5) {
            // 日期，时， 分
            return y + join + m2 + join + d2 + ' ' + h2 + join2 + minute2;
        } else if (type == 3) {
            // 日期
            return y + join + m2 + join + d2;
        }
        return y + join + m2 + join + d2 + ' ' + h2 + join2 + minute2 + join2 + second2;
    }

    /**
     * 返回间隔 天 时 分 秒
     */
    public static getSecondDelta(second: number) {
        let days = Math.floor(second / 86400);
        let hours = Math.floor((second % 86400) / 3600);
        let minutes = Math.floor(((second % 86400) % 3600) / 60);
        let seconds = Math.floor(((second % 86400) % 3600) % 60);
        return `${days}天${hours}时${minutes}分`
    }

    /**
     * 把数组转换为num个为一组的新数组
     * 例：a = [1, 2, 3, 4, 5], num = 2, => b = [[1, 2], [3, 4], [5]]
     */
    public static dataChangte(data: any[], num: number) {
        let resData = [];
        let count = 0;
        let count2 = 0;
        let func = (current_data) => {
            if (!resData[count]) {
                resData[count] = [];
                resData[count][count2] = current_data;
            } else {
                resData[count][count2] = current_data;
            }
        }
        for (let index = 0; index < data.length; index++) {
            const current_data = data[index];
            if (count2 < num) {
                func(current_data);
                count2 += 1;
            } else {
                count += 1;
                count2 = 0;
                func(current_data);
                count2 += 1;
            }
        }

        return resData;
    }

    public static addAnimationBySpriteFrames (node: cc.Node, sprite_frames: cc.SpriteFrame[]|string, mode: cc.WrapMode, speed: number) {
        if (typeof sprite_frames == "string") {
            cc.resources.loadDir(sprite_frames, cc.SpriteFrame, (err, assets) => {
                if (!err) {
                    assets.sort((a: cc.SpriteFrame, b: cc.SpriteFrame) => { return Number(a.name)-Number(b.name); });
                    this.addAnimationBySpriteFrames(node, assets as cc.SpriteFrame[], mode, speed);
                }
            });
        }
        else {
            node.removeComponent(cc.Animation);
            let animation = node.addComponent(cc.Animation);
            let clip = cc.AnimationClip.createWithSpriteFrames(sprite_frames as cc.SpriteFrame[], sprite_frames.length);
            clip.name = "aa";
            clip.wrapMode = mode;
            clip.speed = speed;
            animation.addClip(clip);
            animation.play(clip.name);
        }
    }

    /**
     * 数字转换
     */
    public static formatNumber(count: number, fixed: number = 0): string {
        let list = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D'];
        let result = count.toString();
        while (count >= 1000 && list.length > 0) {
            list.shift();
            result = this.fixed(count/1000, fixed);
            count /= 1000;
        }
        if (count >= 1) {
            result = this.fixed(count, fixed)+list.shift();
        }
        else {
            result = result + list.shift();
        }
        return result;
    }

    private static fixed(count: number, n: number): string {
        let list = count.toString().split('.');
        if (n == 0) {
            return list[0];
        }
        else {
            list[0] += ".";
            if (list.length == 2) {
                list[0] += list[1].slice(0, (n > list[1].length)? list[1].length:n);
                n -= list[1].length;
            }
            while (n-- > 0) { list[0] += "0"; }
            return list[0];
        }
    }

    /**
     * 根据限制尺寸缩放node
     */
    public static getSpScale(sp_node: cc.Node, limit_width: number, limit_height: number) {
        let scale = 1
        let size = sp_node.getContentSize()
        let width_radio = limit_width / size.width
        let height_radio = limit_height / size.height
        if (width_radio < 1 || height_radio < 1) {
            scale = width_radio < height_radio ? width_radio : height_radio
        }

        return scale
    }

    public static clone(sObj: any) {
        if (sObj === null || typeof sObj !== "object") {
            return sObj;
        }

        let s = {};
        if (sObj.constructor === Array) {
            s = [];
        }

        for (let i in sObj) {
            if (sObj.hasOwnProperty(i)) {
                s[i] = this.clone(sObj[i]);
            }
        }

        return s;
    }

    public static getQualityColor (quality: number): cc.Color {
        let font_color = [
            cc.Color.GRAY,
            new cc.Color(72, 143, 37), /* 绿色 */
            new cc.Color(48, 92, 188), /* 蓝色 */
            new cc.Color(131, 63, 174), /* 紫色 */
            new cc.Color(191, 86, 44), /* 棕色 */
            new cc.Color(191, 44, 44), /* 红色 */
        ];
        return font_color[quality];
    }

    public static getQualityName (quality): string {
        let list = {
            "N": "白", "R": "蓝", "SR": "紫", "SSR": "橙", "UR": "红",
            "1": "白", "2": "蓝", "3": "紫", "4": "橙", "5": "红",
        };
        return list[quality];
    }

    public static getWXSafeAreaTop (): number {
        if (typeof(wx) != "undefined") {
            let menu_rect = wx.getMenuButtonBoundingClientRect()
            let info = wx.getSystemInfoSync();
            let top = menu_rect.bottom/info.screenHeight*cc.visibleRect.height;
            return top;
        }
        return 0;
    }

    public static getSafeAreaTop (): number {
        if (typeof(wx) == "undefined") {
            let safe_rect = cc.sys.getSafeAreaRect();
            return cc.visibleRect.height-safe_rect.height;
        }
        else {
            let info = wx.getSystemInfoSync();
            // @ts-ignore
            return cc.visibleRect.height*(info.safeArea.top/info.safeArea.bottom);
        }
    }

    /**
     * 根据零食类型获取类型图标
     */
    public static getSnackTypePathByType(type: number) {
        if (type == 1) {
            return "pic/common/1-1"
        }
        else if (type == 2) {
            return "pic/common/2-1"
        }
        else if (type == 3) {
            return ""
        }
        else if (type == 7) {
            return "pic/common/4-1"
        }
        else if (type == 5 || type == 4) {
            return "pic/common/5-1"
        }
    }

    public static webCopyString (text: string) {
        try {
            if (typeof(wx) != 'undefined') {
                wx.setClipboardData({
                    data: text,
                    success: () => {
                        console.log("success复制成功：");
                    }
                });
            }
            else if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utils", "copyToPast", "(Ljava/lang/String;)V", text);
            }
            else if (navigator.clipboard) {
                // clipboard api 复制
                navigator.clipboard.writeText(text);
            }
            else {
                var textarea = document.createElement('textarea');
                document.body.appendChild(textarea);
                // 隐藏此输入框
                textarea.style.position = 'fixed';
                textarea.style.clip = 'rect(0 0 0 0)';
                textarea.style.top = '10px';
                // 赋值
                textarea.value = text;
                // 选中
                textarea.select();
                // 复制
                document.execCommand('copy', true);
                // 移除输入框
                document.body.removeChild(textarea);
            }
        } catch(e) {}
    }

    public static getMyNumByItemId(id: number) {
        let my_num = 0
        if (id == GameConstant.res_id.coin) {
            my_num = User.getGold()
        }
        else if (id == GameConstant.res_id.diamond) {
            my_num = User.getDiamond()
        }
        else if (id == GameConstant.res_id.crystal) {
            my_num = User.getCrystal()
        }
        else if (id == GameConstant.res_id.stamina) {
            my_num = User.getStamina();
        }

        return my_num
    }

    public static getTipStrById(id: number) {
        let tip = JsonManager.getJsonData(JsonManager._json_name.TIPS, id)
        if (tip && tip["tip"]) {
            return tip["tip"]
        }else {
            return ""
        }
    }

    public static addResNum(id: number, num: number) {
        if (id < 100001) {
            this.addMergeElement(id, num)
        }
        else {
            let data = null
            if (id == GameConstant.res_id.coin) {
                NetManager.requestChangeUserCoin(num)
                data = {}
                data["type"] = 3
                data["money"] = num
            }
            else if (id == GameConstant.res_id.diamond) {
                NetManager.requestChangeUserDiamond(num)
                data = {}
                data["type"] = 2
                data["money"] = num
            }
            else if (id == GameConstant.res_id.stamina) {
                NetManager.requestChangeUserStamina(num)
                data = {}
                data["type"] = 1
                data["money"] = num
            }
            else if (id == GameConstant.res_id.exp) {
                NetManager.requestChangeUserExp(num)
            }
            else if (id == GameConstant.res_id.yugan) {
                NetManager.requestChangeUserFish(num)
            }
            else if (id == GameConstant.res_id.video) {
                let pre_video = User.getVideo();
                NetManager.requestChangeUserVideo(num)
                if ((pre_video == 0 && num > 0) || (pre_video+num == 0)) {
                    EventManager.dispatch(EventManager._event_name.EVENT_VIDEO_CARD);
                }
            }
            else if (id == GameConstant.res_id.crystal) {
                NetManager.requestChangeUserCrystal(num)
                data = {}
                data["type"] = 4
                data["money"] = num
            }
            else if (id == GameConstant.res_id.trave) {
                NetManager.requestChangeUserTrave(num)
            }

            if (data) {
                NetManager.requestDetailRecord(data)
            }
        }
    }

    public static changeConfigItemData(config): any[] {
        let list = []
        let arr_list = config.split(",")
        for (let i = 0; i < arr_list.length; i++) {
            const element = arr_list[i]
            let arr = element.split(":")
            let data = {
                item_id: arr[0],
                item_num: arr[1]
            }
            list.push(data)
        }

        return list
    }

    public static getItemPathById(id: number): string {
        if (id < 100001) {
            if (Config.game_2d) {
                let item_json = JsonManager.getJsonData(JsonManager._json_name.ELE_2D, id)
                return `merge2d/ele/${item_json["icon"]}`
            }
            else {
                let item_json = JsonManager.getJsonData(JsonManager._json_name.ELE, id)
                return `merge/ele/${item_json["icon"]}`
            }
        }else {
            let item_json = JsonManager.getJsonData(JsonManager._json_name.ITEM_BASE, id)
            return `pic/icon/${item_json["icon"]}`
        }
    }

    public static getItemNameById(id: number): string {
        if (id < 100001) {
            if (Config.game_2d) {
                let item_json = JsonManager.getJsonData(JsonManager._json_name.ELE_2D, id)
                return item_json["name"]
            }
            else {
                let item_json = JsonManager.getJsonData(JsonManager._json_name.ELE, id)
                return item_json["name"]
            }
            
        }else {
            let item_json = JsonManager.getJsonData(JsonManager._json_name.ITEM_BASE, id)
            return item_json["name"]
        }
    }

    /**
     * 1: 合成元素
     */
    public static getItemTypeById(id: number): Number {
        if (id < 100001) {
            return 1
        }else {
            return 2
        }
    }

    public static addMergeElement (id: number, count: number) {
        let main = cc.director.getScene().getChildByName("Canvas").getComponent("Main");
        if (!cc.isValid(main)) {
            EventManager.dispatch(EventManager._event_name.EVENT_MERGE_SHOP_BUY, {
                reward_type: 1,
                reward: id,
                sum: count,
            });
        }
        else {
            let LOCAL_KEY = Config.game_2d? "MERGE_DATA2":"MERGE_DATA";
            // let merge_data_json = cc.sys.localStorage.getItem(LOCAL_KEY);
            let merge_data_json = User.getItem(LOCAL_KEY);
            let p_data = JSON.parse(merge_data_json);
            for (let i = 0; i < count; ++i) {
                let bubble_data = {
                    id: id,
                    node: null,
                };
                p_data.bubble_list.push(bubble_data);
            }
            // cc.sys.localStorage.setItem(LOCAL_KEY, JSON.stringify(p_data));
            User.setItem(LOCAL_KEY, JSON.stringify(p_data));
        }
    }

    /**
     * 删除棋盘中元素
     * param list { id: number }
     */
    public static deleteMergeElement (delete_list) {
        let LOCAL_KEY = Config.game_2d? "MERGE_DATA2":"MERGE_DATA";
        // let merge_data_json = cc.sys.localStorage.getItem(LOCAL_KEY);
        let merge_data_json = User.getItem(LOCAL_KEY);
        let p_data = JSON.parse(merge_data_json);
        let cell_data_list = p_data.cell_data_list;
        let tile_data_list = p_data.tile_data_list;
        let list = {};
        for (let i = 0; i < cell_data_list.length; ++i) {
            let cell_data = cell_data_list[i];
            let tile_data = tile_data_list[i];
            if (cell_data && cell_data.element && tile_data.unlock && tile_data.light && delete_list[cell_data.element]) {
                -- delete_list[cell_data.element];
                cell_data_list[i].element = 0;
            }
        }
        // cc.sys.localStorage.setItem(LOCAL_KEY, JSON.stringify(p_data));
        User.setItem(LOCAL_KEY, JSON.stringify(p_data));
    }

    /**
     * 获取元素数量
     */
    public static getMergeElementCountList () {
        let LOCAL_KEY = Config.game_2d? "MERGE_DATA2":"MERGE_DATA";
        // let merge_data_json = cc.sys.localStorage.getItem(LOCAL_KEY);
        let merge_data_json = User.getItem(LOCAL_KEY);
        let p_data = JSON.parse(merge_data_json);
        let cell_data_list = p_data.cell_data_list;
        let tile_data_list = p_data.tile_data_list;
        let list = {};
        for (let i = 0; i < cell_data_list.length; ++i) {
            let cell_data = cell_data_list[i];
            let tile_data = tile_data_list[i];
            if (cell_data && cell_data.element && tile_data.unlock && tile_data.light) {
                if (!list[cell_data.element]) {
                    list[cell_data.element] = 0;
                }
                ++ list[cell_data.element];
            }
        }
        return list;
    }

    public static getItemMovePathById(id: number): Number {
        if (id < 100001) {
            if (Config.game_2d) {
                let item_json = JsonManager.getJsonData(JsonManager._json_name.ELE_2D, id)
                return item_json["move_path"] || 5
            }
            else {
                let item_json = JsonManager.getJsonData(JsonManager._json_name.ELE, id)
                return item_json["move_path"] || 5
            }
            
        }else {
            let item_json = JsonManager.getJsonData(JsonManager._json_name.ITEM_BASE, id)
            return item_json["move_path"]
        }
    }

    public static wxCheckUpdate () {
        if (typeof(wx) != "undefined") {
            const updateManager = wx.getUpdateManager();
            // @ts-ignore
            updateManager.onCheckForUpdate((res) => {
                // 请求完新版本信息的回调
                console.log("请求完新版本信息的回调", res.hasUpdate);
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function () {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function (res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    });

                    updateManager.onUpdateFailed(function () {
                        // 新版本下载失败
                        console.log("新版本下载失败");
                    });
                }
            });
        }
    }

    public static wxReportScene (scene_id: number) {
        // @ts-ignore
        if (typeof(wx) != "undefined" && wx.reportScene) {
            try {
                // @ts-ignore
                wx.reportScene({
                    sceneId: scene_id,
                    success (res) {
                        // 上报接口执行完成后的回调，用于检查上报数据是否符合预期
                        console.log("上报接口执行完成后的回调", res)
                    },
                    fail (res) {
                        // 上报报错时的回调，用于查看上报错误的原因：如参数类型错误等
                        console.log("上报报错时的回调", res)
                    }
                })
            } catch(e) {}
        }
    }

    public static wxShare () {
        if (typeof(wx) != "undefined") {
            wx.showShareMenu({
                withShareTicket: true,
                // @ts-ignore
                menus: ['shareAppMessage', 'shareTimeline']
            });
            wx.onShareAppMessage(function () {
                if (MAOQIU_WX) {
                    return {
                        title: "女生超爱玩！开心又解压的合成经营小游戏！",
                        imageUrlId: "C+n7J1FrSAWrTEYVWl9FYw==",
                        imageUrl: "https://mmocgame.qpic.cn/wechatgame/MOp6ndibAGds52ibt7DECEVeDrB1JlRAnibiaJgglJP8jkNfd49eNvUIZE1BBl86M9KK/0",
                    }
                }
                else if (MIAOZHICHENG_WX) {
                    return {
                        title:  "喵喵浮生记",
                        // @ts-ignore
                        imageUrl: Canvas.toTempFilePathSync({
                            destWidth: 500,
                            destHeight: 400,
                        }),
                    };
                }
                else if (MEISHIMIZHEN_WX) {
                    return (() => {
                        let index = Math.floor(Math.random()*4);
                        let title = [
                            "《美食迷阵》等你来撸猫",
                            "小猫咪拥有大梦想",
                            "快来构建你的猫咪帝国",
                        ][Math.floor(3*Math.random())];
                        let imageUrlId = [
                            "JqgLY7tKSnSwkuboP76rNg==",
                            "FH8Uq5nCRWCDK5C79qhg7Q==",
                            "qBWyH6raQ2KqPpb4sjls4A==",
                            "Tm7f4EnXRKyQrAJ5GzFZAw=="
                        ][index];
                        let imageUrl = [
                            "https://mmocgame.qpic.cn/wechatgame/q0wKpKPElhsaiasP5NuaY1SVJdFGficy1pyibbqHzLqasw5PbBQicXFH7GiafSqIbvJZg/0",
                            "https://mmocgame.qpic.cn/wechatgame/q0wKpKPElhtXW8jdM8dvdDH9b50mwSt4RsDsfsqNHg55ziaZA2SGuggOqPHaDzsof/0",
                            "https://mmocgame.qpic.cn/wechatgame/q0wKpKPElhv9gLSa0lT6dYkHtkSVfSib0BIC0OM4qvEKicJqvnFTVZRO9aUv38iaaUX/0",
                            "https://mmocgame.qpic.cn/wechatgame/q0wKpKPElhup1tZDpxcXvRugd6haLw4Iavz57AFhpwpVsXMQuolT29P7lOHaIXOl/0",
                        ][index];
                        console.log(title, imageUrlId, imageUrl);
                        return {
                            title: title,
                            imageUrlId: imageUrlId,
                            imageUrl: imageUrl,
                        }
                    })();
                }
            });
        }
    }

    public static ttShare () {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            // @ts-ignore
            tt.showShareMenu({
                success(res) {
                    console.log("已成功显示转发按钮");
                },
                fail(err) {
                    console.log("showShareMenu 调用失败", err.errMsg);
                },
                complete(res) {
                    console.log("showShareMenu 调用完成");
                },
            });
            // @ts-ignore
            tt.onShareAppMessage((res) => {
                console.log("调用分享");
                return {
                    //执行函数后，这里是需要该函数返回的对象
                    title: "快来一起玩游戏吧！",
                    templateId: "2458890eo25j4df7a9",
                    success: () => {
                        console.log("分享成功");
                    },
                    fail: (e) => {
                        console.log("分享失败", e);
                    },
                }; 
            });
        }
    }

    public static ttRecordStart () {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            this._tt_video_state = 1;
            // @ts-ignore
            let recorder = tt.getGameRecorderManager();
            let video_path = null;
            recorder.start({ duration: 300, });

            let tm = Date.now();
            recorder.onStart(res =>{
                console.log("开始录屏");
            });

            recorder.onStop(res =>{
                console.log("保存地址", res.videoPath, (Date.now()-tm)/1000);
                this._tt_video = res.videoPath;
            });
        }
    }

    public static ttRecordStop () {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            this._tt_video_state = 2;
            // @ts-ignore
            let recorder = tt.getGameRecorderManager();
            recorder.stop();
        }
    }

    public static ttRecordEdit () {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            this._tt_video_state = 0;
            // @ts-ignore
            tt.shareAppMessage({
                channel: 'video',
                title: '分享视频',
                extra: {
                    videoPath: this._tt_video, // 可用录屏得到的视频地址
                    videoTopics: ['小游戏'],
                },
                success() {
                    console.log('分享视频成功');
                    DialogManager.showTipMsg("分享视频成功");
                },
                fail(e) {
                    console.log('分享视频失败');
                    DialogManager.showTipMsg("分享视频失败");
                }
            });
        }
    }

    public static ttGetVideo () {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            return this._tt_video;
        }
    }

    public static ttGetVideoState (): number {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            return this._tt_video_state;
        }
    }

    /**
     * 抖音平台
     */
    public static ttLaunch () {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            // @ts-ignore
            var _tt = tt;
            let opt = _tt.getLaunchOptionsSync();
            console.log("登录参数", opt);
            if (opt && opt.query && opt.query.clickid) {
                let clickid = cc.sys.localStorage.getItem("CLICKID");
                if (!clickid && opt.query.clickid) {
                    // NetManager.ttConvert("active", opt.query.clickid);
                    cc.sys.localStorage.setItem("CLICKID", opt.query.clickid);
                }
            }
            _tt.login({
                success: (data) => {
                    console.log("_tt登录成功:", data);
                    let clickid = cc.sys.localStorage.getItem("CLICKID");
                    NetManager.ttLogin(data.code, Config.tt_appid, clickid, (err, response) => {
                        console.log("服务器返回login:", err, response);
                        if (!err) {
                            // callback(response.openid);
                            User.setTTData(response);
                            // this.ttToken();
                        }
                    });
                },
                fail: () => {
                },
                complete: () => {
                },
            });
        }
    }

    public static testTTLaunch () {
        // @ts-ignore
        if (true || typeof(tt) != "undefined") {
            // @ts-ignore
            let opt = { query: { clickid: "1xjsj", }, };
            console.log("测试登录参数", opt);
            if (opt && opt.query && opt.query.clickid) {
                let clickid = cc.sys.localStorage.getItem("CLICKID");
                if (!clickid && opt.query.clickid) {
                    // NetManager.ttConvert("active", opt.query.clickid);
                    cc.sys.localStorage.setItem("CLICKID", opt.query.clickid);
                }
            }
            let clickid = cc.sys.localStorage.getItem("CLICKID");
            console.log("clickid", clickid);
        }
    }

    public static ttWatchVideo () {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            let openid = User.getTTData().openid;
            let clickid = cc.sys.localStorage.getItem("CLICKID");
            NetManager.ttWatchVideo(openid, clickid);
        }
    }

    // public static ttToken () {
    //     // @ts-ignore
    //     if (typeof(tt) != "undefined") {
    //         if (this._tt_token_schedule) {
    //             clearTimeout(this._tt_token_schedule);
    //             this._tt_token_schedule = null;
    //         }
    //         NetManager.ttToken(Config.tt_appid, (err, token_response) => {
    //             console.log("服务器返回token", err, token_response);
    //             if (!err && token_response.err_no == 0) {
    //                 User.setTTToken(token_response.data);
    //                 this._tt_token_schedule = setTimeout(() => {
    //                     this._tt_token_schedule = null;
    //                     this.ttToken();
    //                 }, token_response.expires_in*1000);
    //             }
    //         });
    //     }
    // }

    // public static ttEcpm () {
    //     // @ts-ignore
    //     if (typeof(tt) != "undefined") {
    //         let token = User.getTTToken();
    //         if (!token) {
    //             DialogManager.showTipMsg("获取token失败！");
    //         }
    //         else {
    //             if (token.tm < Date.now()) {
    //                 this.ttToken();
    //                 setTimeout(() => {
    //                     this.ttEcpm();
    //                 }, 5000);
    //             }
    //             else {
    //                 let openid = User.getTTData().openid;
    //                 NetManager.ttEcpm(openid, Config.tt_appid, token.access_token, (err, response) => {
    //                     console.log("服务器ecpm", err, response);
    //                     if (!err && response.err_no == 0 && response.data.records.cost >= 100) {
    //                         let clickid = cc.sys.localStorage.getItem("CLICKID");
    //                         NetManager.ttConvert("game_addiction", clickid, {
    //                             ecpm: response.data.records.cost,
    //                         });
    //                     }
    //                 });
    //             }
    //         }
    //     }
    // }

    // public static ttIPU () {
    //     // @ts-ignore
    //     if (typeof(tt) != "undefined") {
    //         let clickid = cc.sys.localStorage.getItem("CLICKID");
    //         NetManager.ttConvert("game_addiction", clickid, {
    //             ipu: 1,
    //         });
    //     }
    // }

    public static getPokedexCusIsHaveRed(): boolean {
        let pokedex_customer_info = UserDefault.getItem(User.getUID() + GameConstant.POKEDEX_CUSTOMER_LOCK_INFO)
        if (pokedex_customer_info) {
            let data = JSON.parse(pokedex_customer_info)
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const cur_data = data[key];
                    let isGetReward = cur_data["isGetReward"]
                    if (!isGetReward) {
                        return true
                    }
                }
            }
        }
        else {
            return false
        }

    }

    public static getSevenDayIsHaveRed(): boolean {
        let local_data = UserDefault.getItem(User.getUID() + GameConstant.SEVENT_DAY_DATA)
        if (local_data) {
            let data = JSON.parse(local_data)
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const cur_data = data[key];
                    let state = cur_data["state"]
                    if (state == 1) {
                        return true
                    }
                }
            }
        }
        else {
            return false
        }

    }

    /**
     * 获取node路径
     */
    public static getMnt (node: cc.Node): string {
        let mnt = node.name;
        while (cc.isValid(node.parent)) {
            mnt = node.parent.name+"/"+mnt;
            node = node.parent;
        }
        return mnt;
    }

    public static changeConfigData(config, join: string = ":"): any[] {
        let list = []
        let arr_list = config.split(",")
        for (let i = 0; i < arr_list.length; i++) {
            const element = arr_list[i]
            let arr = element.split(join)
            let data = {
                item_id: arr[0],
                item_num: arr[1]
            }
            list.push(data)
        }

        return list
    }

    /**
     * 判断是否是新的一天
     * @param {Object|Number} dateValue 时间对象 todo MessageCenter 与 pve 相关的时间存储建议改为 Date 类型
     * @returns {boolean}
     */
    public static isNewDay(dateValue: any) {
        // todo：是否需要判断时区？
        let oldDate = new Date(dateValue);
        let curDate = new Date();

        let oldYear = oldDate.getFullYear();
        let oldMonth = oldDate.getMonth();
        let oldDay = oldDate.getDate();
        let curYear = curDate.getFullYear();
        let curMonth = curDate.getMonth();
        let curDay = curDate.getDate();

        if (curYear > oldYear) {
            return true;
        } else {
            if (curMonth > oldMonth) {
                return true;
            } else {
                if (curDay > oldDay) {
                    return true;
                }
            }
        }

        return false;
    }

    public static getNeedSceleBySprite(sp: cc.Sprite, reference_width: number, reference_height: number): number {
        let rect = sp.spriteFrame.getRect()
        let width_radio = reference_width / rect.width
        let height_radio = reference_height / rect.height
        if (width_radio < 1 || height_radio < 1) {
            return width_radio < height_radio ? width_radio : height_radio
        }else {
            return 1
        }
    }

    public static getDayEndTm (): number {
        let day = 24*3600*1000;
        let refrush_tm = day-(Date.now()+8*3600*1000)%day+Date.now();
        return refrush_tm;
    }

    /**
     * 将object转化为数组。
     */
    public static objectToArray(srcObj: Object) {

        let resultArr = [];

        // to array
        for (let key in srcObj) {
            if (!srcObj.hasOwnProperty(key)) {
                continue;
            }

            resultArr.push(srcObj[key]);
        }

        return resultArr;
    }

    /**
     * 返回指定小数位的数值
     * @param num 
     * @param idx 
     */
    public static formatNumToFixed(num: number, idx: number = 0) {
        return Number(num.toFixed(idx));
    }

    public static test() {
        
    }

    public static mainScene(data) {
        let data2 = JSON.parse(data)
        let id = data2["cp_mem_id"]
        NetManager.init();
        NetManager.login(id)
    }

    /**
     * 提交订单
     * @param name 商品名字
     * @param ex_price 商品价格
     * @param product_id 商品id
     * @param order_num 订单号 服务器会根据这个订单号生成对应的平台订单号，请保证每笔订单传入的订单号的唯一性。
     */
    public static submitOrder(name: string, ex_price: number, product_id: string, order_num?: string) {
        if (!order_num) {
            let user_id = User.getUID()
            let other = Date.now().toString() + Math.floor(Math.random() * 999)
            order_num = `${user_id}${other}`
        }
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utils", "submitOrder", "(Ljava/lang/String;FLjava/lang/String;Ljava/lang/String;)V", name, ex_price, product_id, order_num);
    }

    public static addShopFinishOrder (order_id) {
        let list = this.getShopFinishOrderList();
        if (list.indexOf(order_id) == -1) {
            list.push(order_id);
        }
        // cc.sys.localStorage.setItem("SHOP_FINISH_ORDER_LIST", JSON.stringify(list));
        User.setItem("SHOP_FINISH_ORDER_LIST", JSON.stringify(list));
    }

    public static getShopFinishOrderList () {
        // let list = cc.sys.localStorage.getItem("SHOP_FINISH_ORDER_LIST");
        let list = User.getItem("SHOP_FINISH_ORDER_LIST");
        if (!list) { list = []; }
        else { list = JSON.parse(list); }
        return list;
    }

}

