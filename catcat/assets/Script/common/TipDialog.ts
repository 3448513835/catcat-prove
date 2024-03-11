import MyComponent from "./MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class TipDialog extends MyComponent {

    @property(cc.Label)
    content: cc.Label = null

    @property(cc.Label)
    cancel_label: cc.Label = null

    @property(cc.Label)
    confirm_label: cc.Label = null

    private data = null

    onLoad () {
        let data = this.getDialogData();
        this.content.string = data.content;
        if (data.cancel_fn) {
            if (data.cancel_msg) {
                this.cancel_label.string = data.cancel_msg;
            }
            this.cancel_label.node.parent.active = true;
        }
        else {
            this.cancel_label.node.parent.active = false;
        }
        if (data.confirm_fn) {
            if (data.confirm_msg) {
                this.confirm_label.string = data.confirm_msg;
            }
            this.confirm_label.node.parent.active = true;
        }
        else {
            this.confirm_label.node.parent.active = false;
        }
        this.data = data;
    }

    private clickCancel() {
        if (this.data.cancel_fn) {
            this.data.cancel_fn();
        }
        this.close()
    }

    private clickSure() {
        if (this.data.confirm_fn) {
            this.data.confirm_fn();
        }
        this.close()
    }
}
