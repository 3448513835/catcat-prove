import MyComponent from "../../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PickLanZi extends MyComponent {

    @property([cc.Sprite])
    item_list: cc.Sprite[] = []

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    ttf_num: cc.Label = null

    @property(cc.Sprite)
    sp_finished: cc.Sprite = null

    private id: number = null
    private isMax: boolean = false
    private index: number = null
    private have_num: number = 0
    private data = null

    // onLoad () {}

    start () {

    }

    init(data) {
        this.data = data
        let config = this._json_manager.getJsonData(this._json_name.PICK_ELE, data["id"])
        this.id = config["icon"]

        let path = this._utils.getItemPathById(this.id)
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(sprite_frame)) {
                this.icon.spriteFrame = sprite_frame
            }
        })

        
        this.index = data["index"]
        this.have_num = data["have_num"]
        
        this.setHaveItem()
    }

    setHaveItem() {
        let need_num = this.data["num"]
        this.ttf_num.string = `${this.have_num}/${need_num}`
        if (this.have_num >= need_num) {
            this.sp_finished.node.active = true
            this.isMax = true
        }else {
            this.sp_finished.node.active = false
            this.isMax = false
        }

        if (this.have_num > 0) {
            let path = this._utils.getItemPathById(this.id)
            for (let i = 0; i < this.item_list.length; i++) {
                const icon = this.item_list[i]
                if (i < this.have_num) {
                    this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                        if (cc.isValid(sprite_frame)) {
                            icon.spriteFrame = sprite_frame
                            icon.node.active = true
                        }
                    })
                }else {
                    icon.node.active = false
                }
            }
        }else {
            for (let i = 0; i < this.item_list.length; i++) {
                const icon = this.item_list[i]
                icon.node.active = false
            }
        }
    }

    public hideItemList() {
        for (let i = 0; i < this.item_list.length; i++) {
            const icon = this.item_list[i]
            icon.node.active = false
        }
    }

    public getIndex() {
        return this.index
    }

    getId() {
        return this.id
    }

    getIsMax() {
        return this.isMax
    }

    getHaveNum() {
        return this.have_num
    }

    setHaveNum(value: number) {
        this.have_num = value
    }

    // update (dt) {}
}
