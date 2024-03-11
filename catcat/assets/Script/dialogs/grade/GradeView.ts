import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GradeView extends MyComponent {

    @property(cc.Node)
    view1: cc.Node = null

    @property(cc.Node)
    view2: cc.Node = null

    @property(cc.Node)
    node_lv: cc.Node = null

    @property(cc.Animation)
    node_lv_ani: cc.Animation = null

    @property(cc.Label)
    view2_lv: cc.Label = null

    @property(cc.Node)
    view2_par: cc.Node = null

    @property(cc.Node)
    progress_mask: cc.Node = null

    @property(cc.Node)
    progress_bar: cc.Node = null

    @property(cc.Label)
    progress_percent: cc.Label = null

    @property(cc.Label)
    ttf_lv: cc.Label = null

    @property([cc.Node])
    item_list: cc.Node[] = []

    @property(cc.Node)
    btn1: cc.Node = null

    @property(cc.Node)
    btn2: cc.Node = null

    @property(cc.Node)
    btn3: cc.Node = null

    @property(cc.Node)
    max_lv_tip: cc.Node = null

    @property(cc.Node)
    reward_node: cc.Node = null

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    private show_item_list: cc.Node[] = []

    onLoad() {
        this.listen(this._event_name.SOCKET_USER_LEVEL_UP, this.userLvUp, this)
        this.listen(this._event_name.EVENT_OPENED_DIALOG, this.onOpenDialog, this)

        this.dragon.on(dragonBones.EventObject.COMPLETE, (a) => {
            if (this.dragon.animationName == "gongzuo") {
                this.dragon.playAnimation("daiji", -1)
            }
        })

        this.node_lv_ani.on("finished", () => {
            this._event_manager.dispatch(this._event_name.EVENT_SHOW_MAIN_BUILD_LV_UP)
            if (!this._guide_manager.getGuideFinish()) {
                let guide_id = this._guide_manager.getGuideId();
                this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                this._guide_manager.triggerGuide();
            }
            this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
                type: 1001,
                args: [this._user.getLevel()],
            })
            this.close()
        })
    }

    start() {
        this.view1.active = true
        this.view2.active = false

        this.dragon.playAnimation("gongzuo", 1)

        let lv_config = this._json_manager.getJson(this._json_name.PLAYER_LV)
        let lv_list = this._utils.objectToArray(lv_config)
        lv_list.sort((a, b) => {
            return a["level"] - b["level"]
        })
        let max_lv = lv_list[lv_list.length - 1]["level"]

        let cur_lv = this._user.getLevel()
        this.ttf_lv.string = cur_lv.toString()

        if (cur_lv < max_lv) {
            this.reward_node.active = true
            this.max_lv_tip.active = false

            let json_lv = this._json_manager.getJsonData(this._json_name.PLAYER_LV, cur_lv)
            let need_exp = json_lv["need_exp"]
            let exp = this._user.getExperience()
            let percent = exp / need_exp
            this.progress_mask.width = this.progress_bar.width * percent
            this.progress_percent.string = `${exp}/${need_exp}`
            // let lv_reward = json_lv["lv_reward"]
            let lv_reward = this._config.game_2d ? json_lv["lv_reward_2d"] : json_lv["lv_reward"]
            let arr = lv_reward.split(",")
            let reward_list = []
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i]
                let arr2 = element.split(":")
                let data = {
                    id: arr2[0],
                    num: arr2[1]
                }
                reward_list.push(data)
            }

            this.btn1.active = exp >= need_exp
            this.btn2.active = !(exp >= need_exp)
            this.btn3.active = false

            this.scheduleOnce(() => {
                let time = 0.15
                let index = 0
                for (let j = 0; j < this.item_list.length; j++) {
                    const node = this.item_list[j]
                    let item_data = reward_list[j]
                    if (item_data) {
                        node.active = true
                        let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                        let num = node.getChildByName("Num").getComponent(cc.Label)
                        let name = node.getChildByName("Name").getComponent(cc.Label)
                        num.string = item_data["num"]
    
                        let item_id = item_data["id"]
                        name.string = this._utils.getItemNameById(item_id)
                        let path = this._utils.getItemPathById(item_id)
                        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                            if (cc.isValid(icon)) {
                                icon.spriteFrame = sprite_frame
                                let item_type = this._utils.getItemTypeById(item_id)
                                if (item_type == 1) icon.node.scale = 0.5
                            }
                        })
    
                        node["item_id"] = item_data["id"]
                        node["item_num"] = item_data["num"]
    
                        this.show_item_list.push(node)
    
                        this.scheduleOnce(() => {
                            node.getComponent(cc.Animation).play()
                        }, index * time)
                        index++
                    } else {
                        node.active = false
                    }
                }
            }, 0.15)
        }
        else {
            this.reward_node.active = false
            this.max_lv_tip.active = true

            this.btn1.active = false
            this.btn2.active = false
            this.btn3.active = true

            this.progress_percent.string = "已达到最大等级"
        }
    }

    private checkEventGift() {
        let json = this._json_manager.getJson(this._json_name.EVENT_GIFT)
        let lv = this._user.getLevel()
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                if (item_data["event_type"] == 1) {
                    let event_value = item_data["event_value"]
                    if (event_value == lv) {
                        this._event_manager.dispatch(this._event_name.EVENT_EVENT_GIFT_DATA, item_data)
                        break
                    }
                }
            }
        }
    }

    private clickBtnUp() {
        let cur_lv = this._user.getLevel()
        let json_lv = this._json_manager.getJsonData(this._json_name.PLAYER_LV, cur_lv)
        let need_exp = json_lv["need_exp"]
        this._utils.addResNum(GameConstant.res_id.exp, -need_exp)
        this._user.setLevel(cur_lv + 1)
        this._net_manager.requestRecodeLv(this._user.getLevel())
        this.checkEventGift()
        // this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
        //     type: 1001,
        //     args: [this._user.getLevel()],
        // })
        this.userLvUp()
        this._event_manager.dispatch(this._event_name.EVENT_USER_LV_UP)
        if (!this._guide_manager.getGuideFinish()) {
            let guide_id = this._guide_manager.getGuideId();
            if (guide_id == 111) {
                this._guide_manager.setGuideMask(true);
                this._guide_manager.closeGuideDialog(guide_id);
                this._guide_manager.setGuideMask(true);
            }
        }
        // this._net_manager.requestUserLvUp()
    }

    private userLvUp(data?) {
        // cc.error(data, "datda=-=========")
        this.view1.active = false
        this.view2.active = true
        this.view2.height = cc.view.getVisibleSize().height
        this.view2.width = cc.view.getVisibleSize().width

        let cur_lv = this._user.getLevel() - 1
        this.view2_lv.string = cur_lv.toString()

        this._audio_manager.playEffect(this._audio_name.LEVEL_UP)
        cc.tween(this.node_lv)
            .parallel(
                cc.tween().to(0.3, { scale: 1 }),
                cc.tween().to(0.3, { x: 0 }),
                cc.tween().call(() => {
                    for (let j = 0; j < this.show_item_list.length; j++) {
                        const node = this.show_item_list[j]
                        // const item_data = data[j]
                        let pos_w = node.parent.convertToWorldSpaceAR(node.position)
                        let event_data = {
                            pos_w: pos_w,
                            // item_id: item_data["item_id"],
                            // item_num: item_data["item_num"],
                            item_id: node["item_id"],
                            item_num: Number(node["item_num"]),
                        }
                        this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, event_data)
                    }
                })
            )
            .call(() => {
                this.view2_par.active = true
                this.node_lv_ani.play()
            })
            .start()
    }

    private onOpenDialog(data) {
        if (data.dialog_cfg == this._dialog_name.GradeView) {
            if (!this._guide_manager.getGuideFinish()) {
                let guide_id = this._guide_manager.getGuideId();
                if (guide_id == 110) {
                    this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                    this._guide_manager.triggerGuide();
                }
            }
        }
    }

    private clickBtnBuild() {
        this._dialog_manager.openDialog(this._dialog_name.TaskView)
        this.close()
    }

    // update (dt) {}
}
