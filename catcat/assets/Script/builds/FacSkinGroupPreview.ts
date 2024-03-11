import MyComponent from "../common/MyComponent";
import FacSkinGroup from "./FacSkinGroup";


const {ccclass, property} = cc._decorator;

@ccclass
export default class FacSkinGroupPreview extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    // onLoad () {}

    start () {

    }

    public initView(data) {
        // cc.error(data, "data==========")
        let icon = data["icon"]
        let name = data["name"]
        this.ttf_name.string = `${name}`
        let path = `pic/fac_skin/${icon}`
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
            }
        })
    }

    private clickBack() {
        FacSkinGroup.instance.changeUseSkin()
        FacSkinGroup.instance.setPreview(false)
    }

    // update (dt) {}
}
