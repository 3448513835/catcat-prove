/*
 * socket数据
 */
import EventManager from "./EventManager"
import DialogManager from "./DialogManager"
import { User }     from "./User"
import { Config }   from "./Config"

const HEART = 10;

export default class NetManager {
    private static _socket: WebSocket|any = null;
    private static _url: string = Config.socket;
    private static _msg_used = {};
    private static _msg_cached = [];
    private static _msg_index = 10000;
    private static _inited: boolean = false;
    private static _connected: boolean = false;
    private static _connecting: boolean = false;
    private static _msg_interval = null;
    private static _heart_interval = null;
    private static _connect_count = 0;

    public static init () {
        if (!this._inited) {
            var self = this;
            cc.game.on(cc.game.EVENT_SHOW, () => {
                console.log("游戏切换前台", self._socket, WebSocket.OPEN);
                // @ts-ignore
                if (typeof(tt) != "undefined" && !self._socket) {
                    self.clear();
                    self.connect();
                }
            });
            console.warn("socket", this._url);
            this._inited = true;
            this._msg_interval && clearInterval(this._msg_interval);
            this._msg_interval = setInterval(() => {
                if (this._socket && this._socket.readyState == WebSocket.OPEN) {
                    while (this._msg_cached.length > 0) {
                        let send_data = this._msg_cached.shift();
                        this.send(send_data.data, send_data.except);
                    }
                    let now = Date.now();
                    for (let key in this._msg_used) {
                        let send_data = this._msg_used[key];
                        let data = send_data.data;
                        if (now > send_data.tm+10000) { 
                            if (data.router == EventManager._event_name.SOCKET_HEART) {
                                delete this._msg_used[key];
                                this.clear();
                                this.connect();
                                break;
                            }
                            else {
                                console.error(`${data.router}超时`, data);
                                this.send(data, send_data.except);
                            }
                        }
                    }
                }
            }, 500);
            this.connect();
        }
    }

    private static clear () {
        try {
            if (this._socket) {
                this._socket.onclose = () => {};
                this._socket.onmessage = () => {};
                this._socket.onerror = () => {};
                this._socket.onopen = () => {};
                this._socket.close();
                this._socket = null;
            }
        }
        catch(e) {
            this._socket = null;
        }
    }

    private static connect () {
        ++ this._connect_count;
        if (this._connect_count > 3) {
            this._connect_count = 0;
            DialogManager.openReconnectDialog("网络已断开，请重新连接游戏", () => {
                setTimeout(() => { this.connect(); }, 1000);
            }, null);
        }
        else if (!this._socket) {
            if (this._connected) {
                EventManager.dispatch(EventManager._event_name.SOCKET_CONNECTING);
            }
            this._socket = new WebSocket(this._url);
            this._socket.onopen = this.onopen.bind(this);
            this._socket.onclose = this.onclose.bind(this);
            this._socket.onerror = this.onerror.bind(this);
            this._socket.onmessage = this.onmessage.bind(this);
        }
    }

    private static onopen () {
        console.warn("socket-onopen");
        if (this._connected) { this.reconnect(); }
        EventManager.dispatch(EventManager._event_name.SOCKET_CONNECT, {
            connected: this._connected,
        });
        this._connected = true;
        this._connect_count = 0;
        for (let key in this._msg_used) {
            if (this._msg_used[key].data.router == EventManager._event_name.SOCKET_HEART) {
                delete this._msg_used[key];
            }
        }
        this.heart();
    }

    private static onclose () {
        console.warn("socket-onclose");
        EventManager.dispatch(EventManager._event_name.SOCKET_CLOSE);
        this.clear();
        this.connect();
    }

    private static onerror () {
        console.warn("socket-onerror");
        EventManager.dispatch(EventManager._event_name.SOCKET_CLOSE);
        this.clear();
        this.connect();
    }

    private static onmessage (ev: MessageEvent<any>) {
        try {
            let response = JSON.parse(ev.data);
            if (response.router) {
                console.warn("socket onmessage", response.router, response);
                console.log(JSON.stringify(response));
                delete this._msg_used[response.msg_id];
                if (response.router == EventManager._event_name.SOCKET_HEART) {
                    this.heart();
                }
            }
            if (response.code == 0) {
                EventManager.dispatch(response.router, response.data);
            }
            else {
                console.error(response.msg);
                DialogManager.showTipMsg(response.msg)
            }
        } catch(e) {}
    }

    /**
     * param except 发送失败重发排除
     */
    private static send (data, except?: boolean) {
        let send_data = {
            data: data,
            except: except,
            tm: Date.now(),
        };
        if (this._socket/*  && this._socket.readyState == WebSocket.OPEN */) {
            if (!data.msg_id)  { data.msg_id = this._msg_index++; }
            console.warn("send", data);
            this._socket.send(JSON.stringify(data));
            if (!except) { this._msg_used[data.msg_id] = send_data; }
        }
        else {
            this._msg_cached.push(send_data);
        }
    }

    public static close () {
        if (this._socket && this._socket.readyState == WebSocket.OPEN) {
            this._socket.close();
        }
    }

    public static reconnect () {
        let request = {
            router: EventManager._event_name.SOCKET_RECONNECT,
            data: {
                uid: User.getUID(),
            },
        };
        this.send(request, true);
    }

    public static heart () {
        setTimeout(() => {
            this.send({
                router: EventManager._event_name.SOCKET_HEART,
                data: { uid: User.getUID(), },
            });
        }, HEART*1000);
    }

    /**
     * 登陆
     */
    public static login (openid: string, clickid?: string) {
        let request = {
            router: EventManager._event_name.SOCKET_LOGIN,
            data: {
                openid: openid,
                clickid: clickid,
            },
        };
        this.send(request);
    }

    public static requestUserUpdate (data) {
        User.update(data);
        // EventManager.dispatch(EventManager._event_name.EVENT_USER_UPDATE);
    }

    public static requestChangeUserFish  (add_num: number) {
        User.setFish(User.getFish()+add_num);
        // EventManager.dispatch(EventManager._event_name.EVENT_USER_UPDATE);
    }

    public static requestChangeUserStamina  (add_num: number) {
        User.setStamina(User.getStamina()+add_num);
        // EventManager.dispatch(EventManager._event_name.EVENT_USER_UPDATE);
    }

    public static requestChangeUserCoin  (add_num: number) {
        User.setGold(User.getGold()+add_num);
    }

    public static requestChangeUserDiamond  (add_num: number) {
        User.setDiamond(User.getDiamond()+add_num);
    }

    public static requestChangeUserExp  (add_num: number) {
        User.setExperience(User.getExperience()+add_num);
    }

    public static requestChangeUserCrystal  (add_num: number) {
        User.setCrystal(User.getCrystal()+add_num);
    }

    public static requestChangeUserVideo  (add_num: number) {
        User.setVideo(User.getVideo()+add_num);
    }

    public static requestChangeUserTrave  (add_num: number) {
        User.setTrave(User.getTrave()+add_num);
    }

    /**
     * 初始化房间列表信息
     */
    public static initRoom () {
        let request = {
            router: EventManager._event_name.SOCKET_ROOM_INIT,
            data: {
                uid: User.getUID(),
            },
        };

        this.send(request);
    }

    /**
     * 解锁房间
     * roomId要解锁的房间id
     */
    public static roomUnlockRoom (roomId: number) {
        let request = {
            router: EventManager._event_name.SOCKET_ROOM_UNLOCK_ROOM,
            data: {
                uid: User.getUID(),
                roomId: roomId
            },
        };
        this.send(request);
    }

    /**
     * 解锁设施
     * facilityId要解锁的设置id，对应的房间id，服务器会去配置里查找不用传
     */
    public static roomUnlockFacility (facilityId: number) {
        let request = {
            router: EventManager._event_name.SOCKET_ROOM_UNLOCK_FACILITY,
            data: {
                uid: User.getUID(),
                facilityId: facilityId
            },
        };
        this.send(request);
    }

    /**
     * 解锁场景建筑
     * unit_id 建筑id
     */
    public static roomUnlockUnit (unit_id: number) {
        let request = {
            router: EventManager._event_name.SOCKET_ROOM_UNLOCK_UNIT,
            data: {
                uid: User.getUID(),
                unit_id: unit_id
            },
        };

        this.send(request, true);
    }

    /**
     * 清理垃圾
     */
    public static roomClearRubbish (garbage_id: number) {
        let request = {
            router: EventManager._event_name.SOCKET_ROOM_CLEAN_RUBBISH,
            data: {
                uid: User.getUID(),
                garbage_id: garbage_id
            },
        };

        this.send(request, true);
    }

    /**
     * 购买皮肤
     */
    public static roomFacUnlockSkin (facilityId: number, facilitySkinId: number) {
        let request = {
            router: EventManager._event_name.SOCKET_ROOM_FAC_UNLOCK_SKIN,
            data: {
                uid: User.getUID(),
                facilityId: facilityId,
                facilitySkinId: facilitySkinId,
            },
        };
        this.send(request);
    }

    /**
     * 使用皮肤
     */
    public static roomFacUseSkin (facilityId: number, facilitySkinId: number) {
        let request = {
            router: EventManager._event_name.SOCKET_ROOM_FAC_USE_SKIN,
            data: {
                uid: User.getUID(),
                facilityId: facilityId,
                facilitySkinId: facilitySkinId,
            },
        };
        this.send(request);
    }

    /**
     * 获取背包列表
     */
    public static requestBagData () {
        let request = {
            router: EventManager._event_name.SOCKET_BAG_MY_BAG,
            data: {
                uid: User.getUID(),
            },
        };
        this.send(request);
    }

    /**
     * 获取任务列表
     */
    public static requestTaskInit () {
        let request = {
            router: EventManager._event_name.SOCKET_TASK_LIST,
            data: {
                uid: User.getUID(),
            },
        };
        this.send(request);
    }

    /**
     * 领取阶段奖励
     * rewardId领取的阶段奖励，读配置mission_progress_reward，分为1，2，3，4.groupId领取哪一组
     */
    public static requestTaskReward (rewardId: string, groupId: number) {
        let request = {
            router: EventManager._event_name.SOCKET_TASK_REWARD,
            data: {
                uid: User.getUID(),
                rewardId: rewardId,
                groupId: groupId,
            },
        };
        this.send(request);
    }

    /**
     * 用户升级
     */
    public static requestUserLvUp () {
        let request = {
            router: EventManager._event_name.SOCKET_USER_LEVEL_UP,
            data: {
                uid: User.getUID(),
            },
        };
        this.send(request);
    }

    /**
     * 广告，道具购买体力
     *  type: 1 看广告获得 2 道具获得
     */
    public static requestBuyStamina (type: number) {
        let request = {
            router: EventManager._event_name.SOCKET_BUY_STAMINA,
            data: {
                uid: User.getUID(),
                type: type
            },
        };
        this.send(request);
    }

    /**
     * 广告，道具触发次数
     */
    public static requestStaminaTime () {
        let request = {
            router: EventManager._event_name.SOCKET_STAMINA_SOURCE_DATA,
            data: {
                uid: User.getUID(),
            },
        };
        this.send(request);
    }

    /**
     * 增加/减少体力
     * item_num：体力值变化 is_add:1 增加 0 减少
     */
    public static requestStaminaRecovery (item_num: number, is_add: number) {
        let request = {
            router: EventManager._event_name.SOCKET_USER_STAMINA_RECOVERY,
            data: {
                uid: User.getUID(),
                item_num: item_num,
                is_add: is_add
            },
        };
        this.send(request);
    }

    /**
     * 视频站今日次数次数
     */
    public static requestVideoData () {
        let request = {
            router: EventManager._event_name.SOCKET_VIDEO_DATA,
            data: {
                uid: User.getUID(),
            },
        };
        this.send(request);
    }

    /**
     * 视频站获取道具
     */
    public static requestVideoGetItem (id: number) {
        let request = {
            router: EventManager._event_name.SOCKET_VIDEO_GET_MONEY,
            data: {
                uid: User.getUID(),
                id: id
            },
        };
        this.send(request);
    }

    /**
     * 修改名字
     */
    public static requestChangeName (nickname: string) {
        let request = {
            router: EventManager._event_name.SOCKET_USER_CHANGE_NAME,
            data: {
                uid: User.getUID(),
                nickname: nickname
            },
        };
        this.send(request);
    }

    /**
     * 获取棋盘信息
     */
    public static requestMergeBoardData () {
        let request = {
            router: EventManager._event_name.SOCKET_MERGE_BOARD,
            data: {
                uid: User.getUID(),
            },
        };
        this.send(request);
    }

    /**
     * 合成奖励
     * param id 元素id
     */
    public static requestMergeReward (id) {
        let request = {
            router: EventManager._event_name.SOCKET_MERGE_REWARD,
            data: {
                uid: User.getUID(),
                id: id,
            },
        };
        this.send(request);
    }

    /**
     * 邮件列表
     */
    public static requestMailList () {
        let request = {
            router: EventManager._event_name.SOCKET_MAIL_LIST,
            data: {
                uid: User.getUID(),
            },
        };
        this.send(request);
    }
    
    /**
     * 删除邮件
     */
    public static requestDelMail(id: number) {
        let request = {
            router: EventManager._event_name.SOCKET_DEL_MAIL,
            data: {
                uid: User.getUID(),
                id: id
            },
        };
        this.send(request);
    }

    /**
     * 读取邮件
     */
    public static requestReadMail(id: number) {
        let request = {
            router: EventManager._event_name.SOCKET_READ_MAIL,
            data: {
                uid: User.getUID(),
                id: id
            },
        };
        this.send(request);
    }

    /**
     * 标记已领取奖励
     */
    public static requestGetMailAward(id: number) {
        let request = {
            router: EventManager._event_name.SOCKET_GET_MAIL_ARWARD,
            data: {
                uid: User.getUID(),
                id: id
            },
        };
        this.send(request);
    }

    /**
     * 记录当前等级
     */
    public static requestRecodeLv(lv: number) {
        let request = {
            router: EventManager._event_name.SOCKET_USER_LV_RECODE,
            data: {
                uid: User.getUID(),
                lv: lv
            },
        };
        this.send(request, true);
    }

    /**
     * 请求支付订单列表
     */
    public static requestChargeOrderList (msg_id: string) {
        let request = {
            router: EventManager._event_name.SOCKET_CHARGE_ORDER_LIST,
            data: {
                uid: User.getUID(),
                msg_id: msg_id,
            },
        };
        this.send(request, true);
    }

    /**
     * 保存棋盘信息
     */
    public static requestSaveMergeBoardData (board_json: string) {
        let request = {
            router: EventManager._event_name.SOCKET_MERGE_BOARD_SAVE,
            data: {
                uid: User.getUID(),
                board_json: board_json,
            },
        };
        this.send(request);
    }

    public static requestTablog (tablog: number) {
        console.log("requestTablog", tablog);
        let host = Config.http;
        this.POST(host+"/tablog", { tab_log: tablog, uid: User.getUID(), });
    }

    public static requestDetailRecord (res_data) {
        let host = Config.http;
        res_data.uid = User.getUID()
        // cc.error("detail_record", res_data);
        this.POST(host+"/detail_record", res_data);
    }

    public static requestDuiHuanMa (res_data, callBack: Function) {
        let host = Config.http;
        res_data.uid = User.getUID()
        this.POST(host+"/charge_off", res_data, callBack);
    }

    /**
     * 支付前记录订单数据
     * @param res_data  {
     *      * order_num 订单编号
            * goods_id 商品id
            * uid 用户ID
            * type 1 会员卡 2 商城
     * }
     * 
     * @param callBack 
     */
    public static requestOrderRecode (res_data, callBack: Function) {
        let host = "https://tiktokcat.stygame.com/ka"
        res_data.uid = User.getUID()
        this.POST(host, res_data, callBack);
    }

    public static ttConvert (event_type: string, clickid: string, properties?: any) {
        let host = "https://analytics.oceanengine.com/api/v2/conversion";
        this.POST(host, { 
            event_type: event_type,
            context: {
                ad: {
                    callback: clickid,
                },
            },
            properties: properties,
            timestamp: Date.now(),
        }, (err, data) => {
            console.log("服务器数据ttConvert:", err, data);
        });
    }

    public static ttLogin (code: string, appid: string, clickid: string, callback) {
        this.GET(Config.http+"/openid", { code: code, appid: appid, clickid: clickid, }, callback);
    }

    public static ttToken (appid: string, callback: Function) {
        this.GET(Config.http+"/getAccessToken", { appid: appid }, callback);
    }

    public static ttEcpm (openid: string, appid: string, access_token, callback: Function) {
        let now = new Date();
        let year = now.getFullYear();
        let month: any = now.getMonth()+1;
        let day: any = now.getDate();
        if (month < 10) { month = "0"+month; }
        if (day < 10) { day = "0"+day; }
        let date_hour = `${year}-${month}-${day}`;
        this.GET("https://minigame.zijieapi.com/mgplatform/api/apps/data/get_ecpm", {
            open_id: openid,
            mp_id: appid,
            date_hour: date_hour,
            access_token: access_token,
        }, callback);
    }

    public static ttWatchVideo (openid: string, clickid: string) {
        this.GET(Config.http+"/to_ecpm", { openid: openid, clickid: clickid, });
    }

    private static POST (url: string, param: object = {}, callback?: Function) {
        console.log("url", url);
        var xhr = cc.loader.getXMLHttpRequest();
        let dataStr = '';
        Object.keys(param).forEach(key => {
            dataStr += key + '=' + encodeURIComponent(param[key]) + '&';
        })
        if (dataStr !== '') {
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
        }
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                let response = xhr.responseText;
                if (xhr.status >= 200 && xhr.status < 300) {
                    let httpStatus = xhr.statusText;
                    callback && callback(true, response);
                    // console.log(response);
                } 
                else {
                    callback && callback(false, response);
                }
            }
        };
        xhr.send(dataStr);
    }

    private static GET (url: string, param: object = {}, callback?: Function) {
        var xhr = cc.loader.getXMLHttpRequest();
        let dataStr = '';
        Object.keys(param).forEach(key => {
            dataStr += key + '=' + encodeURIComponent(param[key]) + '&';
        });
        if (dataStr !== '') {
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
            url += "?"+dataStr;
        }
        console.log("url", url);
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                let response = xhr.responseText;
                console.log(response);
                if (xhr.status >= 200 && xhr.status < 300) {
                    let httpStatus = xhr.statusText;
                    callback && callback(false, JSON.parse(response));
                    console.log(response);

                } 
                else {
                    callback && callback(true, response);
                }
            }
        };
        xhr.send();
    }
}
