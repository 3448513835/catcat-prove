/*
 * 新手界面
 */
import MyComponent from "../common/MyComponent"
import { GuideManager, IGuideConfig } from "../common/GuideManager"

const HAND_OFF = new cc.Vec2(100, -100);
const { ccclass, property } = cc._decorator;
@ccclass
export default class GuideDialog extends MyComponent {
    @property(cc.Node)
    private mask_node1: cc.Node = null;
    @property(cc.Node)
    private mask_node2: cc.Node = null;
    @property(cc.Node)
    private mask_node2_bg: cc.Node = null;
    @property(cc.Node)
    private cat_node: cc.Node = null;
    @property(cc.Node)
    private hand_node: cc.Node = null;
    @property([cc.SpriteFrame])
    private hand_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.RichText)
    private msg_label: cc.RichText = null;

    private data: any = null;

    onLoad () {
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_CLOSE_GUIDE_DIALOG, this.onCloseGuideDialog, this);
        this.mask_node1.setContentSize(cc.visibleRect.width, cc.visibleRect.height);
        this.mask_node2_bg.setContentSize(cc.visibleRect.width, cc.visibleRect.height);
        // this.cat_node.on(cc.Node.EventType.TOUCH_START, this.touchCat.bind(this));
        // this.cat_node.on(cc.Node.EventType.TOUCH_MOVE, this.touchCat.bind(this));
        // // @ts-ignore
        // this.cat_node._touchListener.setSwallowTouches(false);
    }

    private touchCat (event: cc.Event.EventTouch) {
        let pos = this.cat_node.position;
        let guide_item_node = this.data.guide_item_node;
        let guide_item_pos = guide_item_node.parent.convertToWorldSpaceAR(guide_item_node.position);
        guide_item_pos = this.node.convertToNodeSpaceAR(guide_item_pos);
        pos.x += event.getDeltaX();
        pos.y += event.getDeltaY();
        this.cat_node.y = pos.y;
        console.log("猫:", pos.y-guide_item_pos.y);
    }

    public setData (data) {
        this.data = data;
        let cfg: IGuideConfig = data.cfg;
        let guide_item_node = data.guide_item_node;
        let guide_id = data.guide_id;
        if (cfg.msg) {
            this.msg_label.string = cfg.msg;
            // this.cat_node.setPosition(0, cfg.cat.y);
            this.cat_node.active = true;
            let pos = guide_item_node.parent.convertToWorldSpaceAR(guide_item_node.position);
            pos = this.node.convertToNodeSpaceAR(pos);
            this.cat_node.y = pos.y+cfg.cat.y;
            let cat_node = cc.find("Cat", this.cat_node);
            let bg_node = cc.find("Bg", this.cat_node);
            let arrow_node = cc.find("Bg/Arrow", this.cat_node);
            if (pos.x < 0) {
                cat_node.x = -cat_node.x;
                cat_node.scaleX = -cat_node.scaleX;
                bg_node.x = -bg_node.x;
                arrow_node.x = -arrow_node.x;
                arrow_node.angle = -arrow_node.angle;
            }
            let line = Math.ceil(cfg.msg.length/17);
            // bg_node.height = this.msg_label.lineHeight*(line-1)+63+this.msg_label.node.y*2;
            this.scheduleOnce(() => {
                bg_node.height = this.msg_label.node.height+this.msg_label.node.y*2;
            }, 0);
            let cat_scale_x = cat_node.scaleX, big = 1.2;
            cat_node.scale = 0;
            cc.tween(cat_node)
                .to(0.15, { scaleY: 0.625*big, scaleX: cat_scale_x*big, })
                .to(0.10, { scaleY: 0.625, scaleX: cat_scale_x, })
                .start();
            bg_node.scaleY = 0;
            cc.tween(bg_node)
                .delay(0.15)
                .to(0.15, { scaleY: 1*big })
                .to(0.10, { scaleY: 1 })
                .start();
        }
        else {
            this.cat_node.active = false;
        }

        GuideManager.setGuideMask(false);
        if (cfg.type == 1) { // 全局
            this.mask_node1.active = true;
            this.mask_node2.active = false;
            this.hand_node.active = true;
            this._utils.addAnimationBySpriteFrames(this.hand_node, [this.hand_spriteframes[1], this.hand_spriteframes[2]], cc.WrapMode.Loop, 1);
        }
        else if (cfg.type == 2) { // 局部
            this.mask_node1.active = false;
            this.mask_node2.active = true;
            this.hand_node.active = true;

            let mask_node2_pos = guide_item_node.parent.convertToWorldSpaceAR(guide_item_node.position);
            mask_node2_pos = this.node.convertToNodeSpaceAR(mask_node2_pos);
            this.mask_node2.position = mask_node2_pos;
            this.mask_node2.setContentSize(guide_item_node.width, guide_item_node.height);
            this.mask_node2.skewX = guide_item_node.skewX;
            this.mask_node2.skewY = guide_item_node.skewY;

            this.mask_node2_bg.x = -this.mask_node2.x;
            this.mask_node2_bg.y = -this.mask_node2.y;
            this.mask_node2_bg.skewX = -this.mask_node2.skewX;
            this.mask_node2_bg.skewY = -this.mask_node2.skewY;

            // let mask_node2_bg_pos = guide_item_node.parent.convertToWorldSpaceAR(guide_item_node.position);
            // mask_node2_bg_pos = this.mask_node2_bg.convertToNodeSpaceAR(mask_node2_bg_pos);
            // this.mask_node2_bg.skewX = -this.mask_node2.skewX;
            // this.mask_node2_bg.skewY = -this.mask_node2.skewY;
            // this.mask_node2_bg.x = -mask_node2_bg_pos.x;
            // this.mask_node2_bg.y = -mask_node2_bg_pos.y;

            let speed = 1;
            if (this.data.guide_id == 14) {
                speed = 1/4;
            }
            this._utils.addAnimationBySpriteFrames(this.hand_node, [this.hand_spriteframes[1], this.hand_spriteframes[2]], cc.WrapMode.Loop, speed);
            this.hand_node.position = mask_node2_pos.add(new cc.Vec2(100, -100));
            if ([10, 12, 19].indexOf(guide_id) != -1) { // 倾斜
                this.hand_node.angle = 30;
                this.hand_node.y += 70;
                this.hand_node.x += 60;
            }
        }
        else if (cfg.type == 3) { // 滑动
            this.mask_node1.active = false;
            this.mask_node2.active = true;
            // this.mask_node2_bg.opacity = 0;
            this.hand_node.active = true;
            this.hand_node.getComponent(cc.Sprite).spriteFrame = this.hand_spriteframes[1];
            let start_node = cc.find("Start", guide_item_node);
            let end_node = cc.find("End", guide_item_node);
            let pos1 = guide_item_node.convertToWorldSpaceAR(start_node.position);
            pos1 = this.node.convertToNodeSpaceAR(pos1).add(new cc.Vec2(50, -80));
            let pos2 = guide_item_node.convertToWorldSpaceAR(end_node.position);
            pos2 = this.node.convertToNodeSpaceAR(pos2).add(new cc.Vec2(50, -80));
            this.hand_node.setPosition(pos1);
            cc.tween(this.hand_node).repeatForever(
                cc.tween()
                .to(0.5, { x: pos2.x, y: pos2.y })
                .to(0, { opacity: 0})
                .delay(1.3)
                .to(0, { x: pos1.x, y: pos1.y, opacity: 255 })
            ).start();

            let mask_node2_pos = guide_item_node.parent.convertToWorldSpaceAR(guide_item_node.position);
            mask_node2_pos = this.node.convertToNodeSpaceAR(mask_node2_pos);
            this.mask_node2.position = mask_node2_pos;
            this.mask_node2.setContentSize(guide_item_node.width, guide_item_node.height);
            this.mask_node2.skewX = guide_item_node.skewX;
            this.mask_node2.skewY = guide_item_node.skewY;

            if (!this._config.game_2d) {
                let mask_node2_bg_pos = guide_item_node.parent.convertToWorldSpaceAR(guide_item_node.position);
                mask_node2_bg_pos = this.mask_node2_bg.convertToNodeSpaceAR(mask_node2_bg_pos);
                this.mask_node2_bg.skewX = -this.mask_node2.skewX;
                this.mask_node2_bg.skewY = -this.mask_node2.skewY;
                this.mask_node2_bg.x = -mask_node2_bg_pos.x;
                this.mask_node2_bg.y = -mask_node2_bg_pos.y;
            }
            else {
                this.mask_node2_bg.skewX = -this.mask_node2.skewX;
                this.mask_node2_bg.skewY = -this.mask_node2.skewY;
                this.mask_node2_bg.x = -this.mask_node2.x;
                this.mask_node2_bg.y = -this.mask_node2.y;
            }
        }
        /* if (cfg.unrecord) {
            this.mask_node1.active = false;
            this.mask_node2.active = false;
        } */
    }

    private clickMask1 () {
        let cfg: IGuideConfig = GuideManager.GuideConfig[this.data.guide_id];
        GuideManager.setGuideId(cfg.next);
        GuideManager.setGuideMask(true);
        GuideManager.triggerGuide();
        this.node.destroy();
    }

    private onCloseGuideDialog (data) {
        if (data.guide_id == this.data.guide_id) {
            this.node.destroy();
        }
    }
}
