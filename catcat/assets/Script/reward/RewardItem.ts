import MyComponent from "../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class RewardItem extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_num: cc.Label = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    // onLoad () {}

    start () {

    }

    updateView(data) {
        let item_id = data["item_id"]
        let item_num = data["item_num"]

        this.ttf_num.string = item_num
        this.ttf_name.string = this._utils.getItemNameById(item_id)

        let path = this._utils.getItemPathById(item_id)
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
                let item_type = this._utils.getItemTypeById(item_id)
                if (item_type == 1) {
                    this.icon.node.scale = 0.5
                }else {
                    this.icon.node.scale = 0.6
                }
            }
        })

        this._utils.addResNum(item_id, Number(item_num))
    }

    // update (dt) {}
}
