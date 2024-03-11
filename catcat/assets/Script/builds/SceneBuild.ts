import MyComponent from "../common/MyComponent";
import CustomerFindWay from "../customer/CustomerFindWay";
import MapGridView from "../main/MapGridView";
import BuildBubble from "./BuildBubble";
import BuildConfig, { SceneBuildId } from "./BuildConfig";
import SceneBuildMgr from "./SceneBuildMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneBuild extends MyComponent {

    // @property({ type: cc.Enum(SceneBuildId) })
    // buildId: SceneBuildId = SceneBuildId.unknown

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    private buildId: number = null

    private data = null
    private lv: number = 1
    private item_config = null

    private isInit: boolean = true

    onLoad() {


        this.dragon.on(dragonBones.EventObject.COMPLETE, (a) => {
            if (this.dragon.animationName == "chuxian") {
                this.dragon.playAnimation("daiji", -1)
            }
        })
    }

    public initBuild(data) {
        // cc.error(data, data["lv"], "data============")
        this.data = data

        this.buildId = data["id"]

        let config = BuildConfig.scene_build_config[this.buildId]
        this.node.position = cc.v3(config.pos)
        this.node.scale = config.scale || 1
        this.node.scaleX = config.flipX ? -this.node.scale : this.node.scale

        let mapIndex = BuildConfig.room_zindex[this.buildId]
        if (mapIndex) {
            this.node.zIndex = mapIndex
        } else {
            this.node.zIndex = 2
        }

        let lv = data["lv"]

        // lv = 2
        // this.config = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_BASE, this.buildId)

        this.item_config = this.getConfigByLv(lv)
        // cc.error(this.item_config, lv, "config=========")
        // let build_res = item_config["build_res"]
        if (this.item_config) {
            


            // this.dragonReplace(lv)
            let is_ani = data["is_ani"]
            if (is_ani == 1) {
                let path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.buildId]}/${lv}`
                this._utils.setSpriteFrame(this.icon, path)
                this.icon.node.active = false
                this.dragonReplace(lv)
            } else {
                let path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.buildId]}/${lv}`
                this._utils.setSpriteFrame(this.icon, path, () => {
                    this.icon.node.active = true
                })

                if (!this.isInit) {
                    let item_config = this.getConfigByLv(lv - 1)
                    if (!item_config) return
                    let reward_item = item_config["reward_item"]
                    let reward_list = this._utils.changeConfigItemData(reward_item)
                    for (let i = 0; i < reward_list.length; i++) {
                        let item_data = reward_list[i]
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

                this.isInit = false
            }
        }



        this.lv = lv

        // this.setNextLockBuild()
    }

    /**
      *
      * @param name 需要从resources文件夹加载的名称
      * @param type 加载资源的类型
      */
    assetLoadRes(name: string, type: any) {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(name, type, (err, resAsset) => {
                err && reject('未找到资源')
                resolve(resAsset)
            })
        })
    }
    /**
     * 进行龙骨动画替换
     */
    async dragonReplace(lv: number, callBack?: Function) {
        // 龙骨动画资源
        // ske 骨骼数据
        // tex 骨骼纹理数据
        let path = `${BuildConfig.room_fac_icon_frames_name[this.buildId]}/${BuildConfig.room_fac_icon_frames_name[this.buildId]}_${lv}`
        let ske = `dragon/${path}_ske`
        let tex = `dragon/${path}_tex`
        const s = await this.assetLoadRes(ske, dragonBones.DragonBonesAsset)
        const t = await this.assetLoadRes(tex, dragonBones.DragonBonesAtlasAsset)
        if (s && t && cc.isValid(this)) {
            // 进行龙骨动画替换
            if (s instanceof dragonBones.DragonBonesAsset) {
                this.dragon.dragonAsset = s
            }
            if (t instanceof dragonBones.DragonBonesAtlasAsset) {
                this.dragon.dragonAtlasAsset = t
            }



            if (!this.isInit) {
                let item_config = this.getConfigByLv(lv - 1)
                if (!item_config) return
                let reward_item = item_config["reward_item"]
                let reward_list = this._utils.changeConfigItemData(reward_item)
                for (let i = 0; i < reward_list.length; i++) {
                    let item_data = reward_list[i]
                    let pos_w = this.node.parent.convertToWorldSpaceAR(cc.v2(this.node.position))
                    let data = {
                        pos_w: pos_w,
                        item_id: item_data["item_id"],
                        item_num: item_data["item_num"],
                        isNotAdd: true,
                    }
                    this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
                }

                if (this.buildId == SceneBuildId.chuanwu) {
                    this.dragon.armatureName = lv.toString()
                    this.dragon.playAnimation("chuxian", 1)
                }
                else if (this.buildId == SceneBuildId.penquan) {
                    this.dragon.armatureName = "Armature"
                    this.dragon.playAnimation("newAnimation", -1)
                }

            } else {
                if (this.buildId == SceneBuildId.chuanwu) {
                    this.dragon.armatureName = lv.toString()
                    this.dragon.playAnimation("daiji", -1)
                }
                else if (this.buildId == SceneBuildId.penquan) {
                    this.dragon.armatureName = "Armature"
                    this.dragon.playAnimation("newAnimation", -1)
                }
            }

            this.isInit = false

            if (callBack) callBack()
        }
    }

    public getIcon() {
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
                        if (id > 100000) {
                            let build_id = null
                            let lv_config = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_LV, id)
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
                            if (build_id == this.buildId) {
                                let bubble = SceneBuildMgr.instance.getBuildBubbleByIndex(id)
                                if (!cc.isValid(bubble)) {
                                    this.addBuildBubble(id)
                                }
                            }
                        }
                    }
                }
            }
        }

        // let cur_data = data[this.buildId]
        // if (!cur_data) return
        // for (let i = 0; i < cur_data.length; i++) {
        //     const id = cur_data[i]
        //     // if (BuildConfig.scene_build_id_list.has(id)) {
        //     if (id > 100000) {
        //         // 场景建筑
        //         // let item_data = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_LV, id)
        //         // let item_build_group = item_data["build_group"]
        //         // let json = this._json_manager.getJson(this._json_name.SCENE_BUILD_BASE)
        //         // let buildId
        //         // for (const key in json) {
        //         //     if (Object.prototype.hasOwnProperty.call(json, key)) {
        //         //         const cur_data = json[key]
        //         //         let build_group = cur_data["build_group"]
        //         //         if (item_build_group == build_group) {
        //         //             buildId = cur_data["id"]
        //         //             break
        //         //         }
        //         //     }
        //         // }

        //         let bubble = SceneBuildMgr.instance.getBuildBubbleByIndex(id)
        //         if (!cc.isValid(bubble)) {
        //             this.addBuildBubble(id)
        //         }
        //     }
        // }
    }

    private getConfigByLv(lv: number) {
        let build_group = this.data["build_group"]
        let json = this._json_manager.getJson(this._json_name.SCENE_BUILD_LV)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let build_group_item = item_data["build_group"]
                let build_lv = item_data["build_lv"]
                if (build_group == build_group_item && build_lv == lv) {
                    return item_data
                }
            }
        }
        return
    }

    public getId() {
        return this.buildId
    }

    /**
     * 可解锁气泡
     * 任务需要解锁id
     */
    public addBuildBubble(lockId: number) {
        // return
        cc.resources.load("prefabs/builds/BuildBubble", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                this.node.parent.addChild(node)
                node.zIndex = BuildConfig.max_zIndex
                let buildBubble = node.getComponent(BuildBubble)
                let item_config = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_LV, Number(lockId) - 1)
                buildBubble.initSceneBuild(this.buildId, item_config, lockId)
                let rect = this.icon.spriteFrame.getRect()


                node.x = this.node.x + rect.width / 2 + 50 - node.width / 2 + 45
                node.y = this.node.y + node.height / 2 + 30 - node.height / 2 + 57

                let index = lockId
                SceneBuildMgr.instance.addBuildBubbleByIndex(index, buildBubble)

                let task_jump_data = this._user.getTaskJumpData()
                if (task_jump_data) {
                    let temp_index = task_jump_data.sceneBuildId
                    if (index == temp_index) {
                        this._event_manager.dispatch(this._event_name.EVENT_TASK_MOVE_MAP_TO_POS, task_jump_data)
                        this._user.setTaskJumpData(null)
                    }
                }
            }
        })
    }

    // update (dt) {}
}
