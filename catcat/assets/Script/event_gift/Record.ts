/*
 * 录制
 */
import MyComponent from "../common/MyComponent";

enum RecordState {
    NONE = 0,
    RECORDING = 1,
    RECORDED = 2,
};

const { ccclass, property } = cc._decorator;
@ccclass
export default class Record extends MyComponent {
    @property(cc.Label)
    private record_label: cc.Label = null;
    private state: RecordState = 0;

    onLoad () {
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            this.refrush();
        }
        else {
            this.node.active = false;
        }
    }

    private refrush () {
        let state = this._utils.ttGetVideoState();
        if (state == RecordState.NONE) {
            this.record_label.string = "录屏";
        }
        else if (state == RecordState.RECORDING) {
            this.record_label.string = "录屏中";
        }
        else if (state == RecordState.RECORDED) {
            this.record_label.string = "录屏分享";
        }
    }

    private click () {
        this.unscheduleAllCallbacks();
        let state = this._utils.ttGetVideoState();
        if (state == RecordState.NONE) {
            this._utils.ttRecordStart();
        }
        else if (state == RecordState.RECORDING) {
            this._utils.ttRecordStop();
            this.scheduleOnce(() => {
                this._utils.ttRecordStop();
                this.refrush();
            }, 300);
        }
        else if (state == RecordState.RECORDED) {
            this._utils.ttRecordEdit();
        }
        this.refrush();
    }
}
