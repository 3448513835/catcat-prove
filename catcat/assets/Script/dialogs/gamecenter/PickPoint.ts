import MyComponent from "../../common/MyComponent";
import EntrustView from "../entrust/EntrustView";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PickPoint extends MyComponent {

    @property([cc.Sprite])
    item_list: cc.Sprite[] = []    

    private data = null
    private point: number = null
    private item_num: number = 0
    private id: number = null

    private have_num: number = 0

    // onLoad () {}

    start () {

    }

    public init(data) {
        this.data = data
        this.point = data["point"]
        this.item_num = data["num"]
        this.have_num = this.item_num
        let config = this._json_manager.getJsonData(this._json_name.PICK_ELE, data["id"])
        this.id = config["icon"]
        this.data["ele_id"] = this.id
        let path = this._utils.getItemPathById(this.id)
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(sprite_frame)) {
                for (let i = 0; i < this.item_list.length; i++) {
                    const icon = this.item_list[i]
                    if (i < this.item_num) {
                        icon.spriteFrame = sprite_frame
                        icon.node.active = true
                    }
                }
            }
        })
    }

    getId() {
        return this.id
    }

    getData() {
        return this.data
    }

    setSelectItemState(isShow: boolean) {
        let sp = this.item_list[this.have_num - 1]
        if (cc.isValid(sp)) {
            sp.node.active = isShow
        }
    }

    getHaveNum() {
        return this.have_num
    }

    setHaveNum(value: number) {
        this.have_num = value
    }

    // update (dt) {}
}
