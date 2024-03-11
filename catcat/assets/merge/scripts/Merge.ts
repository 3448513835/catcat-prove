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
        this.checkGuide();
    }

    private checkGuide () {
        if (!GuideManager.getGuideFinish()) {
            GuideManager.setGuideMask(false);
        }
        else {
            GuideManager.setGuideMask(false);
        }
    }

    onDestroy () {
        this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, { clear: true, });
        super.onDestroy && super.onDestroy();
    }
}
