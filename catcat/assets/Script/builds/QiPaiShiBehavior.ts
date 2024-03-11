
import MyComponent from "../common/MyComponent";

const {ccclass, property} = cc._decorator;

export let QiPaiShiBehaviorName = {
    door: "door",
    laohuji: "laohuji",
    dianshi: "dianshi",
    taiqiu: "taiqiu",
    majiang1: "majiang1",
    majiang2: "majiang2",
    majiang3: "majiang3",
    majiang4: "majiang4",
    move: "move",
}

@ccclass
export default class QiPaiShiBehavior extends MyComponent {

    private stay_time = 10

    private operation_info = {
        door: {
            pos: [cc.v2(-340, -110)],
            zindex: [19],
            actionName: ["bei"],
            flip: [0]
        },
        laohuji: {
            key: QiPaiShiBehaviorName.laohuji,
            pos: [cc.v2(-70, -111), cc.v2(103, -23)],
            actionName: ["bei", "bei"],
            flip: [0, 0],
            endAniPos: cc.v2(103, -23),
            endAniName: "beidaiji",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 21,
            finishPos: cc.v3(103, -23),
            isOn: false,
            facId: 7005,
            move_pos: [cc.v2(-70, -111), cc.v2(-340, -110)],
            move_action_name: ["zheng", "zheng"],
            move_flip: [0, 0],
            index: 0,
        },
        dianshi: {
            key: QiPaiShiBehaviorName.dianshi,
            pos: [cc.v2(-70, -111), cc.v2(132, -112), cc.v2(193, -69)],
            actionName: ["bei", "bei", "bei"],
            flip: [0, 0, 0],
            endAniPos: cc.v2(184, -53),
            endAniName: "zhengzuo",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 21,
            finishPos: cc.v3(193, -69),
            isOn: false,
            facId: 7010,
            move_pos: [cc.v2(132, -112), cc.v2(132, -112), cc.v2(-70, -111), cc.v2(-340, -110)],
            move_action_name: ["zheng", "zheng", "zheng", "zheng"],
            move_flip: [0, 0, 0, 0],
            index: 0,
        },
        majiang1: {
            key: QiPaiShiBehaviorName.majiang1,
            pos: [cc.v2(-184, -25)],
            actionName: ["bei"],
            flip: [0],
            endAniPos: cc.v2(20, 144),
            endAniName: "zhengzuo",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 19,
            finishPos: cc.v3(-184, -25),
            isOn: false,
            facId: 7004,
            move_pos: [cc.v2(-340, -110)],
            move_action_name: ["zheng"],
            move_flip: [0],
            index: 0,
        },
        majiang2: {
            key: QiPaiShiBehaviorName.majiang2,
            pos: [cc.v2(-184, -25)],
            actionName: ["bei"],
            flip: [0],
            endAniPos: cc.v2(35, 84),
            endAniName: "beizuo",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 21,
            finishPos: cc.v3(-184, -25),
            isOn: false,
            facId: 7004,
            move_pos: [cc.v2(-340, -110)],
            move_action_name: ["zheng"],
            move_flip: [0],
            index: 0,
        },
        majiang3: {
            key: QiPaiShiBehaviorName.majiang3,
            pos: [cc.v2(-184, -25)],
            actionName: ["bei"],
            flip: [0],
            endAniPos: cc.v2(-104, 82),
            endAniName: "beizuo",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 21,
            finishPos: cc.v3(-184, -25),
            isOn: false,
            facId: 7004,
            move_pos: [cc.v2(-340, -110)],
            move_action_name: ["zheng"],
            move_flip: [0],
            index: 0,
        },
        majiang4: {
            key: QiPaiShiBehaviorName.majiang4,
            pos: [cc.v2(-184, -25)],
            actionName: ["bei"],
            flip: [0],
            endAniPos: cc.v2(-93, 145),
            endAniName: "zhengzuo",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 19,
            finishPos: cc.v3(-184, -25),
            isOn: false,
            facId: 7004,
            move_pos: [cc.v2(-340, -110)],
            move_action_name: ["zheng"],
            move_flip: [0],
            index: 0,
        },
        taiqiu: {
            key: QiPaiShiBehaviorName.taiqiu,
            pos: [cc.v2(-13, -316), cc.v2(40, -282)],
            actionName: ["zheng", "bei"],
            flip: [1, 0],
            endAniPos: cc.v2(40, -282),
            endAniName: "dataiqiu",
            endFlip: 1,
            stay_time: 2,
            endZindex: 21,
            finishPos: cc.v3(193, -69),

            pos2: [cc.v2(-13, -316), cc.v2(-144, -253)],
            actionName2: ["zheng", "bei"],
            flip2: [0, 1],
            endAniPos2: cc.v2(-144, -253),
            endAniName2: "dataiqiu",
            endFlip2: 0,
            stay_time2: 2,
            endZindex2: 21,

            isOn: false,
            facId: 7012,
            move_pos: [cc.v2(-340, -110)],
            move_action_name: ["zheng"],
            move_flip: [0],
            index: 0,
        },
        move: {
            key: QiPaiShiBehaviorName.move,
            pos: [cc.v2(-716, -276)],
            zindex: [19],
            actionName: ["zheng"],
            flip: [0],
            endAniPos: cc.v2(50, -229),
            endAniName: "zheng",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 18,
            isOn: false,
        },
    }

    public static instance: QiPaiShiBehavior = null
    protected onLoad() {
        QiPaiShiBehavior.instance = this
    }

    onDestroy() {
        QiPaiShiBehavior.instance = null
        this.destroy()
    }

    public getOperationInfoByName(name: string) {
        return this.operation_info[name]
    }

    public getDuanLianType() {
        let list = [
            this.operation_info.laohuji,
            this.operation_info.dianshi,
            this.operation_info.taiqiu,
            this.operation_info.majiang1,
            this.operation_info.majiang2,
            this.operation_info.majiang3,
            this.operation_info.majiang4,
        ]

        let can_list = []
        for (let i = 0; i < list.length; i++) {
            const info = list[i]
            if (!info.isOn) {
                can_list.push(info)
            }
        }

        if (can_list.length > 0) {
            let random = this._utils.getRandomInt(0, can_list.length - 1)
            let info = can_list[random]
            info.isOn = true
            return info
        } else {
            return
        }
    }

    public changeInfoState(key: string, state: boolean) {
        if (this.operation_info[key]) {
            this.operation_info[key].isOn = state
        }
    }

}
