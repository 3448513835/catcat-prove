import BuildConfig from "../builds/BuildConfig";
import { Config, UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";
import PackManager from "../common/PackManager";
import { DataType, User } from "../common/User";
import GuideManager from "../common/GuideManager"
import ChangeScene from "./ChangeScene";
import { CardData } from "../dialogs/monthcard/MonthCard";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends MyComponent {

    // @property(cc.Prefab)
    // private mask_prefab: cc.Prefab = null;

    // 进入游戏弹窗顺序
    private init_pop_view = []

    onLoad() {
        this._dialog_manager.closeAllDialogs();
        this._utils.wxReportScene(1003);
        // this._audio_manager.stopBackgroundMusic();
        this._audio_manager.playBackgroundMusic();
        // this._dialog_manager.init(this.mask_prefab);

        this.listen(this._event_name.SOCKET_BAG_MY_BAG, this.initBagData, this)
        this.listen(this._event_name.SOCKET_USER_LEVEL_UP, this.userLvUp, this)
        this.listen(this._event_name.SOCKET_TASK_LIST, this.initTaskData, this)
        this.listen(this._event_name.EVENT_CHECK_NEXT_POP_VIEW, this.checkNextPopView, this)
        this._net_manager.requestTaskInit()
        // this._net_manager.requestBagData()

        this.initUserData()
        let _audio_manager = this._audio_manager;
        cc.game.on(cc.game.EVENT_SHOW, () => {
            _audio_manager.stopBackgroundMusic();
            _audio_manager.playBackgroundMusic();
        });

        this.createSdkRole()
    }

    start() {
        this._resource_manager.loadBundle(this._config.game_2d ? "merge2d" : "merge");
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 1 && this._guide_manager.getRecoveryId() < 1) {
            this._net_manager.requestTablog(this._config.statistic.ENTER_MAIN_SCENE);
        }
        this.checkGuide();

        let entrust_time = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1014).int_para
        if (entrust_time) {
            ChangeScene.instance.setEntrustAllTime(entrust_time * 60)
        }

        if (!this._user.getIsInitPopView()) {
            this.popStartView()
            this._user.setIsInitPopView(true)
        }
    }

    private checkGuide() {
        if (!GuideManager.getGuideFinish()) {
            GuideManager.setGuideMask(true);
            let guide_id = GuideManager.getGuideId();
            if ([1, 8].indexOf(guide_id) != -1) {
                GuideManager.triggerGuide();
            }
            else if ([13, 14, 18].indexOf(guide_id) != -1) {
                this.scheduleOnce(() => {
                    GuideManager.triggerGuide();
                }, 2.5);
            }
            else if ([2, 3, 201, 4, 5, 6, 7, 20, 21].indexOf(guide_id) != -1) {
                this._resource_manager.loadBundle(this._config.game_2d ? "merge2d" : "merge").then((bundle) => {
                    cc.director.loadScene(this._config.game_2d ? "Merge2d" : "Merge", () => {
                        setTimeout(() => {
                            GuideManager.triggerGuide();
                        }, 1000);
                    });
                });
            }
            else if ([9].indexOf(guide_id) != -1) {
                this._dialog_manager.openDialog(this._dialog_name.TaskView, null, null, () => {
                    setTimeout(() => {
                        GuideManager.triggerGuide();
                    }, 1000);
                });
            }
            else if (guide_id >= 102 && guide_id <= 117) {
                let guide_manager = this._guide_manager;
                this._resource_manager.loadBundle(this._config.game_2d ? "merge2d" : "merge").then((bundle) => {
                    cc.director.loadScene(this._config.game_2d ? "Merge2d" : "Merge");
                });
            }
        }
        else {
            GuideManager.setGuideMask(false);
        }
    }

    private initUserData() {
        let user_data = UserDefault.getItem(User.getUID() + GameConstant.USER_DATA)
        if (user_data) {
            this._net_manager.requestUserUpdate(JSON.parse(user_data))
        } else {
            let user_init_data: DataType = {}
            user_init_data.gold = Config.super ? GameConstant.DEFAULT_RES : this.getInitItemNum(GameConstant.res_id.coin)
            user_init_data.diamond = Config.super ? GameConstant.DEFAULT_RES : this.getInitItemNum(GameConstant.res_id.diamond)
            user_init_data.crystal = Config.super ? GameConstant.DEFAULT_RES : this.getInitItemNum(GameConstant.res_id.crystal)
            user_init_data.experience = Config.super ? GameConstant.DEFAULT_RES : this.getInitItemNum(GameConstant.res_id.exp)
            user_init_data.level = 1
            user_init_data.video = 0
            user_init_data.stamina = Config.super ? GameConstant.DEFAULT_RES : this.getInitItemNum(GameConstant.res_id.stamina)
            user_init_data.fish = Config.super ? GameConstant.DEFAULT_RES : this.getInitItemNum(GameConstant.res_id.yugan)
            user_init_data.trave = Config.super ? GameConstant.DEFAULT_RES : this.getInitItemNum(GameConstant.res_id.trave)
            this._net_manager.requestUserUpdate(user_init_data)
        }

        this._net_manager.requestRecodeLv(this._user.getLevel())
    }

    private initBagData(data) {
        PackManager.initItemData(data)
    }

    private userLvUp(data) {

    }

    /**
     * 缓存任务数据
     */
    private initTaskData(data) {
        // cc.error(data, "缓存任务数据===========")
        UserDefault.setItem(User.getUID() + GameConstant.TASK_LOCAL_VALUE_STR, JSON.stringify(data))
    }

    private getInitItemNum(id: number) {
        let item_data = null
        if (Config.game_2d) {
            item_data = this._json_manager.getJsonData(this._json_name.PLAYER_INIT_2D, id)
        } else {
            item_data = this._json_manager.getJsonData(this._json_name.PLAYER_INIT, id)
        }

        if (!item_data) {
            return 0
        } else {
            return item_data["item_num"] || 0
        }
    }

    private popStartView() {
        if (this._guide_manager.getGuideFinish()) {
            let config_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10026)
            let str_para: string = config_data["str_para"]
            this.init_pop_view = str_para.split(":")
            if (this.init_pop_view.length > 0) {
                this.checkPopView(this.init_pop_view[0])
            }
        }
    }

    private checkNextPopView(index: string) {
        let num = this.init_pop_view.indexOf(index)
        if (num != -1) {
            let next = this.init_pop_view[num + 1]
            if (next) {
                this.checkPopView(next)
            }else {
                this.checkGongGao()
            }
        }
    }

    private checkPopView(index: string) {
        let type = Number(index)
        let lv = this._user.getLevel()
        if (type == 1) {
            // 新手礼包
            let isGet = UserDefault.getItem(this._user.getUID() + GameConstant.NEW_GIFT_IS_GET)
            if (Number(isGet) == 1) {
                this.checkNextPopView(index)
            } else {
                let json = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10017)
                let int_para = json["int_para"]
                if (lv >= int_para) {
                    this._dialog_manager.openDialog(this._dialog_name.NewGift, { init_pop_type: index })
                } else {
                    this.checkNextPopView(index)
                }
            }
        }
        else if (type == 2) {
            // 月卡
            let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.MONTH_CARD_DATA)
            if (local_data) {
                local_data = JSON.parse(local_data)
                let week_data: CardData = local_data["week"]
                let month_data: CardData = local_data["month"]

                let month_have_card = month_data.have_card
                let week_have_card = week_data.have_card
                if (month_have_card && week_have_card) {
                    this.checkNextPopView(index)
                    return
                }
            }

            let month_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10025)
            let month_need_lv = month_data["int_para"]
            if (lv >= month_need_lv) {
                this._dialog_manager.openDialog(this._dialog_name.MonthCard, { init_pop_type: index })
            } else {
                this.checkNextPopView(index)
            }
        }
        else if (type == 3) {
            // 福利
            let month_data = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10025)
            let need_lv = month_data["int_para"]
            if (lv >= need_lv) {
                this._dialog_manager.openDialog(this._dialog_name.DialyAd, { init_pop_type: index })
            } else {
                this.checkNextPopView(index)
            }
        }
        else if (type == 4) {
            // 七日签到
            let config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10020)
            let need_lv = config["int_para"]
            let lv = this._user.getLevel()
            if (lv >= need_lv) {
                let data = UserDefault.getItem(this._user.getUID() + GameConstant.SEVENT_DAY_DATA)
                if (data) {
                    data = JSON.parse(data)
                }
                else {
                    data = {
                        1: {
                            state: 1, //  0 不可以领取 1 可以领取 2 已经领取
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
                    this.checkNextPopView(index)
                } else {
                    this._dialog_manager.openDialog(this._dialog_name.SevenDay, { init_pop_type: index })
                }
            } else {
                this.checkNextPopView(index)
            }
        } 
    }

    private createSdkRole() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utils", "createRole", "(Ljava/lang/String;)V", User.getUID().toString());
        }
    }

    private checkGongGao() {
        let func = () => {
            let json = this._json_manager.getJsonData(this._json_name.NOTICE, 1)
            let validity_end = json["validity_end"]
            let end_time = Date.parse(new Date(validity_end).toString())
            if (Number(end_time) > Number(Date.now())) {
                this._dialog_manager.openDialog(this._dialog_name.GongGao)
            }
        }
        let time = UserDefault.getItem(this._user.getUID() + "gonggao")
        if (time) {
            let isNewDay = this._utils.isNewDay(Number(time))
            if (isNewDay) {
                func()
            }
        }else {
            func()
        }

        UserDefault.setItem(this._user.getUID() + "gonggao", Date.now())
    }

    onDestroy() {
        this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, { clear: true, });
        super.onDestroy && super.onDestroy();
    }

    // update (dt) {}
}
