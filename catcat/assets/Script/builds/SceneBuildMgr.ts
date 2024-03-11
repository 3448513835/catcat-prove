import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";
import BuildBubble from "./BuildBubble";
import SceneBuild from "./SceneBuild";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SceneBuildMgr extends MyComponent {

    @property({ type: [cc.Node] })
    scene_build_list: cc.Node[] = []

    /**可以解锁气泡列表 */
    private buildBubble_list: { [id: number]: BuildBubble } = {}

    public static instance: SceneBuildMgr = null
    protected onLoad() {
        SceneBuildMgr.instance = this

        this.listen(this._event_name.EVENT_TASK_MOVE_MAP_TO_POS, this.taskMoveToPos, this)
    }

    onDestroy() {
        SceneBuildMgr.instance = null
        this.destroy()
    }

    /**
     * 场景建筑
     */
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
        let buildId = buildBubble.getSceneBuildId()
        let build = this.getSceneBuildById(buildId)
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
            sceneBuildId: buildId,
            sceneBuildConfig: buildBubble.getSceneBuildConfig(),
            sceneBuildLockId: buildBubble.getSceneBuildLockId()
        }
        MapGridView.instance.popBuildInfoView(data)
    }

    public getSceneBuildList() {
        return this.scene_build_list
    }

    public addSceneBuildToList(build: cc.Node) {
        this.scene_build_list.push(build)
    }

    public getSceneBuildById(id: number): SceneBuild {
        let build: SceneBuild
        for (let i = 0; i < this.scene_build_list.length; i++) {
            const node = this.scene_build_list[i]
            let build_com = node.getComponent(SceneBuild)
            if (id == build_com.getId()) {
                build = build_com
                break
            }
        }

        return build
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

    private taskMoveToPos(data: {isSceneBuild: boolean, sceneBuildId: number}) {
        if (data.isSceneBuild) {
            let buildBubble = this.getBuildBubbleByIndex(data.sceneBuildId)
            if (cc.isValid(buildBubble)) {
                this.moveToPosByBuildBubble(buildBubble)
            }   
        }
    }
}
