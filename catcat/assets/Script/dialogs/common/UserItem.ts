/*
 * 玩家信息
 */
const JUMP_COUNT = 9;
import MyComponent from "../../common/MyComponent"
import PackManager from "../../common/PackManager";
import FlyItem from "./FlyItem";
import GuideManager from "../../common/GuideManager"
import ChangeScene from "../../main/ChangeScene";
import { UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import RoomMgr from "../../builds/RoomMgr";
import AddItem from "./AddItem";
import ResourceManager from "../../common/ResourceManager";
import SceneBuildMgr from "../../builds/SceneBuildMgr";
import MapGridView from "../../main/MapGridView";
import { User } from "../../common/User";

const { ccclass, property } = cc._decorator;
@ccclass
export default class UserItem extends MyComponent {

    @property(cc.Animation)
    exp_ani: cc.Animation = null

    @property(cc.Node)
    exp_ani_particle: cc.Node = null

    @property(cc.Sprite)
    lv_progress: cc.Sprite = null

    @property(cc.Label)
    lv_num: cc.Label = null

    @property(cc.Label)
    power_num: cc.Label = null
    @property(cc.Node)
    power_node: cc.Node = null

    @property(cc.Label)
    power_time: cc.Label = null

    @property(cc.Sprite)
    power_time_bg: cc.Sprite = null

    @property(cc.Label)
    crystal_label: cc.Label = null
    @property(cc.Label)
    gold_label: cc.Label = null
    @property(cc.Node)
    coin_node: cc.Node = null
    @property(cc.Node)
    crystal_node: cc.Node = null

    @property(cc.Label)
    diamond_label: cc.Label = null
    @property(cc.Node)
    diamond_node: cc.Node = null
    @property(cc.Node)
    exp_node: cc.Node = null
    @property(cc.Node)
    mer_node: cc.Node = null

    @property(cc.Node)
    private add_node: cc.Node = null

    @property(cc.Node)
    private setting_node: cc.Node = null

    @property([cc.Node])
    user_item_list: cc.Node[] = []

    @property(cc.Label)
    fish_label: cc.Label = null

    @property(cc.Animation)
    fish_ani: cc.Animation = null

    @property(cc.Node)
    task_node: cc.Node = null

    @property(cc.Node)
    pokdex_red: cc.Node = null

    @property(cc.Node)
    seven_day_red: cc.Node = null

    @property(cc.Node)
    template_item: cc.Node = null

    @property(cc.Node)
    layout_right: cc.Node = null

    @property(cc.Node)
    layout_left: cc.Node = null

    @property(cc.Node)
    layout_left2: cc.Node = null

    @property(cc.Node)
    dengji: cc.Node = null

    @property(cc.Node)
    nodeRightBottom: cc.Node = null

    @property(cc.Node)
    travel_node: cc.Node = null

    private pre_gold_number: number = null;
    private pre_diamond_number: number = null;
    private gold_schdule_fn = null;
    private diamond_schdule_fn = null;

    /** 是否可以点击等级 */
    private isCanClickLv: boolean = true

    private guide_tip: cc.Node = null
    private guide_tip_is_show: boolean = true

    private user_item_x_list: number[] = [-288, -87.6, 115, 326]
    private power_end_time: number = 0

    onLoad() {
        this.listen(this._event_name.SOCKET_USER_DATA, this.onUserData, this)
        // this.listen(this._event_name.EVENT_PACK_DATA_CHANGE, this.setYuGanNum, this)
        this.listen(this._event_name.EVENT_POWER_COUNT_DOWN, this.powerCountDown, this)
        this.listen(this._event_name.EVENT_USER_UPDATE, this.onUserUpdate, this)
        this.listen(this._event_name.EVENT_ADD_ITEM, this.addItem, this)
        this.listen(this._event_name.EVENT_CAN_LOCK_FAC, this.canLockFac, this)
        this.listen(this._event_name.EVENT_RED_TIP, this.onRedTip, this)
        this.listen(this._event_name.EVENT_SET_IS_CAN_CLICK_LV, this.setIsCanClickLv, this)
        this.listen(this._event_name.EVENT_UNLOCK_FAC_FISH_ANI, this.unlockFacFishAni, this)
        this.listen(this._event_name.EVENT_TRIGGER_GUIDE, this.onTriggerGuide, this);
        this.listen(this._event_name.EVENT_LV_TIP, this.setTipState, this);
        this.listen(this._event_name.EVENT_SKIN_SHOW_UI, this.skinShowState, this);
        this.listen(this._event_name.EVENT_CHANGE_UI_TOP_RES, this.changeTipUiState, this);

        this.power_num.string = this._user.getStamina().toString()
        this.gold_label.string = this._user.getGold().toString()
        this.diamond_label.string = this._user.getDiamond().toString()
        this.fish_label.string = this._user.getFish().toString();
        if (cc.isValid(this.crystal_label)) {
            this.crystal_label.string = this._user.getCrystal().toString()
        }


        this.pre_gold_number = this._user.getGold()
        this.pre_diamond_number = this._user.getDiamond()

        this.setUserItemPos(10001)
        // this.setYuGanNum()

        let next_restore_djs = ChangeScene.instance.getCurPowerEndTime()
        this.setRecoverPoweData(next_restore_djs)

        let safe_area_top = this._utils.getSafeAreaTop();
        let wx_area_top = this._utils.getWXSafeAreaTop();
        let widget = this.node.getComponent(cc.Widget);
        widget.enabled = false;
        this.node.y = cc.visibleRect.height / 2 - widget.top - safe_area_top;
        if (typeof (wx) != "undefined" && safe_area_top < wx_area_top) {
            // this.setting_node.y = this.setting_node.y - (wx_area_top - safe_area_top);
            // let poker_node = cc.find("Pokedex", this.node);
            // if (cc.isValid(poker_node)) {
            //     poker_node.y = poker_node.y - (wx_area_top - safe_area_top);
            // }
            // let mail = cc.find("Mail", this.node);
            // if (cc.isValid(mail)) {
            //     mail.y = mail.y - (wx_area_top - safe_area_top);
            // }

            let layoutRight = cc.find("LayoutRight", this.node);
            if (cc.isValid(layoutRight)) {
                layoutRight.y = layoutRight.y - (wx_area_top - safe_area_top);
            }
        }

        this.canLockFac()
        this.onRedTip({})
    }

    start () {
        this.setLv(); // magic
    }

    private powerCountDown() {
        let stamina = this._user.getStamina()
        let max_power = GameConstant.MAX_POWER_NUM
        let time = ChangeScene.instance.getCurPowerEndTime()
        let now_time = Math.floor(Date.now() / 1000)
        if (stamina < max_power && time <= now_time) {
            let next_restore_djs = ChangeScene.instance.getNextPowerTime()
            this.setRecoverPoweData(next_restore_djs)
        }
    }

    private setLv() {
        let cur_lv = this._user.getLevel()
        this.lv_num.string = cur_lv.toString()

        let lv_config = this._json_manager.getJson(this._json_name.PLAYER_LV)
        let lv_list = this._utils.objectToArray(lv_config)
        lv_list.sort((a, b) => {
            return a["level"] - b["level"]
        })
        let max_lv = lv_list[lv_list.length - 1]["level"]

        if (cur_lv >= max_lv) {
            this.lv_progress.fillRange = 1

            this.exp_ani.play("keshengjitishi2")
            this.exp_ani_particle.active = false
            this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
                // node: this.exp_node,
                level: this._guide_manager.HandConfig.USER_LEVEL,
                show: false,
            });
        }
        else {
            let json_lv = this._json_manager.getJsonData(this._json_name.PLAYER_LV, cur_lv)
            let need_exp = json_lv["need_exp"]
            if (need_exp <= 0) {
                this.lv_progress.fillRange = 1
            } else {
                let exp = this._user.getExperience()
                let percent = exp / need_exp
                this.lv_progress.fillRange = percent

                if (exp >= need_exp) {
                    this.exp_ani.play()
                    this.exp_ani_particle.active = true

                    if (/* !cc.isValid(this.guide_tip) && GuideManager.getGuideFinish() &&  */this.exp_node.active && this.guide_tip_is_show) {
                        this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
                            node: this.exp_node,
                            level: this._guide_manager.HandConfig.USER_LEVEL,
                            show: true,
                        });
                        // this.addGuideTip(this.exp_node, (node) => {
                        //     if (cc.isValid(this.guide_tip)) {
                        //         this.guide_tip.destroy()
                        //         this.guide_tip = null
                        //     }
                        //     this.guide_tip = node
                        //     if (!this.guide_tip_is_show) {
                        //         if (cc.isValid(this.guide_tip)) {
                        //             this.guide_tip.destroy()
                        //             this.guide_tip = null
                        //         }
                        //     }
                        // })
                    }
                } else {
                    this.exp_ani.play("keshengjitishi2")
                    this.exp_ani_particle.active = false
                    this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
                        // node: this.exp_node,
                        level: this._guide_manager.HandConfig.USER_LEVEL,
                        show: false,
                    });
                    // if (cc.isValid(this.guide_tip)) {
                    //     this.guide_tip.destroy()
                    //     this.guide_tip = null
                    // }
                }
            }
        }
    }

    private addGuideTip(parent_node: cc.Node, callBack?: Function) {
        let path = `main_scene/prefabs/guide/GuideTip`
        ResourceManager.getPrefab(path).then((prefab) => {
            if (cc.isValid(prefab)) {
                let node = cc.instantiate(prefab)
                let parent = cc.find("Canvas", cc.director.getScene())
                parent.addChild(node)

                let pos_w = parent_node.parent.convertToWorldSpaceAR(parent_node.position)
                let pos_n = parent.convertToNodeSpaceAR(pos_w)
                node.position = pos_n

                if (callBack) callBack(node)
            }
        })
    }

    private onUserData(data) {
        // cc.error(data, "data----------")
        this._user.init(data)

        if (data.hasOwnProperty("gold")) {
            this.setGoldLabel();
        }
        if (data.hasOwnProperty("diamond")) {
            this.setDiamondLabel();
        }

        this.setLv()
        this.power_num.string = this._user.getStamina().toString()
    }

    private setGoldLabel() {
        let pre_gold_number = Number(this.pre_gold_number);
        let cur_gold_number = this._user.getGold();
        this.pre_gold_number = cur_gold_number;
        if (cur_gold_number > pre_gold_number) {
            let add_number = (cur_gold_number - pre_gold_number) / JUMP_COUNT;
            let index = 0;
            this.gold_schdule_fn && this.unschedule(this.gold_schdule_fn);
            this.gold_schdule_fn = () => {
                if (++index == JUMP_COUNT + 1) {
                    pre_gold_number = cur_gold_number;
                    this.gold_schdule_fn = null;
                }
                else {
                    pre_gold_number += add_number;
                }
                this.gold_label.string = Number(Math.floor(pre_gold_number)) + "";
            };
            this.schedule(this.gold_schdule_fn, 0.5 / JUMP_COUNT, JUMP_COUNT, 0);
            let add_node = cc.instantiate(this.add_node);
            add_node.parent = this.gold_label.node.parent;
            add_node.setPosition(this.gold_label.node.getPosition());
            add_node.getComponent(cc.Label).string = "+" + (cur_gold_number - pre_gold_number);
            add_node.active = true;
            cc.tween(add_node)
                .parallel(
                    cc.tween().by(0.5, { y: 62 }),
                    cc.tween().sequence(
                        cc.tween().delay(0.3),
                        cc.tween().to(0.2, { opacity: 0 })
                    )
                )
                .removeSelf()
                .start();
        }
        else {
            this.gold_label.string = this._user.getGold().toString()
        }
    }

    private setDiamondLabel() {
        let pre_diamond_number = Number(this.pre_diamond_number); // Number(this.diamond_label.string);
        let cur_diamond_number = this._user.getDiamond();
        this.pre_diamond_number = cur_diamond_number;
        if (cur_diamond_number > pre_diamond_number) {
            let add_number = (cur_diamond_number - pre_diamond_number) / JUMP_COUNT;
            let index = 0;
            this.diamond_schdule_fn && this.unschedule(this.diamond_schdule_fn);
            this.diamond_schdule_fn = () => {
                if (++index == JUMP_COUNT + 1) {
                    pre_diamond_number = cur_diamond_number;
                    this.diamond_schdule_fn = null;
                }
                else {
                    pre_diamond_number += add_number;
                }
                this.diamond_label.string = Number(Math.floor(pre_diamond_number)) + "";
            };
            this.schedule(this.diamond_schdule_fn, 0.5 / JUMP_COUNT, JUMP_COUNT, 0);
            let add_node = cc.instantiate(this.add_node);
            add_node.parent = this.diamond_label.node.parent;
            add_node.setPosition(this.diamond_label.node.getPosition());
            add_node.getComponent(cc.Label).string = "+" + (cur_diamond_number - pre_diamond_number);
            add_node.active = true;
            cc.tween(add_node)
                .parallel(
                    cc.tween().by(0.5, { y: 62 }),
                    cc.tween().sequence(
                        cc.tween().delay(0.3),
                        cc.tween().to(0.2, { opacity: 0 })
                    )
                )
                .removeSelf()
                .start();
        }
        else {
            this.diamond_label.string = this._user.getDiamond().toString()
        }
    }

    private setUserItemPos(id: number) {
        let json = this._json_manager.getJsonData(this._json_name.UI_JUMP, id)
        let list = []
        for (let i = 1; i < 5; i++) {
            let value = json["currency_" + i]
            if (value != 0) {
                list.push(value)
            }
        }
        for (let j = 0; j < this.user_item_list.length; j++) {
            let node = this.user_item_list[j]
            let id = Number(node.name)
            if (list.indexOf(id) != -1) {
                let index = list.indexOf(id)
                node.active = true
                node.x = this.user_item_x_list[index]
            } else {
                node.active = false
            }
        }
    }

    private clickLv() {
        if (!this.isCanClickLv) return
        if (!this._guide_manager.getGuideFinish()) {
            let guide_id = this._guide_manager.getGuideId();
            if (guide_id == 110) {
                this._guide_manager.closeGuideDialog(guide_id);
                this._guide_manager.setGuideMask(true);
            }
        }
        this._dialog_manager.openDialog(this._dialog_name.GradeView)
    }

    private clickPower() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_STRENGTH_BTN);
        this._dialog_manager.openDialog(this._dialog_name.PowerView)
    }

    private clickCoin() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_GOLD_BTN);
        if (this._config.isAndroidPay) {
            this._dialog_manager.openDialog(this._dialog_name.ShopDialog);
        }
        else {
            this._dialog_manager.openDialog(this._dialog_name.VideoView)
        }
        this.setUserItemPos(10003)
    }

    private clickDiamond() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_DIAMOND_BTN);
        if (this._config.isAndroidPay) {
            this._dialog_manager.openDialog(this._dialog_name.ShopDialog);
        }
        else {
            this._dialog_manager.openDialog(this._dialog_name.VideoView)
        }
        this.setUserItemPos(10003)
    }

    private clickCrystal () {
        this._net_manager.requestTablog(this._config.statistic.MAIN_CRYSTAL_BTN);
        if (this._config.isAndroidPay) {
            this._dialog_manager.openDialog(this._dialog_name.ShopDialog);
        }
        else {
            this._dialog_manager.openDialog(this._dialog_name.VideoView)
        }
        this.setUserItemPos(10003)
    }

    // private setYuGanNum() {
    //     if (cc.isValid(this.ttf_yugan_num)) {
    //         this.ttf_yugan_num.string = PackManager.getItemNumById(100006).toString()
    //     }
    // }

    private setRecoverPoweData(cur_end_time) {
        let next_restore_djs = cur_end_time - Math.floor(Date.now() / 1000)
        if (next_restore_djs > 0) {
            this.power_time_bg.node.active = true
            this.power_time.node.active = true

            this.power_end_time = cur_end_time
            let now_time = Math.floor(Date.now() / 1000)
            let return_djs = this.power_end_time - now_time
            this.power_time.string = this._utils.formatTimeForSecond(return_djs)
            this.schedule(this.tickPowerTime, 1)

            UserDefault.setItem(User.getUID() + GameConstant.RECORD_POWER_RESIDUE_TIME, return_djs)
        }
        else {
            this.power_time_bg.node.active = false
            this.power_time.node.active = false
        }
    }

    private onUserUpdate() {
        this.fish_label.string = this._user.getFish().toString();
        this.power_num.string = this._user.getStamina().toString()
        if (cc.isValid(this.crystal_label)) {
            this.crystal_label.string = this._user.getCrystal().toString()
        }
        this.setGoldLabel()
        this.setDiamondLabel()
        this.setLv()
    }

    private tickPowerTime() {
        let now_time = Math.floor(Date.now() / 1000)
        if (now_time > this.power_end_time) {
            let diff_time = Math.ceil(now_time - this.power_end_time)
            let stamina = this._user.getStamina()
            let max_power = GameConstant.MAX_POWER_NUM
            let diff_power = max_power - stamina

            let single_time = GameConstant.POWER_RECOVER_TIME
            let num = Math.floor(diff_time / single_time) + 1
            if (num >= diff_power) {
                this.unschedule(this.tickPowerTime)
                this.power_time_bg.node.active = false
                this.power_time.node.active = false
                this._utils.addResNum(GameConstant.res_id.stamina, diff_power)
            } else {
                this._utils.addResNum(GameConstant.res_id.stamina, num)
                let shengyu_time = single_time - diff_time % single_time
                this.unschedule(this.tickPowerTime)
                let end_tiem = Math.floor(Date.now() / 1000) + shengyu_time
                this.setRecoverPoweData(end_tiem)
            }
        } else {
            let return_djs = this.power_end_time - now_time
            if (return_djs <= 0) {
                this.unschedule(this.tickPowerTime)
                this.power_time_bg.node.active = false
                this.power_time.node.active = false
                this._net_manager.requestChangeUserStamina(1)
            } else {
                this.power_time.string = this._utils.formatTimeForSecond(return_djs)
            }
            UserDefault.setItem(User.getUID() + GameConstant.RECORD_POWER_RESIDUE_TIME, return_djs)
        }

    }

    private addItem(data) {
        if (!data) return
        let item_id = data["item_id"]
        let item_type = this._utils.getItemTypeById(item_id)
        if (item_type == 2) {
            let item_config = this._json_manager.getJsonData(this._json_name.ITEM_BASE, item_id)
            let use_type = item_config["use_type"]
            if (use_type == 1002) {
                let use_value = item_config["use_value"]
                this._dialog_manager.openDialog(this._dialog_name.UnlockCusomer, { id: use_value })
                return
            }
        }
        const itemPath = "prefabs/common/FlyItem"
        cc.resources.load(itemPath, cc.Prefab, (err: Error, itemPrefab: cc.Prefab) => {
            if (itemPrefab) {
                let node = cc.instantiate(itemPrefab)
                node.parent = cc.find("Canvas", cc.director.getScene());
                let pos_w = data["pos_w"]
                let pos_n = node.parent.convertToNodeSpaceAR(pos_w)
                node.position = cc.v3(pos_n)

                let move_path = this._utils.getItemMovePathById(item_id)
                let end_node = null
                if (move_path == 2) {
                    end_node = this.power_node
                } else if (move_path == 3) {
                    end_node = this.coin_node
                } else if (move_path == 4) {
                    end_node = this.diamond_node
                } else if (move_path == 1) {
                    end_node = this.exp_node
                } else if (move_path == 5) {
                    end_node = this.mer_node
                } else if (move_path == 6) {
                    end_node = this.crystal_node
                } else if (move_path == 7) {
                    end_node = this.travel_node
                }
                if (cc.isValid(end_node)) {
                    let end_node_pos_w = end_node.parent.convertToWorldSpaceAR(end_node.position)
                    let end_node_pos_n = node.parent.convertToNodeSpaceAR(end_node_pos_w)
                    node.getComponent(FlyItem).init(data, end_node_pos_w)
                }
            }
        })
    }

    private clickBtnTask() {
        this._net_manager.requestTablog(this._config.statistic.MAIN_TASK_BTN);
        let guide_id = GuideManager.getGuideId();
        if (guide_id == 8) {
            GuideManager.setGuideId(GuideManager.GuideConfig[guide_id].next);
            GuideManager.closeGuideDialog(guide_id);
            GuideManager.setGuideMask(true);
        }
        this._dialog_manager.openDialog(this._dialog_name.TaskView)
        // this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
        //     show: false,
        //     node: this.task_node,
        //     level: this._guide_manager.HandConfig.TASK,
        // });
    }

    private clickSeting() {
        this._dialog_manager.openDialog(this._dialog_name.SetingView)
    }

    private clickPokedex() {
        let index = UserDefault.getItem(this._user.getUID() + GameConstant.POKDEX_PAGE_INDEX)
        if (index) {
            this._dialog_manager.openDialog(this._dialog_name.PokedexView, { index: Number(index) })
        } else {
            this._dialog_manager.openDialog(this._dialog_name.PokedexView)
        }

    }

    private canLockFac() {
        if (!cc.isValid(this.fish_ani)) return
        let isCan = ChangeScene.instance.getIsCanLockFac()
        let red = this.task_node.getChildByName("Red")
        if (isCan) {
            this.fish_ani.play()
            this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
                show: true,
                node: this.task_node,
                level: this._guide_manager.HandConfig.TASK,
            });
            if (cc.isValid(red)) {
                red.active = true
            }
        } else {
            this.fish_ani.stop()
            let renwu2 = this.fish_ani.node.getChildByName("renwu2")
            if (cc.isValid(renwu2)) {
                renwu2.y = 0
                renwu2.scale = 1
            }
            if (cc.isValid(red)) {
                red.active = false
            }
        }
    }

    private onRedTip(data) {
        if (cc.isValid(this.pokdex_red)) {
            let element_reward_list = this._user.getElementRewwardList()
            let isCusRed = this._utils.getPokedexCusIsHaveRed()
            if (element_reward_list.length > 0 || isCusRed) {
                this.pokdex_red.active = true
            } else {
                this.pokdex_red.active = false
            }
        }

        if (cc.isValid(this.seven_day_red)) {
            let isRed = this._utils.getSevenDayIsHaveRed()
            this.seven_day_red.active = isRed
        }
    }

    private setIsCanClickLv(isCan: boolean) {
        this.isCanClickLv = isCan
    }

    private unlockFacFishAni(data) {
        let node = cc.instantiate(this.template_item)
        let parent = cc.find("Canvas", cc.director.getScene())
        node.parent = parent
        node.active = true
        node.scale = 1

        let pos1 = this.task_node.parent.convertToWorldSpaceAR(this.task_node.position)
        let pos2 = parent.convertToNodeSpaceAR(pos1)
        node.position = pos2

        this._audio_manager.playEffect(this._audio_name.ELF1)

        let pos_w = data["pos_w"]
        let endPos = parent.convertToNodeSpaceAR(pos_w)
        let x = 200
        cc.tween(node)
            .bezierTo(1, cc.v2(x + this.node.x, this.node.y), cc.v2(x + endPos.x, endPos.y), cc.v2(endPos.x, endPos.y))
            .call(() => {
                const itemPath = "prefabs/common/AddItem"
                cc.resources.load(itemPath, cc.Prefab, (err: Error, itemPrefab: cc.Prefab) => {
                    if (itemPrefab) {
                        let node = cc.instantiate(itemPrefab)
                        let parent = cc.find("Canvas", cc.director.getScene())
                        parent.addChild(node)
                        let pos_w = data["pos_w"]
                        let pos_n = parent.convertToNodeSpaceAR(pos_w)
                        node.position = cc.v3(pos_n)

                        node.getComponent(AddItem).moveToHeight(data)
                    }
                })
                node.destroy()
            })
            .start()
    }

    private onTriggerGuide() {
        if (GuideManager.getGuideFinish()) {
            this.setLv()
        }
    }

    private setTipState(isShow: boolean) {
        this.guide_tip_is_show = isShow
        if (isShow) {
            this.setLv()
        } else {
            this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
                node: this.exp_node,
                level: this._guide_manager.HandConfig.USER_LEVEL,
                show: false,
            });
            // if (cc.isValid(this.guide_tip)) {
            //     this.guide_tip.destroy()
            //     this.guide_tip = null
            // }
        }
    }

    private skinShowState(isShow: boolean) {
        MapGridView.instance.setSkinUiState(isShow)

        this.dengji.active = !isShow
        this.layout_right.active = !isShow
        this.layout_left.active = !isShow
        this.layout_left2.active = !isShow
        this.mer_node.active = !isShow
        this.task_node.active = !isShow
        this.nodeRightBottom.active = !isShow
        this.setTipState(!isShow)

        let room_bubble_list = RoomMgr.instance.getBuildBubbleList()
        let scene_build_bubble_list = SceneBuildMgr.instance.getBuildBubbleList()
        for (const key in room_bubble_list) {
            if (Object.prototype.hasOwnProperty.call(room_bubble_list, key)) {
                const bubble = room_bubble_list[key]
                if (cc.isValid(bubble)) {
                    bubble.node.active = !isShow
                }
            }
        }
        for (const key in scene_build_bubble_list) {
            if (Object.prototype.hasOwnProperty.call(scene_build_bubble_list, key)) {
                const bubble = scene_build_bubble_list[key]
                if (cc.isValid(bubble)) {
                    bubble.node.active = !isShow
                }
            }
        }

        if (isShow) {
            this.setUserItemPos(10004)
        } else {
            this.setUserItemPos(10001)
        }
    }

    private changeTipUiState(data: { id: number }) {
        let id = data.id
        this.setUserItemPos(id)
    }
}
