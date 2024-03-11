import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import BuildConfig from "./BuildConfig";
import RoomMgr from "./RoomMgr";
import SaoGuang from "./SaoGuang";
import ShanGuang from "./ShanGuang";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomFacDragonAni extends MyComponent {

    @property(cc.Mask)
    mask: cc.Mask = null

    @property(dragonBones.ArmatureDisplay)
    dragon_com: dragonBones.ArmatureDisplay = null

    @property(cc.Animation)
    ani: cc.Animation = null

    private roomId: number = null
    private facId: number = null
    private icon_node: cc.Node = null
    private isInit: boolean = true

    private change_pic_time: number = 60
    private tick_pic_time: number = this.change_pic_time
    private change_pic_index: number = 0
    private guoshu_ani_name_list = ["jieguo", "shu", "kaihua"]

    onLoad() {

    }

    start() {

    }

    setAni(roomId: number, facId: number, icon_node: cc.Node, isInit: boolean, skin_num?: number) {
        this.roomId = roomId
        this.facId = facId
        this.icon_node = icon_node
        this.isInit = isInit
        if (skin_num) {
            this.dragonReplace(skin_num)
        } else {
            let armature = BuildConfig.room_fac_dragon_name[roomId][facId]
            this.dragon_com.armatureName = armature
            this.playDragonAni()
        }

        this.setSpecialAni()

        if (!this.isInit) {
            this.setUnlockAni()
        }
    }

    private playDragonAni() {
        if (this.facId == 2006) {
            this.dragon_com.playAnimation("youhuo", 1)
        }
        else if (this.facId == 3003) {
            this.dragon_com.playAnimation("shumiao", -1)
        }
        else if (this.facId == 3004) {
            this.dragon_com.playAnimation("jieguo", -1)
            this.schedule(this.tickChangePic, 1)
        }
        else {
            this.dragon_com.playAnimation("gongzuo", -1)
            if (this.facId == 3008 || this.facId == 4012) {
                if (cc.isValid(this.mask)) {
                    this.mask.enabled = true
                }
            }
        }
    }

    private setUnlockAni() {
        let json = this._json_manager.getJsonData(this._json_name.FACILITY, this.facId)
        if (json) {
            this.ani.on("finished", () => {

                let reward = this._config.game_2d ? json["reward"] : json["reward_three"]
                let reward_list = this._utils.changeConfigItemData(reward)

                let cur_room = RoomMgr.instance.getRoomById(this.roomId)
                let light_prefab = cur_room.getLightPrefab()
                let light = cc.instantiate(light_prefab).getComponent(SaoGuang)

                let func = () => {
                    if (RoomMgr.instance.getRoomFacIsAllUnLockByRoomId(this.roomId)) {

                        // if (typeof(wx) != "undefined") { // 微信
                        // this._dialog_manager.openDialog(this._dialog_name.RoomShow, {roomId: roomId})
                        // }else {
                        // this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
                        //     type: 1011,
                        //     args: [this.roomId],
                        // })
                        // }
                        MapGridView.instance.moveToRoomPosByRoomId(this.roomId, () => {
                            this.scheduleOnce(() => {
                                let path = `prefabs/builds/shanguang`
                                this._resource_manager.getPrefab(path).then((prefab) => {
                                    if (cc.isValid(prefab)) {
                                        let node = cc.instantiate(prefab)
                                        let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
                                        parent.addChild(node)

                                        let script = node.getComponent(ShanGuang)
                                        script.init({ roomId: this.roomId })
                                    }
                                })
                            }, 0.5)
                        })
                    }
                    this.addStar()
                    this.moveNextTaskBubble()
                }
                light.setSaoGuang(this.icon_node, this.node, reward_list, func, this.facId)

                if (this.facId == 3004) {
                    this.schedule(this.tickChangePic, 1)
                }
            })
            let act_effect = json["act_effect"]
            if (act_effect == 2) {
                this.ani.play("sheshijiesuo")
            }
            else if (act_effect == 3) {
                this.ani.play("jiesuofangjian")
            }
        }
    }

    private getRoomStar(): cc.Node {
        let cur_room = RoomMgr.instance.getRoomById(this.roomId)
        let star_node = cur_room.getUnLockParticle()
        return star_node.node
    }

    private addStar() {
        let func = (scale) => {
            let node_star = this.getRoomStar()
            let node = cc.instantiate(node_star)
            this.icon_node.addChild(node)
            node.scale = scale
            node.active = true
            node.position = cc.v3()
            
        }
        // for (let i = 0; i < this.same_icon.length; i++) {
            const sp = this.icon_node.getComponent(cc.Sprite)
            let rect = sp.spriteFrame.getRect()
            let width_radio = rect.width / 400
            let height_radio = rect.height / 400
            let scale = 1
            if (width_radio < 1 || height_radio < 1) {
                scale = width_radio < height_radio ? width_radio : height_radio
            }
            func(scale)
        // }
    }

    private tickChangePic() {
        this.tick_pic_time -= 1
        if (this.tick_pic_time <= 0) {
            this.changeIconPic()
            this.tick_pic_time = this.change_pic_time
        }
    }

    private changeIconPic() {
        this.change_pic_index += 1
        if (this.change_pic_index > this.guoshu_ani_name_list.length - 1) {
            this.change_pic_index = 0
        }
        let ani_name = this.guoshu_ani_name_list[this.change_pic_index]
        this.dragon_com.playAnimation(ani_name, -1)
        if (ani_name == "jieguo") {
            this._event_manager.dispatch("ani_zhaiguozi", { facIdList: [3009, 3008], type: 1 })
        } else {
            this._event_manager.dispatch("ani_zhaiguozi", { facIdList: [3009, 3008], type: 2 })
        }
    }

    private setSpecialAni() {
        if (this.facId == 2009) {
            // 装鱼工
            this.dragon_com.off(dragonBones.EventObject.LOOP_COMPLETE)
            this.dragon_com.on(dragonBones.EventObject.LOOP_COMPLETE, (a) => {
                this._event_manager.dispatch("add_chuangsongdai_yu")
            })
        }
        else if (this.facId == 2006) {
            // 运货员
            this.dragon_com.off(dragonBones.EventObject.LOOP_COMPLETE)
            this.dragon_com.on(dragonBones.EventObject.LOOP_COMPLETE, (a) => {
                if (this.dragon_com.animationName == "youhuo") {
                    this.dragon_com.playAnimation("kongche", 1)
                }
                else if (this.dragon_com.animationName == "kongche") {
                    this.dragon_com.playAnimation("youhuo", 1)
                }
            })
        }
    }

    public changeAni(type: number) {
        if (type == 1) {
            this.dragon_com.playAnimation("gongzuo", -1)
        } else {
            this.dragon_com.playAnimation("daiji", -1)
        }
    }

    public changeSkin(facId: number, skin_num: number) {
        if (this.facId == facId) {
            this.dragonReplace(skin_num)
        }
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
    async dragonReplace(skin_num: number = 1, callBack?: Function) {
        // 龙骨动画资源
        // ske 骨骼数据
        // tex 骨骼纹理数据
        let dragon = BuildConfig.room_fac_skin_dragon_name[this.roomId][skin_num]
        let ske = `dragon/room/${dragon}_ske`
        let tex = `dragon/room/${dragon}_tex`
        // cc.error(ske, tex, "dump=[=============11")
        const s = await this.assetLoadRes(ske, dragonBones.DragonBonesAsset)
        const t = await this.assetLoadRes(tex, dragonBones.DragonBonesAtlasAsset)
        if (s && t && cc.isValid(this)) {
            // 进行龙骨动画替换
            if (s instanceof dragonBones.DragonBonesAsset) {
                this.dragon_com.dragonAsset = s
            }
            if (t instanceof dragonBones.DragonBonesAtlasAsset) {
                this.dragon_com.dragonAtlasAsset = t
            }

            let armature = BuildConfig.room_fac_dragon_name[this.roomId][this.facId]
            this.dragon_com.armatureName = armature

            this.playDragonAni()

            if (callBack) callBack()
        }
    }

    private moveNextTaskBubble() {
        let task_config = this._json_manager.getJson(this._json_name.MISSION)
        let cur_item_data = null
        for (const key in task_config) {
            if (Object.prototype.hasOwnProperty.call(task_config, key)) {
                const item_data = task_config[key]
                if (this.facId == item_data["unlock"]) {
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
            }
        }
    }

    // update (dt) {}
}
