
import MyComponent from "../common/MyComponent";

const { ccclass, property } = cc._decorator;

export let JianShenFangBehaviorName = {
    door: "door",
    danche1: "danche1",
    danche2: "danche2",
    quanji1: "quanji1",
    quanji2: "quanji2",
    juzhong1: "juzhong1",
    juzhong2: "juzhong2",
    paobu: "paobu",
    bengchuang: "bengchuang",
    bath1: "bath1",
    bath2: "bath2",
    move: "move",
}

@ccclass
export default class JianShenFangBehavior extends MyComponent {

    private stay_time = 10

    private operation_info = {
        door: {
            pos: [cc.v2(-79, 210), cc.v2(-219, 109)],
            zindex: [1, 19],
            actionName: ["zheng", "zheng"],
            flip: [0, 0]
        },
        danche1: {
            key: JianShenFangBehaviorName.danche1,
            pos: [cc.v2(250, -173), cc.v2(95, -262)],
            actionName: ["zheng", "zheng"],
            flip: [1, 0],
            endAniPos: cc.v2(50, -229),
            endAniName: "qidanche",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 21,
            isOn: false,
            finishPos: cc.v3(95, -262),
            bath_pos: [cc.v2(241, -181), cc.v2(357, -257)],
            bath_action_name: ["bei", "zheng"],
            bath_flip: [0, 1],
            facId: 6016,
            index: 0,
            no_bath_pos: [cc.v2(241, -181)],
            no_bath_action_name: ["bei"],
            no_bath_flip: [0],
        },
        danche2: {
            key: JianShenFangBehaviorName.danche2,
            pos: [cc.v2(250, -173), cc.v2(155, -225)],
            actionName: ["zheng", "zheng"], flip: [1, 0],
            endAniPos: cc.v2(107, -197),
            endAniName: "qidanche",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 19,
            isOn: false,
            finishPos: cc.v3(155, -225),
            bath_pos: [cc.v2(241, -181), cc.v2(357, -257)],
            bath_action_name: ["bei", "zheng"],
            bath_flip: [0, 1],
            facId: 6016,
            index: 1,
            no_bath_pos: [cc.v2(241, -181)],
            no_bath_action_name: ["bei"],
            no_bath_flip: [0],
        },
        quanji1: {
            key: JianShenFangBehaviorName.quanji1,
            pos: [cc.v2(20, -33), cc.v2(-148, -123)],
            actionName: ["zheng", "zheng"],
            flip: [1, 0],
            endAniPos: cc.v2(-148, -123),
            endAniName: "quanji",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 20,
            isOn: false,
            finishPos: cc.v3(-148, -123),
            bath_pos: [cc.v2(11, -41), cc.v2(357, -257)],
            bath_action_name: ["bei", "zheng"],
            bath_flip: [0, 1],
            facId: 6015,
            index: 0,
            no_bath_pos: [cc.v2(11, -41)],
            no_bath_action_name: ["bei"],
            no_bath_flip: [0],
        },
        quanji2: {
            key: JianShenFangBehaviorName.quanji2,
            pos: [cc.v2(20, -33), cc.v2(-59, -80)],
            actionName: ["zheng", "zheng"],
            flip: [1, 0],
            endAniPos: cc.v2(-59, -80),
            endAniName: "quanji",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 19,
            isOn: false,
            finishPos: cc.v3(-59, -80),
            bath_pos: [cc.v2(11, -41), cc.v2(357, -257)],
            bath_action_name: ["bei", "zheng"],
            bath_flip: [0, 1],
            facId: 6015,
            index: 1,
            no_bath_pos: [cc.v2(11, -41)],
            no_bath_action_name: ["bei"],
            no_bath_flip: [0],
        },
        juzhong1: {
            key: JianShenFangBehaviorName.juzhong1,
            pos: [cc.v2(-66, 0), cc.v2(-236, -103)],
            actionName: ["zheng", "zheng"],
            flip: [1, 0],
            endAniPos: cc.v2(-286, -56),
            endAniName: "juzhong",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 20,
            isOn: false,
            finishPos: cc.v3(-236, -103),
            bath_pos: [cc.v2(-65, 2), cc.v2(357, -257)],
            bath_action_name: ["bei", "zheng"],
            bath_flip: [0, 1],
            facId: 6014,
            index: 0,
            no_bath_pos: [cc.v2(-65, 2)],
            no_bath_action_name: ["bei"],
            no_bath_flip: [0],
        },
        juzhong2: {
            key: JianShenFangBehaviorName.juzhong2,
            pos: [cc.v2(-66, 0), cc.v2(-156, -56)],
            actionName: ["zheng", "zheng"],
            flip: [1, 0],
            endAniPos: cc.v2(-197, -6),
            endAniName: "juzhong",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 19,
            isOn: false,
            finishPos: cc.v3(-156, -56),
            bath_pos: [cc.v2(-65, 2), cc.v2(357, -257)],
            bath_action_name: ["bei", "zheng"],
            bath_flip: [0, 1],
            facId: 6014,
            index: 1,
            no_bath_pos: [cc.v2(-65, 2)],
            no_bath_action_name: ["bei"],
            no_bath_flip: [0],
        },
        paobu: {
            key: JianShenFangBehaviorName.paobu,
            pos: [cc.v2(-485, 31)],
            actionName: ["zheng"],
            flip: [0],
            endAniPos: cc.v2(-535, 72),
            endAniName: "paobu",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 19,
            isOn: false,
            finishPos: cc.v3(-485, 31),
            bath_pos: [cc.v2(-219, 109), cc.v2(357, -257)],
            bath_action_name: ["bei", "zheng"],
            bath_flip: [0, 1],
            facId: 6012,
            index: 0,
            no_bath_pos: [cc.v2(-219, 109)],
            no_bath_action_name: ["bei"],
            no_bath_flip: [0],
        },
        bengchuang: {
            key: JianShenFangBehaviorName.bengchuang,
            pos: [cc.v2(-256, 159)],
            actionName: ["bei"],
            flip: [1],
            endAniPos: cc.v2(-309, 203),
            endAniName: "bengchuang",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 19,
            isOn: false,
            finishPos: cc.v3(-256, 159),
            bath_pos: [cc.v2(357, -257)],
            bath_action_name: ["zheng"],
            bath_flip: [1],
            facId: 6010,
            index: 0,
            no_bath_pos: [cc.v2(357, -257)],
            no_bath_action_name: ["zheng"],
            no_bath_flip: [1],
        },
        bath1: {
            key: JianShenFangBehaviorName.bath1,
            bath_pos: cc.v3(215, -351),
            stay_time: this.stay_time,
            endZindex: 23,
            isOn: false,
            finishPos: cc.v3(357, -257),
        },
        bath2: {
            key: JianShenFangBehaviorName.bath2,
            bath_pos: cc.v3(290, -313),
            stay_time: this.stay_time,
            endZindex: 22,
            isOn: false,
            finishPos: cc.v3(357, -257),
        },
        move: {
            key: JianShenFangBehaviorName.move,
            pos: [cc.v2(-219, 109), cc.v2(-50, 233), cc.v2(61, 312)],
            zindex: [19, 19, 1],
            actionName: ["bei", "bei", "bei"],
            flip: [1, 0, 0],
            endAniPos: cc.v2(50, -229),
            endAniName: "zheng",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 18,
            isOn: false,
        },
    }

    public static instance: JianShenFangBehavior = null
    protected onLoad() {
        JianShenFangBehavior.instance = this
    }

    onDestroy() {
        JianShenFangBehavior.instance = null
        this.destroy()
    }

    public getOperationInfoByName(name: string) {
        return this.operation_info[name]
    }

    public getDuanLianType() {
        let list = [
            this.operation_info.danche1,
            this.operation_info.danche2,
            this.operation_info.quanji1,
            this.operation_info.quanji2,
            this.operation_info.juzhong1,
            this.operation_info.juzhong2,
            this.operation_info.paobu,
            this.operation_info.bengchuang,
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

    public changeDuanLianState(key: string, state: boolean) {
        if (this.operation_info[key]) {
            this.operation_info[key].isOn = state
        }
    }

    /**
     * 是否洗澡
     */
    public getBathType() {
        let list = [
            this.operation_info.bath1,
            this.operation_info.bath2,
        ]

        let need_info = null
        for (let i = 0; i < list.length; i++) {
            const info = list[i]
            if (!info.isOn) {
                need_info = info
                break
            }
        }

        return need_info
    }

    // update (dt) {}
}
