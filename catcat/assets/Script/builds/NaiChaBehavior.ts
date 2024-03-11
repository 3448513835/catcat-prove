import MyComponent from "../common/MyComponent";


const { ccclass, property } = cc._decorator;

export let NaiChaBehaviorName = {
    door: "door",
    qucan1: "qucan1",
    qucan2: "qucan2",
    jiezhang: "jiezhang",
    zuowei1: "zuowei1",
    zuowei2: "zuowei2",
    zuowei3: "zuowei3",
    zuowei4: "zuowei4",
    move1: "move1",
    move2: "move2",
    move3: "move3",
}

@ccclass
export default class NaiChaBehavior extends MyComponent {

    private operation_info = {
        door: { pos: [cc.v2(-205, -57)], actionName: ["bei"], flip: [0] },
        qucan1: { pos: [cc.v2(-40, -80)], actionName: ["bei"], flip: [0], endAniName: "beidaiji", endFlip: 0, stay_time: 1, isOn: false },
        qucan2: { pos: [cc.v2(-90, -115)], actionName: ["zheng"], flip: [1], endAniName: "zhengdaiji", endFlip: 0, stay_time: 1, isOn: false },
        jiezhang: { pos: [cc.v2(-150, -25)], actionName: ["bei"], flip: [1], endAniName: "beidaiji", endFlip: 0, stay_time: 1, isOn: false },
        zuowei1: { key: NaiChaBehaviorName.zuowei1, pos: [cc.v2(110, -139), cc.v2(203, -75), cc.v2(244, -102)], actionName: ["zhengna", "beina", "zhengna"], flip: [1, 0, 1], endAniName: "zhengchi", endFlip: 0, stay_time: 10, moveType: NaiChaBehaviorName.move2, endZindex: 19, isOn: false },
        zuowei2: { key: NaiChaBehaviorName.zuowei2, pos: [cc.v2(110, -139), cc.v2(176, -135)], actionName: ["zhengna", "bei"], flip: [1, 0], endAniName: "beichi", endFlip: 0, stay_time: 10, moveType: NaiChaBehaviorName.move1,  endZindex: 21, isOn: false },
        zuowei3: { key: NaiChaBehaviorName.zuowei3, pos: [cc.v2(106, -171)], actionName: ["zhengna"], flip: [1], endAniName: "zhengchi", endFlip: 0, stay_time: 10, moveType: NaiChaBehaviorName.move1, endZindex: 19, isOn: false },
        zuowei4: { key: NaiChaBehaviorName.zuowei4, pos: [cc.v2(41, -205)], actionName: ["zhengna"], flip: [1], endAniName: "beichi", endFlip: 0, stay_time: 10, moveType: NaiChaBehaviorName.move1, endZindex: 21, isOn: false },
        move1: { pos: [cc.v2(22, -119), cc.v2(-205, -57), cc.v2(-546, -280)], actionName: ["bei", "bei", "zheng"], flip: [1, 1, 0], endAniName: "zheng", endFlip: 0, stay_time: 1, isOn: false },
        move2: { pos: [cc.v2(204, -67), cc.v2(99, -150), cc.v2(22, -119), cc.v2(-205, -57), cc.v2(-546, -280)], actionName: ["bei", "zheng", "bei", "bei", "zheng"], flip: [1, 0, 1, 1, 0], endAniName: "zheng", endFlip: 0, stay_time: 1, isOn: false },
        move3: { pos: [cc.v2(-546, -280)], actionName: ["zheng"], flip: [0], endAniName: "zheng", endFlip: 0, stay_time: 1, isOn: false },
    }

    public static instance: NaiChaBehavior = null
    protected onLoad() {
        NaiChaBehavior.instance = this
    }

    onDestroy() {
        NaiChaBehavior.instance = null
        this.destroy()
    }

    public getOperationInfoByName(name: string) {
        return this.operation_info[name]
    }

    public getQuCanInfo() {
        let list = [this.operation_info.qucan1, this.operation_info.qucan2]
        // if (!this.operation_info.qucan1.isOn) {
        //     list.push(this.operation_info.qucan1)
        // }
        // if (!this.operation_info.qucan2.isOn) {
        //     list.push(this.operation_info.qucan2)
        // }
        if (list.length > 0) {
            let random = this._utils.getRandomInt(0, list.length - 1)
            // random = 0
            return list[random]
        }
    }

    public changeZuoWeiState(key: string, state: boolean) {
        if (this.operation_info[key]) {
            this.operation_info[key].isOn = state
        }
    }

    public getZuoWeiInfo() {
        let list = [
            this.operation_info.zuowei1,
            this.operation_info.zuowei2,
            this.operation_info.zuowei3,
            this.operation_info.zuowei4,
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

    // update (dt) {}
}
