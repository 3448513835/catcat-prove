/*
 * 隐私协议
 */

import MyComponent from "../../../Script/common/MyComponent";

const { ccclass, property } = cc._decorator;
@ccclass
export default class AgreenmentDialog extends MyComponent {
    @property(cc.ScrollView)
    private scroll_view: cc.ScrollView = null;

    onLoad () {
        this.node.setContentSize(cc.visibleRect.width, cc.visibleRect.height);
        let widget = this.scroll_view.node.getComponent(cc.Widget);
        widget.top += this._utils.getSafeAreaTop();
        widget.updateAlignment();
    }
}

