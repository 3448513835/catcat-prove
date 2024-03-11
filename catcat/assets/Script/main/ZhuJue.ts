import MyComponent from "../common/MyComponent";
import CustomerFindWay from "../customer/CustomerFindWay";
import MapGridView from "./MapGridView";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ZhuJue extends MyComponent {

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    private cur_point: number = 1
    /**前一个方向 */
    private pre_dir = 0
    /**角色走路是否翻转 */
    private isFlipX = false
    private nodeScale: number = 0.5
    /**移动一个格子的时间 */
    public move_gride_time: number = 0.7
    private grid_size: number = 60

    private cur_res: string = "zhujue_1"
    private ani_name: string = ""

    onLoad () {
        this.listen(this._event_name.EVENT_SHOW_MAIN_BUILD_LV_UP, this.userLvUp, this)
        this.userLvUp()
    }

    start () {
        let point = this.getInitRandomPoint()
        this.cur_point = point
        let point_data = CustomerFindWay.zhujue_point_data[this.cur_point]
        let pos = point_data.pos
        let node_pos = MapGridView.instance.tileToWorldPos(pos.x, pos.y)
        this.node.position = cc.v3(node_pos)

        this.moveToEndPos()
    }

    private userLvUp() {
        let cur_lv = this._user.getLevel()
        let json_config = this._json_manager.getJsonData(this._json_name.PLAYER_LV, cur_lv)
        let main_cat = json_config["main_cat"]
        if (main_cat != this.cur_res) {
            this.dragon.armatureName = main_cat
            this.dragon.playAnimation(this.ani_name, -1)
            this.cur_res = main_cat
        }
    }

    private moveToEndPos() {
        let end_point = this.getInitRandomPoint([this.cur_point])
        let point_data = CustomerFindWay.zhujue_point_data[end_point]
        let tile_pos = point_data.pos
        let isRest = point_data.isRest
        let playerPos = this.getTilePos()
        let findResult = CustomerFindWay.aStarFindPath(playerPos, tile_pos)
        let isFindTarget = findResult[0]
        if (isFindTarget) {
            let finalPath = findResult[1]
            let func = () => {
                this.cur_point = end_point
                if (isRest) {
                    let isStop = this._utils.getRandomInt(0, 1) == 1 ? true : false
                    if (isStop) {
                        this.setAniRest()
                        this.scheduleOnce(() => {
                            this.moveToEndPos()
                        }, 4)
                    }else {
                        this.moveToEndPos()
                    }
                }else {
                    this.moveToEndPos()
                }
            }
            let action = this.getMoveAction(<[]>finalPath, func)
            // cc.warn(action, "action============")
            if (action) {
                this.setAniMove()
                this.node.runAction(action)
            }
        } else {
            cc.error(playerPos, tile_pos, "寻找路径失败============")
        }

    }

    public setAniMove() {
        this.dragon.playAnimation("zou", -1)
        this.ani_name = "zou"
    }

    public setAniRest() {
        this.dragon.playAnimation("xiuxi", -1)
        this.ani_name = "xiuxi"
    }

    /**获取所处格子位置 */
    public getTilePos(): cc.Vec2 {
        let position = this.node.position
        let worldPos = this.node.parent.convertToWorldSpaceAR(position)
        worldPos.y -= 20
        let tilePos = MapGridView.instance.worldToTilePos(cc.v2(worldPos))

        return tilePos
    }

    public getMoveAction(pathList: cc.Vec2[], endFunc: Function = null) {
        let path_length = Object.keys(pathList).length
        if (path_length <= 0) {
            return
        }

        let oriPos = this.getTilePos()

        // let oriPos = this.playerModel.getTilePos()
        let actionList = []
        let pre_pos = oriPos
        let time_pre_pos = oriPos

        for (let i = 0; i < path_length; i++) {
            let time = 10
            const pos = pathList[i]
            let posXY = MapGridView.instance.tileToWorldPos(pos.x, pos.y)
            let current_start_pos = MapGridView.instance.tileToWorldPos(time_pre_pos.x, time_pre_pos.y)
            let stepTime = this.moveNeedTime(cc.v2(current_start_pos), posXY)
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
                    }else {
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
                            // if (this.roomId) {
                            //     this.walkCurrentWayEnd()
                            // } else {
                                if (endFunc) {
                                    endFunc()
                                }
                            // }
                        }
                    } else if (i == path_length - 1) {
                        // if (this.roomId) {
                        //     this.walkCurrentWayEnd()
                        // } else {
                            if (endFunc) {
                                endFunc()
                            }
                        // }
                    }
                }),
            ])

            actionList.push(seqAction)
        }

        if (actionList.length == 1) {
            let call = cc.callFunc(() => {

            })
            actionList.push(call)
        }
        return cc.sequence(actionList)
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
                dir = i
                break
            }
        }

        return dir
    }

    /**
     * 方向
     * 四周方向的格子 分别为 0：右，1：右下，2：下，3：下左 4：左 5：坐上 6：上 7：上右
     * @param pre_pos 
     * @param nextPos 
     */
    private checkPlayerDir(pre_pos: cc.Vec2, nextPos: cc.Vec2) {
        let dir = null

        // dir: 0：右，1：右下，2：下，3：下左 4：左 5：坐上 6：上 7：上右
        dir = this.getAroundCurrposToNextDir(pre_pos, nextPos)
        if ((this.pre_dir == 3 || this.pre_dir == 4 || this.pre_dir == 5 || this.pre_dir == 6 ) && (dir == 0 || dir == 1 || dir == 2 || dir == 7) && (this.isFlipX)) {
            this.isFlipX = false
            this.dragon.node.scaleX = this.nodeScale
            this.pre_dir = dir
        } else if ((this.pre_dir == 0 || this.pre_dir == 1 || this.pre_dir == 2 || this.pre_dir == 7) && (dir == 3 || dir == 4 || dir == 5 || dir == 6) && !this.isFlipX) {
            this.isFlipX = true
            this.dragon.node.scaleX = -this.nodeScale
            this.pre_dir = dir
        }
    }

    /**移动需要时间 */
    public moveNeedTime(starPos: cc.Vec2, endPos: cc.Vec2) {
        let distance = cc.Vec2.distance(starPos, endPos)
        let stepDis = this.getStepDistance()
        let time = distance / stepDis
        // cc.warn(distance, time, "dump==============22")
        return time
    }

    /**步长 */
    public getStepDistance() {
        let dis = this.grid_size / this.move_gride_time;
        return dis;
    }

    public getInitRandomPoint(exclude: number[] = []) {
        let types = CustomerFindWay.zhujue_point_list.concat()
        for (let i = 0; i < exclude.length; i++) {
            types.splice(types.indexOf(exclude[i]), 1)
        }
        return types[Math.floor(types.length * Math.random())]
    }

    // update (dt) {}
}
