import MyComponent from "../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class FacClear extends MyComponent {

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    // onLoad () {}

    start () {

    }

    public setClear() {
        
    }

    // update (dt) {}
}
