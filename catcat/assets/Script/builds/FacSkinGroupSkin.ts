import { UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";
import MyScrollView from "../common/MyScrollView";
import MapGridView from "../main/MapGridView";
import BuildConfig from "./BuildConfig";
import FacSkinGroup from "./FacSkinGroup";
import SkinGroupItem2 from "./SkinGroupItem2";


const { ccclass, property } = cc._decorator;

@ccclass
export default class FacSkinGroupSkin extends MyComponent {

    @property(cc.Node)
    bg: cc.Node = null

    @property(MyScrollView)
    scroll: MyScrollView = null

    @property(cc.Label)
    ttf_title: cc.Label = null

    @property(cc.Sprite)
    progrss_bar: cc.Sprite = null

    @property(cc.Label)
    progress_percent: cc.Label = null

    @property(cc.Sprite)
    progress_gift: cc.Sprite = null

    @property([cc.SpriteFrame])
    gift_frames: cc.SpriteFrame[] = []

    @property(cc.Node)
    red: cc.Node = null

    private isShow: boolean = false
    private scroll_data = []
    private data = null
    private group: number
    private scroll_percent: number = 0

    onLoad() {
        this.listen(this._event_name.EVENT_REFRESH_CUR_GROUP_SKIN_DATA, this.refreshScroll, this)

        this.scroll.node.on("scroll-ended", () => {
            let percent = Math.abs(this.scroll.getScrollOffset().x) / this.scroll.getMaxScrollOffset().x
            this.scroll_percent = percent
        }, this)
    }

    start() {

    }

    private initView(data) {
        // cc.error(data, "data=========FacSkinGroupSkin")
        this.scroll_percent = 0

        this.data = data
        let group = data["group"]
        this.group = group

        this.ttf_title.string = this.data["name"]

        this.refreshScroll()
    }

    private refreshScroll() {
        let group = this.data["group"]
        let skin_json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        let temp_list = []
        for (const key in skin_json) {
            if (Object.prototype.hasOwnProperty.call(skin_json, key)) {
                const item_data = skin_json[key]
                let item_data_group = item_data["group"]
                if (group == item_data_group) {
                    temp_list.push(item_data)
                }
            }
        }

        let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (skin_data) {
            skin_data = JSON.parse(skin_data)
        } else {
            skin_data = {}
        }
        for (let i = 0; i < temp_list.length; i++) {
            const item_data = temp_list[i]
            let own_facility = item_data["own_facility"]
            if (!skin_data[own_facility]) {
                let defaultSkinId = this.getDefaultSkinId(own_facility)
                skin_data[own_facility] = {
                    use_skin_id: defaultSkinId,
                    have_skin_id_list: [defaultSkinId]
                }
            }
        }

        UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))


        let have_num = 0
        // let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (skin_data) {
            // skin_data = JSON.parse(skin_data)
            for (let i = 0; i < temp_list.length; i++) {
                const item_data = temp_list[i]
                let own_facility = item_data["own_facility"]
                let fac_skin_data = skin_data[own_facility]
                if (fac_skin_data) {
                    let skin_id = item_data["id"]
                    let have_skin_id_list: any[] = fac_skin_data["have_skin_id_list"]
                    if (have_skin_id_list.indexOf(skin_id) != -1) {
                        have_num += 1
                    }
                }
            }
        }

        let length = temp_list.length
        this.progress_percent.string = `${have_num}/${temp_list.length}`
        this.progrss_bar.fillRange = have_num / length
        let rewardData = this.data["reward"]
        if (rewardData == "0") {
            this.red.active = false
            this.progress_gift.node.active = false
        } else {
            let reward_data = UserDefault.getItem(this._user.getUID() + GameConstant.SKIN_GROUP_REWARD)
            if (reward_data) {
                reward_data = JSON.parse(reward_data)
                if (reward_data[group]) {
                    this.progress_gift.node.active = false
                    this.red.active = false
                } else {
                    this.progress_gift.node.active = true
                    if (have_num >= length) {
                        this.progress_gift.spriteFrame = this.gift_frames[1]
                        this.red.active = true
                    } else {
                        this.progress_gift.spriteFrame = this.gift_frames[0]
                        this.red.active = false
                    }
                }
            } else {
                this.progress_gift.node.active = true
                if (have_num >= length) {
                    this.progress_gift.spriteFrame = this.gift_frames[1]
                    this.red.active = true
                } else {
                    this.progress_gift.spriteFrame = this.gift_frames[0]
                    this.red.active = false
                }
            }
        }

        // let skin_json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        let list = []
        for (const key in skin_json) {
            if (Object.prototype.hasOwnProperty.call(skin_json, key)) {
                const item_data = skin_json[key]
                let item_data_group = item_data["group"]
                if (this.group == item_data_group) {
                    list.push(item_data)
                }
            }
        }
        list.sort((a, b) => {
            return a["own_facility"] - b["own_facility"]
        })
        this.scroll_data = this.changeConfigData(list)
        this.initScroll(this.scroll, this.scroll_data)

        this.scroll.scrollToPercentHorizontal(this.scroll_percent)
    }

    private changeConfigData(skin_list: any[]) {
        let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (!skin_data) {
            skin_data = {}
        } else {
            skin_data = JSON.parse(skin_data)
        }

        for (let i = 0; i < skin_list.length; i++) {
            const item_data = skin_list[i]
            let fac_skin_data = skin_data[item_data["own_facility"]]
            let id = item_data["id"]
            if (fac_skin_data) {
                let use_skin_id = fac_skin_data["use_skin_id"]
                if (use_skin_id == id) {
                    item_data["is_use"] = true
                } else {
                    item_data["is_use"] = false
                }
                let have_skin_id_list: any[] = fac_skin_data["have_skin_id_list"]
                if (have_skin_id_list.indexOf(id) != -1) {
                    item_data["is_have"] = true
                } else {
                    item_data["is_have"] = false
                }
            } else {
                let unlock_cost = item_data["unlock_cost"]
                if (unlock_cost == "0") {
                    item_data["is_use"] = true
                    item_data["is_have"] = true
                } else {
                    item_data["is_use"] = false
                    item_data["is_have"] = false
                }
            }
        }

        return skin_list
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
            node.getComponent(SkinGroupItem2).updateView(this.scroll_data[index], this.data["room"])
        }
    }

    public show(data?) {
        this.node.active = true
        this.isShow = true
        let height_half = cc.view.getVisibleSize().height / 2
        this.bg.y = -height_half - this.bg.height - 150
        let end_y = -height_half
        cc.tween(this.bg)
            .to(0.3, { y: end_y })
            .call(() => {
                FacSkinGroup.instance.setCurSkinGroupData(data)
                this.initView(data)
            })
            .start()
    }

    public hide() {
        this.isShow = false
        let height_half = cc.view.getVisibleSize().height / 2
        let end_y = -height_half - this.bg.height - 150
        cc.tween(this.bg)
            .to(0.2, { y: end_y })
            .call(() => {

            })
            .start()
    }

    getIsshow() {
        return this.isShow
    }

    private clickGift() {
        if (this.red.active) {
            let reward = this.data["reward"]
            let list = this._utils.changeConfigData(reward)
            this._dialog_manager.openDialog(this._dialog_name.RewardView, list)

            this.red.active = false
            this.progress_gift.node.active = false

            let group = this.data["group"]
            let reward_data = UserDefault.getItem(this._user.getUID() + GameConstant.SKIN_GROUP_REWARD)
            if (reward_data) {
                reward_data = JSON.parse(reward_data)
                reward_data[group] = true
            } else {
                reward_data = {}
                reward_data[group] = true
            }
            UserDefault.setItem(this._user.getUID() + GameConstant.SKIN_GROUP_REWARD, JSON.stringify(reward_data))

        } else {
            let pos_w = this.progress_gift.node.parent.convertToWorldSpaceAR(this.progress_gift.node.position)
            pos_w.y += this.progress_gift.node.height / 2
            let reward = this._utils.changeConfigData(this.data["reward"])
            let event_data = {
                rewardInfo: reward,
                pos_w: pos_w
            }
            this._event_manager.dispatch(this._event_name.EVENT_SHOW_REWARD_ITEM_INFO, event_data)
        }
    }

    /**
     * 获取初始默认皮肤id
     */
    private getDefaultSkinId(facId: number): number {
        let skin_list = this.getSkinListByFacId(facId)
        for (let i = 0; i < skin_list.length; i++) {
            const item_data = skin_list[i]
            let unlock_cost = item_data["unlock_cost"]
            if (unlock_cost == "0") {
                return item_data["id"]
            }
        }

        return
    }

    /**
     * 获取配置皮肤列表
     */
    private getSkinListByFacId(facId: number) {
        let skin_list = []
        let json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let own_facility = item_data["own_facility"]
                if (facId == own_facility) {
                    skin_list.push(item_data)
                }
            }
        }

        return skin_list
    }

    // update (dt) {}
}
