import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import BuildBubble from "./BuildBubble";
import SceneRubbish from "./SceneRubbish";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SceneRubbishMgr extends MyComponent {

    @property({ type: [cc.Node] })
    scene_rubbish_list: cc.Node[] = []

    /**可以解锁气泡列表 */
    private buildBubble_list: { [id: number]: BuildBubble } = {}

    public static instance: SceneRubbishMgr = null
    protected onLoad() {
        SceneRubbishMgr.instance = this

        this.listen(this._event_name.EVENT_TASK_MOVE_MAP_TO_POS, this.taskMoveToPos, this)
    }

    onDestroy() {
        SceneRubbishMgr.instance = null
        this.destroy()
    }

    /**
     * 场景垃圾
     */
    public checkIsClickRubbishBubble(pos: cc.Vec2): boolean {
        let is_click = false
        for (const key in this.buildBubble_list) {
            if (Object.prototype.hasOwnProperty.call(this.buildBubble_list, key)) {
                const buildBubble = this.buildBubble_list[key]
                let node = buildBubble.node
                let rect = cc.rect(-node.width / 2, -node.height / 2, node.width, node.height)
                let pos_n = node.convertToNodeSpaceAR(pos)
                if (rect.contains(pos_n)) {
                    // cc.error("click_bubble========")
                    this.moveToPosByRubbishBubble(buildBubble)
                    // buildBubble.click()
                    is_click = true
                    break
                }
            }
        }

        return is_click
    }

    public moveToPosByRubbishBubble(buildBubble: BuildBubble) {
        let buildId = buildBubble.getSceneRubbishId()
        let build = this.getSceneRubbishById(buildId)
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

        let data = {
            sceneRubbishId: buildId,
        }
        MapGridView.instance.popBuildInfoView(data)
    }

    public getSceneRubbishList() {
        return this.scene_rubbish_list
    }

    public addSceneRubbishToList(build: cc.Node) {
        this.scene_rubbish_list.push(build)
    }

    public removeSceneRubbishById(id: number) {
        let index = this.getSceneRubbishIndexById(id)
        if (index != null) {
            this.scene_rubbish_list.splice(index, 1)
        }
    }

    public getSceneRubbishIndexById(id: number) {
        let index = null
        for (let i = 0; i < this.scene_rubbish_list.length; i++) {
            const node = this.scene_rubbish_list[i]
            let build_com = node.getComponent(SceneRubbish)
            if (id == build_com.getId()) {
                index = i
                break
            }
        }

        return index
    }

    public getSceneRubbishById(id: number): SceneRubbish {
        let build: SceneRubbish
        for (let i = 0; i < this.scene_rubbish_list.length; i++) {
            const node = this.scene_rubbish_list[i]
            let build_com = node.getComponent(SceneRubbish)
            if (id == build_com.getId()) {
                build = build_com
                break
            }
        }

        return build
    }

    public addRubbishBubbleByIndex(index: number, buildBubble: BuildBubble) {
        this.buildBubble_list[index] = buildBubble

        this._event_manager.dispatch(this._event_name.EVENT_CAN_LOCK_FAC)
    }

    public removeRubbishBubbleByIndex(index: number) {
        delete this.buildBubble_list[index]
    }

    public getRubbishBubbleList() {
        return this.buildBubble_list
    }

    public getRubbishBubbleByIndex(index: number) {
        return this.buildBubble_list[index]
    }

    private taskMoveToPos(data: {isSceneRubbish: boolean, sceneRubbishId: number}) {
        if (data.isSceneRubbish) {
            let buildBubble = this.getRubbishBubbleByIndex(data.sceneRubbishId)
            if (cc.isValid(buildBubble)) {
                this.moveToPosByRubbishBubble(buildBubble)
            }   
        }
    }

    // update (dt) {}
}
