import MyButton from "../../Script/common/MyButton";
import MyComponent from "../../Script/common/MyComponent";
import MyScrollView from "../../Script/common/MyScrollView";
import NiuDanItem from "./NiuDanItem";
import GameConstant from "../../Script/common/GameConstant";
import { UserDefault } from "../../Script/common/Config";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NiuDan extends MyComponent {

    @property(MyScrollView)
    scroll: MyScrollView = null

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    @property(MyButton)
    btn: MyButton = null

    @property(cc.Button)
    inputEvent: cc.Button = null

    @property(cc.Label)
    ttf_tip: cc.Label = null

    @property(cc.Label)
    ttf_tip_num: cc.Label = null

    @property([cc.SpriteFrame])
    private video_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    private video_sprite: cc.Sprite = null;
    @property(cc.Label)
    private video_ttf: cc.Label = null;

    private scroll_data = []
    private today_niudan_num = {}

    onLoad() {
        this.inputEvent.node.width = cc.visibleRect.width
        this.inputEvent.node.height = cc.visibleRect.height

        this.dragon.on(dragonBones.EventObject.COMPLETE, (a) => {
            if (this.dragon.animationName == "gongzuo") {
                this.inputEvent.node.active = false

                this.dragon.playAnimation("daiji", -1)
                this.btn.interactable = true
                this.getRandomReward()
            }
        })

        this.inputEvent.node.active = false
        this.listen(this._event_name.EVENT_VIDEO_CARD, this.setBtnState, this);
        // this.video_sprite.spriteFrame = this.video_spriteframes[(this._user.getVideo() > 0) ? 1 : 0];

        let data = UserDefault.getItem(this._user.getUID() + GameConstant.TODAY_NIU_DAN_NUM)
        if (data) {
            this.today_niudan_num = JSON.parse(data)
        } else {
            this.today_niudan_num = {
                num: 0
            }
        }
        let time = UserDefault.getItem(this._user.getUID() + GameConstant.NIU_DAN_RECOVER_TIME)
        if (time) {
            let isNewDay = this._utils.isNewDay(Number(time))
            if (isNewDay) {
                this.today_niudan_num = {
                    num: 0
                }
            }
        }

        UserDefault.setItem(this._user.getUID() + GameConstant.TODAY_NIU_DAN_NUM, JSON.stringify(this.today_niudan_num))
        UserDefault.setItem(this._user.getUID() + GameConstant.NIU_DAN_RECOVER_TIME, Date.now())
    }

    start() {
        let json = this._json_manager.getJson(this._json_name.RAFFLE)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                this.scroll_data.push(item_data)
            }
        }

        this.initScroll(this.scroll, this.scroll_data)

        let item_data = this.getMinReward()
        if (item_data) {
            this.ttf_tip.string = `${item_data["tips"]}`
        } else {
            this.ttf_tip.string = ""
        }

        this.setNum()
        this.setBtnState()
    }

    private getConfigRound() {
        let round = 20
        let json = this._json_manager.getJson(this._json_name.RAFFLE)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                if (item_data["reword_round"] != 0) {
                    round = item_data["reword_round"]
                    break
                }
            }
        }

        return round
    }

    private getMinReward() {
        let need_data = null
        let json = this._json_manager.getJson(this._json_name.RAFFLE)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                if (item_data["reword_round"] != 0) {
                    need_data = item_data
                    break
                }
            }
        }

        return need_data
    }

    private setNum() {
        let num = 0
        let round = this.getConfigRound()
        let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.NIU_DAN_NUM)
        if (local_data) {
            local_data = JSON.parse(local_data)
            num = local_data["num"]
        }
        this.ttf_tip_num.string = `${num}/${round}`
    }

    private getRandomReward() {
        let local_data = UserDefault.getItem(this._user.getUID() + GameConstant.NIU_DAN_NUM)
        if (local_data) {
            local_data = JSON.parse(local_data)
        } else {
            local_data = {
                num: 0
            }

            UserDefault.setItem(this._user.getUID() + GameConstant.NIU_DAN_NUM, JSON.stringify(local_data))
        }
        let round = this.getConfigRound()
        let num = local_data["num"]
        if (num >= round - 1) {
            local_data["num"] = 0
            UserDefault.setItem(this._user.getUID() + GameConstant.NIU_DAN_NUM, JSON.stringify(local_data))

            let need_data = this.getMinReward()
            if (need_data) {
                let reward_item = need_data["reward_item"]
                let reward_list = this._utils.changeConfigData(reward_item)
                this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
            }

            this.setNum()

        } else {
            local_data["num"] = num + 1
            UserDefault.setItem(this._user.getUID() + GameConstant.NIU_DAN_NUM, JSON.stringify(local_data))

            let total_weight = 0
            let json = this._json_manager.getJson(this._json_name.RAFFLE)
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    const item_data = json[key]
                    let weight = item_data["weight"]
                    total_weight += weight
                }
            }

            let list = []
            let current_weight = total_weight
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    const item_data = json[key]
                    let id = item_data["id"]
                    let weight = item_data["weight"]
                    let range = [current_weight, current_weight - weight]
                    current_weight = current_weight - weight
                    let data = { range: range, id: id }
                    list.push(data)
                }
            }

            let id = null
            let random = this._utils.getRandomInt(0, total_weight)
            for (let i = 0; i < list.length; i++) {
                const data = list[i]
                let range = data["range"]
                if (random >= range[1] && random <= range[0]) {
                    id = data["id"]
                    break
                }
            }

            if (id) {
                let item_data = json[id]
                let reward_item = item_data["reward_item"]

                if (item_data["reword_round"] != 0) {
                    local_data["num"] = 0
                    UserDefault.setItem(this._user.getUID() + GameConstant.NIU_DAN_NUM, JSON.stringify(local_data))
                }

                let reward_list = this._utils.changeConfigData(reward_item)
                this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
            }

            this.setNum()
        }
    }

    private clickBtn() {
        let item_data = this.getCurData()
        if (item_data) {
            let stytle = item_data["stytle"]
            if (stytle == 1) {
                // 免费
                this.inputEvent.node.active = true
                this.dragon.playAnimation("gongzuo", 1)
                this._audio_manager.playEffect(this._audio_name.NIUDANJI)
                this.btn.interactable = false
                this._event_manager.dispatch(this._event_name.EVENT_NIUDAN_RED, false)

                this.changeTodayNum(1)
            }
            else if (stytle == 2) {
                // 看视频
                if (this._user.getVideo() > 0) {
                    this._utils.addResNum(GameConstant.res_id.video, -1);
                    this.inputEvent.node.active = true
                    this.dragon.playAnimation("gongzuo", 1)
                    this._audio_manager.playEffect(this._audio_name.NIUDANJI)
                    this.btn.interactable = false
                    this._event_manager.dispatch(this._event_name.EVENT_NIUDAN_RED, false)

                    this.changeTodayNum(1)
                }
                else {
                    this._ad_manager.setAdCallback(() => {
                        this.inputEvent.node.active = true
                        this.dragon.playAnimation("gongzuo", 1)
                        this.btn.interactable = false
                        this._net_manager.requestTablog(this._config.statistic.VIDEO_GACHA1);
                        this._event_manager.dispatch(this._event_name.EVENT_NIUDAN_RED, false)
                        this._audio_manager.playEffect(this._audio_name.NIUDANJI)

                        this.changeTodayNum(1)
                    });
                    this._net_manager.requestTablog(this._config.statistic.VIDEO_GACHA0);
                    this._ad_manager.showAd();
                }
            }
            else if (stytle == 3) {
                // 道具
                let pay = item_data["index"]
                let arr = pay.split(":")
                let item_id = Number(arr[0])
                let need_num = Number(arr[1])

                let my_num = this._utils.getMyNumByItemId(item_id)
                if (my_num >= need_num) {
                    this._utils.addResNum(item_id, -Number(need_num))

                    this.inputEvent.node.active = true
                    this.dragon.playAnimation("gongzuo", 1)
                    this._audio_manager.playEffect(this._audio_name.NIUDANJI)
                    this.btn.interactable = false
                    this._event_manager.dispatch(this._event_name.EVENT_NIUDAN_RED, false)

                    this.changeTodayNum(1)

                } else {
                    this._dialog_manager.showTipMsg("货币不足")
                }
            }
        } else {
            this._dialog_manager.showTipMsg("今日次数已用完")
        }
    }

    private changeTodayNum(add: number) {
        this.today_niudan_num["num"] += add
        UserDefault.setItem(this._user.getUID() + GameConstant.TODAY_NIU_DAN_NUM, JSON.stringify(this.today_niudan_num))

        this.setBtnState()
    }

    private initScroll(scroll: MyScrollView, data: any[]) {
        if (scroll.content.childrenCount > 0) {
            scroll.ClearData()
            scroll.numItems = data.length
        } else {
            scroll.setTemplateItem()
            scroll.numItems = data.length
        }
    }

    /**
     * 刷新单个tem状态
     * @param node
     * @param index
     */
    onScrollItemUpdate(node: cc.Node, index: number) {
        if (node && this.scroll_data[index]) {
            node.getComponent(NiuDanItem).updateView(this.scroll_data[index])
        }
    }

    private onVideoCard() {
        this.video_sprite.spriteFrame = this.video_spriteframes[(this._user.getVideo() > 0) ? 1 : 0];
    }

    private setBtnState() {
        let item_data = this.getCurData()
        if (item_data) {
            let stytle = item_data["stytle"]
            if (stytle == 1) {
                // 免费
                this.video_sprite.node.active = false
                this.video_ttf.string = "免费"
            }
            else if (stytle == 2) {
                // 看视频
                this.video_sprite.spriteFrame = this.video_spriteframes[(this._user.getVideo() > 0) ? 1 : 0]
                this.video_sprite.node.active = true
                this.video_ttf.string = "免费"
            }
            else if (stytle == 3) {
                // 道具
                let pay = item_data["index"]
                let arr = pay.split(":")
                this.video_sprite.node.active = true
                let item_id = Number(arr[0])
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(this.video_sprite)) {
                        this.video_sprite.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) this.video_sprite.node.scale = 0.3
                    }
                })
                this.video_ttf.string = arr[1]
            }
        }
    }

    private getTotalNum() {
        let json = this._json_manager.getJson(this._json_name.RAFFLE_START)
        let num = 0
        if (json) {
            num = Object.keys(json).length
        }

        return num
    }

    private getCurData() {
        let json = this._json_manager.getJson(this._json_name.RAFFLE_START)
        let num = this.today_niudan_num["num"]
        let need_data = null
        if (json) {
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    const item_data = json[key]
                    if (item_data["round"] == num + 1) {
                        need_data = item_data
                        break
                    }
                }
            }
        }

        return need_data
    }

    // update (dt) {}
}
