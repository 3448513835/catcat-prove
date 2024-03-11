import { UserDefault } from "../common/Config";
import MyComponent from "../common/MyComponent";
import { User } from "../common/User";
import Customer from "../customer/Customer";
import MapGridView from "../main/MapGridView";
import BuildConfig from "./BuildConfig";
import FacCanLockView from "./FacCanLockView";
import FacClear from "./FacClear";
import FacLockView from "./FacLockView";
import RoomFacDragonAni from "./RoomFacDragonAni";
import RoomMgr from "./RoomMgr";
import SaoGuang from "./SaoGuang";
import ShanGuang from "./ShanGuang";
import SkinArrow from "./SkinArrow";
import SkinBtn from "./SkinBtn";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomFac extends MyComponent {

    @property({ tooltip: "设施id" })
    fac_id: number = 0

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property([cc.Sprite])
    same_icon: cc.Sprite[] = []

    @property(dragonBones.ArmatureDisplay)
    yutang_shuihua: dragonBones.ArmatureDisplay = null

    @property(cc.Animation)
    ani: cc.Animation = null

    @property([cc.SpriteFrame])
    change_pic_list: cc.SpriteFrame[] = []

    @property([cc.Node])
    fac_part: cc.Node[] = []

    @property({
        tooltip: '层级'
    })
    public zIndex: number = 0

    @property([dragonBones.ArmatureDisplay])
    dragon_single_fac_ani: dragonBones.ArmatureDisplay[] = []

    private roomId: number = null
    // private facId: number = null
    private isRoom: boolean = false
    private is_lock: boolean = false

    private zIndex_num: number = 0
    private dragon_ani: RoomFacDragonAni = null

    private data = null
    private isInit: boolean = true

    private change_pic_time: number = 60
    private tick_pic_time: number = this.change_pic_time
    private change_pic_index: number = 0

    private skinArrow: cc.Node = null
    private skinBtn: cc.Node = null
    private majiang_customer_list: any[] = []

    onLoad() {
        this.listen("ani_zhaiguozi", this.changeAni, this)
        this.listen(this._event_name.EVENT_CHANGE_FAC_SKIN, this.changeSkin, this)
    }

    start() {

    }

    public init(roomId: number, isRoom: boolean, isInit: boolean, data?) {
        this.roomId = roomId
        this.isRoom = isRoom
        this.isInit = isInit
        if (data) {
            this.data = data
            let is_unlock = this.data["is_unlock"]
            let type = this.data["type"]
            
            if (is_unlock && !this.is_lock) {
                this.is_lock = true

                this.stopBlink()

                let json = this._json_manager.getJsonData(this._json_name.FACILITY, this.fac_id)
                let pre_id = data["pre_id"]
                if (pre_id != 0) {
                    if (cc.isValid(this.dragon_ani)) {
                        this.dragon_ani.node.destroy()
                    }

                    if (!isInit) {
                        let reward = this._config.game_2d ? json["reward"] : json["reward_three"]
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

                        // let pre_roomFac = RoomMgr.instance.getRoomFac(this.roomId, pre_id)
                        // pre_roomFac.node.active = true
                        // pre_roomFac.setzIndex(pre_roomFac.node)
                    }

                    this.node.active = false

                    return
                }

                let is_ani = null
                let skin_num = null
                if (this.getIsHaveSkin()) {
                    let use_skin_id = this.getUseSkinId()
                    let skin_data = this._json_manager.getJsonData(this._json_manager._json_name.FACILITY_SKIN, use_skin_id)
                    is_ani = skin_data["is_ani"]
                    skin_num = skin_data["set"]
                } else {
                    is_ani = json["is_ani"]
                }

                if (is_ani == 1) {
                    // let path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/unlock/${this.data["unlock_show"]}`
                    let path = this.getSkinPath()
                    this._utils.setSpriteFrame(this.icon, path)

                    let dragon = this.getRoomDragon()
                    let node = cc.instantiate(dragon)
                    node.active = true
                    this.node.parent.addChild(node)
                    this.setzIndex(node)


                    this.dragon_ani = node.getComponent(RoomFacDragonAni)
                    this.dragon_ani.setAni(this.roomId, this.fac_id, this.icon.node, this.isInit, skin_num)

                    this.icon.node.active = false
                } else {
                    // let path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/unlock/${this.data["unlock_show"]}`
                    this.icon.node.active = true
                    let path = this.getSkinPath()
                    if (this.same_icon.length > 0) {
                        this.same_icon.forEach(sp => {
                            this._utils.setSpriteFrame(sp, path)
                        })
                    }

                    if (type == 4) {
                        this.node.zIndex = 0
                    }

                    if (this.fac_part.length > 0) {
                        this.fac_part.forEach(node => {
                            node.active = true
                            node.zIndex = 5
                            if (this.fac_id == 7004) {
                                node.zIndex = 18
                            }
                            else if (this.fac_id == 8031) {
                                node.zIndex = 99
                            }
                            else if (this.fac_id == 6000) {
                                node.zIndex = 5
                            }
                            else if (this.fac_id == 9000) {
                                node.zIndex = 8
                            }
                            else if (this.fac_id == 5000 || this.fac_id == 8000) {
                                node.zIndex = 99
                            }
                            let path = this.getSkinPartPath()
                            let sp = node.getComponent(cc.Sprite)
                            this._utils.setSpriteFrame(sp, path)
                        })
                    }

                    if (this.dragon_single_fac_ani.length > 0) {
                        let dragonNode = this.icon.node.getChildByName("DragonNode")
                        dragonNode.active = true
                        // this.dragon_single_fac_ani.forEach(dragon => {
                        //     dragon.node.active = true
                        //     dragon.playAnimation("gongzuo", -1)
                        // })

                        if (BuildConfig.fac_unlock_hide_list.has(this.fac_id)) {
                            // this.icon.enabled = false
                            if (this.same_icon.length > 0) {
                                this.same_icon.forEach(sp => {
                                    sp.enabled = false
                                })
                            }
                            // this.icon.node.active = false
                        }
                        // if (this.same_icon.length > 0) {
                        //     this.same_icon.forEach(sp => {
                        //         sp.node.active = false
                        //     })
                        // }
                    }

                    this.setzIndex(this.node)
                    if (this.fac_id == 1008) {
                        this.yutang_shuihua.node.active = true
                        this.yutang_shuihua.node.zIndex = this.node.zIndex
                        this.yutang_shuihua.armatureName = "shuihua"
                        this.yutang_shuihua.playAnimation("gongzuo", -1)
                    }
                    else if (this.fac_id == 9004) {
                        let dragon = this.getRoomDragon()
                        let node = cc.instantiate(dragon)
                        node.active = true
                        this.node.parent.addChild(node)
                        node.zIndex = 4
                        let dragon_node = node.getChildByName("Dragon")
                        let dragon_com = dragon_node.getComponent(dragonBones.ArmatureDisplay)
                        dragon_com.armatureName = "ren"
                        dragon_com.playAnimation("gongzuo", -1)
                    }
                    else if (this.fac_id == 9000) {
                        let dragon = this.getRoomDragon()
                        let node = cc.instantiate(dragon)
                        node.active = true
                        this.node.parent.addChild(node)
                        node.zIndex = 4
                        let dragon_node = node.getChildByName("Dragon")
                        let dragon_com = dragon_node.getComponent(dragonBones.ArmatureDisplay)
                        dragon_com.armatureName = "yanwu"
                        dragon_com.playAnimation("gongzuo", -1)
                    }

                    if (!this.isInit) {
                        this.setUnlockAni()
                    } else {
                        if (this.fac_id == 4005) {
                            this.schedule(this.tickChangePic, 1)
                        }
                    }
                }
            } else {
                this.setzIndex(this.node)
            }
        } else {
            this.setzIndex(this.node)
        }
    }

    private setUnlockAni() {
        let json = this._json_manager.getJsonData(this._json_name.FACILITY, this.fac_id)
        if (json) {
            let ani = this.icon.getComponent(cc.Animation)
            ani.on("finished", () => {
                let cur_room = RoomMgr.instance.getRoomById(this.roomId)
                let light_prefab = cur_room.getLightPrefab()

                let reward = this._config.game_2d ? json["reward"] : json["reward_three"]
                let reward_list = this._utils.changeConfigItemData(reward)

                for (let i = 0; i < this.same_icon.length; i++) {
                    const icon = this.same_icon[i]
                    let light = cc.instantiate(light_prefab).getComponent(SaoGuang)
                    if (i == this.same_icon.length - 1) {
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
                                        let path = `prefabs/builds/shanguang`;
                                        this._resource_manager.getPrefab(path).then((prefab) => {
                                            if (cc.isValid(prefab)) {
                                                let node = cc.instantiate(prefab)
                                                let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
                                                parent.addChild(node)

                                                let script = node.getComponent(ShanGuang)
                                                script.init({roomId: this.roomId})
                                            }
                                        })
                                    }, 0.5)
                                })
                            }

                            this.addStar()
                            this.moveNextTaskBubble()
                        }
                        light.setSaoGuang(icon.node, null, reward_list, func, this.fac_id)
                    } else {
                        light.setSaoGuang(icon.node)
                    }
                }

                if (this.fac_id == 4005) {
                    this.schedule(this.tickChangePic, 1)
                }
            })
            let act_effect = json["act_effect"]
            if (act_effect == 2) {
                ani.play("sheshijiesuo")
            }
            else if (act_effect == 3) {
                ani.play("jiesuofangjian")
            }
        }
    }

    public setzIndex(node: cc.Node) {
        if (this.zIndex) {
            node.zIndex = this.zIndex
        }
        else {
            let cur_room = RoomMgr.instance.getRoomById(this.roomId)
            let room_fac_list = cur_room.fac_list
            for (let i = 0; i < room_fac_list.length; i++) {
                const roomFac = room_fac_list[i]
                if (this.fac_id == roomFac.getFacId()) {
                    this.zIndex_num = i
                    node.zIndex = i
                    break
                }
            }
        }
    }

    private getRoomDragon(): cc.Node {
        let cur_room = RoomMgr.instance.getRoomById(this.roomId)
        let dragon = cur_room.getDragon()
        return dragon
    }

    private getRoomStar(): cc.Node {
        let cur_room = RoomMgr.instance.getRoomById(this.roomId)
        let star_node = cur_room.getUnLockParticle()
        return star_node.node
    }

    public getzIndex() {
        return this.zIndex_num
    }

    public getIcon() {
        return this.icon
    }

    public getSameIcon() {
        return this.same_icon
    }

    public getFacId() {
        return this.fac_id
    }

    getIsRoom() {
        return this.isRoom
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
                    let json = this._json_manager.getJsonData(this._json_name.FACILITY, this.fac_id)
                    if (json) {
                        let reward = this._config.game_2d ? json["reward"] : json["reward_three"]
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
                    node.destroy()
                    this.node.active = false

                    this.moveNextTaskBubble()
                    if (func) func()
                }, 1000);
            }
        })
    }

    public getRoomId() {
        return this.roomId
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
        if (this.change_pic_index > this.change_pic_list.length - 1) {
            this.change_pic_index = 0
        }
        this.icon.spriteFrame = this.change_pic_list[this.change_pic_index]
    }

    public addSkinArrowAni() {
        cc.resources.load("prefabs/builds/SkinArrow", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                this.skinArrow = cc.instantiate(prefab)
                // this.node.parent.addChild(this.skinArrow)

                // this.skinArrow.zIndex = 99
                // this.skinArrow.x = this.node.x
                // this.skinArrow.y = this.node.y + 60

                let pos_w = this.node.parent.convertToWorldSpaceAR(this.node.position)
                let map = MapGridView.instance.map
                let pos_n = map.convertToNodeSpaceAR(pos_w)
                map.addChild(this.skinArrow)
                this.skinArrow.position = cc.v3(pos_n.x, pos_n.y + 60)
                this.skinArrow.zIndex = BuildConfig.max_zIndex

                this.skinArrow.getComponent(SkinArrow).init(this.roomId, this.fac_id)
            }
        })
    }

    public removeSkinArrowAni() {
        if (cc.isValid(this.skinArrow)) {
            this.skinArrow.destroy()
            this.skinArrow = null
        }
    }

    // public addSkinBtn(data) {
    //     cc.error(cc.isValid(this.skinBtn), "skinBtn=========")
    //     if (cc.isValid(this.skinBtn)) {
    //         this.skinBtn.getComponent(SkinBtn).clickSkinItem(data)
    //     } else {
    //         cc.resources.load("prefabs/builds/SkinBtn", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
    //             if (!err) {
    //                 this.skinBtn = cc.instantiate(prefab)

    //                 let pos_w = this.node.parent.convertToWorldSpaceAR(this.node.position)
    //                 let map = MapGridView.instance.map
    //                 let pos_n = map.convertToNodeSpaceAR(pos_w)
    //                 map.addChild(this.skinBtn)
    //                 this.skinBtn.position = cc.v3(pos_n.x, pos_n.y - 60)
    //                 this.skinBtn.zIndex = BuildConfig.max_zIndex

    //                 this.skinBtn.getComponent(SkinBtn).clickSkinItem(data)
    //             }
    //         })
    //     }
    // }

    public getIsLock() {
        return this.is_lock
    }

    public getDragonNode() {
        return this.dragon_ani
    }

    private changeAni(data) {
        let facIdList: number[] = data["facIdList"]
        let type = data["type"]
        if (facIdList.indexOf(this.fac_id) != -1 && cc.isValid(this.dragon_ani)) {
            this.dragon_ani.changeAni(type)
        }
    }

    public setBlink() {
        let time = 0.8
        cc.tween(this.node)
            .repeatForever(
                cc.tween().sequence(
                    cc.tween().to(time, { opacity: 120 }),
                    cc.tween().to(time, { opacity: 255 }),
                )
            )
            .tag(100)
            .start()
    }

    public stopBlink() {
        cc.Tween.stopAllByTag(100)
        this.node.opacity = 255
    }

    private getSkinPath() {
        let path = ""
        if (this.getIsHaveSkin()) {
            let use_skin_id = this.getUseSkinId()
            let skin_data = this._json_manager.getJsonData(this._json_manager._json_name.FACILITY_SKIN, use_skin_id)
            let skin_num = skin_data["set"]
            if (skin_num < 3) {
                path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/unlock/${this.data["unlock_show"]}`
            } else {
                path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/skin${skin_num}/${this.data["unlock_show"]}`
            }
        } else {
            path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/unlock/${this.data["unlock_show"]}`
        }

        return path
    }

    private getSkinPartPath() {
        let path = ""
        if (this.getIsHaveSkin()) {
            let use_skin_id = this.getUseSkinId()
            let skin_data = this._json_manager.getJsonData(this._json_manager._json_name.FACILITY_SKIN, use_skin_id)
            let skin_num = skin_data["set"]
            if (skin_num < 3) {
                path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/unlock/${this.fac_id}_part`
            } else {
                path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/skin${skin_num}/${this.fac_id}_part`
            }
        } else {
            path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/unlock/${this.fac_id}_part`
        }

        return path
    }

    /**facId: , skin_num: 第几套皮肤, skin_id:  */
    private changeSkin(data) {
        let facId = data["facId"]
        if (facId != this.fac_id) return
        let skin_num = data["skin_num"]
        let skin_id = data["skin_id"]

        let skin_data = this._json_manager.getJsonData(this._json_manager._json_name.FACILITY_SKIN, skin_id)
        let is_ani = skin_data["is_ani"]
        if (is_ani == 1) {
            if (cc.isValid(this.dragon_ani)) {
                this.dragon_ani.changeSkin(facId, skin_num)
                this.dragon_ani.node.active = true
            } else {
                let dragon = this.getRoomDragon()
                let node = cc.instantiate(dragon)
                node.active = true
                this.node.parent.addChild(node)
                this.setzIndex(node)


                this.dragon_ani = node.getComponent(RoomFacDragonAni)
                this.dragon_ani.setAni(this.roomId, this.fac_id, this.icon.node, true, skin_num)
            }
            this.icon.node.active = false
        } else {
            this.icon.node.active = true
            let path = ""
            if (skin_num < 3) {
                path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/unlock/${this.data["unlock_show"]}`
            } else {
                path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/skin${skin_num}/${this.data["unlock_show"]}`
            }
            if (this.same_icon.length > 0) {
                this.same_icon.forEach(sp => {
                    this._utils.setSpriteFrame(sp, path)
                })
            }
            if (cc.isValid(this.dragon_ani)) {
                this.dragon_ani.node.active = false
            }
        }
    }

    private getUseSkinId() {
        let skin_id = null
        let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (!skin_data) {
            skin_id = this.getDefaultSkinId()
        } else {
            skin_data = JSON.parse(skin_data)
            if (!skin_data[this.fac_id]) {
                skin_id = this.getDefaultSkinId()
            } else {
                skin_id = skin_data[this.fac_id]["use_skin_id"]
            }
        }

        return skin_id
    }

    /**
     * 获取初始默认皮肤id
     */
    private getDefaultSkinId(): number {
        let skin_list = this.getSkinListByFacId()
        for (let i = 0; i < skin_list.length; i++) {
            const item_data = skin_list[i]
            let unlock_cost = item_data["unlock_cost"]
            if (unlock_cost == "0") {
                return item_data["id"]
            }
        }

        return
    }

    /**
     * 获取配置皮肤列表
     */
    private getSkinListByFacId() {
        let skin_list = []
        let json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let own_facility = item_data["own_facility"]
                if (this.fac_id == own_facility) {
                    skin_list.push(item_data)
                }
            }
        }

        return skin_list
    }

    private getIsHaveSkin() {
        return this.getSkinListByFacId().length > 0
    }

    public playSingleDragonState(isWork: boolean, index: number) {
        let dragon = this.dragon_single_fac_ani[index]
        if (cc.isValid(dragon)) {
            let ani_name = isWork ? "gongzuo" : "daiji"
            dragon.playAnimation(ani_name, -1)
        }
    }

    public playTaiQiuSingleDragonState(num: number) {
        let dragon = this.dragon_single_fac_ani[0]
        if (cc.isValid(dragon)) {
            let ani_name = "diyigan"
            if (num == 2) {
                ani_name = "diergan"
            }
            dragon.playAnimation(ani_name, 1)
        }
    }

    public playMaJiang(data) {
        this.majiang_customer_list.push(data)
        if (this.majiang_customer_list.length == 4) {
            let dragon = this.dragon_single_fac_ani[0]
            if (cc.isValid(dragon)) {
                dragon.playAnimation("gongzuo", 1)

                dragon.off(dragonBones.EventObject.COMPLETE)
                dragon.on(dragonBones.EventObject.COMPLETE, (a) => {
                    if (dragon.animationName == "gongzuo") {
                        for (let j = 0; j < this.majiang_customer_list.length; j++) {
                            let item_data = this.majiang_customer_list[j]
                            let cus = item_data["target"]
                            let info = item_data["info"]
                            this.scheduleOnce(() => {

                                cus.moveMaJiang(info)
                                let index = this.majiang_customer_list.indexOf(item_data)
                                this.majiang_customer_list.splice(index, 1)
                            }, 1 * j)
                        }

                        dragon.playAnimation("daiji", -1)
                    }
                })
            }
        }
    }

    private addStar() {
        let func = (scale) => {
            let node_star = this.getRoomStar()
            let node = cc.instantiate(node_star)
            this.node.addChild(node)
            node.scale = scale
            node.active = true
            node.position = cc.v3()

        }
        for (let i = 0; i < this.same_icon.length; i++) {
            const sp = this.same_icon[i]
            let rect = sp.spriteFrame.getRect()
            let width_radio = rect.width / 400
            let height_radio = rect.height / 400
            let scale = 1
            if (width_radio < 1 || height_radio < 1) {
                scale = width_radio < height_radio ? width_radio : height_radio
            }
            func(scale)
        }
    }

    private moveNextTaskBubble() {
        let task_config = this._json_manager.getJson(this._json_name.MISSION)
        let cur_item_data = null
        for (const key in task_config) {
            if (Object.prototype.hasOwnProperty.call(task_config, key)) {
                const item_data = task_config[key]
                if (this.fac_id == item_data["unlock"]) {
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

        if (!need_item_data) {
            for (const key in task_config) {
                if (Object.prototype.hasOwnProperty.call(task_config, key)) {
                    const item_data = task_config[key]
                    if (this.roomId == item_data["unlock"]) {
                        cur_item_data = item_data
                        break
                    }
                }
            }

            if (cur_item_data) {
                for (const key in task_config) {
                    if (Object.prototype.hasOwnProperty.call(task_config, key)) {
                        const item_data = task_config[key]
                        if (cur_item_data["id"] == item_data["premission"] && item_data["type"] == 1) {
                            need_item_data = item_data
                            break
                        }
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
            }
        }
    }

    // update (dt) {}
}
