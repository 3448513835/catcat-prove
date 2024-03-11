import MyComponent from "../common/MyComponent";


const {ccclass, property} = cc._decorator;

export let YouLeChangBehaviorName = {
    door: "door",
    motianlun: "motianlun",
    haidaochuan: "haidaochuan",
    feiji: "feiji",
    tiaolouji: "tiaolouji",
    move: "move",
}

@ccclass
export default class YouLeChangBehavior extends MyComponent {

    private stay_time = 10

    private operation_info = {
        door: {
            pos: [cc.v2(-624, 337), cc.v2(-943, 92)],
            zindex: [1, 19],
            actionName: ["zheng", "zheng"],
            flip: [0, 0]
        },
        motianlun: {
            key: YouLeChangBehaviorName.motianlun,
            pos: [cc.v2(-1097, 187)],
            actionName: ["bei"],
            flip: [1],
            endAniPos: cc.v2(-1136, 266),
            endAniName: "zhengzuo",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 21,
            isOn: false,
            finishPos: cc.v3(-1097, 187),
            facId: 8009,
            move_pos: [cc.v2(-943, 92)],
            move_action_name: ["zheng"],
            move_flip: [1],
            index: 0,
        },
        haidaochuan: {
            key: YouLeChangBehaviorName.haidaochuan,
            pos: [cc.v2(-156, -357), cc.v2(30, -536), cc.v2(741, -578), cc.v2(741, -128), cc.v2(922, -51)],
            actionName: ["zheng", "zheng", "zheng", "bei", "bei"],
            flip: [1, 1, 1, 0, 0],
            endAniPos: cc.v2(1103, 145),
            endAniName: "beizuo",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 21,
            isOn: false,
            finishPos: cc.v3(922, -51),
            facId: 8031,
            move_pos: [cc.v2(741, -128), cc.v2(741, -578), cc.v2(30, -536), cc.v2(-156, -357)],
            move_action_name: ["zheng", "zheng", "zheng", "zheng"],
            move_flip: [0, 0, 0, 0],
            index: 0,
        },
        feiji: {
            key: YouLeChangBehaviorName.feiji,
            pos: [cc.v2(-156, -357), cc.v2(30, -536), cc.v2(741, -578), cc.v2(1247, -263)],
            actionName: ["zheng", "zheng", "zheng", "zheng"],
            flip: [1, 1, 1, 1],
            endAniPos: cc.v2(1268.254, -39.434),
            endAniName: "zhengzuo",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 21,
            isOn: false,
            finishPos: cc.v3(1247, -263),
            facId: 8024,
            move_pos: [cc.v2(741, -578), cc.v2(30, -536), cc.v2(-156, -357)],
            move_action_name: ["zheng", "zheng", "zheng"],
            move_flip: [0, 0, 0],
            index: 0,
        },
        tiaolouji: {
            key: YouLeChangBehaviorName.tiaolouji,
            pos: [cc.v2(-156, -357), cc.v2(30, -536), cc.v2(741, -578), cc.v2(1600, -112)],
            actionName: ["zheng", "zheng", "zheng", "zheng"],
            flip: [1, 1, 1, 1],
            endAniPos: cc.v2(1705, -67),
            endAniName: "zhengzuo",
            endFlip: 0,
            stay_time: this.stay_time,
            endZindex: 21,
            isOn: false,
            finishPos: cc.v3(1600, -112),
            facId: 8029,
            move_pos: [cc.v2(741, -578), cc.v2(30, -536), cc.v2(-156, -357)],
            move_action_name: ["zheng", "zheng", "zheng"],
            move_flip: [0, 0, 0],
            index: 0,
        },
        move: {
            key: YouLeChangBehaviorName.move,
            pos: [cc.v2(-943, 92), cc.v2(-624, 337), cc.v2(-480, 406)],
            zindex: [19, 19, 1],
            actionName: ["bei", "bei", "bei"],
            flip: [0, 0, 0],
            endAniPos: cc.v2(50, -229),
            endAniName: "zheng",
            endFlip: 1,
            stay_time: this.stay_time,
            endZindex: 18,
            isOn: false,
        },
    }

    public static instance: YouLeChangBehavior = null
    protected onLoad() {
        YouLeChangBehavior.instance = this
    }

    onDestroy() {
        YouLeChangBehavior.instance = null
        this.destroy()
    }

    public getOperationInfoByName(name: string) {
        return this.operation_info[name]
    }

    public getInfoType() {
        let list = [
            // this.operation_info.motianlun,
            this.operation_info.haidaochuan,
            this.operation_info.feiji,
            this.operation_info.tiaolouji,
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
}
