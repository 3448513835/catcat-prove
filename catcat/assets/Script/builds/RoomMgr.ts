import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import BuildBubble from "./BuildBubble";
import { SceneBuildId } from "./BuildConfig";
import Room from "./Room";
import RoomFac from "./RoomFac";
import SceneBuildMgr from "./SceneBuildMgr";


const { ccclass, property } = cc._decorator;

export enum RoomId {
    unknown = 0,
    yutang = 101,
    fish_factory = 102,
    guoyuan = 103,
    guoyuan2 = 104,
    naicha = 105,
    jianshenmfang = 106,
    qipaishi = 107,
    youlechang = 108,
    kuaicanche = 109,
}

@ccclass
export default class RoomMgr extends MyComponent {

    @property({ type: [cc.Node] })
    room_list: cc.Node[] = []

    /**可以解锁的设施气泡列表 */
    private buildBubble_list: { [id: number]: BuildBubble } = {}
    /**房间解锁木牌 */
    private mupai_list: RoomFac[] = []

    public static instance: RoomMgr = null

    protected onLoad() {
        RoomMgr.instance = this

        this.listen(this._event_name.EVENT_TASK_MOVE_MAP_TO_POS, this.taskMoveToPos, this)
    }

    onDestroy() {
        RoomMgr.instance = null
        this.destroy()
    }

    public getRoomList() {
        return this.room_list
    }

    public addRoomToList(room: cc.Node) {
        this.room_list.push(room)
    }

    public getRoomById(id: number): Room {
        let room: Room
        for (let i = 0; i < this.room_list.length; i++) {
            const node = this.room_list[i]
            let room_com = node.getComponent(Room)
            if (id == room_com.getRoomId()) {
                room = room_com
                break
            }
        }

        return room
    }

    public getRoomFac(roomId: number, facId: number) {
        let room = this.getRoomById(roomId)
        if (cc.isValid(room)) {
            return room.getFacById(facId)
        }
        return
    }

    public getRoomFacIsLock(roomId: number, facId: number): boolean {
        let room = this.getRoomById(roomId)
        let isLock = room.getFacIsUnlockById(facId)
        return isLock
    }

    public addBuildBubbleByIndex(index: number, buildBubble: BuildBubble) {
        this.buildBubble_list[index] = buildBubble
        
        if (MapGridView.instance.getSkinUiState()) {
            buildBubble.node.active = false
        }
        this._event_manager.dispatch(this._event_name.EVENT_CAN_LOCK_FAC)
    }

    public removeBuildBubbleByIndex(index: number) {
        delete this.buildBubble_list[index]
    }

    public getBuildBubbleList() {
        return this.buildBubble_list
    }

    public getBuildBubbleByIndex(index: number) {
        return this.buildBubble_list[index]
    }

    public checkIsClickBuildBubble(pos: cc.Vec2): boolean {
        let is_click = false
        for (const key in this.buildBubble_list) {
            if (Object.prototype.hasOwnProperty.call(this.buildBubble_list, key)) {
                const buildBubble = this.buildBubble_list[key]
                let node = buildBubble.node
                let rect = cc.rect(-node.width / 2, -node.height / 2, node.width, node.height)
                let pos_n = node.convertToNodeSpaceAR(pos)
                if (rect.contains(pos_n)) {
                    // cc.error("click_bubble========")
                    this.moveToPosByBuildBubble(buildBubble)
                    // buildBubble.click()
                    is_click = true
                    break
                }
            }
        }

        return is_click
    }

    public moveToPosByBuildBubble(buildBubble: BuildBubble) {
        let roomId = buildBubble.getRoomId()
        let room = RoomMgr.instance.getRoomById(roomId)
        let isRoom = buildBubble.getIsRoom()
        let facId = buildBubble.getFacId()
        // cc.error(isRoom, "isroom=========")
        let pos_w
        let node: cc.Node = null
        let need_scale: number = null
        if (isRoom) {
            pos_w = room.node.parent.convertToWorldSpaceAR(room.node.position)
            node = room.node

            let icon = room.room_sp
            let rect = icon.spriteFrame.getRect()
            let size = cc.view.getVisibleSize()
            let scale_width = size.width / (rect.width * 1.7)
            let scale_height = size.height / (rect.height * 1.7)
            need_scale = scale_height > scale_width ? scale_width : scale_height
        } else {
            // let facId = buildBubble.getFacId()
            let roomFac = room.getFacById(facId)
            pos_w = roomFac.node.parent.convertToWorldSpaceAR(roomFac.node.position)
            // pos_w = buildBubble.node.parent.convertToWorldSpaceAR(buildBubble.node.position)
            node = roomFac.node

            let icon = roomFac.getIcon()
            let rect = icon.spriteFrame.getRect()
            let size = cc.view.getVisibleSize()
            let scale_width = size.width / (rect.width * 1.7)
            let scale_height = size.height / (rect.height * 1.7)
            need_scale = scale_height > scale_width ? scale_width : scale_height
        }

        let map = MapGridView.instance.map
        let pos_n = map.convertToNodeSpaceAR(pos_w)
        this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, { pos: pos_n, isNotMoment: true, node: node, need_scale: need_scale })
        let data = {
            roomId: roomId,
            isRoom: isRoom,
            facId: facId,
        }
        MapGridView.instance.popBuildInfoView(data)
    }

    public addMupiaToList(roomFac: RoomFac) {
        this.mupai_list.push(roomFac)
    }

    public removeMupaiToList(roomFac: RoomFac) {
        let index = this.mupai_list.indexOf(roomFac)
        if (index != -1) {
            this.mupai_list.splice(index, 1)
        }
    }

    public checkIsClickMupai(pos: cc.Vec2): boolean {
        let is_click = false
        for (let i = 0; i < this.mupai_list.length; i++) {
            const roomFac = this.mupai_list[i]
            let node = roomFac.node
            let rect = cc.rect(-node.width / 2, -node.height / 2, node.width, node.height)
            let pos_n = node.convertToNodeSpaceAR(pos)
            if (rect.contains(pos_n) && roomFac.node.active) {
                // cc.error("click_mupai========")
                let roomId = roomFac.getRoomId()
                let room = RoomMgr.instance.getRoomById(roomId)
                let pos_w = room.node.parent.convertToWorldSpaceAR(room.node.position)
                let map = MapGridView.instance.map
                let pos1 = map.convertToNodeSpaceAR(pos_w)

                let icon = room.room_sp
                let rect = icon.spriteFrame.getRect()
                let size = cc.view.getVisibleSize()
                let scale_width = size.width / (rect.width * 1.7)
                let scale_height = size.height / (rect.height * 1.7)
                let need_scale = scale_height > scale_width ? scale_width : scale_height
                this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, { pos: pos1, isNotMoment: true, node: room.node, need_scale: need_scale })
                // roomFac.click()

                let isRoom = roomFac.getIsRoom()
                let facId = roomFac.getFacId()
                let data = {
                    roomId: roomId,
                    isRoom: isRoom,
                    facId: facId
                }
                MapGridView.instance.popBuildInfoView(data)

                is_click = true
                break
            }
        }

        return is_click
    }

    private taskMoveToPos(data: { isRoom: boolean, roomId: number, facId: number, isSceneBuild: boolean }) {
        if (!data.isSceneBuild) {
            let index = data.facId + data.roomId
            let buildBubble = this.getBuildBubbleByIndex(index)
            if (cc.isValid(buildBubble)) {
                this.moveToPosByBuildBubble(buildBubble)
            }
        }
    }

    public getRoomFacIsAllUnLockByRoomId(roomId: number) {
        let isLock = false
        for (let i = 0; i < this.room_list.length; i++) {
            const node = this.room_list[i]
            let room_com = node.getComponent(Room)
            if (roomId == room_com.getRoomId()) {
                isLock = room_com.getAllFacIsUnlock()
                break
            }
        }

        return isLock
    }

    // update (dt) {}
}
