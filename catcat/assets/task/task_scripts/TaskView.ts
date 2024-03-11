import { UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";
import PackManager from "../../Script/common/PackManager";
import TaskScroll from "./TaskScroll";
import GuideManager from "../../Script/common/GuideManager"
import { User } from "../../Script/common/User";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskView extends MyComponent {

    @property(cc.Label)
    yugan_num: cc.Label = null

    @property(TaskScroll)
    taskScroll: TaskScroll = null

    @property(cc.Node)
    none_node: cc.Node = null

    private taskData = []

    onLoad() {
        this.listen(this._event_name.SOCKET_TASK_LIST, this.initView, this)
        this.listen(this._event_name.EVENT_OPENED_DIALOG, this.onOpenDialog, this);

        let data = UserDefault.getItem(User.getUID() + GameConstant.TASK_LOCAL_VALUE_STR)
        if (data) {
            this.initView(JSON.parse(data))
        } else{
            this._net_manager.requestTaskInit()
        }
    }

    start() {

    }

    private initView(data) {
        // cc.error(data, "task=========")
        UserDefault.setItem(User.getUID() + GameConstant.TASK_LOCAL_VALUE_STR, JSON.stringify(data))

        // this.yugan_num.string = PackManager.getItemNumById(100006).toString()
        this.yugan_num.string = this._user.getFish().toString()
        this.taskData = []

        let boxLists = data["boxLists"]
        let taskLists = data["taskLists"]

        for (const key in boxLists) {
            if (Object.prototype.hasOwnProperty.call(boxLists, key)) {
                const box_data = boxLists[key]
                let task_data = taskLists[key]
                let temp_data = {
                    groupId: key,
                    box_data: box_data
                }
                if (task_data) {
                    temp_data["task_data"] = task_data
                } else {
                    temp_data["task_data"] = []
                }

                this.taskData.push(temp_data)

                // for (let m = 0; m < 8; m++) {
                //     let list = []
                //     let temp_data = {
                //         groupId: key,
                //         box_data: box_data
                //     }
                //     for (let n = 0; n < m; n++) {
                //         list.push(n)

                //     }
                //     temp_data["task_data"] = list
                //     this.taskData.push(temp_data)
                // }
            }
        }

        // cc.error(this.taskData, "this.taskData=========")
        if (this.taskData.length > 0) {
            this.none_node.active = false
            this.taskData.sort((a, b) => {
                let box_data1 = a["box_data"]
                let box_data2 = b["box_data"]
                let levle1 = box_data1["levle"]
                let levle2 = box_data2["levle"]
                return levle1 - levle2
            })
        }else {
            this.none_node.active = true
        }
        this.taskScroll.setView(this.taskData)
    }

    private onOpenDialog (data) {
        if (data.dialog_cfg.prefab == this._dialog_name.TaskView.prefab) {
            GuideManager.triggerGuide();
        }
    }

    // update (dt) {}
}
