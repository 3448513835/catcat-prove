import { UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";
import GuideDialog from "../../guide/GuideDialog";
import PickLanZi from "./PickLanZi";
import PickPoint from "./PickPoint";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PickView extends MyComponent {

    @property(cc.Node)
    di: cc.Node = null

    @property(cc.Sprite)
    bg: cc.Sprite = null

    @property(cc.Node)
    layout_lanzi: cc.Node = null

    @property(cc.Label)
    ttf_tip: cc.Label = null

    @property(cc.Node)
    progress_bar: cc.Node = null

    @property(cc.Node)
    progress_mask: cc.Node = null

    @property(cc.Label)
    progress_percent: cc.Label = null

    @property(cc.Label)
    ttf_time: cc.Label = null

    @property(cc.Node)
    sp_time: cc.Node = null

    @property([PickLanZi])
    lanzi_list: PickLanZi[] = []

    @property([PickPoint])
    point_list: PickPoint[] = []

    @property(cc.Node)
    select_node: cc.Node = null

    @property(cc.Label)
    count_down: cc.Label = null

    @property([PickLanZi])
    guide_lanzi_list: PickLanZi[] = []

    @property([PickPoint])
    guide_point_list: PickPoint[] = []

    @property(cc.Node)
    guide_bg: cc.Node = null

    private isGuide: boolean = false

    private left_num: number = 15
    private guide_left_num: number = 2
    private left_show_num: number = 6

    private selectNode: cc.Node = null
    private selectNodeData = null

    private left_data = null
    private right_data = null
    private count_time: number = 0
    private goal_num: number = 0
    private every_item_score: number = 10

    private receive_num: number = 0

    private isCanClick: boolean = false

    private data = null

    public static instance: PickView = null
    onLoad() {
        PickView.instance = this
        this.data = this.getDialogData()

        this.di.width = cc.visibleRect.width
        this.di.height = cc.visibleRect.height
        this.node.width = cc.visibleRect.width
        this.node.height = cc.visibleRect.height

        this.di.on(cc.Node.EventType.TOUCH_START, this.clickStart, this)
        this.di.on(cc.Node.EventType.TOUCH_MOVE, this.clickMove, this)
        this.di.on(cc.Node.EventType.TOUCH_END, this.clickEnd, this)
        this.di.on(cc.Node.EventType.TOUCH_CANCEL, this.clickEnd, this)
    }

    start() {
        let guide_data = UserDefault.getItem(this._user.getUID() + GameConstant.PICK_IS_GUIDE)
        if (guide_data) {
            guide_data = JSON.parse(guide_data)
        } else {
            guide_data = {
                is_have_guide: false
            }
            UserDefault.setItem(this._user.getUID() + GameConstant.PICK_IS_GUIDE, JSON.stringify(guide_data))
        }
        let is_have_guide = guide_data["is_have_guide"]
        // temp_test
        // is_have_guide = false
        if (is_have_guide) {
            this.isCanClick = false
            this.isGuide = false
            this.guide_bg.active = false
            this.setNoramlGame()
            
        } else {
            this.isCanClick = true
            this.guide_bg.active = true
            this.isGuide = true
            this.setGuideGame()

            guide_data = {
                is_have_guide: true
            }
            UserDefault.setItem(this._user.getUID() + GameConstant.PICK_IS_GUIDE, JSON.stringify(guide_data))
        }
    }

    private setGuideGame() {
        this.sp_time.active = false
        this.ttf_time.node.active = false
        this.left_data = [
            {
                id: 10006,
                num: 2,
                have_num: 0,
                index: 0,
                isFinished: false,
            },
            {
                id: 10050,
                num: 3,
                have_num: 0,
                index: 1,
                isFinished: false,
            }
        ]
        this.right_data = [
            { point: 0, num: 1, id: 10006 },
            { point: 1, num: 1, id: 10050 },
            { point: 2, num: 1, id: 10006 },
            { point: 3, num: 1, id: 10050 },
            { point: 4, num: 1, id: 10006 },
            { point: 5, num: 1, id: 10050 },

        ]
        this.setGuideRightInit()
        this.setGuideLeftInit()

        this.setTopData()
    }

    private setNoramlGame() {
        this.left_data = this.randomEle()
        this.right_data = this.getPointData(this.left_data)

        this.setRightInit()
        this.setLeftInit()

        this.setTopData()

        this.sp_time.active = true
        this.ttf_time.node.active = true

        this.count_time = this.data["time"]
        this.ttf_time.string = this._utils.formatTimeForSecond(this.count_time)

        let time_num = 3
        this.count_down.node.active = true
        this.schedule(() => {
            time_num -= 1
            this.count_down.string = time_num.toString()
            if (time_num == 0) {
                this.isCanClick = true
                this.count_down.node.active = false
                this.schedule(this.tickTime, 1)
                this.moveLeft()
            }
        }, 1, 2)
    }

    onDestroy() {
        PickView.instance = null
        this.destroy()
    }

    private setSelectNode(data) {
        this.selectNodeData = data
        this.selectNode = cc.instantiate(this.select_node)
        this.node.addChild(this.selectNode)
        let config = this._json_manager.getJsonData(this._json_name.PICK_ELE, data["id"])
        let id = config["icon"]
        let path = this._utils.getItemPathById(id)
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(sprite_frame)) {
                let icon = this.selectNode.getComponent(cc.Sprite)
                icon.spriteFrame = sprite_frame
                this.selectNode.active = true
            }
        })
    }

    private clickStart(event) {
        // cc.error("clickstart==========")
        if (!this.isCanClick) return
        let arrPoint = event.getTouches()
        let mPoint = arrPoint[0].getLocation()
        let cur_list = this.point_list
        if (this.isGuide) {
            cur_list = this.guide_point_list
        }

        for (let i = 0; i < cur_list.length; i++) {
            const point = cur_list[i]
            let node = point.node
            let pos_n = node.convertToNodeSpaceAR(mPoint)
            let temp_rect = cc.rect(-node.width / 2, -node.height / 2, node.width, node.height)
            if (temp_rect.contains(pos_n) && point.getHaveNum() > 0) {
                // cc.error(point.getId(), "clickid============")
                this.setSelectNode(point.getData())
                if (cc.isValid(this.selectNode)) {
                    point.setSelectItemState(false)
                    let pos = this.node.convertToNodeSpaceAR(mPoint)
                    // pos.y += 100
                    this.selectNode.position = cc.v3(pos)
                }
                break
            }
        }

        // for (let i = 0; i < this.lanzi_list.length; i++) {
        //     const point = this.lanzi_list[i]
        //     let node = point.node
        //     let pos_n = node.convertToNodeSpaceAR(mPoint)
        //     let temp_rect = cc.rect(-node.width / 2, -node.height, node.width, node.height)
        //     if (temp_rect.contains(pos_n)) {
        //         // cc.error(point.getId(), "clickid============")
        //         cc.error(point.getId(), "id===========")
        //         break
        //     }
        // }

    }

    private clickMove(event) {
        let arrPoint = event.getTouches()
        let mPoint = arrPoint[0].getLocation()
        if (cc.isValid(this.selectNode)) {
            let pos = this.node.convertToNodeSpaceAR(mPoint)
            // pos.y += 100
            this.selectNode.position = cc.v3(pos)
        }
    }

    private clickEnd(event) {
        let arrPoint = event.getTouches()
        let mPoint = arrPoint[0].getLocation()
        if (cc.isValid(this.selectNode)) {

            let cur_list = this.lanzi_list
            let cur_ponit_list = this.point_list
            if (this.isGuide) {
                cur_list = this.guide_lanzi_list
                cur_ponit_list = this.guide_point_list
            }

            let isGoal: boolean = false
            for (let i = 0; i < cur_list.length; i++) {
                const script = cur_list[i]
                let node = script.node
                let pos_n = node.convertToNodeSpaceAR(mPoint)
                let temp_rect = cc.rect(-node.width / 2, -node.height, node.width, node.height)
                // cc.error(temp_rect.contains(pos_n), !script.getIsMax() , script.getId(), this.selectNodeData["ele_id"], "dump=[========33")
                if (temp_rect.contains(pos_n) && !script.getIsMax() && script.getId() == this.selectNodeData["ele_id"]) {
                    // cc.error(script.getId(), "clickid============")
                    this.selectNode.destroy()
                    isGoal = true
                    script.setHaveNum(script.getHaveNum() + 1)
                    script.setHaveItem()

                    let index = script.getIndex()
                    let cur_data = this.left_data[index]
                    if (cur_data) {
                        cur_data["have_num"] = script.getHaveNum()
                        cur_data["isFinished"] = script.getIsMax()

                        this.setTopData()
                    }

                    let point_index = this.selectNodeData["point"]
                    let point = cur_ponit_list[point_index]
                    if (cc.isValid(point)) {
                        point.setHaveNum(point.getHaveNum() - 1)
                    }
                    break
                }
            }

            if (!isGoal) {
                let point_index = this.selectNodeData["point"]
                let point = cur_ponit_list[point_index]
                if (cc.isValid(point)) {
                    point.setSelectItemState(true)
                }

                this.selectNode.destroy()
            }

        }
        this.selectNodeData = null
    }

    private clickCancel(event) {
        if (cc.isValid(this.selectNode)) {
            this.selectNode.destroy()
        }
        this.selectNodeData = null
    }

    private setTopData() {
        let finished_num = 0
        for (let i = 0; i < this.left_data.length; i++) {
            const item_data = this.left_data[i]
            if (item_data["isFinished"]) {
                finished_num += 1
            }
        }
        this.goal_num = finished_num * this.every_item_score

        let cur_left_num = this.left_num
        if (this.isGuide) {
            cur_left_num = this.guide_left_num
        }

        this.ttf_tip.string = `在限定时间内填满${cur_left_num}个盒子`
        this.progress_percent.string = `${finished_num}/${cur_left_num}`
        let percent = finished_num / cur_left_num
        this.progress_mask.width = this.progress_bar.width * percent

        if (finished_num == cur_left_num) {
            if (this.isGuide) {
                this.isCanClick = false
                this._dialog_manager.showTipMsg("难度飙升")
                for (let i = 0; i < this.guide_lanzi_list.length; i++) {
                    const script = this.guide_lanzi_list[i]
                    script.node.active = false
                }
                this.isGuide = false
                this.setNoramlGame()
            }
            else {
                this.unschedule(this.tickTime)
                //  胜利
                this.pauseLeft()
                let data = {
                    score: this.goal_num,
                }
                this._dialog_manager.openDialog(this._dialog_name.PickResultView, data)
            }
        }
    }

    private tickTime() {
        this.count_time -= 1
        if (this.count_time >= 0) {
            this.ttf_time.string = this._utils.formatTimeForSecond(this.count_time)
        } else {
            this.isCanClick = false
            this.unschedule(this.tickTime)
            this.pauseLeft()

            let finished_num = 0
            for (let i = 0; i < this.left_data.length; i++) {
                const item_data = this.left_data[i]
                if (item_data["isFinished"]) {
                    finished_num += 1
                }
            }

            if (finished_num == this.left_num) {

            } else {
                if (this.receive_num == 0) {
                    let data = {
                        score: this.goal_num,
                        func: (isReveive) => {
                            if (isReveive) {
                                let time_num = 3
                                this.count_down.string = time_num.toString()
                                this.count_down.node.active = true
                                this.schedule(() => {
                                    time_num -= 1
                                    this.count_down.string = time_num.toString()
                                    if (time_num == 0) {
                                        this.isCanClick = true
                                        this.count_down.node.active = false
                                        this.count_time = 30
                                        this.resumeLeft()
                                        this.ttf_time.string = this._utils.formatTimeForSecond(this.count_time)
                                        this.schedule(this.tickTime, 1)
                                    }
                                }, 1, 2)
                            } else {
                                this._dialog_manager.openDialog(this._dialog_name.PickResultView, { score: this.goal_num })
                            }
                        }
                    }
                    this._dialog_manager.openDialog(this._dialog_name.PickReviveView, data)

                    this.receive_num += 1
                } else {
                    let data = {
                        score: this.goal_num,
                    }
                    this._dialog_manager.openDialog(this._dialog_name.PickResultView, data)
                }
            }
        }
    }

    private pauseLeft() {
        for (let i = 0; i < this.lanzi_list.length; i++) {
            const script = this.lanzi_list[i]
            script.node.pauseAllActions()
        }
    }

    private resumeLeft() {
        for (let i = 0; i < this.lanzi_list.length; i++) {
            const script = this.lanzi_list[i]
            script.node.resumeAllActions()
        }
    }

    private moveLeft() {
        for (let i = 0; i < this.lanzi_list.length; i++) {
            const script = this.lanzi_list[i]
            this.moveAction(script, i)
        }
    }

    private moveAction(script: PickLanZi, index: number) {
        // let end_pos = cc.v2(0, 281)
        // let start_pos = cc.v2(node.position)
        // let dis = cc.Vec2.distance(start_pos, end_pos)
        // let time = dis / 300
        // cc.error(time, "time==========")
        let node = script.node
        cc.tween(node)
            .by(1.2, { y: 300 })
            .call(() => {
                // cc.error(node.y, index, "yyyyyyyyyy")
                if (node.y == 281) {
                    let cur_index = script.getIndex()
                    let temp_index = cur_index + this.left_show_num
                    if (temp_index > this.left_num - 1) {
                        temp_index -= this.left_num
                    }
                    let data = this.left_data[temp_index]
                    script.init(data)
                    node.position = cc.v3(0, -1519)
                }

                if (index == this.lanzi_list.length - 1) {
                    this.moveLeft()
                }

            })
            .start()

    }

    private setLeftInit() {
        for (let i = 0; i < this.lanzi_list.length; i++) {
            const script = this.lanzi_list[i]
            let item_data = this.left_data[i]
            if (cc.isValid(script) && item_data) {
                script.node.active = true
                script.init(item_data)
            }
        }
    }

    private setGuideLeftInit() {
        for (let i = 0; i < this.guide_lanzi_list.length; i++) {
            const script = this.guide_lanzi_list[i]
            let item_data = this.left_data[i]
            if (cc.isValid(script) && item_data) {
                script.node.active = true
                script.init(item_data)
            }
        }
    }

    private setRightInit() {
        if (this.right_data) {
            for (let i = 0; i < this.right_data.length; i++) {
                const item_data = this.right_data[i]
                let point = item_data["point"]
                let point_script = this.point_list[point]
                if (cc.isValid(point_script)) {
                    point_script.init(item_data)
                }
            }
        }
    }

    private setGuideRightInit() {
        if (this.right_data) {
            for (let i = 0; i < this.right_data.length; i++) {
                const item_data = this.right_data[i]
                let point = item_data["point"]
                let point_script = this.guide_point_list[point]
                if (cc.isValid(point_script)) {
                    point_script.init(item_data)
                }
            }
        }
    }

    private randomEle(need_num?: number) {
        let json: {} = this._json_manager.getJson(this._json_name.PICK_ELE)
        let key_list = []
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let id = item_data["id"]
                key_list.push(id)
            }
        }

        // let ele_list = this._utils.objectToArray(json)
        let num = need_num ? need_num : this.left_num
        let select_id_list = []
        for (let i = 0; i < num; i++) {
            let id = this.getInitRandomType(key_list, select_id_list)
            select_id_list.push(Number(id))
        }

        let need_ele_list = []
        for (let j = 0; j < select_id_list.length; j++) {
            const id = select_id_list[j]
            let item_config = json[id]
            let min_num = item_config["min_num"]
            let max_num = item_config["max_num"]
            let num = this._utils.getRandomInt(min_num, max_num)
            let data = {
                id: id,
                num: num,
                have_num: 0,
                index: j,
                isFinished: false,
            }

            need_ele_list.push(data)
        }

        // cc.error(select_id_list, need_ele_list, "dump========22")

        return need_ele_list
    }

    private getPointData(list) {
        let point_num = 36
        let use_point = []
        let point_list = []
        for (let j = 0; j < point_num; j++) {
            point_list.push(j)
        }

        let need_point_data = []
        for (let i = 0; i < list.length; i++) {
            const item_data = list[i]
            let id = item_data["id"]
            let random2 = this._utils.getRandomInt(1, 3)
            let point = this.getInitRandomType(point_list, use_point)
            let data = {
                point: point,
                num: random2,
                id: id
            }
            need_point_data.push(data)
            use_point.push(point)
            if (random2 < 3) {
                let num2 = 3 - random2
                let point = this.getInitRandomType(point_list, use_point)
                let data = {
                    point: point,
                    num: num2,
                    id: id
                }
                need_point_data.push(data)
                use_point.push(point)
            }
        }

        let use_ele_id = []
        for (let i = 0; i < use_ele_id.length; i++) {
            const item_data = list[i]
            let id = item_data["id"]
            use_ele_id.push(id)
        }

        let json: {} = this._json_manager.getJson(this._json_name.PICK_ELE)
        let key_list = Object.keys(json)
        for (let j = 0; j < point_list.length; j++) {
            const point = point_list[j]
            if (use_point.indexOf(point) == -1) {
                let ele_id = this.getInitRandomType(key_list, use_ele_id)
                let data = {
                    point: point,
                    num: this._utils.getRandomInt(1, 3),
                    id: Number(ele_id)
                }
                need_point_data.push(data)
                use_point.push(point)
            }
        }

        // cc.error(need_point_data, "need_point_data==========")

        return need_point_data
    }

    /**
     * 获取随机类型
     * @param exclude 需排除的类型
     */
    public getInitRandomType(list: any[], exclude: any[] = []) {
        let types = list.concat()
        for (let i = 0; i < exclude.length; i++) {
            types.splice(types.indexOf(exclude[i]), 1)
        }
        return types[Math.floor(types.length * Math.random())]
    }

    private clickClose() {
        let sure_func = () => {
            this.close()
        }
        let cancel_func = () => {

        }

        this._dialog_manager.openTipDialog("中途退出游戏，则不保存本局积分和奖励", sure_func, cancel_func)
    }

    public getGoalNum() {
        return this.goal_num
    }

    private clickGuideBg() {
        this.guide_bg.active = false
    }

    // update (dt) {}
}
