import BuildConfig from "../../Script/builds/BuildConfig";
import MyComponent from "../../Script/common/MyComponent";
import GuideManager from "../../Script/common/GuideManager";
import ChangeScene from "../../Script/main/ChangeScene";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskSingleItem extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Sprite)
    reward_icon: cc.Sprite = null

    @property(cc.Label)
    reward_num: cc.Label = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    private isRoom: boolean = false
    private roomId: number = 0
    private facId: number = 0
    private isSceneBuild: boolean = false
    private sceneBuildId: number = 0
    private isSceneRubbish: boolean = false
    private sceneRubbishId: number = 0

    // onLoad () {}

    start() {

    }

    public initItem(data) {
        // cc.error(data, "data=-==========")
        this.ttf_name.string = data["name"]
        let type = data["type"]
        let unlock = data["unlock"]
        if (type == 1) {
            // 房间
            let json = this._json_manager.getJsonData(this._json_name.ROOM, unlock)
            let unlock_cost = json["unlock_cost"]
            let arr = unlock_cost.split(":")
            let cost_data = {
                id: arr[0],
                num: arr[1]
            }
            this.reward_num.string = "x" + cost_data["num"]
            let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
            this._utils.setSpriteFrame(this.reward_icon, `pic/icon/${json_item["icon"]}`)

            let icon = json["icon"]
            let path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[unlock]}/skin1/${icon}`
            this._utils.setSpriteFrame(this.icon, path)

            this.isRoom = true
            this.roomId = unlock
        }
        else if (type == 2) {
            // 设施
            let json = this._json_manager.getJsonData(this._json_name.FACILITY, unlock)
            let unlock_cost = json["unlock_cost"]
            let arr = unlock_cost.split(":")
            let cost_data = {
                id: arr[0],
                num: arr[1]
            }
            this.reward_num.string = "x" + cost_data["num"]
            let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
            this._utils.setSpriteFrame(this.reward_icon, `pic/icon/${json_item["icon"]}`)

            let icon = json["icon"]
            let roomId = json["owning_room"]
            let path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[roomId]}/skin1/${icon}`
            this._utils.setSpriteFrame(this.icon, path)

            this.isRoom = true
            this.roomId = roomId
            this.facId = unlock
        }
        else if (type == 3) {
            // 场景建筑
            // cc.error(data, "data=-==========")
            let json = this._json_manager.getJson(this._json_name.SCENE_BUILD_BASE)
            // let build_group = json["build_group"]
            let item_data = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_LV, Number(unlock) - 1)
            if (!item_data) return
            // let lv_list = []
            // for (const key in json_lv) {
            //     if (Object.prototype.hasOwnProperty.call(json_lv, key)) {
            //         const item_data = json_lv[key]
            //         if (Number(build_group) == item_data["build_group"]) {
            //             lv_list.push(item_data)
            //         }
            //     }
            // }
            // lv_list.sort((a, b) => {
            //     return a["build_lv"] - b["build_lv"]
            // })

            // let item_data = lv_list[0]
            let unlock_cost = item_data["consume_item"]
            let arr = unlock_cost.split(":")
            let cost_data = {
                id: arr[0],
                num: arr[1]
            }
            this.reward_num.string = "x" + cost_data["num"]

            let item_build_group = item_data["build_group"]
            let buildId
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    const cur_data = json[key]
                    let build_group = cur_data["build_group"]
                    if (item_build_group == build_group) {
                        buildId = cur_data["id"]
                        break
                    }
                }
            }

            let path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[buildId]}/${item_data["build_res"]}`
            this._utils.setSpriteFrame(this.icon, path)

            this.isSceneBuild = true
            this.sceneBuildId = unlock
        }
        else if (type == 4) {
            // cc.error(data, "data=========")
            // 场景垃圾
            let item_data = this._json_manager.getJsonData(this._json_name.SCENE_RUBBISH, unlock)
            let unlock_cost = item_data["cost"]
            let arr = unlock_cost.split(":")
            let cost_data = {
                id: arr[0],
                num: arr[1]
            }
            this.reward_num.string = "x" + cost_data["num"]

            let path = `pic/scene_rubbish/${item_data["icon"]}`
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.icon)) {
                    this.icon.spriteFrame = sprite_frame
                    let scale = this._utils.getNeedSceleBySprite(this.icon, 160, 160)
                    this.icon.node.scale = scale
                }
            })

            this.isSceneRubbish = true
            this.sceneRubbishId = unlock
        }
    }

    private clickGo() {
        let data = {
            isRoom: this.isRoom,
            roomId: this.roomId,
            facId: this.facId,
            isSceneBuild: this.isSceneBuild,
            sceneBuildId: this.sceneBuildId,
            isSceneRubbish: this.isSceneRubbish,
            sceneRubbishId: this.sceneRubbishId
        }
        let guide_id = GuideManager.getGuideId();
        if (guide_id == 9) {
            GuideManager.setGuideId(GuideManager.GuideConfig[guide_id].next);
            GuideManager.closeGuideDialog(guide_id);
            GuideManager.setGuideMask(true);
        }
        if (cc.director.getScene().name == "Main") {
            this._event_manager.dispatch(this._event_name.EVENT_TASK_MOVE_MAP_TO_POS, data)
            this._dialog_manager.closeDialog(this._dialog_name.TaskView)
        } else {
            let _user = this._user;
            let _dialog_manager = this._dialog_manager;
            let _dialog_name = this._dialog_name;
            let func = () => {
                _user.setTaskJumpData(data)
                _dialog_manager.closeDialog(_dialog_name.TaskView)
                cc.director.loadScene("Main")
            }
            ChangeScene.instance.enter(func)
        }
    }

    // update (dt) {}
}
