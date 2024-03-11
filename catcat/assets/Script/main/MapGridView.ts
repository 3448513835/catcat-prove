import BuildConfig from "../builds/BuildConfig";
import FacCanLockView from "../builds/FacCanLockView";
import FacLockView from "../builds/FacLockView";
import FacSkin from "../builds/FacSkin";
import FacSkinGroup from "../builds/FacSkinGroup";
import Room from "../builds/Room";
import RoomMgr from "../builds/RoomMgr";
import SceneBuild from "../builds/SceneBuild";
import SceneBuildMgr from "../builds/SceneBuildMgr";
import SceneRubbish from "../builds/SceneRubbish";
import SceneRubbishMgr from "../builds/SceneRubbishMgr";
import SkinBtn from "../builds/SkinBtn";
import { UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";
import ResourceManager from "../common/ResourceManager";
import { User } from "../common/User";
import Customer from "../customer/Customer";
import CustomerFindWay from "../customer/CustomerFindWay";
import CustomerManager from "../customer/CustomerManager";
import CustomerPoolManager from "../customer/CustomerPoolManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapGridView extends MyComponent {

    @property(cc.Node)
    map: cc.Node = null

    @property(cc.Prefab)
    template_customer: cc.Prefab = null

    @property(cc.Sprite)
    test_sp: cc.Sprite = null

    /** 格子x坐标数量*/
    private tileWidthNum = 120
    /** 格子y坐标数量*/
    private tileHeightNum = 120
    /** 格子边长*/
    private tileWidth = 272 / 2
    /** 格子的高度*/
    private tileHeight = 140 / 2
    private ratio = 2
    private tileWidthHalf = this.tileWidth / 2
    private tileHeightHalf = this.tileHeight / 2

    private use_grid_list: cc.Vec2[] = []
    private room_data = {}
    private nextUnlock = {}
    private scene_build_data = {}

    private select_fac_id: number = null
    private select_room_id: number = null
    private tick_time: number = 0
    private tick_add_time: number = 1 / 60
    private isHaveSkinViwe: boolean = false
    private facSkinScript: FacSkin = null
    private skinBtn: cc.Node = null
    private cur_skin_id: number = null
    private is_add_skin_arrow: boolean = false
    public is_have_skin_group: boolean = false
    /**皮肤套装是否可以快捷选择其他设施 0：不可以  1： 可以 */
    private skin_group_state: number = 0
    /**当前操作的是第几套套装 */
    private cur_skin_group_set: number = null
    private cur_group_skin_fac_id: number = null
    /**皮肤操作ui状态 */
    private skin_ui_state: boolean = false

    private guide_show_room_list = [101, 109, 106, 107]

    public static instance: MapGridView = null

    private str: string = ""

    protected onLoad() {
        MapGridView.instance = this
        this.listen(this._event_name.SOCKET_ROOM_INIT, this.initAllRoom, this)
        this.listen(this._event_name.SOCKET_ROOM_UNLOCK_ROOM, this.unlockRoom, this)
        this.listen(this._event_name.SOCKET_ROOM_UNLOCK_FACILITY, this.unlockRoomFac, this)
        this.listen(this._event_name.SOCKET_ROOM_UNLOCK_UNIT, this.unlockSceneBuild, this)
        this.listen(this._event_name.SOCKET_ROOM_CLEAN_RUBBISH, this.unlockSceneRubbish, this)
        this.listen(this._event_name.EVENT_ADD_FAC_SKIN_VIEW, this.addSkinView, this)
        this.listen(this._event_name.EVENT_ADD_FAC_SKIN_BTN, this.addSkinBtn, this)
        this.listen(this._event_name.EVENT_REMOVE_FAC_SKIN_VIEW, this.removeSkinView, this)
        this.listen(this._event_name.EVENT_RANDOM_BEHAVIOR_CUSTOMER, this.addCustomer, this)

        // this.node.zIndex = 99999
    }

    onDestroy() {
        MapGridView.instance = null
        this.destroy()
    }

    start() {
        // this.paintGrid(0, 0, this.tileWidthNum, this.tileHeightNum)
        // this.showPos()

        let scene_build_data = UserDefault.getItem(BuildConfig.scene_build_data_json_name)
        if (scene_build_data) {
            scene_build_data = JSON.parse(scene_build_data)
            scene_build_data = this.checkSceneBuildData(scene_build_data)
        } else {
            scene_build_data = this.initSceneBuildConfig()
        }

        let room_data = UserDefault.getItem(BuildConfig.data_json_name)
        // cc.error(JSON.parse(data), "data==========")
        if (room_data) {
            let temp_data = JSON.parse(room_data)
            let json = this._json_manager.getJson(this._json_name.ROOM)
            let room_id_list = []
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    room_id_list.push(key)
                }
            }
            let roomLists = temp_data["roomLists"]
            let nextUnlock = temp_data["nextUnlock"]
            // 检查是否增加了新房间
            for (let i = 0; i < room_id_list.length; i++) {
                const key = room_id_list[i]
                if (!roomLists[key]) {
                    let room_data = json[key]
                    let id = room_data["id"]
                    room_data["facility"] = []
                    room_data["is_unlock"] = false
                    nextUnlock[key] = []
                    let task_json = this._json_manager.getJson(this._json_name.MISSION)
                    for (const task_key in task_json) {
                        if (Object.prototype.hasOwnProperty.call(task_json, task_key)) {
                            const task_data = task_json[task_key]
                            let unlock = task_data["unlock"]
                            if (unlock == Number(key)) {
                                let premission = task_data["premission"]
                                if (premission == 0) {
                                    nextUnlock[key].push(Number(key))
                                } else {
                                    let is_lock = this.checkTaskIsLock(premission, roomLists)
                                    if (is_lock) {
                                        nextUnlock[key].push(Number(key))
                                    }
                                }
                                break
                            }
                        }
                    }

                    let json_fac = this._json_manager.getJson(this._json_name.FACILITY)
                    for (const key_fac in json_fac) {
                        if (Object.prototype.hasOwnProperty.call(json_fac, key_fac)) {
                            const fac_data = json_fac[key_fac]
                            let owning_room = fac_data["owning_room"]
                            fac_data["is_unlock"] = false
                            if (id == owning_room) {
                                room_data["facility"].push(fac_data)
                            }
                        }
                    }

                    roomLists[key] = room_data
                }
            }

            temp_data["roomLists"] = roomLists
            temp_data["nextUnlock"] = nextUnlock


            room_data = temp_data
        } else {
            room_data = this.initConfig()
        }

        this.room_data = room_data["roomLists"]
        this.nextUnlock = room_data["nextUnlock"]

        this.initAllRoom(room_data, true)

        if (this._guide_manager.getGuideFinish()) {
            this.initSceneBuilds(scene_build_data)
            this.initSceneRubbish()
        }

        this.addEntrustCus()

        // this.setUseGridPos()

        // this.tempAddCustomer()


        // let star_pos = cc.v2(53, 92)
        // let end_pos = cc.v2(97, 58)
        // let end_pos = cc.v2(75, 35)


        // let star_pos = cc.v2(97, 58)
        // let end_pos = cc.v2(53, 92)
        // let end_pos = cc.v2(75, 35)

        // let star_pos = cc.v2(75, 35)
        // let end_pos = cc.v2(53, 92)
        // let end_pos = cc.v2(75, 35)
        // let arr = CustomerFindWay.aStarFindPath(star_pos, end_pos)
        // cc.error(arr, "arr=============")
        // let list = arr[1]
        // let list = CustomerFindWay.road_map_pos_list
        // for (let i = 0; i < list.length; i++) {
        //     const pos = list[i]
        //     let pos2 = this.tileToWorldPos(pos.x, pos.y)
        //     pos2.y -= this.tileHeightHalf + 20
        //     let node: cc.Node = new cc.Node()
        //     let label = node.addComponent(cc.Label)
        //     // label.string = `(${i}, ${j})`
        //     label.string = `${pos.x}, ${pos.y}`
        //     label.fontSize = 22
        //     node.color = cc.color(255, 0, 0)

        //     node.position = cc.v3(pos2)
        //     this.map.addChild(node)
        //     node.zIndex = 99999
        // }
    }

    private initSceneRubbish() {
        // cc.error(this.getNextUnlockData(), "dump========getNextUnlockData()")
        let clear_data = UserDefault.getItem(this._user.getUID() + GameConstant.ALY_CLEAR_SCENE_RUBBISH)
        if (clear_data) {
            clear_data = JSON.parse(clear_data)
        } else {
            clear_data = {}
        }
        let json = this._json_manager.getJson(this._json_name.SCENE_RUBBISH)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let id = item_data["id"]
                if (!clear_data[id]) {
                    this._resource_manager.getPrefab("prefabs/rooms/SceneRubbish").then((prefab) => {
                        if (cc.isValid(this.map)) {
                            let node = cc.instantiate(prefab)
                            this.map.addChild(node)

                            SceneRubbishMgr.instance.addSceneRubbishToList(node)

                            let sceneRubbish = node.getComponent(SceneRubbish)
                            sceneRubbish.init(item_data)
                            sceneRubbish.setNextLockBuild()
                        }
                    })
                }
            }
        }
    }

    private checkTaskIsLock(taskId: number, roomLists: object): boolean {
        let item_data = this._json_manager.getJsonData(this._json_name.MISSION, taskId)
        let type = item_data["type"]
        let unlock = item_data["unlock"]
        if (type == 2) {
            // 设施
            let fac_config = this._json_manager.getJsonData(this._json_name.FACILITY, unlock)
            let owning_room = fac_config["owning_room"]
            let room_data = roomLists[owning_room]
            if (room_data) {
                let facility = room_data["facility"]
                let fac_data
                for (let j = 0; j < facility.length; j++) {
                    const item_data = facility[j]
                    if (Number(unlock) == item_data["id"]) {
                        fac_data = item_data
                        break
                    }
                }

                if (fac_data) {
                    return fac_data["is_unlock"]
                } else {
                    return false
                }
            } else {
                return false
            }
        } else if (type == 1) {
            // 房间 
            let room_data = roomLists[unlock]
            if (room_data) {
                return room_data["is_unlock"]
            } else {
                return false
            }
        }

        return false
    }

    private initSceneBuildConfig() {
        let scene_build_data = {}
        let json = this._json_manager.getJson(this._json_name.SCENE_BUILD_BASE)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const build_data = json[key]
                let type = build_data["type"]
                build_data["lv"] = 1
                scene_build_data[key] = build_data
            }
        }

        // cc.error(scene_build_data, "data===========")
        return scene_build_data
    }

    private checkSceneBuildData(data) {
        let json = this._json_manager.getJson(this._json_name.SCENE_BUILD_BASE)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                if (!data[key]) {
                    const build_data = json[key]
                    build_data["lv"] = 1
                    data[key] = build_data
                }
            }
        }

        return data
    }

    private initConfig() {
        let json = this._json_manager.getJson(this._json_name.ROOM)
        let roomLists = {}
        let nextUnlock = {}
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const room_data = json[key]
                let id = room_data["id"]
                room_data["facility"] = []
                room_data["is_unlock"] = false
                nextUnlock[key] = []
                let task_json = this._json_manager.getJson(this._json_name.MISSION)
                for (const task_key in task_json) {
                    if (Object.prototype.hasOwnProperty.call(task_json, task_key)) {
                        const task_data = task_json[task_key]
                        let unlock = task_data["unlock"]
                        if (unlock == Number(key)) {
                            let premission = task_data["premission"]
                            if (premission == 0) {
                                nextUnlock[key].push(Number(key))
                            }
                            break
                        }
                    }
                }

                let json_fac = this._json_manager.getJson(this._json_name.FACILITY)
                for (const key_fac in json_fac) {
                    if (Object.prototype.hasOwnProperty.call(json_fac, key_fac)) {
                        const fac_data = json_fac[key_fac]
                        let owning_room = fac_data["owning_room"]
                        fac_data["is_unlock"] = false
                        if (id == owning_room) {
                            room_data["facility"].push(fac_data)
                        }
                    }
                }

                roomLists[key] = room_data
            }
        }

        let data = {
            roomLists: roomLists,
            nextUnlock: nextUnlock
        }

        // cc.error(data, "roomLists========")

        return data
    }

    private initSceneBuilds(data) {
        // cc.error(data, "data=============")
        if (!data) return
        UserDefault.setItem(BuildConfig.scene_build_data_json_name, JSON.stringify(data))
        this.scene_build_data = data
        for (const key in this.scene_build_data) {
            if (Object.prototype.hasOwnProperty.call(this.scene_build_data, key)) {
                const cur_data = this.scene_build_data[key]
                let id = cur_data["id"]
                let config = BuildConfig.scene_build_config[id]
                if (BuildConfig.room_prefab_name[id] && !config.isHide) {
                    // let path = `prefabs/scenebuild/${BuildConfig.room_prefab_name[id]}`
                    let path = `prefabs/scenebuild/ChuanWu`
                    ResourceManager.getPrefab(path).then((prefab) => {
                        if (cc.isValid(prefab)) {
                            if (!cc.isValid(this.map)) return
                            let build_node = cc.instantiate(prefab)
                            this.map.addChild(build_node)
                            SceneBuildMgr.instance.addSceneBuildToList(build_node)

                            let sceneBuild = build_node.getComponent(SceneBuild)
                            sceneBuild.initBuild(cur_data)
                            sceneBuild.setNextLockBuild()
                        }
                    })
                }
                // let build = SceneBuildMgr.instance.getSceneBuildById(id)
                // if (cc.isValid(build)) {
                //     build.initBuild(cur_data)
                // }
            }
        }
    }

    private initAllRoom(data, isInit: boolean = false) {
        // cc.error(data, "initAllRoom=============")

        if (!data) return

        UserDefault.setItem(BuildConfig.data_json_name, JSON.stringify(data))

        this.room_data = data["roomLists"]
        this.nextUnlock = data["nextUnlock"]

        for (const key in this.room_data) {
            if (Object.prototype.hasOwnProperty.call(this.room_data, key)) {
                let cur_data = this.room_data[key]
                let id = cur_data["id"]
                if (!this._guide_manager.getGuideFinish()) {
                    if (this.guide_show_room_list.indexOf(Number(id)) == -1) {
                        let path = `prefabs/rooms/${BuildConfig.room_prefab_name[id]}`
                        cc.resources.preload(path)
                        continue
                    }
                }
                let room = RoomMgr.instance.getRoomById(id)
                if (cc.isValid(room)) {
                    room.initRoom(cur_data)
                } else {
                    let path = `prefabs/rooms/${BuildConfig.room_prefab_name[id]}`
                    ResourceManager.getPrefab(path).then((prefab) => {
                        if (cc.isValid(prefab)) {
                            if (!cc.isValid(this.map)) return
                            let room_node = cc.instantiate(prefab)
                            this.map.addChild(room_node)
                            RoomMgr.instance.addRoomToList(room_node)

                            let room = room_node.getComponent(Room)
                            room.initRoom(cur_data)
                        }
                    })
                }
            }
        }

        if (!isInit) {
            let scene_build_list = SceneBuildMgr.instance.getSceneBuildList()
            for (let index = 0; index < scene_build_list.length; index++) {
                const node = scene_build_list[index]
                if (cc.isValid(node)) {
                    node.getComponent(SceneBuild).setNextLockBuild()
                }
            }

            let scene_rubbish_list = SceneRubbishMgr.instance.getSceneRubbishList()
            for (let index = 0; index < scene_rubbish_list.length; index++) {
                const node = scene_rubbish_list[index]
                if (cc.isValid(node)) {
                    node.getComponent(SceneRubbish).setNextLockBuild()
                }
            }
        }
    }

    public getNextUnlockData() {
        return this.nextUnlock
    }

    /**
     * 解锁房间返回
     */
    private unlockRoom(data) {
        // cc.error(data, "解锁房间========")
        let roomId = data["roomId"]
        let bubble = RoomMgr.instance.getBuildBubbleByIndex(roomId)
        if (cc.isValid(bubble)) {
            bubble.node.destroy()
            RoomMgr.instance.removeBuildBubbleByIndex(roomId)
        }

        // let roomFac = RoomMgr.instance.getRoomFac(roomId, 0)
        // RoomMgr.instance.removeMupaiToList(roomFac)
        let room = RoomMgr.instance.getRoomById(roomId)
        if (cc.isValid(room)) {
            room.unlockRoomAni()
        }

        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1010,
            args: [roomId],
        })
    }

    /**
     * 解锁场景垃圾
     */
    private unlockSceneRubbish(data) {
        // cc.error(data, "解锁场景垃圾========")
        let rubbish_id = data["garbage_id"]
        let clear_data = UserDefault.getItem(this._user.getUID() + GameConstant.ALY_CLEAR_SCENE_RUBBISH)
        if (clear_data) {
            clear_data = JSON.parse(clear_data)
        } else {
            clear_data = {}
        }
        clear_data[rubbish_id] = true
        UserDefault.setItem(this._user.getUID() + GameConstant.ALY_CLEAR_SCENE_RUBBISH, JSON.stringify(clear_data))


        let bubble = SceneRubbishMgr.instance.getRubbishBubbleByIndex(rubbish_id)
        if (cc.isValid(bubble)) {
            bubble.node.destroy()
            SceneRubbishMgr.instance.removeRubbishBubbleByIndex(rubbish_id)
        }
        let scene_rubbish = SceneRubbishMgr.instance.getSceneRubbishById(rubbish_id)
        if (cc.isValid(scene_rubbish)) {
            scene_rubbish.clearRubbish()
            SceneRubbishMgr.instance.removeSceneRubbishById(rubbish_id)
        }
    }

    /**
     * 解锁场景建筑
     */
    private unlockSceneBuild(data) {
        // cc.error(data, "解锁场景建筑========")
        let unit_id = data["unit_id"]

        let item_data = this._json_manager.getJsonData(this._json_name.SCENE_BUILD_LV, unit_id)
        let json = this._json_manager.getJson(this._json_name.SCENE_BUILD_BASE)
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

        let bubble = SceneBuildMgr.instance.getBuildBubbleByIndex(unit_id)
        if (cc.isValid(bubble)) {
            bubble.node.destroy()
            SceneBuildMgr.instance.removeBuildBubbleByIndex(unit_id)
        }

        if (this.scene_build_data[buildId]) {
            let cur_data = this.scene_build_data[buildId]
            cur_data["lv"] = item_data["build_lv"]
            UserDefault.setItem(BuildConfig.scene_build_data_json_name, JSON.stringify(this.scene_build_data))
            let build = SceneBuildMgr.instance.getSceneBuildById(buildId)
            if (cc.isValid(build)) {
                build.initBuild(cur_data)
            }
        }
    }

    /**
     * 解锁设施
     */
    private unlockRoomFac(data) {
        // cc.error(data, "解锁设施========")
        let roomId = data["roomId"]
        let facilityId = data["facilityId"]
        let index = roomId + facilityId
        let bubble = RoomMgr.instance.getBuildBubbleByIndex(index)
        if (cc.isValid(bubble)) {
            bubble.node.destroy()
            RoomMgr.instance.removeBuildBubbleByIndex(index)
        }

        let roomFac = RoomMgr.instance.getRoomFac(roomId, facilityId)
        if (cc.isValid(roomFac)) {

        }

        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1009,
            args: [facilityId],
        })
    }

    public setSkinGroupState(value: number) {
        this.skin_group_state = value
        this.cur_group_skin_fac_id = null
        this.cur_skin_group_set = null
    }

    public setCurSkinGroupSet(value: number) {
        this.cur_skin_group_set = value
    }

    public setCurGroupSkinFacId(value: number) {
        this.cur_group_skin_fac_id = value
    }

    public setSkinUiState(value: boolean) {
        this.skin_ui_state = value
    }

    public getSkinUiState() {
        return this.skin_ui_state
    }

    /**
     * 点击开始
     * @param event 
     */
    public clickStart(event) {
        this._event_manager.dispatch(this._event_name.EVENT_HIDE_WELCOME_CAT)
        // let arrPoint = event.getTouches()
        // let mPoint = arrPoint[0].getLocation()
        this.is_add_skin_arrow = false
        if (this.is_have_skin_group && !this.skin_group_state) return

        let pos: cc.Vec2 = cc.v2(event.getLocation())
        let tile_pos = this.worldToTilePos(pos)
        // cc.error(tile_pos.x, tile_pos.y, "tile=-=========")
        let roomId = this.checkClickRoom(tile_pos)
        // cc.error(roomId, "roomId==========")
        if (roomId) {
            this.select_room_id = roomId
            let facId = this.checkClickFac(roomId, tile_pos)
            // cc.error(facId, "facId==========")
            if (facId) {
                let roomFac = RoomMgr.instance.getRoomFac(roomId, facId)
                if (!cc.isValid(roomFac)) return
                let isLock = roomFac.getIsLock()
                if (!isLock) return
                let skin_fac_list = this.getSkinListByFacId(facId)
                if (skin_fac_list.length <= 0) return
                let same_icon = roomFac.getSameIcon()
                let isClickContain = false
                for (let i = 0; i < same_icon.length; i++) {
                    const icon = same_icon[i]
                    let pos_n = icon.node.convertToNodeSpaceAR(pos)
                    let rect = icon.spriteFrame.getRect()
                    let temp_rect = cc.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height)
                    if (temp_rect.contains(pos_n)) {
                        isClickContain = true
                        break
                    }
                }
                if (isClickContain) {
                    // cc.error(facId, "dump==========22")
                    if (this.skin_group_state) {
                        if (this.cur_group_skin_fac_id != facId) {
                            let cur_change_skin_data = FacSkinGroup.instance.getCurChangeSkinData()
                            if (cur_change_skin_data[this.cur_group_skin_fac_id]) {
                                let use_skin_id = cur_change_skin_data[this.cur_group_skin_fac_id]
                                let skin_data = this._json_manager.getJsonData(this._json_manager._json_name.FACILITY_SKIN, use_skin_id)
                                this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, { facId: skin_data["own_facility"], skin_num: skin_data["set"], skin_id: use_skin_id })
                            }
                            else {
                                let use_skin_id = this.getUseSkinIdByFacId(this.cur_group_skin_fac_id)
                                let skin_data = this._json_manager.getJsonData(this._json_manager._json_name.FACILITY_SKIN, use_skin_id)
                                this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, { facId: skin_data["own_facility"], skin_num: skin_data["set"], skin_id: use_skin_id })
                            }
                            this.cur_group_skin_fac_id = facId
                            this.changeSkinGroupFac(roomId, facId)
                        }
                    } else {
                        if (cc.isValid(this.facSkinScript)) {
                            if (this.cur_skin_id != facId) {
                                let use_skin_id = this.getUseSkinIdByFacId(this.cur_skin_id)
                                let skin_data = this._json_manager.getJsonData(this._json_manager._json_name.FACILITY_SKIN, use_skin_id)
                                this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, { facId: skin_data["own_facility"], skin_num: skin_data["set"], skin_id: use_skin_id })

                                this.cur_skin_id = facId
                                this.addSkinView({ roomId: roomId, facId: facId })

                            }
                        } else {
                            this.cur_skin_id = facId
                            this.select_fac_id = facId
                            this.schedule(this.tickClick, 1 / 60)
                        }
                    }
                }
            }
        }
    }

    /**
     * 皮肤套装快速选中
     */
    private changeSkinGroupFac(roomId: number, facId: number) {
        this.moveToFacPosByRoomIdByFacId(roomId, facId)
        let skin_data
        let json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let own_facility = item_data["own_facility"]
                let set = item_data["set"]
                if (facId == own_facility && set == this.cur_skin_group_set) {
                    skin_data = item_data
                    break
                }
            }
        }

        if (!skin_data) return

        let temp_data = {
            roomId: roomId,
            facId: facId,
            data: skin_data,
            isSkinGroup: true
        }
        // this._event_manager.dispatch(this._event_name.EVENT_ADD_FAC_SKIN_BTN, temp_data)
        this.addSkinBtn(temp_data)

        let data = {
            facId: facId,
            skin_num: skin_data["set"],
            skin_id: skin_data["id"],
        }
        this._event_manager.dispatch(this._event_name.EVENT_CHANGE_FAC_SKIN, data)

        let event_data = {
            facId: facId,
            skin_num: this.cur_skin_group_set,
            isShow: true
        }
        this._event_manager.dispatch(this._event_name.EVENT_SHOW_SINGLE_SKIN_ITEM, event_data)
    }

    private tickClick() {
        this.tick_time += this.tick_add_time
        if (this.tick_time >= 0.05) {
            this.unschedule(this.tickClick)
            this.tick_time = 0
            this.addSkinArrow()
            this.is_add_skin_arrow = true
        }
    }

    public getIsAddSkinArrow() {
        return this.is_add_skin_arrow
    }

    /**
     * 获取配置皮肤列表
     */
    private getSkinListByFacId(facId) {
        let skin_list = []
        let json = this._json_manager.getJson(this._json_name.FACILITY_SKIN)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let own_facility = item_data["own_facility"]
                if (facId == own_facility) {
                    skin_list.push(item_data)
                }
            }
        }

        return skin_list
    }

    private addSkinArrow() {
        if (this.select_fac_id) {
            let roomFac = RoomMgr.instance.getRoomFac(this.select_room_id, this.select_fac_id)
            if (cc.isValid(roomFac)) {
                roomFac.addSkinArrowAni()
            }
        }
    }

    private removeSkinArrow() {
        if (this.select_fac_id) {
            let roomFac = RoomMgr.instance.getRoomFac(this.select_room_id, this.select_fac_id)
            if (cc.isValid(roomFac)) {
                roomFac.removeSkinArrowAni()
            }
        }
    }

    /**
     * 点击移动
     * @param event 
     */
    public clickMove(event, isTouchMoved) {
        let touches: any[] = event.getTouches()
        if (touches.length === 1) {

        }

        if (isTouchMoved) {
            this.unschedule(this.tickClick)
            this.removeSkinArrow()
        }
    }

    /**
     * 点击结束
     * @param event 
     */
    public clickEnd(event, isTouchMoved) {
        this.unschedule(this.tickClick)
        this.removeSkinArrow()
        this.select_room_id = null
        this.select_fac_id = null
        this.is_add_skin_arrow = false

        let touches: any[] = event.getTouches()
        if (touches.length <= 1) {
            if (!isTouchMoved) {
                let worldPos: cc.Vec2 = cc.v2(event.getLocation())
                this.checkClick(worldPos)
            }
        }
    }

    /**
     * 点击取消
     * @param event 
     */
    public clickCancel(event) {
    }

    public getSelectFacId() {
        return this.select_fac_id
    }

    private addSkinView(data) {
        // cc.error(data, "data=========")
        let roomId = data["roomId"]
        let facId = data["facId"]
        this.isHaveSkinViwe = true

        if (cc.isValid(this.facSkinScript)) {
            this.facSkinScript.init(roomId, facId)
        } else {
            cc.resources.load("prefabs/builds/FacSkin", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
                if (!err) {
                    let node = cc.instantiate(prefab)
                    let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
                    parent.addChild(node)

                    this.facSkinScript = node.getComponent(FacSkin)
                    this.facSkinScript.init(roomId, facId)

                    this._event_manager.dispatch(this._event_name.EVENT_SKIN_SHOW_UI, true)
                }
            })
        }

        this.moveToFacPosByRoomIdByFacId(roomId, facId)
    }

    private addSkinBtn(eventData) {
        let roomId = eventData["roomId"]
        let facId = eventData["facId"]
        let data = eventData["data"]
        let roomFac = RoomMgr.instance.getRoomFac(roomId, facId)
        if (cc.isValid(roomFac)) {
            if (cc.isValid(this.skinBtn)) {
                let pos_w = roomFac.node.parent.convertToWorldSpaceAR(roomFac.node.position)
                let pos_n = this.map.convertToNodeSpaceAR(pos_w)
                this.skinBtn.position = cc.v3(pos_n.x, pos_n.y - 60)
                this.skinBtn.getComponent(SkinBtn).clickSkinItem(eventData)
            } else {
                cc.resources.load("prefabs/builds/SkinBtn", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
                    if (!err) {
                        this.skinBtn = cc.instantiate(prefab)

                        let pos_w = roomFac.node.parent.convertToWorldSpaceAR(roomFac.node.position)
                        let pos_n = this.map.convertToNodeSpaceAR(pos_w)
                        this.map.addChild(this.skinBtn)
                        this.skinBtn.position = cc.v3(pos_n.x, pos_n.y - 60)
                        this.skinBtn.zIndex = BuildConfig.max_zIndex

                        this.skinBtn.getComponent(SkinBtn).clickSkinItem(eventData)
                    }
                })
            }
        }
    }

    private removeSkinView() {
        this.isHaveSkinViwe = false
        this.facSkinScript = null
        this.cur_skin_id = null
    }

    public setIsHaveSkinViwe(value: boolean) {
        this.isHaveSkinViwe = value
    }

    public getIsHaveSkinViwe() {
        return this.isHaveSkinViwe
    }

    public checkClick(pos: cc.Vec2) {
        let is_click = RoomMgr.instance.checkIsClickBuildBubble(pos)
        if (!is_click) {
            is_click = RoomMgr.instance.checkIsClickMupai(pos)
        }
        if (!is_click) {
            is_click = SceneBuildMgr.instance.checkIsClickBuildBubble(pos)
        }
        if (!is_click) {
            is_click = SceneRubbishMgr.instance.checkIsClickRubbishBubble(pos)
        }

        if (is_click) {
            this._event_manager.dispatch(this._event_name.EVENT_REMOVE_FAC_SKIN_VIEW)
            this._event_manager.dispatch(this._event_name.EVENT_REMOVE_FAC_SKIN_BTN)
        }

        // this.worldToTilePos(pos)
        // if (!is_click) {
        //     let tile_pos = this.worldToTilePos(pos)
        //     let roomId = this.checkClickRoom(tile_pos)
        //     // cc.error(roomId, "roomId==========")
        //     if (roomId) {
        //         let facId = this.checkClickFac(roomId, tile_pos)
        //         // cc.error(facId, "facId==========")
        //         if (facId) {
        //             let roomFac = RoomMgr.instance.getRoomFac(roomId, facId)
        //             let same_icon = roomFac.getSameIcon()
        //             let isClickContain = false
        //             for (let i = 0; i < same_icon.length; i++) {
        //                 const icon = same_icon[i]
        //                 let pos_n = icon.node.convertToNodeSpaceAR(pos)
        //                 let rect = icon.spriteFrame.getRect()
        //                 let temp_rect = cc.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height)
        //                 if (temp_rect.contains(pos_n)) {
        //                     isClickContain = true
        //                     break
        //                 }
        //             }
        //             if (isClickContain) {
        //                 cc.error(facId, "dump==========22")
        //                 is_click = true
        //             } else {
        //                 is_click = false
        //             }
        //         } else {
        //             is_click = false
        //         }
        //     } else {
        //         is_click = false
        //     }
        // }

        // const locationInNode = this.test_sp.node.convertToNodeSpaceAR(pos)
        // const { anchorX, anchorY, width, height } = this.test_sp.node;
        // const x = locationInNode.x + anchorX * width;
        // const y = -(locationInNode.y - anchorY * height);

        // const isValid = !this.isPixelTransparent(this.test_sp.node, x, y);
        // cc.error(isValid,"isvalid========")
    }

    /**
     * 对比
     * @param x 比较对象
     */
    public compare(pos1: cc.Vec2, pos2: cc.Vec2): boolean {
        return pos1.x === pos2.x && pos1.y === pos2.y
    }

    /**
     * 坐标集中是否包含某个坐标
     */
    public coordsIsHaveByCoord(coords: cc.Vec2[], cur_pos: cc.Vec2) {
        for (let i = 0; i < coords.length; i++) {
            const current_coord = coords[i]
            if (this.compare(current_coord, cur_pos)) {
                return true
            }
        }

        return false
    }

    private checkClickFac(roomId: number, tile_pos: cc.Vec2) {
        let fac_pos_list = BuildConfig.fac_grid_pos[roomId]
        for (const key in fac_pos_list) {
            if (Object.prototype.hasOwnProperty.call(fac_pos_list, key)) {
                const pos_list = fac_pos_list[key]
                let is_click_fac = this.coordsIsHaveByCoord(pos_list, tile_pos)
                if (is_click_fac) {
                    return Number(key)
                }
            }
        }

        return
    }

    private checkClickRoom(tile_pos: cc.Vec2) {
        let room_grid_pos_round = BuildConfig.room_grid_pos_round
        for (const key in room_grid_pos_round) {
            if (Object.prototype.hasOwnProperty.call(room_grid_pos_round, key)) {
                const room_pos = room_grid_pos_round[key]
                let x_range = room_pos.x
                let y_range = room_pos.y
                if (tile_pos.x >= x_range[0] && tile_pos.x <= x_range[1] && tile_pos.y >= y_range[0] && tile_pos.y <= y_range[1]) {
                    return Number(key)
                }
            }
        }

        return
    }

    public getMap() {
        return this.map
    }

    public popBuildInfoView(data: { sceneRubbishId?: number, sceneBuildId?: number, roomId?: number, isRoom?: boolean, facId?: number, sceneBuildConfig?, sceneBuildLockId?}) {
        let sceneBuildId = data.sceneBuildId
        let sceneRubbishId = data.sceneRubbishId
        let isRoom = data.isRoom
        let roomId = data.roomId
        let facId = data.facId
        if (sceneBuildId) {
            let sceneBuildConfig = data.sceneBuildConfig
            let sceneBuildLockId = data.sceneBuildLockId
            this.popSceneBuildView(sceneBuildId, sceneBuildConfig, sceneBuildLockId)
        }
        else if (sceneRubbishId) {
            this.popSceneRubbishView(sceneRubbishId)
        }
        else {
            if (isRoom) {
                let json_mission = this._json_manager.getJson(this._json_name.MISSION)
                let need_misson_data = null
                for (const key in json_mission) {
                    if (Object.prototype.hasOwnProperty.call(json_mission, key)) {
                        const data = json_mission[key]
                        if (data["unlock"] == roomId) {
                            need_misson_data = data
                            break
                        }
                    }
                }

                if (need_misson_data) {
                    let level = need_misson_data["level"]
                    if (User.getLevel() >= level) {
                        this.popView1(roomId, facId, isRoom)
                    } else {
                        this.popView2(level, roomId, facId, isRoom)
                    }
                }
            } else {
                this.popView1(roomId, facId, isRoom)
            }
        }
    }

    private popSceneBuildView(sceneBuildId, sceneBuildConfig, sceneBuildLockId) {
        cc.resources.load("prefabs/builds/FacCanLockView", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
                parent.addChild(node)

                let script = node.getComponent(FacCanLockView)
                script.initSceneBuild(sceneBuildId, sceneBuildConfig, sceneBuildLockId)
            }
        })
    }

    private popSceneRubbishView(sceneRubbishId) {
        cc.resources.load("prefabs/builds/FacCanLockView", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
                parent.addChild(node)

                let script = node.getComponent(FacCanLockView)
                script.initSceneRubbish(sceneRubbishId)
            }
        })
    }

    private popView1(roomId: number, facId: number, isRoom: boolean) {
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 11 || guide_id == 18) {
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.setGuideMask(true);
        }
        cc.resources.load("prefabs/builds/FacCanLockView", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
                parent.addChild(node)

                let script = node.getComponent(FacCanLockView)
                script.init(roomId, facId, isRoom)
            }
        })
    }

    private popView2(lv: number, roomId: number, facId: number, isRoom: boolean) {
        cc.resources.load("prefabs/builds/FacLockView", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (!err) {
                let node = cc.instantiate(prefab)
                let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
                parent.addChild(node)

                let script = node.getComponent(FacLockView)
                script.init(roomId, facId, isRoom, lv)
            }
        })
    }



    private setUseGridPos() {
        for (let i = 0; i < this.tileWidthNum; i++) {
            for (let j = 0; j < this.tileHeightNum; j++) {
                let pos = this.tileToWorldPos(i, j)
                if (
                    pos.x >= -this.map.width / 2
                    && pos.x <= this.map.width / 2
                    && pos.y >= -this.map.height / 2
                    && pos.y <= this.map.height / 2
                ) {
                    this.use_grid_list.push(cc.v2(i, j))
                }
            }
        }

        // cc.error(this.use_grid_list, "list=-============")
    }

    private showPos() {
        for (let i = 0; i < 80; i++) {
            for (let j = 0; j < 80; j++) {
                let pos = this.tileToWorldPos(i, j)
                pos.y -= this.tileHeightHalf
                let node: cc.Node = new cc.Node()
                let label = node.addComponent(cc.Label)
                // label.string = `(${i}, ${j})`
                label.string = `${i}, ${j}`
                label.fontSize = 22
                node.color = cc.color(255, 0, 0)

                node.position = cc.v3(pos)
                this.map.addChild(node)
            }

        }
    }

    /**
     格子坐标转相对地图坐标
    */
    public tileToWorldPos(tileX, tileY) {
        var xx = this.getScreenX(this.tileHeightNum - tileY, this.tileWidthNum - tileX);
        var yy = this.getScreenY(this.tileHeightNum - tileY, this.tileWidthNum - tileX);
        var wp = this.node.convertToWorldSpaceAR(cc.v2(xx, yy));
        var np = this.map.convertToNodeSpaceAR(wp);

        return np;
    }

    /**
     * 世界坐标转格子坐标
     * @param mPoint 
     */
    public worldToTilePos(mPoint) {
        // 相对格子node
        let pos = this.node.convertToNodeSpaceAR(mPoint);
        // 格子顶端的坐标
        let oriPos = cc.v2(0, this.tileHeightNum * this.tileHeight);

        let tileX = ((pos.x - oriPos.x) / this.tileWidth) + ((oriPos.y - pos.y) / this.tileHeight);
        let tileY = ((oriPos.y - pos.y) / this.tileHeight) - ((pos.x - oriPos.x) / this.tileWidth);

        tileX = Math.floor(tileX);
        tileY = Math.floor(tileY);

        // let temp_str = `cc.v2(${tileX}, ${tileY}),`
        // this.str += temp_str
        // cc.error(this.str, "str=========")

        // let pos2 = this.tileToWorldPos(tileX, tileY)
        // pos2.y -= this.tileHeightHalf + 20
        // let node: cc.Node = new cc.Node()
        // let label = node.addComponent(cc.Label)
        // // label.string = `(${i}, ${j})`
        // label.string = `${tileX}, ${tileY}`
        // label.fontSize = 22
        // node.color = cc.color(255, 0, 0)

        // node.position = cc.v3(pos2)
        // this.map.addChild(node)

        // cc.error(tileX, tileY, CustomerFindWay.getTileInMapIndex(cc.v2(tileX, tileY)), "dump==========11")
        return cc.v2(tileX, tileY);
    }

    public getRoomFacIsLockByRoomId(roomId: number) {
        return RoomMgr.instance.getRoomFacIsAllUnLockByRoomId(roomId)
    }

    public moveToRoomPosByRoomId(roomId: number, callBack?: Function) {
        let room = RoomMgr.instance.getRoomById(roomId)
        if (cc.isValid(room)) {
            let pos_w = room.node.parent.convertToWorldSpaceAR(room.node.position)
            let node = room.node

            let icon = room.room_sp
            let rect = icon.spriteFrame.getRect()
            let size = cc.view.getVisibleSize()
            let scale_width = size.width / (rect.width * 1.7)
            let scale_height = size.height / (rect.height * 1.7)
            let need_scale = scale_height > scale_width ? scale_width : scale_height
            let pos_n = this.map.convertToNodeSpaceAR(pos_w)
            this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, { pos: pos_n, isNotMoment: true, node: node, need_scale: need_scale, callBack: callBack })
        }
    }

    public moveToSceneBuildByBuildId(buildId: number, callBack?: Function) {
        let build = SceneBuildMgr.instance.getSceneBuildById(buildId)
        if (cc.isValid(build)) {
            let pos_w = build.node.parent.convertToWorldSpaceAR(build.node.position)
            let map = MapGridView.instance.map
            let pos_n = map.convertToNodeSpaceAR(pos_w)

            let icon = build.getIcon()
            let rect = icon.spriteFrame.getRect()
            let size = cc.view.getVisibleSize()
            let scale_width = size.width / (rect.width * 1.7)
            let scale_height = size.height / (rect.height * 1.7)
            let need_scale = scale_height > scale_width ? scale_width : scale_height

            this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, { pos: pos_n, isNotMoment: true, node: build.node, need_scale: need_scale })
        }
    }

    public moveToSceneRubbishByRubbishId(rubbishId: number, callBack?: Function) {
        let build = SceneRubbishMgr.instance.getSceneRubbishById(rubbishId)
        if (cc.isValid(build)) {
            let pos_w = build.node.parent.convertToWorldSpaceAR(build.node.position)
            let map = MapGridView.instance.map
            let pos_n = map.convertToNodeSpaceAR(pos_w)

            let icon = build.getIcon()
            let rect = icon.spriteFrame.getRect()
            let size = cc.view.getVisibleSize()
            let scale_width = size.width / (rect.width * 1.7)
            let scale_height = size.height / (rect.height * 1.7)
            let need_scale = scale_height > scale_width ? scale_width : scale_height

            this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, { pos: pos_n, isNotMoment: true, node: build.node, need_scale: need_scale })
        }
    }

    public moveToFacPosByRoomIdByFacId(roomId: number, facId: number, callBack?: Function) {
        let roomFac = RoomMgr.instance.getRoomFac(roomId, facId)
        if (cc.isValid(roomFac) && this._guide_manager.getGuideFinish()) {
            let node = roomFac.node
            let icon = roomFac.getIcon()
            let rect = icon.spriteFrame.getRect()
            let size = cc.view.getVisibleSize()
            let scale_width = size.width / rect.width
            let scale_height = size.height / rect.height
            let need_scale = scale_height > scale_width ? scale_width : scale_height
            let pos_w = roomFac.node.parent.convertToWorldSpaceAR(roomFac.node.position)
            let pos_n = this.map.convertToNodeSpaceAR(pos_w)
            this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, { pos: pos_n, isNotMoment: true, node: node, need_scale: need_scale })
        }
    }

    private getUseSkinIdByFacId(facId: number) {
        let skin_id = null
        let skin_data = UserDefault.getItem(BuildConfig.fac_skin_data)
        if (!skin_data) {
            skin_id = this.getDefaultSkinIdByFacId(facId)
        } else {
            skin_data = JSON.parse(skin_data)
            if (!skin_data[facId]) {
                skin_id = this.getDefaultSkinIdByFacId(facId)
            } else {
                skin_id = skin_data[facId]["use_skin_id"]
            }
        }

        return skin_id
    }

    /**
     * 获取初始默认皮肤id
     */
    private getDefaultSkinIdByFacId(facId: number): number {
        let skin_list = this.getSkinListByFacId(facId)
        for (let i = 0; i < skin_list.length; i++) {
            const item_data = skin_list[i]
            let unlock_cost = item_data["unlock_cost"]
            if (unlock_cost == "0") {
                return item_data["id"]
            }
        }

        return
    }

    private clearStr() {
        this.str = ""
    }

    /**
     格子X坐标转换成点坐标（用于绘制格子）
    */
    public getScreenX(tileX: number, tileY: number) {
        // (x - y) * tileWidthHalf
        return (tileX - tileY * (this.ratio - 1)) * this.tileWidthHalf
    }

    /**
     格子Y坐标转换成点坐标（用于绘制格子）
    */
    public getScreenY(tileX: number, tileY: number) {
        // (y + x) * tileHeightHalf
        return (tileY + tileX * (this.ratio - 1)) * this.tileHeightHalf
    }

    /**
    绘制网格
   */
    private paintGrid(posX, posY, endX, endY) {
        var drawNode = this.node.addComponent(cc.Graphics)
        var color = new cc.Color(255, 0, 0);
        //横线
        for (let i = posX; i <= endX; i++) {
            var newX = this.getScreenX(i, posY);
            var newY = this.getScreenY(i, posY);
            var newEndX = this.getScreenX(i, endY);
            var newEndY = this.getScreenY(i, endY);

            drawNode.moveTo(newX, newY);
            drawNode.lineTo(newEndX, newEndY);
        }
        //竖线
        for (let j = posY; j <= endY; j++) {
            var newX = this.getScreenX(posX, j);
            var newY = this.getScreenY(posX, j);
            var newEndX = this.getScreenX(endX, j);
            var newEndY = this.getScreenY(endX, j);

            drawNode.moveTo(newX, newY);
            drawNode.lineTo(newEndX, newEndY);
        }
        drawNode.strokeColor = color;
        drawNode.lineWidth = 5;
        drawNode.stroke();
    }

    ////////////////////////////////////////////////////////////////顾客////////////////////////////////////////////////////
    private tempAddCustomer() {
        this.schedule(() => {
            let temp_data = {
                point: 1,
                id: 101,
                roomId: 105
            }
            this.addCustomer(temp_data)
        }, 10)
    }

    /**
     * 获取随机类型
     * @param exclude 需排除的类型
     */
    public getInitRandomType(exclude: number[] = []): number {
        let types = CustomerFindWay.road_line.concat()
        for (let i = 0; i < exclude.length; i++) {
            types.splice(types.indexOf(exclude[i]), 1)
        }
        return types[Math.floor(types.length * Math.random())]
    }

    private addCustomer(eventData) {
        if (!eventData) return
        let point = eventData["point"]
        let id = eventData["id"]
        let behavior_type = eventData["behavior_type"]
        let roomId = eventData["roomId"]
        let is_have_entrust = eventData["is_have_entrust"]

        // cc.error(eventData, "eventData============")

        let star_pos = cc.v2(52, 53)
        let end_pos = cc.v2(44, 53)
        if (behavior_type == 101) {
            star_pos = CustomerFindWay.start_pos[point]
            let end_index = this.getInitRandomType([point])
            // end_index = 1
            end_pos = CustomerFindWay.start_pos[end_index]
        }
        else if (behavior_type == 102) {
            star_pos = CustomerFindWay.start_pos[point]
            // star_pos = cc.v2(52, 53)
            end_pos = CustomerFindWay.room_end_pos[roomId]
        }
        let node = CustomerPoolManager.get()
        let pos = this.tileToWorldPos(star_pos.x, star_pos.y)
        pos.y += 20
        node.parent = this.map
        node.position = cc.v3(pos)
        // node.scaleX = -1
        let data = {
            end_pos: end_pos,
            id: id,
            roomId: roomId,
            is_have_entrust: is_have_entrust
        }
        node.getComponent(Customer).init(data)
    }

    private addEntrustCus() {
        // UserDefault.removeItem(this._user.getUID() + GameConstant.ENTRUST_DATA)
        let local_entrust_data = UserDefault.getItem(this._user.getUID() + GameConstant.ENTRUST_DATA)
        if (local_entrust_data) {
            local_entrust_data = JSON.parse(local_entrust_data)

            // cc.error(local_entrust_data, "dump-----------22")

            for (const key in local_entrust_data) {
                if (Object.prototype.hasOwnProperty.call(local_entrust_data, key)) {
                    const item_data = local_entrust_data[key]
                    let end_time = item_data["end_time"]
                    if (end_time > Date.now()) {
                        let tile_pos = item_data["tile_pos"]
                        let cus_id = item_data["cus_id"]
                        let node = CustomerPoolManager.get()
                        let pos = this.tileToWorldPos(tile_pos.x, tile_pos.y)
                        pos.y += 20
                        node.parent = this.map
                        node.position = cc.v3(pos)
                        let data = {
                            end_pos: null,
                            id: cus_id,
                            roomId: null,
                            is_have_entrust: false,
                            is_entrust: true,
                            entrust_data: item_data
                        }

                        let cus = node.getComponent(Customer)
                        cus.init(data)

                        CustomerManager.instance.addEntrustCusToList(item_data["key"], cus)

                        let zindex = CustomerFindWay.getRoadZindex(tile_pos)
                        if (zindex) {
                            node.zIndex = zindex
                        }
                    } else {
                        let key = item_data["key"]
                        if (local_entrust_data[key]) {
                            delete local_entrust_data[key]
                            UserDefault.setItem(this._user.getUID() + GameConstant.ENTRUST_DATA, JSON.stringify(local_entrust_data))
                        }
                    }
                }
            }

            this.checkEntrustIsFinished()
        }

    }

    public checkEntrustIsFinished() {
        let merge_ele_item = this._utils.getMergeElementCountList() || {}
        let list = CustomerManager.instance.getEntrustCusList()
        for (const key in list) {
            if (Object.prototype.hasOwnProperty.call(list, key)) {
                const customer = list[key]
                if (cc.isValid(customer)) {
                    let data = customer.getEntrustOrderData()
                    if (data) {
                        let order = data["order"]
                        let order_data = this._utils.changeConfigData(order)
                        let isFinished = true
                        for (let i = 0; i < order_data.length; i++) {
                            const item_data = order_data[i]
                            let item_id = Number(item_data["item_id"])
                            let ele_num = merge_ele_item[item_id] || 0
                            let need_num = Number(item_data["item_num"])

                            if (need_num > ele_num) {
                                isFinished = false
                                break
                            }
                        }
                        customer.setEntrustFinishedTip(isFinished)
                    }
                }
            }
        }
    }
    ////////////////////////////////////////////////////////////////顾客////////////////////////////////////////////////////

    // update (dt) {}
}
