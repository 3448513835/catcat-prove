import MyComponent from "../common/MyComponent";
import MapGridView from "../main/MapGridView";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SaoGuang extends MyComponent {

    @property(cc.Mask)
    mask: cc.Mask = null

    @property(cc.Node)
    sp: cc.Node = null

    // onLoad () {}

    start() {

    }

    public setSaoGuang(node: cc.Node, parent: cc.Node = null, reward_list: any[] = [], callBack?: Function, facId?: number) {
        let sp_com = node.getComponent(cc.Sprite)
        if (cc.isValid(sp_com)) {
            if (cc.isValid(parent)) {
                parent.addChild(this.node)
                let pos_w = node.parent.convertToWorldSpaceAR(cc.v2(node.position))
                let pos_n = parent.convertToNodeSpaceAR(pos_w)
                this.node.x = pos_n.x
                this.node.y = pos_n.y
            } else {
                node.addChild(this.node)
            }
            // cc.error(this.node.x, this.node.y, "kkkkkkkkkkkk")
            this.mask.spriteFrame = sp_com.spriteFrame
            // this.sp.width = node.width
            this.sp.height = node.height
            this.node.width = node.width
            this.node.height = node.height

            // cc.error(this.node.width, this.node.height, this.sp.width, this.sp.height, "dddddddddddddddd")
            let frame_width = sp_com.spriteFrame.getRect().width
            // let start_x = this.node.x - frame_width / 2 - 100
            // let end_x = this.node.x + frame_width / 2 + 100
            let start_x = -frame_width / 2 - 100
            let end_x = frame_width / 2 + 100
            this.sp.x = start_x
            let time = 1

            this._audio_manager.playEffect(this._audio_name.FAC_UNLOCK)
            cc.tween(this.sp)
                .to(time, { x: end_x })
                .call(() => {
                    // let isHaveCus: boolean = false
                    for (let i = 0; i < reward_list.length; i++) {
                        const item_data = reward_list[i]
                        let pos_w = node.parent.convertToWorldSpaceAR(cc.v2(node.position))
                        let data = {
                            pos_w: pos_w,
                            item_id: item_data["item_id"],
                            item_num: item_data["item_num"],
                            isNotAdd: true,
                        }
                        this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)

                        // let item_id = Number(item_data["item_id"])
                        // let item_type = this._utils.getItemTypeById(item_id)
                        // if (item_type == 2) {
                        //     let item_config = this._json_manager.getJsonData(this._json_name.ITEM_BASE, item_id)
                        //     let use_type = item_config["use_type"]
                        //     if (use_type == 1002) {
                        //         isHaveCus = true
                        //     }
                        // }
                    }
                    
                    if (callBack) callBack()

                    this.node.destroy()
                })
                // .removeSelf()
                .start()
        }
    }

    // update (dt) {}
}
