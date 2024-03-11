import BuildConfig from "../builds/BuildConfig";
import Utils from "../common/Utils";

interface PathNode {
    x: number,
    y: number,
    G: number,
    F: number
    parent?: { x: number, y: number },
}


export default class CustomerFindWay {

    public static zhujue_point_data = {
        1: { pos: cc.v2(53, 89), isRest: false },
        2: { pos: cc.v2(53, 74), isRest: true },
        3: { pos: cc.v2(53, 55), isRest: true },
        4: { pos: cc.v2(53, 43), isRest: false },
        5: { pos: cc.v2(46, 43), isRest: true },
        6: { pos: cc.v2(41, 43), isRest: false },
        7: { pos: cc.v2(40, 50), isRest: false },
        8: { pos: cc.v2(40, 62), isRest: true },
        9: { pos: cc.v2(64, 43), isRest: true },
        10: { pos: cc.v2(74, 43), isRest: false },
        11: { pos: cc.v2(75, 38), isRest: true },
        12: { pos: cc.v2(68, 78), isRest: true },
        13: { pos: cc.v2(81, 78), isRest: false },
        14: { pos: cc.v2(83, 71), isRest: false },
        15: { pos: cc.v2(83, 61), isRest: true },
        16: { pos: cc.v2(91, 58), isRest: false },
    }

    public static zhujue_point_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

    public static road_line = [1, 2, 3]

    public static start_pos = {
        1: cc.v2(53, 93),
        2: cc.v2(75, 35),
        3: cc.v2(98, 58),
    }

    public static road_map_pos_list = [
        cc.v2(53, 92), cc.v2(53, 91), cc.v2(53, 90), cc.v2(53, 89), cc.v2(53, 88), cc.v2(53, 87), cc.v2(53, 86),
        cc.v2(53, 85), cc.v2(53, 84), cc.v2(53, 83), cc.v2(53, 82), cc.v2(53, 81), cc.v2(53, 80), cc.v2(53, 79),
        cc.v2(53, 78), cc.v2(53, 77), cc.v2(53, 76), cc.v2(53, 75), cc.v2(53, 74), cc.v2(53, 73), cc.v2(53, 72), cc.v2(53, 71),
        cc.v2(53, 70), cc.v2(53, 69), cc.v2(53, 68), cc.v2(53, 67), cc.v2(53, 66), cc.v2(53, 65), cc.v2(53, 64), cc.v2(53, 63),
        cc.v2(53, 62), cc.v2(53, 61), cc.v2(53, 60), cc.v2(53, 59), cc.v2(53, 58), cc.v2(53, 57), cc.v2(53, 56), cc.v2(53, 55),
        cc.v2(53, 54), cc.v2(53, 53), cc.v2(53, 52), cc.v2(53, 51), cc.v2(53, 50), cc.v2(53, 49), cc.v2(53, 48), cc.v2(53, 47),
        cc.v2(53, 46), cc.v2(53, 45), cc.v2(53, 44), cc.v2(53, 43), cc.v2(54, 78), cc.v2(55, 78), cc.v2(56, 78), cc.v2(57, 78),
        cc.v2(58, 78), cc.v2(59, 78), cc.v2(60, 78), cc.v2(61, 78), cc.v2(62, 78), cc.v2(63, 78), cc.v2(64, 78), cc.v2(65, 78),
        cc.v2(66, 78), cc.v2(67, 78), cc.v2(68, 78), cc.v2(69, 78), cc.v2(70, 78), cc.v2(71, 78), cc.v2(72, 78), cc.v2(73, 78),
        cc.v2(74, 78), cc.v2(75, 78), cc.v2(76, 78), cc.v2(77, 78), cc.v2(78, 78), cc.v2(79, 78), cc.v2(80, 78), cc.v2(81, 78),
        cc.v2(82, 78), cc.v2(83, 77), cc.v2(83, 76), cc.v2(83, 75), cc.v2(83, 74), cc.v2(83, 73), cc.v2(83, 72), cc.v2(83, 71),
        cc.v2(83, 70), cc.v2(83, 69), cc.v2(83, 68), cc.v2(83, 67), cc.v2(83, 66), cc.v2(83, 65), cc.v2(83, 64), cc.v2(83, 63),
        cc.v2(83, 62), cc.v2(83, 61), cc.v2(83, 60), cc.v2(83, 59), cc.v2(83, 58), cc.v2(84, 58), cc.v2(85, 58), cc.v2(86, 58),
        cc.v2(87, 58), cc.v2(88, 58), cc.v2(89, 58), cc.v2(90, 58), cc.v2(91, 58), cc.v2(92, 58), cc.v2(93, 58), cc.v2(94, 58),
        cc.v2(95, 58), cc.v2(96, 58), cc.v2(97, 58), cc.v2(98, 58), cc.v2(54, 65), cc.v2(55, 65), cc.v2(56, 65),
        cc.v2(57, 65), cc.v2(58, 65), cc.v2(59, 65), cc.v2(60, 65), cc.v2(61, 65), cc.v2(62, 65), cc.v2(63, 65), cc.v2(64, 65),
        cc.v2(65, 65), cc.v2(66, 65), cc.v2(62, 89), cc.v2(62, 89), cc.v2(67, 64), cc.v2(67, 63), cc.v2(67, 62), cc.v2(73, 41),
        cc.v2(73, 41), cc.v2(67, 61), cc.v2(67, 60), cc.v2(67, 59), cc.v2(68, 58), cc.v2(69, 57), cc.v2(70, 56), cc.v2(71, 55),
        cc.v2(72, 54), cc.v2(68, 61), cc.v2(69, 62), cc.v2(70, 63), cc.v2(71, 64), cc.v2(72, 65), cc.v2(73, 65), cc.v2(74, 64),
        cc.v2(75, 63), cc.v2(76, 62), cc.v2(77, 61), cc.v2(73, 68), cc.v2(73, 68), cc.v2(78, 60), cc.v2(78, 59), cc.v2(77, 58),
        cc.v2(76, 57), cc.v2(75, 56), cc.v2(74, 55), cc.v2(73, 54), cc.v2(73, 53), cc.v2(73, 52), cc.v2(73, 51), cc.v2(73, 50),
        cc.v2(73, 49), cc.v2(73, 48), cc.v2(73, 47), cc.v2(73, 46), cc.v2(93, 89), cc.v2(93, 89), cc.v2(73, 45), cc.v2(73, 44),
        cc.v2(40, 64), cc.v2(40, 63), cc.v2(40, 62), cc.v2(40, 61), cc.v2(40, 60), cc.v2(40, 59), cc.v2(40, 58), cc.v2(40, 57),
        cc.v2(40, 56), cc.v2(40, 55), cc.v2(40, 54), cc.v2(40, 53), cc.v2(40, 52), cc.v2(40, 51),
        cc.v2(40, 50), cc.v2(40, 49), cc.v2(40, 48), cc.v2(40, 47), cc.v2(40, 46), cc.v2(40, 45), cc.v2(40, 44), cc.v2(40, 43),
        cc.v2(41, 43), cc.v2(42, 43), cc.v2(43, 43), cc.v2(44, 43), cc.v2(45, 43), cc.v2(46, 43), cc.v2(47, 43), cc.v2(48, 43),
        cc.v2(49, 43), cc.v2(50, 43), cc.v2(51, 43), cc.v2(93, 89), cc.v2(93, 89), cc.v2(52, 43), cc.v2(54, 43), cc.v2(55, 43),
        cc.v2(56, 43), cc.v2(57, 43), cc.v2(58, 43), cc.v2(59, 43), cc.v2(60, 43), cc.v2(61, 43), cc.v2(62, 43), cc.v2(63, 43),
        cc.v2(64, 43), cc.v2(65, 43), cc.v2(66, 43), cc.v2(67, 43), cc.v2(68, 43), cc.v2(69, 43), cc.v2(70, 43), cc.v2(71, 43),
        cc.v2(72, 43), cc.v2(73, 43), cc.v2(74, 42), cc.v2(75, 41), cc.v2(75, 40), cc.v2(75, 39), cc.v2(75, 38), cc.v2(75, 37),
        cc.v2(75, 36), cc.v2(75, 35), cc.v2(79, 60), cc.v2(80, 60), cc.v2(81, 60), cc.v2(82, 60),
    ]

    public static room_road_pos_list = {
        // 105: [
        //     cc.v2(52, 52), cc.v2(51, 52), cc.v2(50, 52), cc.v2(92, 52), cc.v2(92, 52), cc.v2(49, 52), cc.v2(48, 52), cc.v2(47, 52),
        //     cc.v2(46, 52), cc.v2(45, 52), cc.v2(44, 52), cc.v2(43, 52),
        // ],
    }

    public static room_end_pos = {
        105: cc.v2(56, 78),
        106: cc.v2(56, 43),
        107: cc.v2(72, 78),
        108: cc.v2(72, 78),
    }

    public static room_start_zindex = {
        105: 19,
        106: 19,
        107: 19,
        108: 19,
    }

    public static room_wupin = {
        105: ["shangpin_1", "shangpin_2", "shangpin_3", "shangpin_4"],
    }

    public static getRoadZindex(pos: cc.Vec2) {
        let x = pos.x
        let y = pos.y
        let zindex = null
        if (x == 40 && y >= 43) {
            zindex = 1500
        }
        else if (x == 53 && y >= 44) {
            zindex = 2800
        }
        else if (x >= 40 && y == 43) {
            zindex = 2500
        }
        else if (x >= 54 && y == 78) {
            zindex = 9000
        }
        else if (x >= 54 && y == 65) {
            zindex = 5800
        }

        return zindex
    }

    public static getWupinByRoomId(roomId: number) {
        let list = this.room_wupin[roomId]
        let random = Utils.getRandomInt(0, list.length - 1)
        return list[random]
    }

    /**两格之间距离 */
    public static tileDist(ox, oy, tx, ty) {
        let value = Math.pow((tx - ox), 2) + Math.pow((ty - oy), 2);
        return Math.sqrt(value);
    }

    public static getInitRandomType(exclude: number[] = []): number {
        let types = this.road_line.concat()
        for (let i = 0; i < exclude.length; i++) {
            types.splice(types.indexOf(exclude[i]), 1)
        }
        return types[Math.floor(types.length * Math.random())]
    }

    /**
     * a星寻路
     * @param oriPos 开始格子坐标
     * @param endPos 目标格子坐标
     * @param ifNotFindToNear 如果没有找到路径，以最近目标并且与起点较近的格作为终点
     */
    public static aStarFindPath(oriPos: cc.Vec2, endPos: cc.Vec2, roomId: number = null, isAround: boolean = true, ifNotFindToNear: boolean = true): [boolean, cc.Vec2[]] {
        if (oriPos.x == endPos.x && oriPos.y == endPos.y) return [false, []];
        //已探索记录
        let setExplore: Set<number> = new Set<number>();
        // 被考虑的格子列表（open列表）
        let arrOptCost: PathNode[] = [];
        // 确定的格子列表（closed列表）
        let arrPathNode: Array<PathNode> = new Array<PathNode>();
        // 先把起点插入到已探索列表中
        let currP: PathNode = { x: oriPos.x, y: oriPos.y, G: 0, F: this.tileDist(oriPos.x, oriPos.y, endPos.x, endPos.y) };
        /**理论上寻路的loop 多数至多只会在地图格数3倍的寻找次数下找到，如果超过意味着不存在路径, 若果地图极端，把3调大 */
        let isFindTarget = false;
        let loop = 0

        let road_pos_list = this.road_map_pos_list
        if (roomId && this.room_road_pos_list[roomId]) {
            let room_road_pos = this.room_road_pos_list[roomId]
            road_pos_list.push(...room_road_pos)
        }

        // for (loop = 0; loop < BuildConfig.tileWidthNum * BuildConfig.tileHeightNum * 3; ++loop) {
        for (loop = 0; loop < road_pos_list.length * 3; ++loop) {
            let arrDir: Array<cc.Vec2> = [];
            if (isAround) {
                arrDir = this.getAroundDirectTileVec(currP.x, currP.y);
            } else {
                arrDir = this.getFourDirectTileVec(currP.x, currP.y);
            }
            for (let i = 0; i < arrDir.length; ++i) {
                let mapIndex = this.getTileInMapIndex(arrDir[i]);
                if (arrDir[i].x == endPos.x && arrDir[i].y == endPos.y) {
                    arrPathNode.push({ x: arrDir[i].x, y: arrDir[i].y, G: 0, F: 0, parent: { x: currP.x, y: currP.y } });
                    isFindTarget = true;
                    // console.log("找到结果");
                    break;
                } else {
                    if (
                        setExplore.has(mapIndex)
                        || arrDir[i].x == oriPos.x && arrDir[i].y == oriPos.y
                        || arrDir[i].x < 0
                        || arrDir[i].y < 0
                        || arrDir[i].x > BuildConfig.tileWidthNum - 1
                        || arrDir[i].y > BuildConfig.tileHeightNum - 1
                        || !this.coordsIsHaveByCoord(this.road_map_pos_list, arrDir[i])
                    ) {
                        continue;
                    } else {
                        let g = currP.G + 10; //权重增加
                        let pNode = {
                            x: arrDir[i].x,
                            y: arrDir[i].y,
                            G: g,
                            F: Math.round(this.tileDist(arrDir[i].x, arrDir[i].y, endPos.x, endPos.y)) + g,
                            parent: { x: currP.x, y: currP.y }
                        };
                        setExplore.add(this.getTileInMapIndex(arrDir[i]));
                        arrOptCost.push(pNode);
                        arrOptCost.sort(function (a, b) {
                            return a.F - b.F;
                        });
                    }


                }
            }
            if (!isFindTarget && arrOptCost.length > 0) {

                // for (let key in arrOptCost) {
                let random = Utils.getRandomInt(0, arrOptCost.length - 1)
                currP = arrOptCost[random]
                arrOptCost.splice(random, 1)

                // currP = arrOptCost.shift();
                arrPathNode.push(currP);
                // break;
                // }
            } else break;
        }

        // cc.warn(isFindTarget, "isFindTarget===========")
        // cc.warn(arrPathNode, "arrPathNode===========")
        let p: PathNode = null;
        if (arrPathNode.length > 0 && isFindTarget) {
            p = arrPathNode.pop();
        } else if (arrPathNode.length > 0 && !isFindTarget && ifNotFindToNear) {
            // let maxDist = Math.floor(this.tileDist(oriPos.x, oriPos.y, endPos.x, endPos.y));
            // let dist: number = 0;
            // for (let i = arrPathNode.length - 1; i >= 0; --i) {
            //     let d = Math.floor(this.tileDist(arrPathNode[i].x, arrPathNode[i].y, endPos.x, endPos.y));
            //     let a = Math.abs(oriPos.x - (p == null ? 0 : p.x)) + Math.abs(oriPos.y - (p == null ? 0 : p.y));
            //     let b = Math.abs(oriPos.x - arrPathNode[i].x) + Math.abs(oriPos.y - arrPathNode[i].y);
            //     if (d > maxDist || !this.coordsIsHaveByCoord(this.road_map_pos_list, cc.v2(arrPathNode[i].x, arrPathNode[i].y))) continue;
            //     //console.log(p,`比较目标：${ arrPathNode[i].x},${ arrPathNode[i].y}`,`dist${dist} 与 d${d}`,`a${a} 与 d${b}`);
            //     if (p == null || dist > d || dist == d && a > b) {
            //         p = arrPathNode[i];
            //         dist = d;
            //     }
            // }
            // cc.error(`新目标：${p.x},${p.y}`);
        } else {
            // console.log("没找到========================")
            return [isFindTarget, []];
        }

        let FinalPath: Array<cc.Vec2> = [];
        if (p) {
            let parent = p.parent;
            FinalPath = [new cc.Vec2(p.x, p.y)];
            for (let i = arrPathNode.length - 1; i >= 0; --i) {
                let pn = arrPathNode[i];
                if (pn.x == parent.x && pn.y == parent.y) {
                    FinalPath.unshift(new cc.Vec2(pn.x, pn.y));
                    parent = pn.parent;
                } else
                    continue;
            }
        }
        // console.log(FinalPath, "path========================")

        return [isFindTarget, FinalPath];
    }

    /**
     * 对比
     * @param x 比较对象
     */
    public static compare(pos1: cc.Vec2, pos2: cc.Vec2): boolean {
        return pos1.x === pos2.x && pos1.y === pos2.y
    }

    /**
     * 坐标集中是否包含某个坐标
     */
    public static coordsIsHaveByCoord(coords: cc.Vec2[], cur_pos: cc.Vec2): boolean {
        for (let i = 0; i < coords.length; i++) {
            const current_coord = coords[i]
            if (this.compare(current_coord, cur_pos)) {
                return true
            }
        }

        return false
    }

    /**
     * 取得四方向格 分别为 0：右，1：下，2：左，3：上
     * @param XorVec 
     * @param Y 
     * @returns 
     */
    public static getFourDirectTileVec(XorVec: number | cc.Vec2, Y?: number): Array<cc.Vec2> {
        let currPos: cc.Vec2 = null;
        if (Y == undefined) {
            currPos = <cc.Vec2>XorVec;
        } else {
            currPos = new cc.Vec2(<number>XorVec, Y);
        }
        let arrPos: Array<cc.Vec2> = [
            new cc.Vec2(currPos.x + 1, currPos.y),
            new cc.Vec2(currPos.x, currPos.y + 1),
            new cc.Vec2(currPos.x - 1, currPos.y),
            new cc.Vec2(currPos.x, currPos.y - 1),
        ]
        return arrPos;
    }

    /**
     * 四周方向的格子 分别为 0：右，1：右下，2：下，3：下左 4：左 5：坐上 6：上 7：上右
     * @param XorVec 
     * @param Y 
     * @returns 
     */
    public static getAroundDirectTileVec(XorVec: number | cc.Vec2, Y?: number): Array<cc.Vec2> {
        let currPos: cc.Vec2 = null;
        if (Y == undefined) {
            currPos = <cc.Vec2>XorVec;
        } else {
            currPos = new cc.Vec2(<number>XorVec, Y);
        }
        let arrPos: Array<cc.Vec2> = [
            new cc.Vec2(currPos.x, currPos.y - 1),
            new cc.Vec2(currPos.x + 1, currPos.y - 1),

            new cc.Vec2(currPos.x + 1, currPos.y),
            new cc.Vec2(currPos.x + 1, currPos.y + 1),

            new cc.Vec2(currPos.x, currPos.y + 1),
            new cc.Vec2(currPos.x - 1, currPos.y + 1),

            new cc.Vec2(currPos.x - 1, currPos.y),
            new cc.Vec2(currPos.x - 1, currPos.y - 1),
        ]
        return arrPos;
    }

    /**
     * 返回格子是地图中的第几个
     * @param XorVec 格子的坐标或者格子X坐标
     * @param Y 格子Y坐标
     */
    public static getTileInMapIndex(XorVec: number | cc.Vec2, Y?: number) {
        let x, y = null;
        if (Y == undefined) {
            x = (<cc.Vec2>XorVec).x;
            y = (<cc.Vec2>XorVec).y;
        } else {
            x = XorVec;
            y = Y;
        }
        return x * BuildConfig.tileWidthNum + y;
    }
}
