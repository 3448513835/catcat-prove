import { Config, UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";


const { ccclass, property } = cc._decorator;

export interface PowerData {
    ad_num?: number,
    buy_num?: number,
}

@ccclass
export default class PowerView extends MyComponent {

    @property(cc.Label)
    ttf_video_num: cc.Label = null

    @property(cc.Label)
    ttf_buy_num: cc.Label = null

    @property(cc.Label)
    ttf_buy_need_num: cc.Label = null

    @property(cc.Sprite)
    buy_need_icon: cc.Sprite = null

    @property(cc.Label)
    ttf_time_tip: cc.Label = null

    @property(cc.Label)
    ttf_need_time: cc.Label = null

    @property(cc.Node)
    item1_icon: cc.Node = null

    @property(cc.Node)
    item2_icon: cc.Node = null

    @property(cc.Label)
    ad_num: cc.Label = null

    @property(cc.Node)
    ad_num_node: cc.Node = null

    private buy_id: number = null
    private buy_num: number = 0
    private send_index: number = 1
    private ad_get_num: number = 0
    private buy_get_num: number = 0

    onLoad() {
        this.setAdNum()
        this.listen(this._event_name.SOCKET_STAMINA_SOURCE_DATA, this.initView, this)
        this.listen(this._event_name.SOCKET_BUY_STAMINA, this.buyCallBack, this)
        this._net_manager.requestStaminaTime()
    }

    start() {

    }

    private setAdNum() {
        let time = UserDefault.getItem(this._user.getUID() + GameConstant.POWER_AD_RECOVER_TIME)
        if (time) {
            let isNewDay = this._utils.isNewDay(Number(time))
            if (isNewDay) {
                UserDefault.setItem(this._user.getUID() + GameConstant.POWER_AD_GET_NUM, 0)
            }
        } else {
            UserDefault.setItem(this._user.getUID() + GameConstant.POWER_AD_GET_NUM, 0)
        }

        UserDefault.setItem(this._user.getUID() + GameConstant.POWER_AD_RECOVER_TIME, Date.now())
    }

    private initView(data?) {
        // cc.error(data, "data---------")
        let today_advertisement_count = Number(data["today_advertisement_count"])
        let today_prop_count = Number(data["today_prop_count"])

        // let today_advertisement_count = Number(UserDefault.getItem(GameConstant.POWER_VIEW_AD_NUM) || 0)
        // let today_prop_count = Number(UserDefault.getItem(GameConstant.POWER_VIEW_BUY_NUM) || 0)

        // cc.error(today_advertisement_count, today_prop_count, "num=========")
        let ad_data = this.getPowerNum(today_advertisement_count + 1, true)
        if (ad_data) {
            let call_data = ad_data["call_data"]
            this.ttf_video_num.string = "+" + call_data["num"]
            this.ad_get_num = Number(call_data["num"])
        }
        let ad_num_total = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10013).int_para
        if (ad_num_total == 0) {
            this.ad_num_node.active = false
        }
        else {
            this.ad_num_node.active = true
            let num = UserDefault.getItem(this._user.getUID() + GameConstant.POWER_AD_GET_NUM)
            if (num) {
                num = Number(num)
                this.ad_num.string = `${ad_num_total - num}/${ad_num_total}`
            } else {
                this.ad_num.string = `${ad_num_total}/${ad_num_total}`
            }
        }

        let item_data = this.getPowerNum(today_prop_count + 1, false)
        if (item_data) {
            let call_data = item_data["call_data"]
            this.ttf_buy_num.string = "+" + call_data["num"]

            this.buy_get_num = Number(call_data["num"])

            let need_data = item_data["need_data"]
            this.buy_id = Number(need_data["id"])
            this.buy_num = Number(need_data["num"])

            let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, need_data["id"])
            this._utils.setSpriteFrame(this.buy_need_icon, `pic/icon/${json_item["icon"]}`)
            this.ttf_buy_need_num.string = need_data["num"]
        }

        let json_const = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10002)
        let int_para = json_const["int_para"]
        let num = Math.floor(int_para / 60)
        this.ttf_time_tip.string = `每${num}分钟恢复一点体力`
        this.ttf_need_time.string = `${num}m`
    }

    private getPowerNum(num: number, isAd: boolean) {
        let json_get = null
        if (Config.game_2d) {
            json_get = this._json_manager.getJson(this._json_name.STRENGTH_GET_2D)
        } else {
            json_get = this._json_manager.getJson(this._json_name.STRENGTH_GET)
        }

        if (!json_get) return

        let length = Object.keys(json_get).length
        let single_data = null
        if (num >= length) {
            single_data = json_get[length]
        } else {
            single_data = json_get[num]
        }

        if (single_data) {
            if (isAd) {
                let ad_strength = single_data["ad_strength"]
                let arr = ad_strength.split(":")
                let call_data = {
                    id: arr[0],
                    num: arr[1]
                }
                return { call_data: call_data }
            } else {
                let item_strength = single_data["item_strength"]
                let arr = item_strength.split(":")
                let call_data = {
                    id: arr[0],
                    num: arr[1]
                }
                let item_num = single_data["item_num"]
                let arr2 = item_num.split(":")
                let need_data = {
                    id: arr2[0],
                    num: arr2[1]
                }
                return { call_data: call_data, need_data: need_data }
            }
        } else {
            return null
        }
    }

    private clickVideo() {


        let ad_num_total = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10013).int_para
        if (ad_num_total == 0) {
            if (this._user.getVideo() > 0) {
                this._utils.addResNum(GameConstant.res_id.video, -1);
                this.send_index = 1
                this._net_manager.requestBuyStamina(1)
            }
            else {
                this._ad_manager.setAdCallback(() => {
                    this._net_manager.requestTablog(this._config.statistic.VIDEO_STRENGTH2);
                    this.send_index = 1
                    this._net_manager.requestBuyStamina(1)
                });
                this._net_manager.requestTablog(this._config.statistic.VIDEO_STRENGTH);
                this._ad_manager.showAd();
            }
        }
        else {
            let num = UserDefault.getItem(this._user.getUID() + GameConstant.POWER_AD_GET_NUM)
            if (num) {
                num = Number(num)
                if (num < ad_num_total) {
                    if (this._user.getVideo() > 0) {
                        this._utils.addResNum(GameConstant.res_id.video, -1);
                        this.send_index = 1
                        this._net_manager.requestBuyStamina(1)
                        UserDefault.setItem(this._user.getUID() + GameConstant.POWER_AD_GET_NUM, num + 1)
                    }
                    else {
                        this._ad_manager.setAdCallback(() => {
                            this.send_index = 1
                            this._net_manager.requestBuyStamina(1)
                            this._net_manager.requestTablog(this._config.statistic.VIDEO_STRENGTH2);
                            UserDefault.setItem(this._user.getUID() + GameConstant.POWER_AD_GET_NUM, num + 1)
                        });
                        this._net_manager.requestTablog(this._config.statistic.VIDEO_STRENGTH);
                        this._ad_manager.showAd();
                    }
                } else {
                    let tip = this._json_manager.getJsonData(this._json_name.TIPS, 10006)
                    this._dialog_manager.showTipMsg(tip["tip"])
                }
            } else {
                if (this._user.getVideo() > 0) {
                    this._utils.addResNum(GameConstant.res_id.video, -1);
                    this.send_index = 1
                    this._net_manager.requestBuyStamina(1)
                    UserDefault.setItem(this._user.getUID() + GameConstant.POWER_AD_GET_NUM, 1)
                }   
                else {
                    this._ad_manager.setAdCallback(() => {
                        this.send_index = 1
                        this._net_manager.requestBuyStamina(1)
                        this._net_manager.requestTablog(this._config.statistic.VIDEO_STRENGTH2);
                        UserDefault.setItem(this._user.getUID() + GameConstant.POWER_AD_GET_NUM, 1)
                    });
                    this._net_manager.requestTablog(this._config.statistic.VIDEO_STRENGTH);
                    this._ad_manager.showAd();
                }
            }
        }
    }

    private clickBuy() {
        if (this.buy_id != null) {
            let my_num = 0

            if (this.buy_id == 100001) {
                my_num = this._user.getGold()
            } else if (this.buy_id == 100002) {
                my_num = this._user.getDiamond()
            }

            if (my_num >= this.buy_num) {
                this.send_index = 2
                this._net_manager.requestBuyStamina(2)
                // this.localBuyCallBack(this.item2_icon, this.buy_get_num, GameConstant.res_id.stamina)
                // let num = UserDefault.getItem(GameConstant.POWER_VIEW_BUY_NUM) || 0
                // num = Number(num) + 1
                // UserDefault.setItem(GameConstant.POWER_VIEW_BUY_NUM, num)
                this._net_manager.requestChangeUserDiamond(-this.buy_num)
                this._net_manager.requestTablog(this._config.statistic.BUY_STRENGTH);
                // this.initView()
            } else {
                // this._dialog_manager.showTipMsg("货币不足")
                this._dialog_manager.openDialog(this._dialog_name.VideoView)
                this.close()
            }
        }
    }

    private localBuyCallBack(node: cc.Node, add_num: number, item_id: number) {
        let pos_w = node.parent.convertToWorldSpaceAR(node.position)
        let eventData = {
            pos_w: pos_w,
            item_id: item_id,
            item_num: add_num,
        }
        this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, eventData)
    }

    private buyCallBack(data) {
        // cc.error(data, "dadta-===========")

        let node: cc.Node
        if (this.send_index == 1) node = this.item1_icon
        else if (this.send_index == 2) node = this.item2_icon

        let item_data = data[0]
        if (cc.isValid(node) && item_data) {
            let pos_w = node.parent.convertToWorldSpaceAR(node.position)
            let eventData = {
                pos_w: pos_w,
                item_id: item_data["item_id"],
                item_num: item_data["item_num"],
            }
            this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, eventData)
        }
    }

    // update (dt) {}
}
