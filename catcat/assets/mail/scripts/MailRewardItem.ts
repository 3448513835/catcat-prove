import MyComponent from "../../Script/common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class MailRewardItem extends MyComponent {

    @property(cc.Label)
    ttf_num: cc.Label = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Node)
    mask: cc.Node = null

    // onLoad () {}

    start () {

    }

    updateView(data, isGet) {
        this.mask.active = isGet
        this.ttf_num.string = data["item_num"]
        let path = this._utils.getItemPathById(data["item_id"])
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
                let item_type = this._utils.getItemTypeById(data["item_id"])
                if (item_type == 1) {
                    this.icon.node.scale = 0.3
                }else {
                    this.icon.node.scale = 0.5
                }
            }
        })
    }

    // update (dt) {}
}
