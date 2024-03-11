import BuildConfig from "../builds/BuildConfig";
import JianShenFangBehavior, { JianShenFangBehaviorName } from "../builds/JianShenFangBehavior";
import NaiChaBehavior, { NaiChaBehaviorName } from "../builds/NaiChaBehavior";
import QiPaiShiBehavior, { QiPaiShiBehaviorName } from "../builds/QiPaiShiBehavior";
import RoomMgr, { RoomId } from "../builds/RoomMgr";
import YouLeChangBehavior, { YouLeChangBehaviorName } from "../builds/YouLeChangBehavior";
import { UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import CustomerFindWay from "./CustomerFindWay";
import CustomerManager from "./CustomerManager";
import CustomerPoolManager from "./CustomerPoolManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Customer extends MyComponent {

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    @property(cc.Sprite)
    wupin: cc.Sprite = null

    @property(cc.Node)
    bubble_node: cc.Node = null

    @property(cc.Label)
    bubble_ttf: cc.Label = null

    @property(cc.Animation)
    bubble_ani: cc.Animation = null

    @property(cc.Node)
    entrust_node: cc.Node = null

    @property(cc.Node)
    entrust_finished_tip: cc.Node = null

    @property(cc.Node)
    entrust_finished: cc.Node = null

    /**前一个方向 */
    private pre_dir = 4
    /**角色走路是否翻转 */
    private isFlipX = false
    private nodeScale: number = 1
    /**移动一个格子的时间 */
    public move_gride_time: number = 0.7
    private grid_size: number = 60

    private roomId: number = null
    private id: number = null
    private config = null
    private word_bubble = null
    private word_bubble_time: number = 0
    private word_bubble_count_time: number = 0
    private word_bubble_show_time: number = 0
    private bubble_pos_y = {
        10001: 122,
        10002: 144,
        10003: 175,
    }

    private wupin_pos = {
        10001: {
            zheng: cc.v2(-8, 52),
            bei: cc.v2(52, 73)
        },
        10002: {
            zheng: cc.v2(-7, 62),
            bei: cc.v2(42, 72)
        },
        10003: {
            zheng: cc.v2(-5, 76),
            bei: cc.v2(64, 116)
        },
    }

    private isInitRoom: boolean = false
    private isClickCustomer: boolean = false
    private click_dragon_armature_name: string = null

    private entrust_order_data = null
    private entrust_count_time: number = 0
    private is_receive_entrust: boolean = false

    onLoad() {
        this.dragon.on(dragonBones.EventObject.COMPLETE, (a) => {
            if (this.dragon.armatureName == "dianji") {
                this.clickActionAfter()
            }
        })
    }

    start() {

    }

    init(data) {
        this.entrust_order_data = null
        this.entrust_node.active = false
        this.entrust_finished_tip.active = false
        this.entrust_finished.active = false
        this.is_receive_entrust = false
        this.unschedule(this.tickBubbleTime)
        this.node.zIndex = 10
        this.pre_dir = 4
        this.nodeScale = 1
        this.dragon.node.scaleX = this.nodeScale
        this.wupin.node.active = false
        let end_pos = data["end_pos"]
        let roomId = data["roomId"]
        let is_have_entrust = data["is_have_entrust"]
        let is_entrust = data["is_entrust"]
        this.roomId = roomId
        this.id = data["id"]
        this.config = this._json_manager.getJsonData(this._json_name.CUSTOMER_BASE, this.id)
        this.bubble_node.y = this.bubble_pos_y[this.id] || 150
        this.bubble_ani.node.scaleX = 0

        if (is_entrust) {
            this.entrust_order_data = data["entrust_data"]
            this.is_receive_entrust = true
            let end_time = this.entrust_order_data["end_time"]
            let diff_time = Math.floor((end_time - Date.now()) / 1000)
            if (diff_time < 0) {
                CustomerPoolManager.put(this.node)
            }
            this.entrust_count_time = diff_time
            this.schedule(this.countEntrustTime, 1)
        }

        if (is_have_entrust && !this.entrust_order_data) {
            // cc.error("dump==========33")
            this.checkEntrust()
        }

        // cc.error("dump==========44")
        if (this.entrust_order_data) {
            this.entrust_node.active = true
            this.entrust_finished.active = true
            // CustomerManager.instance.is_product = false
        }

        this.dragonReplace(() => {
            if (!is_entrust) {
                let func = () => {
                    CustomerPoolManager.put(this.node)
                }
                this.goGoalPos(end_pos, roomId, func)
            }else {
                this.setAniByName("zhengdaiji")
            }
        })

        if (!this.entrust_order_data) {
            let word_bubble = this.config["word_bubble"]
            let bubble_config = this._json_manager.getJsonData(this._json_name.WORD_BUBBLE, word_bubble)
            let trigger_type = bubble_config["trigger_type"]
            this.word_bubble_show_time = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10021).int_para
            if (trigger_type == 1) {
                // 时长
                this.word_bubble_time = bubble_config["trigger_para"]
                this.word_bubble_count_time = this.word_bubble_time
                this.schedule(this.tickBubbleTime, 1)
            }
        }

        this.isClickCustomer = false
        this.click_dragon_armature_name = null
    }

    private checkEntrust() {
        let entrust_index = this._json_manager.getJson(this._json_name.ENTRUST_INDEX)
        let lv = this._user.getLevel()

        let need_data = null
        for (const key in entrust_index) {
            if (Object.prototype.hasOwnProperty.call(entrust_index, key)) {
                const item_data = entrust_index[key]
                let lv_min = item_data["lv_min"]
                let lv_max = item_data["lv_max"]
                if (lv >= lv_min && lv <= lv_max) {
                    need_data = item_data
                    break
                }
            }
        }
        let is_random = false
        if (need_data) {
            let percent = need_data["percent"]
            let random = this._utils.getRandomInt(1, 100)
            if (random <= percent) {
                is_random = true
            }
        }

        // temp_test
        // is_random = true
        if (is_random) {
            let pool_id = need_data["pool_id"]
            let entrust_pool = this._json_manager.getJson(this._json_name.ENTRUST)
            let list = []
            for (const key in entrust_pool) {
                if (Object.prototype.hasOwnProperty.call(entrust_pool, key)) {
                    const item_data = entrust_pool[key]
                    if (pool_id == item_data["pool_id"]) {
                        list.push(item_data)
                    }
                }
            }

            if (list.length > 0) {
                let need_data = this.getEntrustOrder(list)
                if (need_data) {
                    this.entrust_order_data = this._utils.clone(need_data)

                    this.entrust_order_data["cus_id"] = this.id
                }
            }
        }
    }

    /**
     * 根据权重获得奖池数据
     */
    private getEntrustOrder(item_list: any[]) {
        let total_weight = 0
        for (let i = 0; i < item_list.length; i++) {
            let item_data = item_list[i]
            const weight = Number(item_data["weight"])
            total_weight += weight
        }

        let list = []
        let current_weight = total_weight
        for (let j = 0; j < item_list.length; j++) {
            let item_data = item_list[j]
            const value = Number(item_data["weight"])
            let range = [current_weight, current_weight - value]
            current_weight = current_weight - value
            let data = { range: range, data: item_data }
            list.push(data)
        }

        let random = this._utils.getRandomInt(0, total_weight)
        let need_data = null
        for (let i = 0; i < list.length; i++) {
            const data = list[i]
            let range = data["range"]
            if (random >= range[1] && random <= range[0]) {
                need_data = data["data"]
                break
            }
        }
        // cc.error(list, random, need_data, "dump=-=========11")

        return need_data
    }

    private tickBubbleTime() {
        if (this.isInitRoom) return

        this.word_bubble_count_time -= 1
        if (this.word_bubble_count_time <= 0) {
            let str = this.getBubbleStr()
            if (str) {
                this.bubble_ttf.string = str
                this.bubble_node.active = true
                cc.tween(this.bubble_node)
                    .call(() => {
                        this.bubble_ani.play("duihuaqipao")
                    })
                    .delay(this.word_bubble_show_time)
                    .call(() => {
                        this.bubble_ani.play("duihuaqipao2")
                    })
                    .start()

            }

            this.word_bubble_count_time = this.word_bubble_time
        }
    }

    private getBubbleStr() {
        let word_bubble = this.config["word_bubble"]
        let bubble_config = this._json_manager.getJsonData(this._json_name.WORD_BUBBLE, word_bubble)
        let total_weight = bubble_config["null_weight"]
        for (let i = 1; i <= 3; i++) {
            let weight = bubble_config["weight_" + i]
            total_weight += weight
        }

        let list = []
        let current_weight = total_weight
        let keys = ["null_weight", "weight_1", "weight_2", "weight_3"]
        let word_keys = ["none", "word_1", "word_2", "word_3"]
        for (let j = 0; j < keys.length; j++) {
            const key = keys[j]
            let word_key = word_keys[j]
            let weight = bubble_config[key]
            let range = [current_weight, current_weight - weight]
            current_weight = current_weight - weight
            let data = { range: range, word_key: word_key }
            list.push(data)
        }

        let word_key = null
        let random = this._utils.getRandomInt(0, total_weight)
        for (let i = 0; i < list.length; i++) {
            const data = list[i]
            let range = data["range"]
            if (random >= range[1] && random <= range[0]) {
                word_key = data["word_key"]
                break
            }
        }

        if (word_key) {
            if (word_key != "none") {
                return bubble_config[word_key]
            } else {
                return
            }
        } else {
            return
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
    async dragonReplace(callBack?: Function) {
        // 龙骨动画资源
        // ske 骨骼数据
        // tex 骨骼纹理数据
        let dragon = this.config["action"]
        let ske = `dragon/customer/${dragon}_ske`
        let tex = `dragon/customer/${dragon}_tex`
        // cc.error(ske, tex, "dump=[=============11")
        const s = await this.assetLoadRes(ske, dragonBones.DragonBonesAsset)
        const t = await this.assetLoadRes(tex, dragonBones.DragonBonesAtlasAsset)
        if (s && t) {
            // 进行龙骨动画替换
            if (s instanceof dragonBones.DragonBonesAsset) {
                this.dragon.dragonAsset = s
            }
            if (t instanceof dragonBones.DragonBonesAtlasAsset) {
                this.dragon.dragonAtlasAsset = t
            }

            // this.dragon_state = this.dragon.playAnimation("newAnimation", -1)
            // this.yinying.active = true

            if (callBack) callBack()
        }
    }

    public setAniMove() {
        this.dragon.armatureName = "zheng"
        this.dragon.playAnimation("newAnimation", -1)
    }

    public setAniBei() {
        this.dragon.armatureName = "bei"
        this.dragon.playAnimation("newAnimation", -1)
    }

    public setAniByName(name: string, play_times: number = -1) {
        this.dragon.armatureName = name
        this.dragon.playAnimation("newAnimation", play_times)
    }

    /**步长 */
    public getStepDistance() {
        let dis = this.grid_size / this.move_gride_time;
        return dis;
    }

    /**移动需要时间 */
    public moveNeedTime(starPos: cc.Vec2, endPos: cc.Vec2) {
        let distance = cc.Vec2.distance(starPos, endPos)
        let stepDis = this.getStepDistance()
        let time = distance / stepDis
        // cc.warn(distance, time, "dump==============22")
        return time
    }

    public goGoalPos(tile_pos: cc.Vec2, roomId: number, func?: Function) {
        let playerPos = this.getTilePos()
        let findResult = CustomerFindWay.aStarFindPath(playerPos, tile_pos, roomId)
        let isFindTarget = findResult[0]
        if (isFindTarget) {
            let finalPath = findResult[1]

            let action = this.getMoveAction(<[]>finalPath, func)
            // cc.warn(action, "action============")
            if (action) {
                this.setAniMove()
                this.node.runAction(action);
            }
        } else {
            cc.error(playerPos, tile_pos, "寻找路径失败============")
            CustomerPoolManager.put(this.node)
        }
    }

    private walkCurrentWayEnd() {
        let room = RoomMgr.instance.getRoomById(this.roomId)
        let pos_w = this.node.parent.convertToWorldSpaceAR(this.node.position)
        let pos_n = room.node.convertToNodeSpaceAR(pos_w)
        this.node.parent = room.node
        this.node.position = pos_n
        // cc.error(pos_n.x, pos_n.y, "pos===========")
        this.node.zIndex = CustomerFindWay.room_start_zindex[this.roomId]
        this.node.scale /= BuildConfig.room_scale[this.roomId]
        // this.move_gride_time = 0.3
        if (this.roomId == RoomId.naicha) {
            this.goNaiChaDoor()
        }
        else if (this.roomId == RoomId.jianshenmfang) {
            this.goJianShenFangDoor()
        }
        else if (this.roomId == RoomId.qipaishi) {
            this.goQIPaiShiDoor()
        }
        else if (this.roomId == RoomId.youlechang) {
            this.goYouLeChangDoor()
        }

        this.isInitRoom = true
    }

    public getMoveAction(pathList: cc.Vec2[], endFunc: Function = null) {
        let path_length = Object.keys(pathList).length
        if (path_length <= 0) {
            return
        }

        let oriPos = this.getTilePos()

        // let oriPos = this.playerModel.getTilePos();
        let actionList = [];
        let pre_pos = oriPos;
        let time_pre_pos = oriPos;

        for (let i = 0; i < path_length; i++) {
            let time = 10;
            const pos = pathList[i];
            let posXY = MapGridView.instance.tileToWorldPos(pos.x, pos.y);
            let current_start_pos = MapGridView.instance.tileToWorldPos(time_pre_pos.x, time_pre_pos.y)
            let stepTime = this.moveNeedTime(cc.v2(current_start_pos), posXY);
            time = stepTime
            time_pre_pos = pos

            let spawnArr = [
                cc.moveTo(time, cc.v2(posXY.x, posXY.y)),
                cc.callFunc((target) => {
                    this.checkPlayerDir(pre_pos, pos)

                    pre_pos = pos

                    let zindex = CustomerFindWay.getRoadZindex(pos)
                    if (zindex) {
                        target.zIndex = zindex
                    } else {
                        let mapIndex = CustomerFindWay.getTileInMapIndex(pos)
                        target.zIndex = mapIndex
                    }
                })
            ]

            let spawnAction = cc.spawn(spawnArr);
            let seqAction = cc.sequence([
                spawnAction,
                cc.callFunc(() => {
                    if (i == 0) {
                        if (path_length == 1) {
                            if (this.roomId) {
                                this.walkCurrentWayEnd()
                            } else {
                                if (endFunc) {
                                    endFunc()
                                }
                            }
                        }
                    } else if (i == path_length - 1) {
                        if (this.roomId) {
                            this.walkCurrentWayEnd()
                        } else {
                            if (endFunc) {
                                endFunc()
                            }
                        }
                    }
                }),
            ])

            actionList.push(seqAction);
        }

        if (actionList.length == 1) {
            let call = cc.callFunc(() => {

            });
            actionList.push(call);
        }
        return cc.sequence(actionList);
    }

    /**获取所处格子位置 */
    public getTilePos(): cc.Vec2 {
        let position = this.node.position
        let worldPos = this.node.parent.convertToWorldSpaceAR(position)
        worldPos.y -= 20
        let tilePos = MapGridView.instance.worldToTilePos(cc.v2(worldPos))

        return tilePos
    }

    /**
     * 方向
     * 四周方向的格子 分别为 0：右，1：右下，2：下，3：下左 4：左 5：坐上 6：上 7：上右
     * @param pre_pos 
     * @param nextPos 
     */
    private checkPlayerDir(pre_pos: cc.Vec2, nextPos: cc.Vec2) {
        let dir = null

        dir = this.getAroundCurrposToNextDir(pre_pos, nextPos)
        if ((this.pre_dir == 4 || this.pre_dir == 3) &&
            (dir == 5 || dir == 6)) {
            if (dir == 6) {
                this.isFlipX = false
                this.dragon.node.scaleX = -this.nodeScale
                this.setAniBei()
            } else if (dir == 5) {
                this.isFlipX = false
                this.dragon.node.scaleX = this.nodeScale
                this.setAniMove()
            }
        }
        else if ((this.pre_dir == 4 || this.pre_dir == 3) &&
            (dir == 7)) {
            this.isFlipX = true
            this.dragon.node.scaleX = this.nodeScale
            this.setAniBei()
        }
        else if ((this.pre_dir == 3 || this.pre_dir == 4) &&
            (dir == 0 || dir == 1 || dir == 2)) {
            this.isFlipX = true
            this.dragon.node.scaleX = -this.nodeScale
            this.setAniMove()
        }
        else if ((this.pre_dir == 0 || this.pre_dir == 1 || this.pre_dir == 2) &&
            (dir == 6 || dir == 7)) {
            this.isFlipX = true
            this.dragon.node.scaleX = -this.nodeScale
            this.setAniMove()
        }
        else if ((this.pre_dir == 0 || this.pre_dir == 1 || this.pre_dir == 2) &&
            (dir == 5)) {
            this.isFlipX = false
            this.dragon.node.scaleX = this.nodeScale
            this.setAniMove()
        }
        else if ((this.pre_dir == 0 || this.pre_dir == 1 || this.pre_dir == 2) &&
            (dir == 3 || dir == 4)) {
            this.isFlipX = false
            this.dragon.node.scaleX = this.nodeScale
            this.setAniMove()
        }
        // dir: 0：右，1：右下，2：下，3：下左 4：左 5：坐上 6：上 7：上右
        else if ((this.pre_dir == 5 || this.pre_dir == 6) &&
            (dir == 7)) {
            this.isFlipX = true
            this.dragon.node.scaleX = this.nodeScale
            this.setAniBei()
        }
        else if ((this.pre_dir == 5 || this.pre_dir == 6) &&
            (dir == 0 || dir == 1 || dir == 2)) {
            this.isFlipX = true
            this.dragon.node.scaleX = -this.nodeScale
            this.setAniMove()
        }
        else if ((this.pre_dir == 5 || this.pre_dir == 6) &&
            (dir == 3 || dir == 4)) {
            this.isFlipX = false
            this.dragon.node.scaleX = this.nodeScale
            this.setAniMove()
        }
        else if ((this.pre_dir == 7) &&
            (dir == 0 || dir == 1 || dir == 2)) {
            this.isFlipX = true
            this.dragon.node.scaleX = -this.nodeScale
            this.setAniMove()
        }
        else if ((this.pre_dir == 7) &&
            (dir == 3 || dir == 4)) {
            this.isFlipX = false
            this.dragon.node.scaleX = this.nodeScale
            this.setAniMove()
        }
        else if ((this.pre_dir == 7) &&
            (dir == 5 || dir == 6)) {
            if (dir == 6) {
                this.isFlipX = false
                this.dragon.node.scaleX = -this.nodeScale
                this.setAniBei()
            } else if (dir == 5) {
                this.isFlipX = false
                this.dragon.node.scaleX = this.nodeScale
                this.setAniMove()
            }
        }
        this.pre_dir = dir

    }

    /**
     * 通过当前位置判断下一位置
     * @param currPos 
     * @param nextPos 
     * @returns dir: 0：右，1：右下，2：下，3：下左 4：左 5：坐上 6：上 7：上右
     */
    public getAroundCurrposToNextDir(currPos: cc.Vec2, nextPos: cc.Vec2) {
        let dir = null;
        let arrPos = CustomerFindWay.getAroundDirectTileVec(currPos)
        for (let i = 0; i < arrPos.length; i++) {
            const pos = arrPos[i];
            if (pos.x == nextPos.x && pos.y == nextPos.y) {
                dir = i;
                break;
            }
        }

        return dir;
    }

    private getRoomAction(act_info: object, callBack?: Function, actionName?: string) {
        let pos_list
        let actionName_list
        let flip_list

        if (actionName == "bath") {
            pos_list = act_info["bath_pos"]
            actionName_list = act_info["bath_action_name"]
            flip_list = act_info["bath_flip"]
        }
        else if (actionName == "noBath") {
            pos_list = act_info["no_bath_pos"]
            actionName_list = act_info["no_bath_action_name"]
            flip_list = act_info["no_bath_flip"]
        }
        else if (actionName == "move") {
            pos_list = act_info["move_pos"]
            actionName_list = act_info["move_action_name"]
            flip_list = act_info["move_flip"]
        }
        else if (actionName == "pos2") {
            pos_list = act_info["pos2"]
            actionName_list = act_info["actionName2"]
            flip_list = act_info["flip2"]
        }
        else {
            pos_list = act_info["pos"]
            actionName_list = act_info["actionName"]
            flip_list = act_info["flip"]
        }

        let zindex = act_info["zindex"]

        let actionList = []
        let oriPos = this.node.position
        let pre_pos = oriPos
        let time_pre_pos = oriPos

        let path_length = pos_list.length
        for (let i = 0; i < path_length; i++) {
            let time = 10
            const pos = pos_list[i]
            let act_name = actionName_list[i]
            let flipX = flip_list[i]
            let stepTime = this.moveNeedTime(cc.v2(time_pre_pos), pos)
            time = stepTime
            time_pre_pos = pos

            let spawnArr = [
                cc.moveTo(time, cc.v2(pos.x, pos.y)),
                cc.callFunc((target) => {
                    if (zindex) {
                        this.node.zIndex = zindex[i]
                    }
                    this.setAniByName(act_name)
                    if (act_name == "zhengna") {
                        let pos = this.wupin_pos[this.id]["zheng"]
                        this.wupin.node.position = pos
                    } else if (act_name == "beina") {
                        let pos = this.wupin_pos[this.id]["bei"]
                        this.wupin.node.position = pos
                    }

                    if (flipX == 1) {
                        this.dragon.node.scaleX = -this.nodeScale
                    } else {
                        this.dragon.node.scaleX = this.nodeScale
                    }
                    pre_pos = pos
                })
            ]

            let spawnAction = cc.spawn(spawnArr);
            let seqAction = cc.sequence([
                spawnAction,
                cc.callFunc(() => {
                    if (i == 0) {
                        if (path_length == 1) {
                            if (callBack) {
                                callBack()
                            }
                        }
                    } else if (i == path_length - 1) {
                        if (callBack) {
                            callBack()
                        }
                    }
                }),
            ])

            actionList.push(seqAction);
        }

        if (actionList.length == 1) {
            let call = cc.callFunc(() => {

            });
            actionList.push(call)
        }

        return cc.sequence(actionList)
    }

    private clickCustomer() {
        if (this.isInitRoom == false && !this.isClickCustomer) {
            this.isClickCustomer = true
            this.node.pauseAllActions()
            this.click_dragon_armature_name = this.dragon.armatureName

            let str = this.getBubbleStr()
            if (str) {
                this.bubble_ttf.string = str
                this.bubble_ani.node.scaleX = 0
                this.bubble_ani.play("duihuaqipao")

                this.scheduleOnce(() => {
                    if (this.bubble_ani.node.scaleX == 1) {
                        this.bubble_ani.play("duihuaqipao2")
                    }
                }, 2)
            }

            this.setAniByName("dianji", 1)
        }
    }

    private clickActionAfter() {
        this.node.resumeAllActions()
        this.setAniByName(this.click_dragon_armature_name)
        this.click_dragon_armature_name = null
        this.isClickCustomer = false
    }

    private clickEntrust() {
        if (this.is_receive_entrust && this.entrust_order_data) {
            let func = (is_receive) => {
                if (!is_receive) {
                    CustomerPoolManager.put(this.node)
                }
            }
            this.entrust_order_data["callBack"] = func
            this._dialog_manager.openDialog(this._dialog_name.EntrustView, this.entrust_order_data)
        } else {
            if (this.entrust_order_data) {
                let func = (is_receive) => {
                    if (is_receive) {
                        this.is_receive_entrust = true
                        this.entrust_order_data["isReveive"] = true
                        let time = this.entrust_order_data["time"]
                        let seconds = time / 60 * 3600
                        let end_time = Date.now() + seconds * 1000
                        this.entrust_order_data["end_time"] = end_time

                        let key = Date.now() + Math.floor(1000 + 9000 * Math.random())
                        let local_entrust_data = UserDefault.getItem(this._user.getUID() + GameConstant.ENTRUST_DATA)
                        if (local_entrust_data) {
                            local_entrust_data = JSON.parse(local_entrust_data)
                        }else {
                            local_entrust_data = {}
                        }

                        // this.entrust_order_data["target_node"] = this
                        this.entrust_order_data["key"] = key
                        this.entrust_order_data["tile_pos"] = this.getTilePos()
                        local_entrust_data[key] = this.entrust_order_data
                        // cc.error(local_entrust_data, "dump========33")
                        UserDefault.setItem(this._user.getUID() + GameConstant.ENTRUST_DATA, JSON.stringify(local_entrust_data))

                        let diff_time = Math.floor((end_time - Date.now()) / 1000)
                        if (diff_time < 0) {
                            CustomerPoolManager.put(this.node)
                        }
                        this.entrust_count_time = diff_time
                        this.schedule(this.countEntrustTime, 1)

                        CustomerManager.instance.addEntrustCusToList(key, this)
                        MapGridView.instance.checkEntrustIsFinished()
                    } else {
                        this.entrust_order_data = null
                        this.entrust_node.active = false
                        CustomerPoolManager.put(this.node)
                    }
                }
                this.entrust_order_data["callBack"] = func
                this._dialog_manager.openDialog(this._dialog_name.EntrustView, this.entrust_order_data)
                this.node.pauseAllActions()
                this.setAniByName("zhengdaiji")
            }
        }
    }

    private countEntrustTime() {
        this.entrust_count_time -= 1
        if (this.entrust_count_time > 0) {

        } else {
            let local_entrust_data = UserDefault.getItem(this._user.getUID() + GameConstant.ENTRUST_DATA)
            if (local_entrust_data) {
                local_entrust_data = JSON.parse(local_entrust_data)
                if (this.entrust_order_data && this.entrust_order_data["key"]) {
                    let key = this.entrust_order_data["key"]
                    if (local_entrust_data[key]) {
                        delete local_entrust_data[key]
                        UserDefault.setItem(this._user.getUID() + GameConstant.ENTRUST_DATA, JSON.stringify(local_entrust_data))
                    }
                }
            }

            CustomerPoolManager.put(this.node)
        }
    }

    public getEntrustOrderData() {
        return this.entrust_order_data
    }

    public setEntrustFinishedTip(value: boolean) {
        this.entrust_finished_tip.active = value
        this.entrust_finished.active = !value
    }

    //#region 奶茶
    ///////////////////////////////////////////////////////////奶茶/////////////////////////////////////////////////////
    private goNaiChaDoor() {
        let door_info = NaiChaBehavior.instance.getOperationInfoByName(NaiChaBehaviorName.door)
        let func = () => {
            this.goQucan()
        }
        let actions = this.getRoomAction(door_info, func)
        this.node.runAction(actions)

        let num = 0
        let info = UserDefault.getItem(this._user.getUID() + GameConstant.ROLE_ENTER_ROOM_DATA)
        if (info) {
            info = JSON.parse(info)
            if (info[this.id]) {
                let temp_num = info[this.id][this.roomId] || 0
                info[this.id][this.roomId] = temp_num + 1

                num = info[this.id][this.roomId]
            } else {
                info[this.id] = {
                    [this.roomId]: 1
                }
                num = 1
            }
        } else {
            info = {}
            info[this.id] = {
                [this.roomId]: 1
            }
            num = 1
        }
        UserDefault.setItem(this._user.getUID() + GameConstant.ROLE_ENTER_ROOM_DATA, JSON.stringify(info))
        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1007,
            args: [this.id, num, this.roomId],
        })
    }

    private goQucan() {
        let qucan_info = NaiChaBehavior.instance.getQuCanInfo()
        let endAniName = qucan_info["endAniName"]
        let endFlip = qucan_info["endFlip"]
        let stay_time = qucan_info["stay_time"]
        let func = () => {
            this.setAniByName(endAniName)
            if (endFlip) this.dragon.node.scaleX = -this.nodeScale
            else this.dragon.node.scaleX = this.nodeScale

            this.scheduleOnce(this.goJiezhang, stay_time)
        }
        let actions = this.getRoomAction(qucan_info, func)
        this.node.runAction(actions)
    }

    private goJiezhang() {
        let info = NaiChaBehavior.instance.getOperationInfoByName(NaiChaBehaviorName.jiezhang)
        let endAniName = info["endAniName"]
        let endFlip = info["endFlip"]
        let stay_time = info["stay_time"]
        let func = () => {
            this.setAniByName(endAniName)
            if (endFlip) this.dragon.node.scaleX = -this.nodeScale
            else this.dragon.node.scaleX = this.nodeScale

            this.scheduleOnce(this.goZuoWei, stay_time)
        }
        let actions = this.getRoomAction(info, func)
        this.node.runAction(actions)
    }

    private goZuoWei() {
        let info = NaiChaBehavior.instance.getZuoWeiInfo()
        if (info) {
            let key = info["key"]
            NaiChaBehavior.instance.changeZuoWeiState(key, true)
            let endAniName = info["endAniName"]
            let endFlip = info["endFlip"]
            let stay_time = info["stay_time"]
            let moveType = info["moveType"]
            let endZindex = info["endZindex"]
            let func = () => {
                this.wupin.node.active = false
                this.node.zIndex = endZindex
                this.setAniByName(endAniName)
                if (endFlip) this.dragon.node.scaleX = -this.nodeScale
                else this.dragon.node.scaleX = this.nodeScale

                this.scheduleOnce(() => {
                    NaiChaBehavior.instance.changeZuoWeiState(key, false)
                    this.move(moveType)
                }, stay_time)
            }
            let actions = this.getRoomAction(info, func)
            this.node.runAction(actions)

            if (this.roomId) {
                let wupin_name = CustomerFindWay.getWupinByRoomId(this.roomId)
                if (wupin_name) {
                    this.wupin.node.active = true
                    let path = `pic/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/unlock/${wupin_name}`
                    this._utils.setSpriteFrame(this.wupin, path)
                }
            }
        }
        else {
            this.move(NaiChaBehaviorName.move3)
        }
    }


    private move(moveType: string) {
        let info = NaiChaBehavior.instance.getOperationInfoByName(moveType)
        let endAniName = info["endAniName"]
        let endFlip = info["endFlip"]
        let stay_time = info["stay_time"]
        let func = () => {
            this.setAniByName(endAniName)
            if (endFlip) this.dragon.node.scaleX = -this.nodeScale
            else this.dragon.node.scaleX = this.nodeScale
            this.pre_dir = 4
            this.goPoint()
        }
        let actions = this.getRoomAction(info, func)
        this.node.runAction(actions)
    }

    private goPoint() {
        this.isInitRoom = false

        this.wupin.node.active = false
        let map = MapGridView.instance.map
        let pos_w = this.node.parent.convertToWorldSpaceAR(this.node.position)
        let pos_n = map.convertToNodeSpaceAR(pos_w)
        this.node.parent = map
        this.node.position = pos_n
        this.node.scale *= BuildConfig.room_scale[this.roomId]
        this.roomId = null

        let func = () => {
            CustomerPoolManager.put(this.node)
        }
        let end_index = CustomerFindWay.getInitRandomType()
        let end_pos = CustomerFindWay.start_pos[end_index]
        this.goGoalPos(end_pos, null, func)
    }
    ///////////////////////////////////////////////////////////奶茶/////////////////////////////////////////////////////
    //#endregion

    //#region 健身房
    ///////////////////////////////////////////////////////////健身房/////////////////////////////////////////////////////
    private goJianShenFangDoor() {
        let door_info = JianShenFangBehavior.instance.getOperationInfoByName(JianShenFangBehaviorName.door)
        let func = () => {
            this.goDuanLian()
        }
        let actions = this.getRoomAction(door_info, func)
        this.node.runAction(actions)

        let num = 0
        let info = UserDefault.getItem(this._user.getUID() + GameConstant.ROLE_ENTER_ROOM_DATA)
        if (info) {
            info = JSON.parse(info)
            if (info[this.id]) {
                let temp_num = info[this.id][this.roomId] || 0
                info[this.id][this.roomId] = temp_num + 1

                num = info[this.id][this.roomId]
            } else {
                info[this.id] = {
                    [this.roomId]: 1
                }
                num = 1
            }
        } else {
            info = {}
            info[this.id] = {
                [this.roomId]: 1
            }
            num = 1
        }
        UserDefault.setItem(this._user.getUID() + GameConstant.ROLE_ENTER_ROOM_DATA, JSON.stringify(info))
        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1007,
            args: [this.id, num, this.roomId],
        })
    }

    private goDuanLian() {
        let info = JianShenFangBehavior.instance.getDuanLianType()
        if (info) {
            let key = info["key"]
            JianShenFangBehavior.instance.changeDuanLianState(key, true)
            let endAniName = info["endAniName"]
            let endFlip = info["endFlip"]
            let stay_time = info["stay_time"]
            let endZindex = info["endZindex"]
            let endAniPos = info["endAniPos"]
            let func = () => {
                this.node.position = cc.v3(endAniPos)
                this.node.zIndex = endZindex
                this.setAniByName(endAniName)
                if (endFlip) this.dragon.node.scaleX = -this.nodeScale
                else this.dragon.node.scaleX = this.nodeScale

                let facId = info["facId"]
                let index = info["index"]
                let roomFac = RoomMgr.instance.getRoomFac(RoomId.jianshenmfang, facId)
                if (cc.isValid(roomFac)) {
                    roomFac.playSingleDragonState(true, index)
                }

                this.scheduleOnce(() => {
                    JianShenFangBehavior.instance.changeDuanLianState(key, false)
                    let finishPos = info["finishPos"]
                    this.node.position = finishPos

                    if (cc.isValid(roomFac)) {
                        roomFac.playSingleDragonState(false, index)
                    }

                    let bath_info = JianShenFangBehavior.instance.getBathType()
                    if (bath_info) {
                        let key = bath_info["key"]
                        JianShenFangBehavior.instance.changeDuanLianState(key, true)
                        let callBack = () => {
                            this.goBath(bath_info)
                        }

                        let actions = this.getRoomAction(info, callBack, "bath")
                        this.node.runAction(actions)

                    } else {

                        let callBack = () => {
                            this.goMove()
                        }

                        let actions = this.getRoomAction(info, callBack, "noBath")
                        this.node.runAction(actions)
                    }

                }, stay_time)
            }
            let actions = this.getRoomAction(info, func)
            this.node.runAction(actions)
        }
        else {
            this.goMove()
        }
    }

    private noBath(info) {
        let key = info["key"]
        let no_bath_pos = info["no_bath_pos"]
        this.node.position = no_bath_pos
    }

    private goBath(info) {
        // let info = JianShenFangBehavior.instance.getBathType()
        if (info) {
            let key = info["key"]
            let bath_pos = info["bath_pos"]
            let stay_time = info["stay_time"]
            let endZindex = info["endZindex"]
            let finishPos = info["finishPos"]
            this.node.position = bath_pos
            this.setAniByName("xizao")
            this.node.zIndex = endZindex
            this.scheduleOnce(() => {
                this.node.position = finishPos
                this.setAniByName("zhengdaiji")
                this.goMove()
                JianShenFangBehavior.instance.changeDuanLianState(key, false)
            }, stay_time)
        }
    }

    private goMove() {
        let info = JianShenFangBehavior.instance.getOperationInfoByName(JianShenFangBehaviorName.move)
        let endAniName = info["endAniName"]
        let endFlip = info["endFlip"]
        let endZindex = info["endZindex"]
        this.node.zIndex = endZindex
        let func = () => {
            this.setAniByName(endAniName)
            if (endFlip) this.dragon.node.scaleX = -this.nodeScale
            else this.dragon.node.scaleX = this.nodeScale

            this.pre_dir = 3
            this.goPoint()
        }
        let actions = this.getRoomAction(info, func)
        this.node.runAction(actions)
    }
    ///////////////////////////////////////////////////////////健身房/////////////////////////////////////////////////////
    //#endregion

    //#region 棋牌室
    ///////////////////////////////////////////////////////////棋牌室/////////////////////////////////////////////////////
    private goQIPaiShiDoor() {
        let door_info = QiPaiShiBehavior.instance.getOperationInfoByName(QiPaiShiBehaviorName.door)
        let func = () => {
            this.goPlay()
        }
        let actions = this.getRoomAction(door_info, func)
        this.node.runAction(actions)

        let num = 0
        let info = UserDefault.getItem(this._user.getUID() + GameConstant.ROLE_ENTER_ROOM_DATA)
        if (info) {
            info = JSON.parse(info)
            if (info[this.id]) {
                let temp_num = info[this.id][this.roomId] || 0
                info[this.id][this.roomId] = temp_num + 1

                num = info[this.id][this.roomId]
            } else {
                info[this.id] = {
                    [this.roomId]: 1
                }
                num = 1
            }
        } else {
            info = {}
            info[this.id] = {
                [this.roomId]: 1
            }
            num = 1
        }
        UserDefault.setItem(this._user.getUID() + GameConstant.ROLE_ENTER_ROOM_DATA, JSON.stringify(info))
        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1007,
            args: [this.id, num, this.roomId],
        })
    }

    private goPlay() {
        let info = QiPaiShiBehavior.instance.getDuanLianType()
        if (info) {
            let key = info["key"]
            if (key == QiPaiShiBehaviorName.majiang1 || key == QiPaiShiBehaviorName.majiang2 || key == QiPaiShiBehaviorName.majiang3 || key == QiPaiShiBehaviorName.majiang4) {
                if (this.id == 10001) {
                    this.playMaJiang(info)
                } else {
                    this.goMoveQiPaiShi()
                    QiPaiShiBehavior.instance.changeInfoState(key, false)
                }

                return
            }

            QiPaiShiBehavior.instance.changeInfoState(key, true)
            let endAniName = info["endAniName"]
            let endFlip = info["endFlip"]
            let stay_time = info["stay_time"]
            let endZindex = info["endZindex"]
            let endAniPos = info["endAniPos"]
            let func = () => {
                this.node.position = cc.v3(endAniPos)
                this.node.zIndex = endZindex
                if (endAniName == "dataiqiu") {
                    this.dragon.armatureName = endAniName
                    this.dragon.playAnimation("newAnimation", 1)
                } else {
                    this.setAniByName(endAniName)
                }

                if (endFlip) this.dragon.node.scaleX = -this.nodeScale
                else this.dragon.node.scaleX = this.nodeScale

                let facId = info["facId"]
                let index = info["index"]
                let roomFac = RoomMgr.instance.getRoomFac(RoomId.qipaishi, facId)
                if (cc.isValid(roomFac)) {
                    if (endAniName == "dataiqiu") {
                        roomFac.playTaiQiuSingleDragonState(1)
                    } else {
                        roomFac.playSingleDragonState(true, index)
                    }

                }

                this.scheduleOnce(() => {
                    if (endAniName == "dataiqiu") {
                        this.playTaiQiuDiErGan(info)
                    }
                    else {
                        QiPaiShiBehavior.instance.changeInfoState(key, false)
                        let finishPos = info["finishPos"]
                        this.node.position = finishPos

                        if (cc.isValid(roomFac)) {
                            roomFac.playSingleDragonState(false, index)
                        }

                        let callBack = () => {
                            this.goMoveQiPaiShi()
                        }

                        let actions = this.getRoomAction(info, callBack, "move")
                        this.node.runAction(actions)
                    }
                }, stay_time)
            }
            let actions = this.getRoomAction(info, func)
            this.node.runAction(actions)
        }
        else {
            this.goMoveQiPaiShi()
        }
    }

    private playMaJiang(info) {
        let func = () => {
            let key = info["key"]
            let endAniName = info["endAniName"]
            let endFlip = info["endFlip"]
            let stay_time = info["stay_time"]
            let endZindex = info["endZindex"]
            let endAniPos = info["endAniPos"]
            this.node.position = cc.v3(endAniPos)
            this.node.zIndex = endZindex
            this.dragon.armatureName = endAniName
            this.dragon.playAnimation("newAnimation", 1)

            if (endFlip) this.dragon.node.scaleX = -this.nodeScale
            else this.dragon.node.scaleX = this.nodeScale

            let facId = info["facId"]
            let roomFac = RoomMgr.instance.getRoomFac(RoomId.qipaishi, facId)
            if (cc.isValid(roomFac)) {
                roomFac.playMaJiang({ target: this, info: info })
            }
        }
        let actions = this.getRoomAction(info, func)
        this.node.runAction(actions)
    }

    public moveMaJiang(info) {
        let finishPos = info["finishPos"]
        this.node.position = finishPos
        let func = () => {
            let key = info["key"]
            QiPaiShiBehavior.instance.changeInfoState(key, false)
            this.goMoveQiPaiShi()
        }
        let actions = this.getRoomAction(info, func, "move")
        this.node.runAction(actions)
    }

    private playTaiQiuDiErGan(info) {
        let func = () => {
            let key = info["key"]
            let endAniName = info["endAniName2"]
            let endFlip = info["endFlip2"]
            let stay_time = info["stay_time2"]
            let endZindex = info["endZindex2"]
            let endAniPos = info["endAniPos2"]
            this.node.position = cc.v3(endAniPos)
            this.node.zIndex = endZindex
            this.dragon.armatureName = endAniName
            this.dragon.playAnimation("newAnimation", 1)

            if (endFlip) this.dragon.node.scaleX = -this.nodeScale
            else this.dragon.node.scaleX = this.nodeScale

            let facId = info["facId"]
            let index = info["index"]
            let roomFac = RoomMgr.instance.getRoomFac(RoomId.qipaishi, facId)
            if (cc.isValid(roomFac)) {
                roomFac.playTaiQiuSingleDragonState(2)
            }

            this.scheduleOnce(() => {
                QiPaiShiBehavior.instance.changeInfoState(key, false)

                if (cc.isValid(roomFac)) {
                    roomFac.playSingleDragonState(false, index)
                }

                let callBack = () => {
                    this.goMoveQiPaiShi()
                }

                let actions = this.getRoomAction(info, callBack, "move")
                this.node.runAction(actions)
            }, stay_time)
        }
        let actions = this.getRoomAction(info, func, "pos2")
        this.node.runAction(actions)
    }

    private goMoveQiPaiShi() {
        let door_info = QiPaiShiBehavior.instance.getOperationInfoByName(QiPaiShiBehaviorName.move)
        let func = () => {
            this.pre_dir = 4
            this.goPoint()
        }
        let actions = this.getRoomAction(door_info, func)
        this.node.runAction(actions)
    }
    ///////////////////////////////////////////////////////////棋牌室/////////////////////////////////////////////////////
    //#endregion

    //#region 游乐场
    ///////////////////////////////////////////////////////////游乐场/////////////////////////////////////////////////////
    private goYouLeChangDoor() {
        let door_info = YouLeChangBehavior.instance.getOperationInfoByName(YouLeChangBehaviorName.door)
        let func = () => {
            this.playYouLeChang()
        }
        let actions = this.getRoomAction(door_info, func)
        this.node.runAction(actions)

        let num = 0
        let info = UserDefault.getItem(this._user.getUID() + GameConstant.ROLE_ENTER_ROOM_DATA)
        if (info) {
            info = JSON.parse(info)
            if (info[this.id]) {
                let temp_num = info[this.id][this.roomId] || 0
                info[this.id][this.roomId] = temp_num + 1

                num = info[this.id][this.roomId]
            } else {
                info[this.id] = {
                    [this.roomId]: 1
                }
                num = 1
            }
        } else {
            info = {}
            info[this.id] = {
                [this.roomId]: 1
            }
            num = 1
        }
        UserDefault.setItem(this._user.getUID() + GameConstant.ROLE_ENTER_ROOM_DATA, JSON.stringify(info))
        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1008,
            args: [this.id, num, this.roomId],
        })
    }

    private playYouLeChang() {
        let info = YouLeChangBehavior.instance.getInfoType()
        if (info) {
            let key = info["key"]
            // if (key == YouLeChangBehaviorName.motianlun) {
            this.goMoTianLun(info)
            // }
        }
        else {
            this.moveYouLeChang()
        }
    }

    private goMoTianLun(info) {
        // let info = YouLeChangBehavior.instance.getOperationInfoByName(YouLeChangBehaviorName.motianlun)
        let key = info["key"]
        YouLeChangBehavior.instance.changeDuanLianState(key, true)
        let func = () => {
            let endAniName = info["endAniName"]
            let endFlip = info["endFlip"]
            let stay_time = info["stay_time"]
            let endZindex = info["endZindex"]
            let endAniPos = info["endAniPos"]

            this.node.position = cc.v3(endAniPos)
            this.node.scale = 0.8
            this.node.zIndex = endZindex
            this.setAniByName(endAniName)
            if (endFlip) this.dragon.node.scaleX = -this.nodeScale
            else this.dragon.node.scaleX = this.nodeScale

            let facId = info["facId"]
            let index = info["index"]
            let roomFac = RoomMgr.instance.getRoomFac(RoomId.youlechang, facId)

            let ani = this.node.getComponent(cc.Animation)
            if (key == YouLeChangBehaviorName.haidaochuan || key == YouLeChangBehaviorName.feiji) {
                if (key == YouLeChangBehaviorName.haidaochuan) {
                    ani.play("haidaochuan")
                } else if (key == YouLeChangBehaviorName.feiji) {
                    ani.play("feiji")
                }

                this.scheduleOnce(() => {
                    if (key == YouLeChangBehaviorName.haidaochuan) {
                        ani.stop("haidaochuan")
                    } else if (key == YouLeChangBehaviorName.feiji) {
                        ani.stop("feiji")
                    }

                    this.node.angle = 0
                    this.node.scale = 1
                    let finishPos = info["finishPos"]
                    this.node.position = finishPos
                    YouLeChangBehavior.instance.changeDuanLianState(key, false)
                    this.playFinished(info)
                    if (cc.isValid(roomFac)) {
                        roomFac.playSingleDragonState(false, index)
                    }
                }, stay_time)
            }
            else if (key == YouLeChangBehaviorName.motianlun || key == YouLeChangBehaviorName.tiaolouji) {

                ani.off("finished")
                ani.on("finished", () => {
                    this.node.scale = 1
                    YouLeChangBehavior.instance.changeDuanLianState(key, false)
                    let ani_name = ani.currentClip.name
                    if (ani_name == "motianlun" || ani_name == "tiaolouji") {
                        this.playFinished(info)
                        if (cc.isValid(roomFac)) {
                            roomFac.playSingleDragonState(false, index)
                        }
                    }
                })

                if (key == YouLeChangBehaviorName.motianlun) {
                    ani.play("motianlun")
                } else if (key == YouLeChangBehaviorName.tiaolouji) {
                    ani.play("tiaolouji")
                }
            }


            if (cc.isValid(roomFac)) {
                roomFac.playSingleDragonState(true, index)
            }
        }
        let actions = this.getRoomAction(info, func)
        this.node.runAction(actions)
    }

    private playFinished(info) {
        let func = () => {
            this.moveYouLeChang()
        }
        let actions = this.getRoomAction(info, func, "move")
        this.node.runAction(actions)
    }

    private moveYouLeChang() {
        let info = YouLeChangBehavior.instance.getOperationInfoByName(YouLeChangBehaviorName.move)
        let endAniName = info["endAniName"]
        let endFlip = info["endFlip"]
        let endZindex = info["endZindex"]
        this.node.zIndex = endZindex
        let func = () => {
            this.setAniByName(endAniName)
            if (endFlip) this.dragon.node.scaleX = -this.nodeScale
            else this.dragon.node.scaleX = this.nodeScale

            this.pre_dir = 3
            this.goPoint()
        }
        let actions = this.getRoomAction(info, func)
        this.node.runAction(actions)
    }
    ///////////////////////////////////////////////////////////游乐场/////////////////////////////////////////////////////
    //#endregion

    // update (dt) {}
}
