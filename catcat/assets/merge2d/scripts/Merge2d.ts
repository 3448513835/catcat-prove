/*
 * 测试
 */
import MyComponent from "../../Script/common/MyComponent"
import GuideManager from "../../Script/common/GuideManager"

const { ccclass, property } = cc._decorator;
@ccclass
export default class Merge extends MyComponent {

    onLoad () {
        super.onLoad && super.onLoad();
        this._dialog_manager.closeAllDialogs();
        // this.checkGuide();
        // this.schedule(() => { console.log(cc.renderer.drawCalls); }, 1);
    }

    private checkGuide () {
        if (!GuideManager.getGuideFinish()) {
            GuideManager.setGuideMask(true);
        }
        else {
            GuideManager.setGuideMask(false);
        }
    }

    onDestroy () {
        this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, { clear: true, });
        /* this._resource_manager.loadBundle("merge2d").then((bundle) => {
            bundle.releaseAll();
        }); */
        super.onDestroy && super.onDestroy();
    }
}
