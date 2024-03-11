import { UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyButton from "../../Script/common/MyButton";
import MyComponent from "../../Script/common/MyComponent";
import MyScrollView from "../../Script/common/MyScrollView";
import DialyAdItem from "./DialyAdItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DialyAd extends MyComponent {

    @property(MyScrollView)
    scroll: MyScrollView = null

    @property(cc.Label)
    time_num: cc.Label = null

    @property([cc.Node])
    item_list: cc.Node[] = []

    @property(cc.Label)
    look_num: cc.Label = null

    @property(MyButton)
    btn_other_get: MyButton = null

    private scroll_data = []
    private other_reward_nun: number = 0
    private other_reward = []
    private get_data_info = {}

    private init_pop_type = null

    onLoad() {
        let event_data = this.getDialogData()
        if (event_data) {
            this.init_pop_type = event_data["init_pop_type"]
        }

        let data = UserDefault.getItem(this._user.getUID() + GameConstant.DIALY_AD_GET_DATA)
        if (data) {
            this.get_data_info = JSON.parse(data)
        } else {
            this.get_data_info = {}
        }

        let time = UserDefault.getItem(this._user.getUID() + GameConstant.DIALY_AD_RECOVER_TIME)
        if (time) {
            let isNewDay = this._utils.isNewDay(Number(time))
            if (isNewDay) {
                this.get_data_info = {}
            }
        }

        UserDefault.setItem(this._user.getUID() + GameConstant.DIALY_AD_GET_DATA, JSON.stringify(this.get_data_info))
        UserDefault.setItem(this._user.getUID() + GameConstant.DIALY_AD_RECOVER_TIME, Date.now())

        this.listen(this._event_name.EVENT_GET_DIALY_AD_REWARD, this.getReward, this)
    }

    start() {
        this.refreshScroll()
        this.setOtherReward()
        this.setOtherBtn()
    }

    private refreshScroll() {
        let list = []
        let json = this._json_manager.getJson(this._json_name.DAILY_AD)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                if (this.get_data_info[key]) {
                    item_data["is_get"] = true
                } else {
                    item_data["is_get"] = false
                }
                list.push(item_data)
            }
        }

        let list1 = []
        let list2 = []
        for (let i = 0; i < list.length; i++) {
            const item_data = list[i]
            if (item_data["is_get"]) {
                list1.push(item_data)
            } else {
                list2.push(item_data)
            }
        }
        this.scroll_data = []
        this.scroll_data.push(...list2, ...list1)
        this.initScroll(this.scroll, this.scroll_data)
    }

    private setOtherBtn() {
        let num = 0
        for (const key in this.get_data_info) {
            if (Object.prototype.hasOwnProperty.call(this.get_data_info, key)) {
                const is_get = this.get_data_info[key]
                if (key != "other" && is_get) {
                    num += 1
                }
            }
        }
        
        this.look_num.string = `${num}/${this.other_reward_nun}`

        if (this.get_data_info["other"]) {
            this.btn_other_get.interactable = false
        } else {
            if (num >= this.other_reward_nun) {
                this.btn_other_get.interactable = true
            }else {
                this.btn_other_get.interactable = false
            }
        }
    }

    private clickOtherBtn() {
        if (this.btn_other_get.interactable) {
            this.btn_other_get.interactable = false
            this._dialog_manager.openDialog(this._dialog_name.RewardView, this.other_reward)
            this.get_data_info["other"] = true
            UserDefault.setItem(this._user.getUID() + GameConstant.DIALY_AD_GET_DATA, JSON.stringify(this.get_data_info))
            
            this._event_manager.dispatch(this._event_name.EVENT_CHECK_RED)
        }
    }

    private getReward(data) {
        let id = data["id"]
        let reward = data["reward"]
        this.get_data_info[id] = true

        this._dialog_manager.openDialog(this._dialog_name.RewardView, reward)

        this.setOtherBtn()
        UserDefault.setItem(this._user.getUID() + GameConstant.DIALY_AD_GET_DATA, JSON.stringify(this.get_data_info))
        this.refreshScroll()
        this._event_manager.dispatch(this._event_name.EVENT_CHECK_RED)

        // if (this.get_data_info["other"]) {
        //     this._dialog_manager.openDialog(this._dialog_name.RewardView, reward)
        // }else {
        //     let num = 0
        //     for (const key in this.get_data_info) {
        //         if (Object.prototype.hasOwnProperty.call(this.get_data_info, key)) {
        //             const is_get = this.get_data_info[key]
        //             if (key != "other" && is_get) {
        //                 num += 1
        //             }
        //         }
        //     }
        //     if (num >= this.other_reward_nun) {
        //         reward.push(...this.other_reward)
        //         this.get_data_info["other"] = true
        //     }
        //     let temp_data = {}
        //     let copy_list = this._utils.clone(reward)
        //     for (let i = 0; i < copy_list.length; i++) {
        //         const item_data = copy_list[i]
        //         let id = item_data["item_id"]
        //         if (temp_data[id]) {
        //             let num = Number(temp_data[id]["item_num"]) + Number(item_data["item_num"])
        //             temp_data[id]["item_num"] = num
        //         }else {
        //             temp_data[id] = item_data
        //         }
        //     }
        //     let need_list = []
        //     for (const key in temp_data) {
        //         if (Object.prototype.hasOwnProperty.call(temp_data, key)) {
        //             const item_data = temp_data[key]
        //             need_list.push(item_data)
        //         }
        //     }
        //     this._dialog_manager.openDialog(this._dialog_name.RewardView, need_list)
        // }
    }

    private setOtherReward() {
        let json = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10019)
        this.other_reward_nun = json["int_para"]
        this.time_num.string = `观看${this.other_reward_nun}次可领取奖励`
        this.other_reward = this._utils.changeConfigData(json["str_para"])

        for (let j = 0; j < this.item_list.length; j++) {
            const node = this.item_list[j]
            let item_data = this.other_reward[j]
            if (item_data) {
                node.active = true
                let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                let num = node.getChildByName("Num").getComponent(cc.Label)
                // let name = node.getChildByName("Name").getComponent(cc.Label)
                num.string = item_data["item_num"]

                let item_id = item_data["item_id"]
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(icon)) {
                        icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) {
                            icon.node.scale = 0.4
                        } else {
                            icon.node.scale = 0.7
                        }
                    }
                })

            } else {
                node.active = false
            }
        }
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
            node.getComponent(DialyAdItem).updateView(this.scroll_data[index])
        }
    }

    onDestroy () {
        if (this.init_pop_type) {
            this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEXT_POP_VIEW, this.init_pop_type)
        }
        super.onDestroy && super.onDestroy()
    }

    // update (dt) {}
}
