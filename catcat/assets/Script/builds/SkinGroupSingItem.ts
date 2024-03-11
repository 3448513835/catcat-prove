import MyComponent from "../common/MyComponent";
import BuildConfig from "./BuildConfig";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SkinGroupSingItem extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    private skin_num: number = null

    // onLoad () {}

    start() {

    }

    // facId: ,
    // skin_num: ,
    // isShow: 
    initView(data) {
        if (data["skin_num"]) {
            this.skin_num = data["skin_num"]
        }
        let facId = data["facId"]
        let skin_data = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        let item_data
        for (const key in skin_data) {
            if (Object.prototype.hasOwnProperty.call(skin_data, key)) {
                const temp_data = skin_data[key]
                let own_facility = temp_data["own_facility"]
                let set = temp_data["set"]
                if (this.skin_num == set && own_facility == facId) {
                    item_data = temp_data
                }
            }
        }
        if (item_data) {
            let fac_data = this._json_manager.getJsonData(this._json_name.FACILITY, facId)
            let roomId = fac_data["owning_room"]
            let set = item_data["set"]
            let path = ""
            if (set < 3) {
                path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[roomId]}/skin1/${item_data["icon"]}`
            } else {
                path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[roomId]}/skin${set}/${item_data["icon"]}`
            }

            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.icon)) {
                    this.icon.spriteFrame = sprite_frame
                }
            })

            this.ttf_name.string = item_data["name"]
        }
    }

    // update (dt) {}
}
