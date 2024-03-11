import MyComponent from "../common/MyComponent";
import Room from "./Room";


const {ccclass, property} = cc._decorator;

@ccclass
export default class FishAni extends MyComponent {

    @property(dragonBones.ArmatureDisplay)
    dragon_fish: dragonBones.ArmatureDisplay = null

    @property(cc.Animation)
    ani: cc.Animation = null

    @property(cc.Node)
    parent_node: cc.Node = null

    private room: Room = null

    onLoad () {
        this.ani.on("finished", () => {
            this.parent_node.destroy()
        })
    }

    start () {

    }

    public init(room: Room) {
        this.room = room
    }

    private change(ani_name) {
        // cc.error(ani_name, "aaaa=========")
        
        if (ani_name == "da") {
            let fac_id = 2010
            if (this.room.getFacIsUnlockById(fac_id)) {
                this.dragon_fish.armatureName = "yu"
                this.dragon_fish.playAnimation("siyu", -1)
            }
        }
        else if (ani_name == "kao") {
            let fac_id = 2011
            if (this.room.getFacIsUnlockById(fac_id)) {
                this.dragon_fish.armatureName = "yu"
                this.dragon_fish.playAnimation("shuyu", -1)
            }
        }
        else if (ani_name == "qie") {
            let fac_id = 2012
            if (this.room.getFacIsUnlockById(fac_id)) {
                this.dragon_fish.armatureName = "yu"
                this.dragon_fish.playAnimation("qieyu_1", -1)
            }
        }
        else if (ani_name == "kai") {
            this.dragon_fish.armatureName = "yu"
            this.dragon_fish.playAnimation("huoyu", -1)
        }
    }

    // update (dt) {}
}
