import MyComponent from "../../common/MyComponent";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PickResultView extends MyComponent {

    @property(cc.Label)
    goal_num: cc.Label = null

    @property(cc.Node)
    reward_node: cc.Node = null

    @property(cc.Label)
    ttf_title: cc.Label = null

    private data = null
    private need_config = null

    onLoad () {
        this.data = this.getDialogData()
    }

    start () {
        this.goal_num.string = `+${this.data["score"]}`
        let my_score = this.data["score"]
        let need_config = null
        let config = this._json_manager.getJson(this._json_name.GAME_ELE_REWARD)
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                const item_data = config[key]
                let sort = item_data["sort"]
                let arr = sort.split("-")
                if (Number(arr[0]) <= my_score && my_score <= Number(arr[1])) {
                    need_config = item_data
                    break
                }
            }
        }

        if (need_config) {
            this.need_config = need_config

            this.ttf_title.string = need_config["content"]

            let reword = need_config["reword"]
            let reward_list = this._utils.changeConfigData(reword)
            let item_list = this.reward_node.children
            for (let j = 0; j < item_list.length; j++) {
                const node = item_list[j]
                let item_data = reward_list[j]
                if (item_data) {
                    node.active = true
                    let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                    let num = node.getChildByName("Num").getComponent(cc.Label)
                    let name = node.getChildByName("Name").getComponent(cc.Label)
                    num.string = item_data["item_num"]

                    let item_id = item_data["item_id"]
                    name.string = this._utils.getItemNameById(item_id)
                    let path = this._utils.getItemPathById(item_id)
                    this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                        if (cc.isValid(icon)) {
                            icon.spriteFrame = sprite_frame
                            let item_type = this._utils.getItemTypeById(item_id)
                            if (item_type == 1) icon.node.scale = 0.5
                        }
                    })
                } else {
                    node.active = false
                }
            }
        }
    }

    onDestroy () {
        if (this.need_config) {
            let reword = this.need_config["reword"]
            let reward_list = this._utils.changeConfigData(reword)
            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_list)
        }
        this._dialog_manager.closeDialog(this._dialog_name.PickView)
        super.onDestroy && super.onDestroy();
    }

    // update (dt) {}
}
