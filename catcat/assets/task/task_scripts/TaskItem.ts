
import { Holder } from "../adapter/abstract/Holder";
import { HolderEvent } from "../adapter/define/enum";
import MyButton from "../../Script/common/MyButton";
import MyComponent from "../../Script/common/MyComponent";
import TaskSingleItem from "./TaskSingleItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskItem extends MyComponent {

    @property(cc.Sprite)
    bg: cc.Sprite = null

    @property(cc.Sprite)
    bg2: cc.Sprite = null

    @property(cc.Node)
    progress_mask: cc.Node = null

    @property(cc.Node)
    progress_bar: cc.Node = null

    @property(cc.Label)
    progress_percent: cc.Label = null

    @property([cc.Node])
    gift_list: cc.Node[] = []

    @property(cc.Label)
    ttf_name: cc.Label = null

    @property(cc.Node)
    template_item: cc.Node = null

    @property(cc.Layout)
    layout_item: cc.Layout = null

    @property(cc.Node)
    tipLevel: cc.Node = null

    @property(cc.Label)
    tipLevel_level: cc.Label = null

    @property(cc.Label)
    tipLevel_tip: cc.Label = null

    @property(cc.Node)
    jindu: cc.Node = null

    @property(cc.Node)
    noLevel: cc.Node = null

    @property(cc.Label)
    noLevel_des: cc.Label = null

    @property([cc.SpriteFrame])
    bg_frames: cc.SpriteFrame[] = []

    @property(cc.Animation)
    ani: cc.Animation = null

    private data = null
    private _holder: Holder = null
    private node_init_height: number = 186
    private node_init_height_level_tip: number = 331
    private template_item_height: number = 227
    private reward_change_list = []
    private bg2_init_height: number = 186
    private bg2_init_height_level_tip: number = 160

    onLoad() {
        this.node.on(HolderEvent.CREATED, this.onCreated, this)
        this.node.on(HolderEvent.VISIBLE, this.onVisible, this)
        this.node.on(HolderEvent.DISABLE, this.onDisabled, this)
    }

    private onCreated() {

    }

    private onVisible(holder: Holder) {
        // cc.error("我收到了显示", holder.data)
        this.data = holder.data
        this._holder = holder

        // holder.view.adapter.modelManager.remove(holder.index)

        // let groupId = this.data["groupId"]

        let box_data = this.data["box_data"]

        let unlock_lv = box_data["levle"]
        let group_name = box_data["group_name"]
        this.ttf_name.string = group_name

        // cc.error(box_data, "box_data=========")
        let progress = box_data["progress"]
        let percent_self = progress["self"]
        let percent_total = progress["total"]
        let percent = percent_self / percent_total
        this.progress_mask.width = this.progress_bar.width * percent
        this.progress_percent.string = `${Math.floor(percent * 100)}%`

        let rewardLists = box_data["rewardLists"]
        this.reward_change_list = []
        for (const key in rewardLists) {
            if (Object.prototype.hasOwnProperty.call(rewardLists, key)) {
                const data = rewardLists[key]
                data["send_key"] = key
                this.reward_change_list.push(data)
            }
        }

        let percent_num = percent_self / percent_total * 100
        for (let i = 0; i < this.gift_list.length; i++) {
            const node = this.gift_list[i]
            let node_data = this.reward_change_list[i]
            if (node_data) {
                node.active = true
                let proportion = node_data["proportion"]
                let pos_x = this.progress_bar.width * proportion / 100
                node.x = pos_x

                let isGet = node_data["isGet"]
                let icon2 = node.getChildByName("icon2")
                let ani = icon2.getComponent(cc.Animation)
                let icon_sprite = icon2.getChildByName("icon").getComponent(cc.Sprite)
                
                if (percent_num >= proportion) {
                    if (isGet) {
                        ani.play("task_gift_init")
                        
                        icon_sprite.setMaterial(0, cc.Material.getBuiltinMaterial("2d-gray-sprite"))
                    } else {
                        ani.play("icon2")
                        icon_sprite.setMaterial(0, cc.Material.getBuiltinMaterial("2d-sprite"))
                    }
                }else {
                    ani.play("task_gift_init")
                    icon_sprite.setMaterial(0, cc.Material.getBuiltinMaterial("2d-sprite"))
                }
            } else {
                node.active = false
            }
        }

        this.tipLevel.active = false

        this.layout_item.node.removeAllChildren()
        let task_data = this.data["task_data"]
        if (task_data.length > 0) {
            for (let i = 0; i < task_data.length; i++) {
                const item_data = task_data[i]
                let node_item = cc.instantiate(this.template_item)
                node_item.active = true
                node_item.getComponent(TaskSingleItem).initItem(item_data)
                this.layout_item.node.addChild(node_item)
            }
            let y = this.layout_item.paddingTop + this.layout_item.paddingBottom
            y += task_data.length * (this.template_item_height + this.layout_item.spacingY)
            this.node.height = this.node_init_height + y
            this.bg2.node.width = this.bg2_init_height
            this.bg2.spriteFrame = this.bg_frames[0]

            this.jindu.active = true
            this.noLevel.active = false
        } else {
            let my_lv = this._user.getLevel()
            if (my_lv >= unlock_lv) {
                this.node.height = this.node_init_height
                this.bg2.node.width = this.bg2_init_height
                this.bg2.spriteFrame = this.bg_frames[1]
                this.jindu.active = true
                this.noLevel.active = false
            }else {
                this.node.height = this.node_init_height_level_tip
                this.bg2.node.width = this.bg2_init_height_level_tip
                this.bg2.spriteFrame = this.bg_frames[0]

                this.tipLevel.active = true
                this.tipLevel_level.string = unlock_lv

                this.jindu.active = false
                this.noLevel.active = true
                this.noLevel_des.string = box_data["des"] || ""
            }
            
        }
        this.bg.node.height = this.node.height
    }

    private onDisabled() {

    }

    start() {
        this.listen(this._event_name.SOCKET_TASK_REWARD, this.getReward, this)
    }

    private getReward(data) {
        if (!this.node.active) return
        // cc.error(data, "dadta==========")
        let groupId = data["groupId"]
        if (groupId == this.data["groupId"]) {
            let rewardId = data["rewardId"]
            for (let i = 0; i < this.reward_change_list.length; i++) {
                const element = this.reward_change_list[i]
                if (rewardId == element["send_key"]) {
                    // cc.error(rewardId, groupId, "dump==========11")
                    let reward = data["reward"]
                    let node = this.gift_list[i]
                    let pos_w = node.parent.convertToWorldSpaceAR(node.position)
                    for (let j = 0; j < reward.length; j++) {
                        const item_data = reward[j]
                        let temp_data = {
                            pos_w: pos_w,
                            item_id: item_data["item_id"],
                            item_num: item_data["item_num"],
                            standingTime: 0.3,
                        }
                        this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, temp_data)
                    }
                    break
                }
            }
        }
    }

    private clickGift(...params) {
        let index = params[1]
        let node: cc.Node = params[0].currentTarget

        let box_data = this.data["box_data"]
        let progress = box_data["progress"]
        let percent_self = progress["self"]
        let percent_total = progress["total"]
        let percent = percent_self / percent_total * 100

        let data = this.reward_change_list[index]
        let proportion = data["proportion"]
        if (percent >= proportion) {
            let isGet = data["isGet"]
            if (isGet) {
                // node.getComponent(MyButton).interactable = false

                let reward = data["reward"]

                let pos_w = node.parent.convertToWorldSpaceAR(node.position)
                pos_w.y += node.height / 2
                let event_data = {
                    rewardInfo: reward,
                    pos_w: pos_w
                }
                this._event_manager.dispatch(this._event_name.EVENT_SHOW_REWARD_ITEM_INFO, event_data)
            } else {
                let rewardId = data["send_key"]
                let groupId = this.data["groupId"]
                this._net_manager.requestTaskReward(rewardId, groupId)
            }
        } else {
            let reward = data["reward"]

            let pos_w = node.parent.convertToWorldSpaceAR(node.position)
            pos_w.y += node.height / 2
            let event_data = {
                rewardInfo: reward,
                pos_w: pos_w
            }
            this._event_manager.dispatch(this._event_name.EVENT_SHOW_REWARD_ITEM_INFO, event_data)
        }
    }

    public playRemoveAction(callBack: Function) {
        this.ani.off("finished")
        this.ani.on("finished", () => {
            if (callBack) callBack()
        })
        this.ani.play()
        
    }

    // update (dt) {}
}
