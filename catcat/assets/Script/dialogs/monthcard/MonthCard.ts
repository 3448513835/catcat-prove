

import { Config, UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MyButton from "../../common/MyButton";
import MyComponent from "../../common/MyComponent";
import { User } from "../../common/User";
import Utils from "../../common/Utils";

const { ccclass, property } = cc._decorator;

export interface CardData {
    have_card?: boolean,
    today_get?: boolean,
    video_num?: number,
    start_time?: number,
    end_time?: number,
    get_reward_time?: number,
}

@ccclass
export default class MonthCard extends MyComponent {

    @property([cc.Node])
    month_day_item_list: cc.Node[] = []

    @property([cc.Node])
    month_item_list: cc.Node[] = []

    @property([cc.Node])
    month_all_get_item_list: cc.Node[] = []

    @property(cc.Label)
    month_state: cc.Label = null

    @property(cc.Label)
    month_video_num: cc.Label = null

    @property(cc.Node)
    month_video: cc.Node = null

    @property(cc.Label)
    month_get: cc.Label = null

    @property(MyButton)
    month_btn: MyButton = null

    @property(cc.Node)
    month_video_node: cc.Node = null

    @property(cc.Node)
    month_price_node: cc.Node = null

    @property(cc.Label)
    month_price_origin: cc.Label = null

    @property(cc.Label)
    month_price_dis: cc.Label = null

    @property(cc.Label)
    month_discount: cc.Label = null

    @property([cc.Node])
    week_day_item_list: cc.Node[] = []

    @property([cc.Node])
    week_item_list: cc.Node[] = []

    @property([cc.Node])
    week_all_get_item_list: cc.Node[] = []

    @property(cc.Label)
    week_state: cc.Label = null

    @property(cc.Label)
    week_video_num: cc.Label = null

    @property(cc.Node)
    week_video: cc.Node = null

    @property(cc.Label)
    week_get: cc.Label = null

    @property(MyButton)
    week_btn: MyButton = null

    @property(cc.Node)
    week_video_node: cc.Node = null

    @property(cc.Node)
    week_price_node: cc.Node = null

    @property(cc.Label)
    week_price_origin: cc.Label = null

    @property(cc.Label)
    week_price_dis: cc.Label = null

    @property(cc.Label)
    week_discount: cc.Label = null

    private config = {}

    private init_pop_type = null
    private month_price = 0
    private week_price = 0

    private recode_good_id = null

    onLoad() {
        let data = this.getDialogData()
        if (data) {
            this.init_pop_type = data["init_pop_type"]
        }

        // this.listen(this._event_name.SOCKET_PAY_CHECKCALLBACK_URL, this.payCallBack, this)
        this.listen(this._event_name.EVENT_ON_PAY_SUCCESS_CALLBACK, this.payCallBack, this)
    }

    start() {
        this.config = this._json_manager.getJson(this._json_name.MONTH_CARD)
        if (Config.isAndroidPay) {
            this.config = this._json_manager.getJson(this._json_name.MONTH_CARD_PAY)
        }
        this.setMonth()
        this.setWeek()
        this.setBtnState()
    }

    /**
     * 支付成功回调
    }
     */
    private payCallBack() {
        let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA)
        if (local_data) {
            local_data = JSON.parse(local_data)
        }
        console.log("支付成功回调=================22")
        let goods_id = this.recode_good_id
        if (Number(goods_id) == 101) {
            // 周卡
            let week_data: CardData = local_data["week"]

            let data = this.config["101"]
            let buy_reward = data["buy_reward"]
            let duration = data["duration"]
            let reward_list = this._utils.changeConfigData(buy_reward)
            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
            week_data.have_card = true
            week_data.start_time = Date.now()
            week_data.end_time = Date.now() + duration * 24 * 60 * 60 * 1000
            UserDefault.setItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA, JSON.stringify(local_data))
            this.setBtnState()

            this._event_manager.dispatch(this._event_name.EVENT_CHECK_RED)
        }
        else if (Number(goods_id) == 102) {
            // 月卡
            let month_data: CardData = local_data["month"]

            let data = this.config["102"]
            let buy_reward = data["buy_reward"]
            let duration = data["duration"]
            let reward_list = this._utils.changeConfigData(buy_reward)
            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
            month_data.have_card = true
            month_data.start_time = Date.now()
            month_data.end_time = Date.now() + duration * 24 * 60 * 60 * 1000
            UserDefault.setItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA, JSON.stringify(local_data))
            this.setBtnState()

            this._event_manager.dispatch(this._event_name.EVENT_CHECK_RED)
        }
        this.recode_good_id = null
    }

    private clickMonth() {
        let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA)
        if (local_data) {
            local_data = JSON.parse(local_data)
            let month_data: CardData = local_data["month"]

            let have_card = month_data.have_card
            if (have_card) {
                let today_get = month_data.today_get
                if (today_get) {
                    this._dialog_manager.showTipMsg("今日已领取")
                } else {
                    let data = this.config["102"]
                    let daily_reward = data["daily_reward"]
                    let reward_list = this._utils.changeConfigData(daily_reward)
                    this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)

                    month_data.today_get = true
                    month_data.get_reward_time = Date.now()
                    UserDefault.setItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA, JSON.stringify(local_data))

                    this.month_btn.interactable = !month_data.today_get

                    this._event_manager.dispatch(this._event_name.EVENT_CHECK_RED)
                }
            } else {
                let month_config_data = this.config["102"]
                let month_card_type = month_config_data["month_card_type"]
                if (month_card_type == 2) {
                    let func = () => {
                        let video_num = month_data.video_num
                        let cur_num = video_num + 1
                        month_data.video_num = cur_num

                        let data = this.config["102"]
                        let buy_price = data["buy_price"]
                        if (cur_num >= buy_price) {
                            let buy_reward = data["buy_reward"]
                            let duration = data["duration"]
                            let reward_list = this._utils.changeConfigData(buy_reward)
                            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
                            month_data.have_card = true
                            month_data.start_time = Date.now()
                            month_data.end_time = Date.now() + duration * 24 * 60 * 60 * 1000
                        }
                        UserDefault.setItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA, JSON.stringify(local_data))
                        this.setBtnState()

                        this._event_manager.dispatch(this._event_name.EVENT_CHECK_RED)
                    }
                    if (this._user.getVideo() > 0) {
                        this._utils.addResNum(GameConstant.res_id.video, -1);
                        func()
                    }
                    else {
                        this._ad_manager.setAdCallback(() => {
                            this._net_manager.requestTablog(this._config.statistic.MONTH_CARD1);
                            func()
                        });
                        this._net_manager.requestTablog(this._config.statistic.MONTH_CARD0);
                        this._ad_manager.showAd();
                    }
                }
                else if (month_card_type == 1) {
                    let data = this.config["102"]
                    let name = "月卡"
                    let ex_price = this.month_price
                    let user_id = User.getUID()
                    let other = Date.now().toString() + Math.floor(Math.random() * 999)
                    let order_num = `${user_id}${other}`
                    let product_id = data["id"]

                    // ex_price = 0.01
                    /**
                     * order_num 订单编号
                     * goods_id 商品id
                     * uid 用户ID
                     * type 1 会员卡 2 商城
                     */
                    let post_data = {
                        order_num: order_num,
                        goods_id: product_id,
                        uid: this._user.getUID(),
                        type: 1
                    }
                    this._net_manager.requestOrderRecode(post_data, () => {
                        this.recode_good_id = product_id
                        Utils.submitOrder(name, ex_price, product_id, order_num)
                    })
                }
            }
        }
    }

    private clickWeek() {
        let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA)
        if (local_data) {
            local_data = JSON.parse(local_data)
            let week_data: CardData = local_data["week"]

            let have_card = week_data.have_card
            if (have_card) {
                let today_get = week_data.today_get
                if (today_get) {
                    this._dialog_manager.showTipMsg("今日已领取")
                } else {
                    let data = this.config["101"]
                    let daily_reward = data["daily_reward"]
                    let reward_list = this._utils.changeConfigData(daily_reward)
                    this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)

                    week_data.today_get = true
                    week_data.get_reward_time = Date.now()
                    UserDefault.setItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA, JSON.stringify(local_data))

                    this.week_btn.interactable = !week_data.today_get

                    this._event_manager.dispatch(this._event_name.EVENT_CHECK_RED)
                }
            } else {
                let week_config_data = this.config["101"]
                let week_card_type = week_config_data["month_card_type"]
                if (week_card_type == 2) {
                    let func = () => {
                        let video_num = week_data.video_num
                        let cur_num = video_num + 1
                        week_data.video_num = cur_num

                        let data = this.config["101"]
                        let buy_price = data["buy_price"]
                        if (cur_num >= buy_price) {
                            let buy_reward = data["buy_reward"]
                            let duration = data["duration"]
                            let reward_list = this._utils.changeConfigData(buy_reward)
                            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
                            week_data.have_card = true
                            week_data.start_time = Date.now()
                            week_data.end_time = Date.now() + duration * 24 * 60 * 60 * 1000
                        }
                        UserDefault.setItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA, JSON.stringify(local_data))
                        this.setBtnState()

                        this._event_manager.dispatch(this._event_name.EVENT_CHECK_RED)
                    }
                    if (this._user.getVideo() > 0) {
                        this._utils.addResNum(GameConstant.res_id.video, -1);
                        func()
                    }
                    else {
                        this._ad_manager.setAdCallback(() => {
                            this._net_manager.requestTablog(this._config.statistic.WEEK_CARD1);
                            func()
                        });
                        this._net_manager.requestTablog(this._config.statistic.WEEK_CARD0);
                        this._ad_manager.showAd();
                    }
                }
                else if (week_card_type == 1) {
                    let data = this.config["101"]
                    let name = "周卡"
                    let ex_price = this.week_price
                    let user_id = User.getUID()
                    let other = Date.now().toString() + Math.floor(Math.random() * 999)
                    let order_num = `${user_id}${other}`
                    let product_id = data["id"]

                    // ex_price = 0.01
                    /**
                     * order_num 订单编号
                     * goods_id 商品id
                     * uid 用户ID
                     * type 1 会员卡 2 商城
                     */
                    let post_data = {
                        order_num: order_num,
                        goods_id: product_id,
                        uid: this._user.getUID(),
                        type: 1
                    }
                    this._net_manager.requestOrderRecode(post_data, () => {
                        this.recode_good_id = product_id
                        Utils.submitOrder(name, ex_price, product_id, order_num)
                    })
                }
            }
        }
    }

    private setBtnState() {
        let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA)
        if (local_data) {
            local_data = JSON.parse(local_data)
        } else {
            local_data = {}
        }

        // cc.error(local_data, "localdata-----------")
        let month_config_data = this.config["102"]
        let month_card_type = month_config_data["month_card_type"]
        let month_data: CardData = null
        let month_have = false
        let month_video_num = 0
        let month_today_get = false
        if (local_data["month"]) {
            month_data = local_data["month"]

            let month_end_time = month_data.end_time
            let cur_time = Date.now()
            if (month_end_time && cur_time >= month_end_time) {
                let tmep_data: CardData = {}
                tmep_data.have_card = false
                tmep_data.video_num = 0
                tmep_data.start_time = null
                tmep_data.end_time = null
                tmep_data.today_get = false
                tmep_data.get_reward_time = null

                local_data["month"] = tmep_data
                month_data = tmep_data
            }

            month_have = month_data.have_card
            month_video_num = month_data.video_num

            let get_reward_time = month_data.get_reward_time
            if (get_reward_time) {
                let isNew = this._utils.isNewDay(get_reward_time)
                if (isNew) {
                    month_data.today_get = false
                }
            }

            month_today_get = month_data.today_get
        } else {
            let tmep_data: CardData = {}
            tmep_data.have_card = false
            tmep_data.video_num = 0
            tmep_data.start_time = null
            tmep_data.end_time = null
            tmep_data.today_get = false
            tmep_data.get_reward_time = null

            local_data["month"] = tmep_data
            month_data = tmep_data
        }



        UserDefault.setItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA, JSON.stringify(local_data))

        if (month_have) {
            if (month_card_type == 2) {
                this.month_video_node.active = true
                this.month_price_node.active = false
                this.month_get.node.active = true
                this.month_video.active = false
                this.month_video_num.node.active = false
            }
            else if (month_card_type == 1) {
                this.month_video_node.active = false
                this.month_price_node.active = false
                this.month_get.node.active = true
            }

            let start_time = month_data.start_time
            let end_time = Date.now()
            let diff_time = (end_time - start_time) / 1000
            let day_num = Math.floor(diff_time / (24 * 60 * 60))
            let data = this.config["102"]
            let duration = data["duration"]
            this.month_state.string = `剩余${duration - day_num}天`
        } else {
            this.month_get.node.active = false
            let data = this.config["102"]
            if (month_card_type == 2) {
                this.month_video_node.active = true
                this.month_price_node.active = false

                this.month_video.active = true
                this.month_video_num.node.active = true
                let buy_price = data["buy_price"]
                this.month_video_num.string = `${month_video_num}/${buy_price}`
            }
            else if (month_card_type == 1) {
                this.month_video_node.active = false
                this.month_price_node.active = true

                this.month_price_dis.string = "¥" + ((data["buy_price"] * data["discount"]).toFixed(1)).toString()
                this.month_price_origin.string = "¥" + data["buy_price"]
                this.month_discount.string = (10 * data["discount"]).toString() + "折"

                this.month_price = Number((data["buy_price"] * data["discount"]).toFixed(1))
            }

            this.month_state.string = "未激活"



        }
        this.month_btn.interactable = !month_today_get

        let week_config_data = this.config["101"]
        let week_card_type = week_config_data["month_card_type"]
        let week_data: CardData = null
        let week_have = false
        let week_video_num = 0
        let week_today_get = false
        if (local_data["week"]) {
            week_data = local_data["week"]

            let week_end_time = week_data.end_time
            let cur_time = Date.now()
            // cur_time = week_data.end_time
            if (week_end_time && cur_time >= week_end_time) {
                let tmep_data: CardData = {}
                tmep_data.have_card = false
                tmep_data.video_num = 0
                tmep_data.start_time = null
                tmep_data.end_time = null
                tmep_data.today_get = false
                tmep_data.get_reward_time = null

                local_data["week"] = tmep_data
                week_data = tmep_data
            }

            week_have = week_data.have_card
            week_video_num = week_data.video_num

            let week_get_reward_time = week_data.get_reward_time
            if (week_get_reward_time) {
                let isNew = this._utils.isNewDay(week_get_reward_time)
                if (isNew) {
                    week_data.today_get = false
                }
            }

            week_today_get = week_data.today_get
        } else {
            let tmep_data: CardData = {}
            tmep_data.have_card = false
            tmep_data.video_num = 0
            tmep_data.start_time = null
            tmep_data.end_time = null
            tmep_data.today_get = false
            tmep_data.get_reward_time = null

            local_data["week"] = tmep_data
            week_data = tmep_data
        }

        UserDefault.setItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA, JSON.stringify(local_data))

        if (week_have) {
            if (week_card_type == 2) {
                this.week_video_node.active = true
                this.week_price_node.active = false

                this.week_get.node.active = true
                this.week_video.active = false
                this.week_video_num.node.active = false
            }
            else if (week_card_type == 1) {
                this.week_video_node.active = false
                this.week_price_node.active = false
                this.week_get.node.active = true
            }

            let start_time = week_data.start_time
            let end_time = Date.now()
            let diff_time = (end_time - start_time) / 1000
            let day_num = Math.floor(diff_time / (24 * 60 * 60))
            let data = this.config["101"]
            let duration = data["duration"]
            this.week_state.string = `剩余${duration - day_num}天`
        } else {
            this.week_get.node.active = false
            let data = this.config["101"]
            if (week_card_type == 2) {
                this.week_video_node.active = true
                this.week_price_node.active = false

                this.week_video.active = true
                this.week_video_num.node.active = true
                let buy_price = data["buy_price"]
                this.week_video_num.string = `${week_video_num}/${buy_price}`
            }
            else if (week_card_type == 1) {
                this.week_video_node.active = false
                this.week_price_node.active = true

                this.week_price_dis.string = "¥" + ((data["buy_price"] * data["discount"]).toFixed(1)).toString()
                this.week_price_origin.string = "¥" + data["buy_price"]
                this.week_discount.string = (10 * data["discount"]).toString() + "折"

                this.week_price = Number((data["buy_price"] * data["discount"]).toFixed(1))
            }

            this.week_state.string = "未激活"
        }
        this.week_btn.interactable = !week_today_get
    }

    private setMonth() {
        let data = this.config["102"]
        let duration = data["duration"]
        let buy_reward = data["buy_reward"]
        let daily_reward = data["daily_reward"]

        let item_list = this._utils.changeConfigData(buy_reward)
        this.setGetItem(1, item_list)
        let daily_reward_list = this._utils.changeConfigData(daily_reward)
        this.setDailyItem(1, daily_reward_list, duration)
    }

    private setWeek() {
        let data = this.config["101"]
        let duration = data["duration"]
        let buy_reward = data["buy_reward"]
        let daily_reward = data["daily_reward"]

        let item_list = this._utils.changeConfigData(buy_reward)
        this.setGetItem(2, item_list)
        let daily_reward_list = this._utils.changeConfigData(daily_reward)
        this.setDailyItem(2, daily_reward_list, duration)
    }

    private setDailyItem(type: number, item_list: any[], duration: number) {
        let node_list: cc.Node[] = null
        let node_all_list: cc.Node[] = null
        if (type == 1) {
            node_list = this.month_day_item_list
            node_all_list = this.month_all_get_item_list
        } else if (type == 2) {
            node_list = this.week_day_item_list
            node_all_list = this.week_all_get_item_list
        }

        for (let i = 0; i < node_list.length; i++) {
            const item_data = item_list[i]
            let node = node_list[i]
            let node_all = node_all_list[i]
            if (item_data && cc.isValid(node) && cc.isValid(node_all)) {
                node.active = true
                node_all.active = true
                let item_id = item_data["item_id"]
                let item_num = item_data["item_num"]
                let num = node.getChildByName("Num1").getComponent(cc.Label)
                let ttf_name = node.getChildByName("ttf").getComponent(cc.Label)
                num.string = item_num
                let item_name = this._utils.getItemNameById(item_id)
                ttf_name.string = item_name

                let node_all_icon = node_all.getChildByName("Icon").getComponent(cc.Sprite)
                let node_all_num = node_all.getChildByName("Num").getComponent(cc.Label)
                node_all_num.string = "x" + (Number(item_num) * duration).toString()
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(node_all_icon)) {
                        node_all_icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) node_all_icon.node.scale = 0.2
                    }
                })
            } else {
                node.active = false
                node_all.active = false
            }
        }
    }

    private setGetItem(type: number, item_list: any[]) {
        let node_list = null
        if (type == 1) {
            node_list = this.month_item_list
        } else if (type == 2) {
            node_list = this.week_item_list
        }

        for (let i = 0; i < node_list.length; i++) {
            const item_data = item_list[i]
            let node = node_list[i]
            if (item_data && cc.isValid(node)) {
                node.active = true
                let item_id = item_data["item_id"]
                let item_num = item_data["item_num"]
                let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                let num = node.getChildByName("Num").getComponent(cc.Label)
                num.string = "x" + item_num
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(icon)) {
                        icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) icon.node.scale = 0.3
                    }
                })
            } else {
                node.active = false
            }
        }
    }

    onDestroy() {
        if (this.init_pop_type) {
            this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEXT_POP_VIEW, this.init_pop_type)
        }
        super.onDestroy && super.onDestroy()
    }

    // update (dt) {}
}
