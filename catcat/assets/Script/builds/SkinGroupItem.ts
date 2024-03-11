import { UserDefault } from "../common/Config";
import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import BuildConfig from "./BuildConfig";
import FacSkinGroup from "./FacSkinGroup";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SkinGroupItem extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    @property(cc.Label)
    ttf_num: cc.Label = null

    private data = null
    private type: number = 1

    // onLoad () {}

    start () {

    }

    updateView(data, type: number) {
        this.data = data
        this.type = type
        // cc.error(data, "data============")
        if (type == 1) {
            let icon = data["icon"]
            let name = data["name"]
            let roomId = data["id"]
            let path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[roomId]}/skin1/${icon}`
            // this._utils.setSpriteFrame(this.icon, path)
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(icon)) {
                    this.icon.spriteFrame = sprite_frame
                }
            })

            this.ttf_name.string = `${name}`
        }else if (type == 2) {
            let icon = data["icon"]
            let name = data["name"]
            this.ttf_name.string = `${name}`
            let path = `pic/fac_skin/${icon}`
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.icon)) {
                    this.icon.spriteFrame = sprite_frame
                }
            })
            let group = data["group"]
            let skin_json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
            let list = []
            for (const key in skin_json) {
                if (Object.prototype.hasOwnProperty.call(skin_json, key)) {
                    const item_data = skin_json[key]
                    let item_data_group = item_data["group"]
                    if (group == item_data_group) {
                        list.push(item_data)
                    }
                }
            }
            // cc.error(list, "list===========")
            let have_num = 0
            let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)

            if (skin_data) {
                skin_data = JSON.parse(skin_data)
                for (let i = 0; i < list.length; i++) {
                    const item_data = list[i]
                    let facId = item_data["own_facility"]

                    let fac_skin_data = skin_data[facId]
                    if (fac_skin_data) {
                        let skin_id = item_data["id"]
                        let have_skin_id_list: any[] = fac_skin_data["have_skin_id_list"]
                        if (have_skin_id_list.indexOf(skin_id) != -1) {
                            have_num += 1
                        }
                    }
                }
            }

            UserDefault.setItem(BuildConfig.fac_skin_data, JSON.stringify(skin_data))

            this.ttf_num.node.active = true
            this.ttf_num.string = `${have_num}/${list.length}`
        }
    }

    private clickItem() {
        if (this.type == 1) {
            FacSkinGroup.instance.facSkinGroupRoom.show(this.data["id"])
            MapGridView.instance.moveToRoomPosByRoomId(this.data["id"])
        }
        else if (this.type == 2) {
            FacSkinGroup.instance.facSkinGroupSkin.show(this.data)
            FacSkinGroup.instance.setTopBtnState(true)
        }
    }

    // update (dt) {}
}
