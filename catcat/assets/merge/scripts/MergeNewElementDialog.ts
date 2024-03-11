import MyComponent from "../../Script/common/MyComponent";

const {ccclass, property} = cc._decorator;
@ccclass
export default class MergeNewElementDialog extends MyComponent {

    @property(cc.Node)
    private light_node: cc.Node = null
    @property(cc.Label)
    private name_label: cc.Label = null
    @property(cc.Sprite)
    private icon_sprite: cc.Sprite = null

    onLoad () {
        super.onLoad && super.onLoad();
        this._audio_manager.playEffect(this._audio_name.UNLOCK);
        cc.tween(this.light_node).repeatForever(
            cc.tween().by(1, { angle: -60 })
        ).start()
        let element_id = this.getDialogData();
        let json_data = this._json_manager.getJsonData(this._json_name.ELE, element_id);
        this._resource_manager.getSpriteFrame(`merge/ele/${json_data.icon}`).then((sprite_frame) => {
            if (cc.isValid(this.icon_sprite)) {
                this.icon_sprite.spriteFrame = sprite_frame;
            }
        });
        this.name_label.string = json_data.name;
    }
}
