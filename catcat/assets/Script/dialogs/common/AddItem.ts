import MyComponent from "../../common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddItem extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_num: cc.Label = null

    // onLoad () {}

    start() {

    }

    init(data, endPos: cc.Vec3) {
        let item_id = data["item_id"]
        let item_num = `+${data["item_num"]}`
        this.ttf_num.string = item_num
        let json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, item_id)
        this._utils.setSpriteFrame(this.icon, `pic/icon/${json["icon"]}`)
        let time = cc.Vec2.distance(this.node.position, endPos) / 1500
        let sub_pos = cc.v2((endPos.x - this.node.position.x) / 4, (endPos.y - this.node.y) / 4)
        let x = -200
        cc.tween(this.node)
            .delay(0.2)
            .bezierTo(time, cc.v2(x + this.node.x, this.node.y), cc.v2(x + endPos.x, endPos.y), cc.v2(endPos.x, endPos.y))
            .call(() => {
                this.node.destroy()
            })
            .start()
    }

    moveToHeight(data) {
        this._audio_manager.playEffect(this._audio_name.CURRENCY)

        let item_id = data["item_id"]
        let item_num = `${data["item_num"]}`
        this.ttf_num.string = item_num
        let path = this._utils.getItemPathById(item_id)
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
                let item_type = this._utils.getItemTypeById(item_id)
                if (item_type == 1) this.icon.node.scale = 0.3
            }
        })

        cc.tween(this.node)
            .to(0.3, {y: this.node.y + 120})
            .delay(0.1)
            .call(() => {
                if (data["callBack"]) data["callBack"]()
                this.node.destroy()
            })
            .start()
    }

    // update (dt) {}
}
