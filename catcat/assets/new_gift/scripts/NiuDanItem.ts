import MyComponent from "../../Script/common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NiuDanItem extends MyComponent {

    @property(cc.Sprite)
    bg: cc.Sprite = null

    @property(cc.Sprite)
    bg2: cc.Sprite = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_num: cc.Label = null

    @property(cc.Node)
    big_reward: cc.Node = null

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    @property([cc.SpriteFrame])
    bg_frames: cc.SpriteFrame[] = []

    private data = null

    // onLoad () {}

    start() {

    }

    updateView(data) {
        this.data = data
        let big_reward = data["big_reward"]
        this.big_reward.active = big_reward == 1
        // this.dragon.node.active = big_reward == 1
        this.bg.node.active = !(big_reward == 1)
        this.bg2.node.active = big_reward == 1
        let reward_item = data["reward_item"]
        let arr = reward_item.split(":")
        let item_id = arr[0]
        let item_num = arr[1]
        this.ttf_num.string = item_num
        let path = this._utils.getItemPathById(item_id)
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
                let item_type = this._utils.getItemTypeById(item_id)
                if (item_type == 1) this.icon.node.scale = 0.3
            }
        })
    }

    // update (dt) {}
}
