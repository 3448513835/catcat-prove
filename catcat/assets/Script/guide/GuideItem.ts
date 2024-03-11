/*
 * 新手
 */
import MyComponent from "../common/MyComponent"
import { GuideManager, IGuideConfig } from "../common/GuideManager"
import GuideDialog from "./GuideDialog"

const { ccclass, property } = cc._decorator;
@ccclass
export default class GuideItem extends MyComponent {
    @property({ type: cc.Float, visible: true })
    private guide_id: number = 0;

    private trigged: boolean = false;

    onLoad () {
        super.onLoad && super.onLoad();
        if (this.guide_id == 300) {
            let end_node = cc.find("End", this.node);
            let pos = new cc.Vec2(cc.visibleRect.width-225, 107);
            pos = end_node.parent.convertToNodeSpaceAR(pos);
            end_node.setPosition(pos);
        }
        let guide_id = GuideManager.getGuideId();
        if (GuideManager.getGuideFinish() && this.guide_id < 300) {
            this.node.destroy();
        }
        else {
            this.listen(this._event_name.EVENT_TRIGGER_GUIDE, this.onTriggerGuide, this);
        }
    }

    private onTriggerGuide () {
        if (this.guide_id == GuideManager.getGuideId() && !this.trigged) {
            // console.log(this.node.uuid, this._utils.getMnt(this.node));
            this.unlisten(this._event_name.EVENT_TRIGGER_GUIDE);
            this.trigged = true;
            let cfg: IGuideConfig = GuideManager.GuideConfig[this.guide_id];
            this._resource_manager.getPrefab("main_scene/prefabs/guide/GuideDialog").then((prefab) => {
                let dialog = cc.instantiate(prefab);
                dialog.parent = GuideManager.getGuideNode();
                dialog.getComponent(GuideDialog).setData({
                    guide_item_node: this.node,
                    guide_id: this.guide_id,
                    cfg: cfg,
                });
            });
        }
    }
}
