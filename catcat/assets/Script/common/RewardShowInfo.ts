import MyComponent from "../../Script/common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RewardShowInfo extends MyComponent {

    @property(cc.Sprite)
    bg: cc.Sprite = null

    @property(cc.Layout)
    layout_item: cc.Layout = null

    @property([cc.Node])
    item_list: cc.Node[] = []

    private arrow_height: number = 26

    onLoad() {
        this.node.active = false;
        this.listen(this._event_name.EVENT_SHOW_REWARD_ITEM_INFO, this.showRewardInfo, this)
        this.listen(this._event_name.EVENT_CLICK_SCREEN, this.onClickScreen, this)
    }

    start() {

    }

    private showRewardInfo(data: { rewardInfo: object, pos_w: cc.Vec3 }) {
        if (!this.node.active) {
            this.node.active = true
            let position = this.node.parent.convertToNodeSpaceAR(data.pos_w)
            position.y += this.node.height / 2 + this.arrow_height
            this.node.setPosition(position)

            this.setItemList(data.rewardInfo)
        }
        // else {
        //     this.node.active = false
        // }
    }

    private setItemList(data) {
        for (let i = 0; i < this.item_list.length; i++) {
            const node = this.item_list[i]
            let item_data = data[i]
            if (item_data) {
                node.active = true
                let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                let num = node.getChildByName("Num").getComponent(cc.Label)
                let item_num = item_data["item_num"]
                num.string = `x${item_num}`

                let item_id = item_data["item_id"]
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(icon)) {
                        icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) icon.node.scale = 0.3
                    }
                })
            }
            else {
                node.active = false
            }
        }

        this.scheduleOnce(() => {
            this.bg.node.width = this.layout_item.node.width + 33
        })
    }

    private onClickScreen() {
        if (this.node.active) {
            this.node.active = false
        }
    }

    // update (dt) {}
}
