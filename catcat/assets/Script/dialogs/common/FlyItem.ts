import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class FlyItem extends MyComponent {

    @property(cc.Node)
    template_item: cc.Node = null

    private createcoin: number = 6

    /**
     * 随机范围(random1~random2之间)
     */
    private random1: number = -100
    private random2: number = 100

    /**
     * 生成到赋予位置的时间
     */
    private createTime: number = 0.15

    /**
     * 停留时间
     */
    private standingTime: number = 0.1

    /**
     * 移动速度
     */
    private coinSpeed: number = 1500

    init(data, endPos: cc.Vec3, callback: Function = null) {
        let item_id = data["item_id"]
        let item_num = data["item_num"]
        this.standingTime = data["standingTime"] || this.standingTime
        // let json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, item_id)
        endPos = this.node.convertToNodeSpaceAR(endPos)
        for (let i = 0; i < this.createcoin; i++) {
            let node = cc.instantiate(this.template_item)
            node.parent = this.node
            node.active = true
            let icon = node.getComponent(cc.Sprite)
            // this._utils.setSpriteFrame(icon, `pic/icon/${json["icon"]}`)

            let path = this._utils.getItemPathById(item_id)
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(icon)) {
                    icon.spriteFrame = sprite_frame
                    let item_type = this._utils.getItemTypeById(item_id)
                    if (item_type == 1) icon.node.scale = 0.5
                }
            })

            let rannumx = Math.floor(Math.random() * (this.random2 - this.random1 + 1) + this.random1)
            let rannumy = Math.floor(Math.random() * (this.random2 - this.random1 + 1) / 1.5 + this.random1 / 1.5)
            node.runAction(cc.moveBy(this.createTime, rannumx, rannumy))
            this.scheduleOnce(() => {
                node.stopAllActions()

                let pos = node.getPosition()
                let playTime = pos.sub(cc.v2(endPos)).mag() / this.coinSpeed

                let dir = pos.sub(cc.v2(endPos)).normalize()
                // 方向取反计算x的位置
                let x = -dir.x > 0 ? 200 : -200
                cc.tween(node)
                    .sequence(
                        cc.tween().bezierTo(playTime, cc.v2(x + pos.x, pos.y), cc.v2(x + endPos.x, endPos.y), cc.v2(endPos.x, endPos.y)),
                        cc.tween().call(() => {
                            node.destroy()
                            if (i == this.createcoin - 1) {
                                //结束
                                if (!data["isNotAdd"]) {
                                    this._utils.addResNum(item_id, Number(item_num))
                                }
                                
                                this.scheduleOnce(() => {
                                    if (callback) callback()
                                    this.node.destroy()
                                }, 0.5)
                            }
                        })
                    ).start()
            }, this.standingTime + this.createTime + i * 0.05)

        }

        this._audio_manager.playEffect(this._audio_name.GET_ITEM)
    }
}
