/*
 * 扫光
 */
const {ccclass, property} = cc._decorator;
@ccclass
export default class Light extends cc.Component {
    @property(cc.Mask)
    sprite_mask: cc.Mask = null;
    @property(cc.Node)
    light_node: cc.Node = null;

    /**
     * param node 包含一个sprite
     */
    setOriginNode (node: cc.Node) {
        let sprite: cc.Sprite = node.getComponent(cc.Sprite);
        if (cc.isValid(sprite)) {
            this.node.parent = node;
            this.node.setAnchorPoint(node.getAnchorPoint());
            this.node.setContentSize(node.width, node.height);
            this.sprite_mask.spriteFrame = sprite.spriteFrame;
            this.light_node.height = node.height+node.width;
            this.light_node.width = this.node.width/2;
            let start_pos = new cc.Vec2(
                -this.node.width*2.0,
                -this.node.height*0.5
            );
            let end_pos = new cc.Vec2(
                this.node.width*2.0,
                -this.node.height*0.5
            );
            this.light_node.setPosition(start_pos);
            let tm = 1.5; // node.width/800;
            cc.tween(this.light_node)
                .to(tm, { x: end_pos.x, y: end_pos.y })
                .to(0, { x: start_pos.x, y: start_pos.y, opacity: 0 })
                .delay(0.5)
                .to(0, { opacity: 255 })
                .to(tm, { x: end_pos.x, y: end_pos.y })
                .to(0, { x: start_pos.x, y: start_pos.y })
                .removeSelf()
                .start();
        }
    }
}
