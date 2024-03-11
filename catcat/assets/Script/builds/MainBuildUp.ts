import MyComponent from "../common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainBuildUp extends MyComponent {

    @property(cc.Label)
    ttf_lv: cc.Label = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    @property(cc.Node)
    layout_item: cc.Node = null

    @property(cc.Node)
    ttf_max: cc.Node = null

    @property(cc.Node)
    light: cc.Node = null

    private data = null

    onLoad() {
        this.data = this.getDialogData()
        cc.tween(this.light).repeatForever(
            cc.tween().by(1, { angle: -60 })
        ).start()
        this._audio_manager.playEffect(this._audio_name.UNLOCK);
    }

    start() {
        if (this.data) {
            let cur_data = this.data["cur_data"]
            let next_list = this.data["next_list"]

            this.ttf_lv.string = `${this._user.getLevel()}级`
            let path = `main_scene/pic/main_build/${cur_data["build_res"]}`
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.icon)) {
                    this.icon.spriteFrame = sprite_frame

                    let scale = this._utils.getNeedSceleBySprite(this.icon, 594, 426)
                    this.icon.node.scale = scale
                }
            })

            this.ttf_name.string = cur_data["build_name"]

            if (next_list.length <= 0) {
                this.ttf_max.active = true
                this.layout_item.active = false
            } else {
                this.ttf_max.active = false
                this.layout_item.active = true

                let item_list = this.layout_item.children
                for (let i = 0; i < next_list.length; i++) {
                    const item_data = next_list[i]
                    let node = item_list[i]
                    if (cc.isValid(node)) {
                        node.active = true
                        let name = node.getChildByName("Name").getComponent(cc.Label)
                        name.string = item_data["build_name"]
                        let icon_node = cc.find("Mask/Icon", node)
                        let icon = icon_node.getComponent(cc.Sprite)
                        let path = `main_scene/pic/main_build/${item_data["build_res"]}`
                        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                            if (cc.isValid(icon)) {
                                icon.spriteFrame = sprite_frame

                                if (item_data["build_res"] == "zhujianzhu_5") {
                                    icon_node.scale = 0.15
                                } else {
                                    icon_node.scale = 0.25
                                }
                            }
                        })
                    }
                }
            }
        }
    }

    // update (dt) {}
}
