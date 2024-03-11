

import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import BuildBubble from "./BuildBubble";
import BuildConfig from "./BuildConfig";
import FacClear from "./FacClear";
import SceneRubbishMgr from "./SceneRubbishMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneRubbish extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    private rubbish_pos = {
        1: cc.v3(315, 700),
        2: cc.v3(-183, 706),
        3: cc.v3(-465, 456),
        4: cc.v3(-185, 251),
        5: cc.v3(153, 155),
        6: cc.v3(428, 288),
        7: cc.v3(-489, -80),
        8: cc.v3(-774, -234),
        9: cc.v3(-1426, 1045),
        10: cc.v3(-816, 1151),
        11: cc.v3(-468, 1032),
        12: cc.v3(-1155, 466),
        13: cc.v3(-977, 1790),
        14: cc.v3(-1570, 524),
        15: cc.v3(-2408, 989),
        16: cc.v3(-2339, 66),
        17: cc.v3(-148, 1885),
        18: cc.v3(857, 1288),
        19: cc.v3(1129, 1103),
        20: cc.v3(1674, 462),
        21: cc.v3(986, 318),
        22: cc.v3(1509, 2),
        23: cc.v3(1601, -201),
        24: cc.v3(1751, -468),
        25: cc.v3(1971, -28),
        26: cc.v3(847, -346),
        27: cc.v3(-349, -470),
        28: cc.v3(-1202, -308),
        29: cc.v3(-1768, -215),
        30: cc.v3(-2221, -404),
        31: cc.v3(-1593, -1443),
        32: cc.v3(-1030, -1734),
    }

    private data = null
    private rubbish_id = null

    // onLoad () {}

    start() {

    }

    init(data) {
        this.data = data
        this.rubbish_id = data["id"]
        let icon = data["icon"]
        let sort = data["sort"]
        this.node.position = this.rubbish_pos[sort]
        let path = `pic/scene_rubbish/${icon}`
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
                this.icon.node.active = true
            }
        })

        // this.node.zIndex = 99999
    }

    getId() {
        return this.data["id"]
    }

    getIcon() {
        return this.icon
    }

    /**
     * 下一个需要解锁的设施
     */
    public setNextLockBuild() {
        let data = MapGridView.instance.getNextUnlockData()
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const list = data[key]
                    for (let i = 0; i < list.length; i++) {
                        const id = list[i]
                        if (id > 10000 && id < 100000 && id == this.rubbish_id) {
                            let bubble = SceneRubbishMgr.instance.getRubbishBubbleByIndex(id)
                            if (!cc.isValid(bubble)) {
                                this.addBuildBubble()
                            }
                        }
                    }
                }
            }
        }

        // let cur_data = data[10]
        // if (!cur_data) return
        // for (let i = 0; i < cur_data.length; i++) {
        //     const id = cur_data[i]
        //     if (id == this.rubbish_id) {
        //         let bubble = SceneRubbishMgr.instance.getRubbishBubbleByIndex(id)
        //         if (!cc.isValid(bubble)) {
        //             this.addBuildBubble()
        //         }
        //     }
        // }
    }

    /**
     * 可解锁气泡
     * 任务需要解锁id
     */
    public addBuildBubble() {
        // return
        cc.resources.load("prefabs/builds/BuildBubble", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                this.node.parent.addChild(node)
                node.zIndex = BuildConfig.max_zIndex
                let buildBubble = node.getComponent(BuildBubble)
                buildBubble.initSceneRubbish(this.rubbish_id)
                let rect = this.icon.spriteFrame.getRect()


                node.x = this.node.x + rect.width / 2 + 50 - node.width / 2 + 45
                node.y = this.node.y + node.height / 2 + 30 - node.height / 2 + 57

                SceneRubbishMgr.instance.addRubbishBubbleByIndex(this.rubbish_id, buildBubble)

                let task_jump_data = this._user.getTaskJumpData()
                if (task_jump_data) {
                    let temp_index = task_jump_data.sceneRubbishId
                    if (this.rubbish_id == temp_index) {
                        this._event_manager.dispatch(this._event_name.EVENT_TASK_MOVE_MAP_TO_POS, task_jump_data)
                        this._user.setTaskJumpData(null)
                    }
                }
            }
        })
    }

    public clearRubbish(func?: Function) {
        if (!this.node.active) return
        cc.resources.load("prefabs/builds/FacClear", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                this.node.addChild(node)

                let script = node.getComponent(FacClear)
                script.setClear()

                setTimeout(() => {
                    let json = this._json_manager.getJsonData(this._json_name.SCENE_RUBBISH, this.rubbish_id)
                    if (json) {
                        let reward = json["reward"]
                        let reward_list = this._utils.changeConfigItemData(reward)
                        for (let i = 0; i < reward_list.length; i++) {
                            const item_data = reward_list[i]
                            let pos_w = this.node.parent.convertToWorldSpaceAR(cc.v2(this.node.position))
                            let data = {
                                pos_w: pos_w,
                                item_id: item_data["item_id"],
                                item_num: item_data["item_num"],
                                isNotAdd: true,
                            }
                            this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
                        }

                    }
                    this.moveNextTaskBubble()
                    node.destroy()
                    if (func) func()
                    this.node.destroy()

                }, 1000);
            }
        })
    }

    private moveNextTaskBubble() {
        let task_config = this._json_manager.getJson(this._json_name.MISSION)
        let cur_item_data = null
        for (const key in task_config) {
            if (Object.prototype.hasOwnProperty.call(task_config, key)) {
                const item_data = task_config[key]
                if (this.rubbish_id == item_data["unlock"]) {
                    cur_item_data = item_data
                    break
                }
            }
        }
        let need_item_data = null
        if (cur_item_data) {
            for (const key in task_config) {
                if (Object.prototype.hasOwnProperty.call(task_config, key)) {
                    const item_data = task_config[key]
                    if (cur_item_data["id"] == item_data["premission"]) {
                        need_item_data = item_data
                        break
                    }
                }
            }
        }

        if (need_item_data) {
            let type = need_item_data["type"]
            if (type == 1) {
                MapGridView.instance.moveToRoomPosByRoomId(need_item_data["unlock"])
            } else if (type == 2) {
                let facId = need_item_data["unlock"]
                let fac_data = this._json_manager.getJsonData(this._json_name.FACILITY, facId)
                let owning_room = fac_data["owning_room"]
                MapGridView.instance.moveToFacPosByRoomIdByFacId(owning_room, facId)
            } else if (type == 3) {
                let build_id = null
                let lv_config = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_LV, need_item_data["unlock"])
                let config = this._json_manager.getJson(this._json_name.SCENE_BUILD_BASE)
                for (const key in config) {
                    if (Object.prototype.hasOwnProperty.call(config, key)) {
                        const item_data = config[key]
                        if (lv_config["build_group"] == item_data["build_group"]) {
                            build_id = item_data["id"]
                            break
                        }
                    }
                }
                MapGridView.instance.moveToSceneBuildByBuildId(build_id)
            } else if (type == 4) {
                let id = need_item_data["unlock"]
                MapGridView.instance.moveToSceneRubbishByRubbishId(id)
            }
        }
    }

    // update (dt) {}
}
