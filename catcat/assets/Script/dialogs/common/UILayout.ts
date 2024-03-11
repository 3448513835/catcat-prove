/*
 * UI界面
 */
import MyComponent from "../../common/MyComponent"
import PackManager from "../../common/PackManager";
import { User } from "../../common/User";
import AddItem from "./AddItem";
import FlyItem from "./FlyItem";
import GuideManager from "../../common/GuideManager"
import ChangeScene from "../../main/ChangeScene";
import { UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MapGridView from "../../main/MapGridView";
import { CardData } from "../monthcard/MonthCard";

const BUTTON_TIP_DURATION = 10;
const { ccclass, property } = cc._decorator;
@ccclass
export default class UILayout extends MyComponent {
    @property(cc.Node)
    power_node: cc.Node = null

    @property(cc.Node)
    coin_node: cc.Node = null

    @property(cc.Node)
    diamond_node: cc.Node = null

    @property(cc.Node)
    exp_node: cc.Node = null

    @property(cc.Node)
    new_gift_node: cc.Node = null

    @property(cc.Node)
    skin_node: cc.Node = null

    @property(cc.Node)
    month_node: cc.Node = null

    @property(cc.Node)
    game_center_node: cc.Node = null

    @property(cc.Node)
    fuli_node: cc.Node = null

    @property(cc.Node)
    niudan_red: cc.Node = null

    @property(cc.Node)
    fuli_red: cc.Node = null

    @property(cc.Node)
    new_gift_red: cc.Node = null

    @property(cc.Node)
    mail_red: cc.Node = null

    @property(cc.Node)
    seven_day_node: cc.Node = null

    @property(cc.Node)
    month_card_red: cc.Node = null

    private niudan_first: boolean = true

    private top_node_y: number = 0;

    private texture: cc.RenderTexture = null
    private _canvas = null

    protected onLoad() {
        this.listen(this._event_name.EVENT_CLICK_SCREEN, this.onClickScreen, this);
        this.listen(this._event_name.EVENT_CHECK_NEW_GIFT, this.checkNewGift, this)
        this.listen(this._event_name.EVENT_USER_LV_UP, this.checkLvUp, this)
        this.listen(this._event_name.EVENT_NIUDAN_RED, this.setNiuDanFirstState, this)
        this.listen(this._event_name.EVENT_CHECK_RED, this.checkRed, this)
        this.listen(this._event_name.SOCKET_MAIL_LIST, this.mailData, this)

        this._net_manager.requestMailList()

        this.checkLvUp()
        this.checkRed()
        // this.checkSevenDay()
        let level = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1013).int_para;
        if (this._user.getLevel() < level) {
            this.scheduleOnce(this.playMergeButtonAnimal, BUTTON_TIP_DURATION);
        }
    }

    private clickMerge() {
        let guide_id = GuideManager.getGuideId();
        if (guide_id == 1) {
            this._net_manager.requestTablog(this._config.statistic.GUIDE_MERGE_BUTTON);
        }
        let _resource_manager = this._resource_manager;
        let _config = this._config;
        let func = () => {
            if (guide_id == 1) {
                GuideManager.closeGuideDialog(guide_id);
                GuideManager.setGuideMask(true);
                GuideManager.setGuideId(GuideManager.GuideConfig[guide_id].next);
            }
            _resource_manager.loadBundle(_config.game_2d ? "merge2d" : "merge").then((bundle) => {
                cc.director.loadScene(_config.game_2d ? "Merge2d" : "Merge", () => {
                    if (GuideManager.getGuideId() == 2) {
                        GuideManager.setGuideMask(true);
                    }
                });
            });
        }
        ChangeScene.instance.enter(func)
    }

    private onClickScreen() {
        this.unschedule(this.playMergeButtonAnimal);
        let button_node = cc.find("Synthesis", this.node);
        if (cc.isValid(button_node)) {
            button_node.stopAllActions();
            button_node.scale = 1;
        }
        let level = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1013).int_para;
        if (this._user.getLevel() < level) {
            this.scheduleOnce(this.playMergeButtonAnimal, BUTTON_TIP_DURATION);
        }
    }

    private playMergeButtonAnimal() {
        let level = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1013).int_para;
        if (this._user.getLevel() < level) {
            let button_node = cc.find("Synthesis", this.node);
            if (cc.isValid(button_node)) {
                cc.tween(button_node)
                    .repeatForever(
                        cc.tween()
                            .to(0.25, { scale: 1.2 })
                            .to(0.25, { scale: 1.0 })
                            .to(0.25, { scale: 1.2 })
                            .to(0.25, { scale: 1.0 })
                            .delay(1)
                    )
                    .start();
            }
        }
    }

    private openSevenDay() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_SIGN_BTN);
        this._dialog_manager.openDialog(this._dialog_name.SevenDay)
    }

    private openMailView() {
        this._dialog_manager.openDialog(this._dialog_name.MailView)
    }

    private clickGameCenter() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_GAMECENTER_BTN);
        this._dialog_manager.openDialog(this._dialog_name.GameCenter)
    }

    private clickMonthCard() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_MONTHCARD_BTN);
        this._dialog_manager.openDialog(this._dialog_name.MonthCard)
    }

    private clickSkin() {
        MapGridView.instance.is_have_skin_group = true
        cc.resources.load("prefabs/builds/FacSkinGroup", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
                parent.addChild(node)

                this._event_manager.dispatch(this._event_name.EVENT_SKIN_SHOW_UI, true)
            }
        })
    }

    private openNewGift() {
        this._dialog_manager.openDialog(this._dialog_name.NewGift)
    }

    private checkNewGift() {
        let isGet = UserDefault.getItem(this._user.getUID() + GameConstant.NEW_GIFT_IS_GET)
        if (Number(isGet) == 1) {
            this.new_gift_node.active = false
        } else {
            let lv = this._user.getLevel()
            let json = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10017)
            let int_para = json["int_para"]
            if (lv >= int_para) {
                // if (!this.new_gift_node.active && this._user.getIsInitNewGift()) {
                //     this.openNewGift()
                //     this._user.setIsInitNewGift(false)
                // }
                this.new_gift_node.active = true
            } else {
                this.new_gift_node.active = false
            }
        }
    }

    private clickFuLi() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_WELFARE_BTN);
        this._dialog_manager.openDialog(this._dialog_name.WelfareCenter)
    }

    private clickOnline() {
        // this._net_manager.requestTablog(this._config.statistic.MAIN_WELFARE_BTN);
        this._dialog_manager.openDialog(this._dialog_name.OnLineLayer)
    }

    private clickDailyAd() {
        this._dialog_manager.openDialog(this._dialog_name.DialyAd)
    }

    private clickNiuDan() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_NIUDAN_BTN);
        this._dialog_manager.openDialog(this._dialog_name.NiuDan)
    }

    private clickTravel () {
        this._net_manager.requestTablog(this._config.statistic.MAIN_TRAVEL_BTN);
        this._dialog_manager.openDialog(this._dialog_name.TravelDialog)
    }

    private checkLvUp() {
        let lv = this._user.getLevel()

        let skin_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10014)
        let skin_need_lv = skin_data["int_para"]
        this.skin_node.active = lv >= skin_need_lv
        
        // 游戏中心开放等级
        let game_center_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10023)
        let game_center_need_lv = game_center_data["int_para"]
        this.game_center_node.active = lv >= game_center_need_lv

        // 福利开放等级
        let fuli_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10024)
        let fuli_need_lv = fuli_data["int_para"]
        this.fuli_node.active = lv >= fuli_need_lv

        // 月卡开放等级
        let month_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10025)
        let month_need_lv = month_data["int_para"]
        this.month_node.active = lv >= month_need_lv

        this.checkSevenDay()
    }

    private setNiuDanFirstState(isRed: boolean) {
        this.niudan_first = isRed
        this.checkRed()
    }

    private checkRed() {
        this.niudan_red.active = this.niudan_first

        let fuli_is_red = false
        let daily_ad_data = UserDefault.getItem(this._user.getUID() + GameConstant.DIALY_AD_GET_DATA)
        if (daily_ad_data) {
            daily_ad_data = JSON.parse(daily_ad_data)
            let json = this._json_manager.getJson(this._json_name.DAILY_AD)
            let length1 = Object.keys(daily_ad_data).length
            let length2 = Object.keys(json).length
            if (length1 >= length2 + 1) {
                fuli_is_red = false
            } else {
                fuli_is_red = true
            }
        } else {
            fuli_is_red = true
        }

        this.fuli_red.active = fuli_is_red

        let month_card_is_red = false
        // if (fuli_is_red) {
        //     this.fuli_red.active = fuli_is_red
        // } else {
            let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA)
            if (local_data) {
                local_data = JSON.parse(local_data)
                if (local_data["month"]) {
                    let month_data: CardData = local_data["month"]
                    let have_card = month_data.have_card
                    if (have_card) {
                        let month_end_time = month_data.end_time
                        let cur_time = Date.now()
                        if (month_end_time && cur_time >= month_end_time) {
                            month_card_is_red = true
                        } else {
                            let today_get = month_data.today_get
                            month_card_is_red = !today_get
                        }
                    } else {
                        month_card_is_red = true
                    }
                }
                if (!month_card_is_red) {
                    if (local_data["week"]) {
                        let week_data: CardData = local_data["week"]
                        let have_card = week_data.have_card
                        if (have_card) {
                            let week_end_time = week_data.end_time
                            let cur_time = Date.now()
                            if (week_end_time && cur_time >= week_end_time) {
                                month_card_is_red = true
                            } else {
                                let today_get = week_data.today_get
                                month_card_is_red = !today_get
                            }
                        } else {
                            month_card_is_red = true
                        }
                    }
                }
            }
             else {
                month_card_is_red = true
            }

            this.month_card_red.active = month_card_is_red
        // }
    }

    private mailData(data) {
        let isNoRed = false
        for (let i = 0; i < data.length; i++) {
            const item_data = data[i]
            let status = item_data["status"]
            if (status == 0) {
                isNoRed = true
                break
            }

        }
        this.mail_red.active = isNoRed
    }

    /**
     * 检查七天登录数据
     */
    private checkSevenDay() {
        let config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10020)
        let need_lv = config["int_para"]
        let lv = this._user.getLevel()
        if (lv >= need_lv) {
            // UserDefault.removeItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
            // UserDefault.removeItem(this._user.getUID() + GameConstant.SEVENT_DAY_RECOVER_TIME)
            let data = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
            if (data) {
                data = JSON.parse(data)
            } else {
                data = {
                    1: {
                        state: 1, //  0 不可以领取 1 可以领取 2 已经领取
                    }
                }
            }

            let time = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_RECOVER_TIME)
            if (time) {
                let isNewDay = this._utils.isNewDay(Number(time))
                if (isNewDay) {
                    let length = Object.keys(data).length
                    if (length < 7) {
                        data[length + 1] = {
                            state: 1, //  0 不可以领取 1 可以领取 2 已经领取
                        }
                    }
                }
            }

            let temp_num = 0
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const item_data = data[key]
                    let state = item_data["video_state"]
                    if (state == 1) {
                        temp_num += 1
                    }
                }
            }
            if (temp_num >= 7) {
                this.seven_day_node.active = false
            }else {
                this.seven_day_node.active = true
            }
            UserDefault.setItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA, JSON.stringify(data))
            UserDefault.setItem(this._user.getUID() + GameConstant.SEVENT_DAY_RECOVER_TIME, Date.now())

            this._event_manager.dispatch(this._event_name.EVENT_RED_TIP, {})
        } else {
            this.seven_day_node.active = false
        }
    }

    private checkOnline() {
        
    }
}
