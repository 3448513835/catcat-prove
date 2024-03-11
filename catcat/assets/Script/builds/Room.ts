import Light from "../common/Light";
import MyComponent from "../common/MyComponent";
import CustomerFindWay from "../customer/CustomerFindWay";
import MapGridView from "../main/MapGridView";
import BuildBubble from "./BuildBubble";
import BuildConfig from "./BuildConfig";
import FishAni from "./FishAni";
import RoomFac from "./RoomFac";
import RoomMgr, { RoomId } from "./RoomMgr";
import SaoGuang from "./SaoGuang";
import SceneBuildMgr from "./SceneBuildMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Room extends MyComponent {

    @property({ type: cc.Enum(RoomId) })
    roomId: RoomId = RoomId.unknown

    @property({ type: RoomFac })
    fac_list: RoomFac[] = []

    @property(cc.Sprite)
    room_sp: cc.Sprite = null

    // @property(cc.Sprite)
    // room_sp2: cc.Sprite = null

    @property(cc.Node)
    mupai: cc.Node = null

    @property(cc.Node)
    rubbish1: cc.Node = null

    @property(cc.Node)
    rubbish2: cc.Node = null

    // @property({ type: cc.SpriteFrame })
    // room_frams: cc.SpriteFrame[] = []

    @property(cc.Node)
    dragon: cc.Node = null

    @property(cc.Node)
    dragon_fish: cc.Node = null

    @property(cc.Animation)
    unlock_ani: cc.Animation = null

    @property(cc.ParticleSystem)
    unlock_particle: cc.ParticleSystem = null

    @property(cc.Prefab)
    light_prefab: cc.Prefab = null

    @property(cc.Node)
    sign_node: cc.Node = null

    @property(cc.Sprite)
    wall: cc.Sprite = null

    private data = null
    private room_json = null
    private isInit: boolean = true
    private is_lock: boolean = false

    onLoad() {
        this.listen("add_chuangsongdai_yu", this.addFish, this)
        let mapIndex = BuildConfig.room_zindex[this.roomId]
        this.node.zIndex = mapIndex
    }

    start() {
        // for (let i = 0; i < this.fac_list.length; i++) {
        //     const roomFac = this.fac_list[i]
        //     this.addBuildBubble(roomFac)
        // }

        // this.mupai.active = true
        // this.setLockNeed()
    }

    getDragon() {
        return this.dragon
    }

    getUnLockParticle() {
        return this.unlock_particle
    }

    /**
     * 设施是否解锁
     */
    public getFacIsUnlockById(facId: number): boolean {
        let facility = this.data["facility"]
        for (let i = 0; i < facility.length; i++) {
            const fac_data = facility[i]
            if (facId == fac_data["id"]) {
                return fac_data["is_unlock"]
            }
        }

        return false
    }

    public getAllFacIsUnlock() {
        let isAllLock = true
        let facility = this.data["facility"]
        for (let i = 0; i < facility.length; i++) {
            const fac_data = facility[i]
            if (!fac_data["is_unlock"]) {
                return false
            }
        }

        return isAllLock
    }

    /**
     * 设置设施状态
     */
    private setFacStateById(facId: number) {
        let isUnlock = this.getFacIsUnlockById(facId)
    }

    public initRoom(data) {
        this.data = data
        let is_unlock = data["is_unlock"]
        this.is_lock = this.is_lock

        // is_unlock = true
        // cc.error(data, "data============")
        if (!is_unlock) {
            // this.mupai.active = true

            this.setLockNeed()
        } else {
            // this.room_sp.spriteFrame = this.room_frams[1]
            // if (this.roomId == RoomId.naicha || this.roomId == RoomId.youlechang) {
            //     this.room_sp2.spriteFrame = this.room_frams[3]
            //     this.room_sp2.node.zIndex = 99
            // }
            // if (cc.isValid(this.wall)) {
            //     this.wall.node.active = true
            //     this.wall.node.zIndex = 5
            // }
            this.mupai.active = false
            let facility = data["facility"]

            let json = this._json_manager.getJsonData(this._json_name.ROOM, this.roomId)
            let lock_show = json["show"]
            let arr_show: string[] = lock_show.split(",")
            let pre_id_list = []
            for (let m = 0; m < facility.length; m++) {
                const fac_data = facility[m]
                let type = fac_data["type"]

                let id = fac_data["id"]

                let pre_id = fac_data["pre_id"]
                if (pre_id != 0) {
                    pre_id_list.push(fac_data)
                }
                let is_unlock = fac_data["is_unlock"]
                let roomFac = this.getFacById(id)
                if (type == 1) {
                    if (!is_unlock) {
                        roomFac.node.active = true
                        roomFac.init(this.roomId, false, this.isInit)
                    } else {
                        if (this.isInit) {
                            roomFac.node.active = !is_unlock
                        } else {
                            roomFac.stopBlink()
                            roomFac.clearRubbish(() => {
                                this.setSignState()
                            })
                        }
                    }
                }
                else if (type == 2) {
                    if (is_unlock) {
                        roomFac.node.active = true
                        roomFac.init(this.roomId, false, this.isInit, fac_data)
                    } else {
                        if (arr_show.indexOf(id.toString()) != -1) {
                            roomFac.node.active = true
                            roomFac.init(this.roomId, false, this.isInit, fac_data)
                        }
                        else {
                            roomFac.node.active = false
                        }
                    }
                }
                else if (type == 3) {
                    if (is_unlock) {
                        roomFac.node.active = true
                        roomFac.init(this.roomId, false, this.isInit, fac_data)
                    } else {
                        roomFac.node.active = is_unlock
                    }
                }
                else if (type == 4) {
                    roomFac.node.active = true
                    roomFac.init(this.roomId, false, true, fac_data)
                }
            }

            // cc.error(pre_id_list, "list==========")
            if (pre_id_list.length > 0) {
                for (let n = 0; n < pre_id_list.length; n++) {
                    const fac_data = pre_id_list[n]
                    let id = fac_data["id"]
                    let pre_id = fac_data["pre_id"]
                    let roomFac = this.getFacById(id)

                    let is_unlock = fac_data["is_unlock"]
                    if (is_unlock) {
                        // let dragon_ani = roomFac.getDragonNode()
                        // if (cc.isValid(dragon_ani)) {
                        //     dragon_ani.node.destroy()
                        // }
                        // roomFac.node.active = false

                        let pre_roomFac = this.getFacById(pre_id)
                        pre_roomFac.node.active = true
                        roomFac.init(this.roomId, false, this.isInit, fac_data)
                    }
                }
            }

            this.setNextLockFac()
        }

        this.setSignState()

        this.isInit = false
    }

    public getIsInit() {
        return this.isInit
    }

    private setSignState() {
        let list = [this.rubbish1, this.rubbish2]
        let isAllLock = true
        for (let i = 0; i < list.length; i++) {
            const node = list[i]
            if (cc.isValid(node)) {
                if (node.active) {
                    isAllLock = false
                    break
                }
            }
        }

        this.sign_node.active = !isAllLock
        if (this.sign_node.active) {
            this.sign_node.zIndex = 99
            let tipLevel = this.sign_node.getChildByName("TipLevel").getComponent(cc.Label)
            let json = this._json_manager.getJsonData(this._json_name.ROOM, this.roomId)
            tipLevel.string = `${json["unlock_value"]}级解锁`
        }
    }

    /**
     * 下一个需要解锁的设施
     */
    private setNextLockFac() {
        let data = MapGridView.instance.getNextUnlockData()
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const list = data[key]
                    for (let i = 0; i < list.length; i++) {
                        const id = list[i]
                        if (id < 10000 && this.roomId == Number(key)) {
                            let roomFac = this.getFacById(id)
                            if (cc.isValid(roomFac)) {
                                roomFac.node.active = true
                                roomFac.init(this.roomId, false, this.isInit)

                                let facId = roomFac.getFacId()
                                let index = this.roomId + facId
                                let bubble = RoomMgr.instance.getBuildBubbleByIndex(index)
                                if (!cc.isValid(bubble)) {
                                    this.addBuildBubble(roomFac, false)
                                }
                                roomFac.setBlink()
                            }
                        }
                    }
                }
            }
        }
        // let cur_data = data[this.roomId]
        // if (!cur_data) return
        // for (let i = 0; i < cur_data.length; i++) {
        //     const id = cur_data[i]
        //     // if (BuildConfig.scene_build_id_list.has(id)) {
        //     // if (id > 100000) {
        //     //     // 场景建筑
        //     //     let item_data = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_LV, id)
        //     //     let item_build_group = item_data["build_group"]
        //     //     let json = this._json_manager.getJson(this._json_name.SCENE_BUILD_BASE)
        //     //     let buildId
        //     //     for (const key in json) {
        //     //         if (Object.prototype.hasOwnProperty.call(json, key)) {
        //     //             const cur_data = json[key]
        //     //             let build_group = cur_data["build_group"]
        //     //             if (item_build_group == build_group) {
        //     //                 buildId = cur_data["id"]
        //     //                 break
        //     //             }
        //     //         }
        //     //     }

        //     //     let build = SceneBuildMgr.instance.getSceneBuildById(buildId)
        //     //     let bubble = SceneBuildMgr.instance.getBuildBubbleByIndex(id)
        //     //     if (!cc.isValid(bubble)) {
        //     //         build.addBuildBubble(id)
        //     //     }
        //     // } else {
        //     let roomFac = this.getFacById(id)
        //     if (cc.isValid(roomFac)) {
        //         roomFac.node.active = true
        //         roomFac.init(this.roomId, false, this.isInit)

        //         let facId = roomFac.getFacId()
        //         let index = this.roomId + facId
        //         let bubble = RoomMgr.instance.getBuildBubbleByIndex(index)
        //         if (!cc.isValid(bubble)) {
        //             this.addBuildBubble(roomFac, false)
        //         }
        //         roomFac.setBlink()
        //     }
        //     // }
        // }
    }

    private getRubbishShowFac(index: number): [] {
        let json = this._json_manager.getJsonData(this._json_name.ROOM, this.roomId)
        let key = `facility${index + 1}`
        let fac = json[key]
        let arr = fac.split(",")
        return arr
    }

    private getRubbishIsUnlock(id: number): boolean {
        let is_unlock = false
        let facility = this.data["facility"]
        for (let i = 0; i < facility.length; i++) {
            const fac_data = facility[i]
            let type = fac_data["type"]
            if (type == 1) {
                let fac_id = fac_data["id"]
                if (id == fac_id) {
                    is_unlock = fac_data["is_unlock"]
                    break
                }
            }
        }

        return is_unlock
    }

    public getFacById(id: number): RoomFac {
        let roomFac: RoomFac
        for (let i = 0; i < this.fac_list.length; i++) {
            const roomFac_com = this.fac_list[i]
            if (id == roomFac_com.getFacId()) {
                roomFac = roomFac_com
                break
            }
        }

        return roomFac
    }

    /**
     * 解锁需要
     */
    private setLockNeed() {
        let data = MapGridView.instance.getNextUnlockData()
        let cur_data = data[this.roomId]
        if (cur_data && cur_data.length > 0) {
            let roomFac = this.mupai.getComponent(RoomFac)

            let facId = roomFac.getFacId()
            let index = this.roomId + facId
            let bubble = RoomMgr.instance.getBuildBubbleByIndex(index)
            if (!cc.isValid(bubble)) {
                this.addBuildBubble(roomFac, true)
            }

            roomFac.init(this.roomId, true, this.isInit)
            RoomMgr.instance.addMupiaToList(roomFac)
        }

        let json = this._json_manager.getJsonData(this._json_name.ROOM, this.roomId)
        let lock_show = json["lock_show"]
        let arr = lock_show.split(",")
        for (let i = 0; i < arr.length; i++) {
            const id = Number(arr[i])
            let roomFac = this.getFacById(id)
            if (cc.isValid(roomFac)) {
                roomFac.node.active = true
            }
            // else {
            //     cc.error(id, "id==========")
            // }
        }
    }

    public getRoomId() {
        return this.roomId
    }

    /**
     * 可解锁气泡
     */
    public addBuildBubble(roomFac: RoomFac, isRoom: boolean = false) {
        // return
        cc.resources.load("prefabs/builds/BuildBubble", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                if (!cc.isValid(node)) return
                // roomFac.node.parent.addChild(node)
                node.zIndex = BuildConfig.max_zIndex
                let buildBubble = node.getComponent(BuildBubble)
                let facId = roomFac.getFacId()
                buildBubble.init(this.roomId, facId, isRoom)
                let icon = roomFac.getIcon()
                if (!cc.isValid(icon)) { return; }
                let rect = icon.spriteFrame.getRect()
                let bubble_x = 0
                let bubble_y = 0
                let map = MapGridView.instance.getMap()
                if (isRoom) {
                    // let pos_w = this.room_sp.node.parent.convertToWorldSpaceAR(this.room_sp.node.position)
                    // let pos_n = map.convertToNodeSpaceAR(pos_w)
                    bubble_x = this.node.x
                    bubble_y = this.node.y
                }
                else {
                    let pos_w = roomFac.node.parent.convertToWorldSpaceAR(cc.v2(roomFac.node.x, roomFac.node.y))
                    let pos_n = map.convertToNodeSpaceAR(pos_w)

                    if (facId == 2004) {
                        bubble_x = pos_n.x + 50 - node.width / 2 + 45
                    }
                    else {
                        bubble_x = pos_n.x + rect.width / 2 + 50 - node.width / 2 + 45
                    }
                    bubble_y = pos_n.y + node.height / 2 + 30 - node.height / 2 + 57
                }


                map.addChild(node)
                node.x = bubble_x
                node.y = bubble_y


                let index = this.roomId + facId
                RoomMgr.instance.addBuildBubbleByIndex(index, buildBubble)

                let task_jump_data = this._user.getTaskJumpData()
                if (task_jump_data) {
                    let temp_index = task_jump_data.facId + task_jump_data.roomId
                    if (index == temp_index) {
                        this._event_manager.dispatch(this._event_name.EVENT_TASK_MOVE_MAP_TO_POS, task_jump_data)
                        this._user.setTaskJumpData(null)
                    }
                }

                let guide_id = this._guide_manager.getGuideId();
                let recovery_id = this._guide_manager.getRecoveryId();
                // console.log(guide_id, recovery_id, "dump=========22")
                if (!this._guide_manager.getGuideFinish() && this.roomId == 101 && (recovery_id < 17 && (guide_id == 11 || guide_id == 13 || guide_id == 18))) {
                    // console.log(guide_id, "dump=========44")
                    let pos_w = roomFac.node.parent.convertToWorldSpaceAR(roomFac.node.position)
                    let node = roomFac.node
                    let map = MapGridView.instance.map
                    let pos_n = map.convertToNodeSpaceAR(pos_w)
                    let event_data = {
                        pos: pos_n,
                        isNotMoment: false,
                        node: node,
                        callBack: () => {
                            this.scheduleOnce(() => {
                                this._guide_manager.triggerGuide()
                            }, 0.5)
                        }
                    }
                    this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, event_data)
                }
            }
        })
    }

    public getMupai(): RoomFac {
        return this.mupai.getComponent(RoomFac)
    }

    private addFish() {
        if (this.roomId == RoomId.fish_factory) {
            let node = cc.instantiate(this.dragon_fish)
            this.node.addChild(node)
            node.getChildByName("yu").getComponent(FishAni).init(this)
            node.active = true
            node.zIndex = 3
        }
    }

    public unlockRoomAni() {
        this.unlock_ani.on("finished", () => {
            let json = this._json_manager.getJsonData(this._json_name.ROOM, this.roomId)
            let reward = json["reward"]
            let reward_list = this._utils.changeConfigItemData(reward)

            let light = cc.instantiate(this.light_prefab).getComponent(SaoGuang)
            let func = () => {
                let task_config = this._json_manager.getJson(this._json_name.MISSION)
                let cur_item_data = null
                for (const key in task_config) {
                    if (Object.prototype.hasOwnProperty.call(task_config, key)) {
                        const item_data = task_config[key]
                        if (this.roomId == item_data["unlock"]) {
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
                    }
                }
            }
            light.setSaoGuang(this.room_sp.node, null, reward_list, func)
            this.unlock_particle.node.active = false
        })
        this.unlock_ani.play()
        this.unlock_particle.node.active = true
    }

    public getLightPrefab() {
        return this.light_prefab
    }

    public getIsLock() {
        return this.is_lock
    }
    // update (dt) {}
}
