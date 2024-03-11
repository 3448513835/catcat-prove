import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class EventGiftView extends MyComponent {

    @property(cc.Label)
    ttf_time: cc.Label = null

    @property([cc.Node])
    item_list: cc.Node[] = []

    private data = null
    private end_time: number = null
    private reward_list = null
    private show_item_list: cc.Node[] = []

    onLoad() {
        this.data = this.getDialogData()
    }

    start() {
        if (this.data) {
            this.end_time = this.data["end_time"]
            let now_time = Date.now()
            if (this.end_time > now_time) {
                this.tickTime()
                this.schedule(this.tickTime, 1)
            } else {
                this.close()
            }

            let gift_data = this.data["gift_data"]
            let event_reward = gift_data["event_reward"]
            let reward_list = this._utils.changeConfigData(event_reward)
            this.reward_list = reward_list
            for (let i = 0; i < this.item_list.length; i++) {
                const node = this.item_list[i]
                let item_data = reward_list[i]
                if (item_data) {
                    node.active = true
                    let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                    let num = node.getChildByName("Num").getComponent(cc.Label)
                    let item_id = item_data["item_id"]
                    let item_num = item_data["item_num"]
                    let path = this._utils.getItemPathById(item_id)
                    this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                        if (cc.isValid(icon)) {
                            icon.spriteFrame = sprite_frame
                            let item_type = this._utils.getItemTypeById(item_id)
                            if (item_type == 1) icon.node.scale = 0.5
                        }
                    })
                    num.string = item_num

                    node["item_id"] = item_id
                    node["item_num"] = item_num

                    this.show_item_list.push(node)
                } else {
                    node.active = false
                }
            }
        }
    }

    private tickTime() {
        if (this.end_time) {
            let now_time = Date.now()
            let diff_time = Math.ceil((this.end_time - now_time) / 1000)
            if (diff_time > 0) {
                this.ttf_time.string = this._utils.formatTimeForSecond(diff_time)
            } else {
                this.unschedule(this.tickTime)
                this.close()
            }
        }
    }

    private click() {
        if (this._user.getVideo() > 0) {
            this._utils.addResNum(GameConstant.res_id.video, -1);
            for (let j = 0; j < this.show_item_list.length; j++) {
                const node = this.show_item_list[j]
                let pos_w = node.parent.convertToWorldSpaceAR(node.position)
                let event_data = {
                    pos_w: pos_w,
                    item_id: node["item_id"],
                    item_num: Number(node["item_num"]),
                }
                this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, event_data)
            }
            this._event_manager.dispatch(this._event_name.EVENT_REMOVE_EVENT_GIFT)
            this.close()
        }
        else {
            this._ad_manager.setAdCallback(() => {
                for (let j = 0; j < this.show_item_list.length; j++) {
                    const node = this.show_item_list[j]
                    let pos_w = node.parent.convertToWorldSpaceAR(node.position)
                    let event_data = {
                        pos_w: pos_w,
                        item_id: node["item_id"],
                        item_num: Number(node["item_num"]),
                    }
                    this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, event_data)
                }
                this._net_manager.requestTablog(this._config.statistic.CATGIFT1);
                this._event_manager.dispatch(this._event_name.EVENT_REMOVE_EVENT_GIFT)
                this.close()
            });

            this._net_manager.requestTablog(this._config.statistic.CATGIFT0);
            this._ad_manager.showAd();
        }
    }

    // update (dt) {}
}
