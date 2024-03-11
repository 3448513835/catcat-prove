/*
 * 暂存
 */
import MyComponent from "../../Script/common/MyComponent"
import MyButton from "../../Script/common/MyButton"
import { BubbleData } from "./MergeDataInterface2d"

const ITEM_HEIGHT = 160;
const EDG_HEIGHT = 5;

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeStage extends MyComponent {
    @property(cc.ScrollView)
    private my_scrollview: cc.ScrollView = null;
    @property(cc.Prefab)
    private stage_item_prefab: cc.Prefab = null;
    @property(cc.Node)
    private order_node: cc.Node = null;
    @property(cc.Node)
    private down_node: cc.Node = null;
    @property(cc.Label)
    private tip_count_label: cc.Label = null;

    private bubble_list = null;
    private is_open: boolean = false;

    onLoad () {
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_CLICK_SCREEN, this.onClickScreen, this);
    }

    public refrushBubble (bubble_list: BubbleData[]) {
        this.bubble_list = bubble_list;
        let scroll_view_node = cc.find("Scrollview", this.order_node);
        let pre_scale = this.node.scale;
        if (bubble_list.length == 0) {
            this.node.scale = 0;
            this.order_node.setPosition(-295, 728);
            if (cc.isValid(scroll_view_node)) {
                scroll_view_node.width = cc.visibleRect.width/2-this.order_node.x-scroll_view_node.x;
                scroll_view_node.getChildByName("view").width = scroll_view_node.width;
            }
        }
        else {
            this.node.scale = 1;
            this.order_node.setPosition(-110, 728);
            if (cc.isValid(scroll_view_node)) {
                scroll_view_node.width = cc.visibleRect.width/2-this.order_node.x-scroll_view_node.x;
                scroll_view_node.getChildByName("view").width = scroll_view_node.width;
            }
            this.tip_count_label.string = bubble_list.length.toString();
            for (let i = 0; i < bubble_list.length; ++i) {
                bubble_list[i].node = this.setItem(bubble_list[i].id, i);
            }
            if (this.is_open) {
                this.setOpen();
            }
            else {
                this.setClose();
            }
        }
        if (pre_scale != this.node.scale) {
            this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, {
                show: false,
                level: this._guide_manager.HandConfig.MERGE_ORDER,
            });
        }
    }

    private setOpen () {
        this.is_open = true;
        let length = this.bubble_list.length;
        if (length > 4) { length = 4; }
        this.my_scrollview.node.height = ITEM_HEIGHT*length+2*EDG_HEIGHT;
        this.my_scrollview.enabled = true;
        this.my_scrollview.content.y = 0;
        let view_node = this.my_scrollview.node.getChildByName("view");
        view_node.height = ITEM_HEIGHT*length;
        view_node.y = -EDG_HEIGHT;
        this.down_node.y = 15-this.my_scrollview.node.height;
        this.down_node.scaleY = -1;
        let node = this.my_scrollview.content.children[0];
        if (cc.isValid(node)) {
            let icon_node = cc.find("Icon", node);
            icon_node.stopAllActions();
            icon_node.scale = 1;
            icon_node.setPosition(0, 0);
        }
    }

    private setClose () {
        this.is_open = false;
        this.my_scrollview.node.height = ITEM_HEIGHT+2*EDG_HEIGHT;
        this.my_scrollview.enabled = false;
        this.my_scrollview.content.y = 0;
        let view_node = this.my_scrollview.node.getChildByName("view");
        view_node.height = ITEM_HEIGHT;
        this.down_node.y = 15-this.my_scrollview.node.height;
        this.down_node.scaleY = 1;
        let node = this.my_scrollview.content.children[0];
        if (cc.isValid(node)) {
            let icon_node = cc.find("Icon", node);
            icon_node.stopAllActions();
            icon_node.scale = 1;
            icon_node.setPosition(0, 0);
            this.playJumpAnimal(icon_node);
        }
    }

    private setItem (ele_id: number, index: number): cc.Node {
        let node = this.my_scrollview.content.children[index];
        if (!cc.isValid(node)) {
            node = cc.instantiate(this.stage_item_prefab);
            node.parent = this.my_scrollview.content;
            node.setPosition(0, (-0.5-index)*node.height);
        }
        let my_button = node.getComponent(MyButton);
        if (my_button.clickEvents.length == 0) {
            let event_handle = new cc.Component.EventHandler();
            event_handle.target = this.node;
            event_handle.component = "MergeStage";
            event_handle.handler = "clickItem";
            my_button.clickEvents.push(event_handle);
        }
        else {
            // my_button.clickEvents[0].customEventData = index.toString();
        }
        let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, ele_id);
        this._resource_manager.getSpriteFrame(`merge2d/ele/${json_data.icon}`).then((sprite_frame) => {
            if (cc.isValid(node)) {
                this.addSpriteFrameRef(sprite_frame);
                let sprite_node = cc.find("Icon", node);
                sprite_node.getComponent(cc.Sprite).spriteFrame = sprite_frame;
                let pos = sprite_frame.getOffset();
                sprite_node.x = -pos.x/2;
                sprite_node.y = -pos.y/2;
            }
        });
        return node;
    }

    private clickItem (event: cc.Event.EventTouch) {
        if (!this._guide_manager.getGuideFinish()) {
            let guide_id = this._guide_manager.getGuideId();
            if (guide_id == 112) {
                this._guide_manager.setGuideMask(true);
                this._guide_manager.closeGuideDialog(guide_id);
                this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
                this._guide_manager.triggerGuide();
            }
        }
        if (!this.is_open && this.bubble_list.length > 1) {
            this.setOpen();
            return;
        }
        let node = event.currentTarget;
        for (let i = 0; i < this.bubble_list.length; ++i) {
            let item = this.bubble_list[i];
            if (item.node == node) {
                this._event_manager.dispatch(this._event_name.EVENT_MERGE_SHOP_USE, item);
                break;
            }
        }
    }

    private onClickScreen (data) {
        if (this.is_open) {
            let event: cc.Event.EventTouch = data.event;
            let pos = this.node.convertToNodeSpaceAR(event.getLocation());
            if (Math.abs(pos.x) > this.node.width/2 || pos.y > 0 || pos.y < -this.node.height) {
                this.is_open = false;
                // this.refrushBubble(this.bubble_list);
                this.setClose();
            }
        }
    }

    private playJumpAnimal (node: cc.Node) {
        let o_y = node.y;
        cc.tween(node).repeatForever(
            cc.tween()
                .to(15/60, { scaleX: 1.05, scaleY: 0.95, y: o_y })
                .to(15/60, { scaleX: 0.95, scaleY: 1.05, y: o_y+10 })
                .to(15/60, { scaleX: 0.95, scaleY: 1.05, y: o_y })
                .to(13/60, { scaleX: 1.05, scaleY: 0.95, y: o_y })
                .to(12/60, { scaleX: 0.98, scaleY: 1.02, y: o_y })
                .to(10/60, { scaleX: 1.0, scaleY: 1.0, y: o_y })
                .delay(10/60)
                .to(15/60, { scaleX: 1.25, scaleY: 1.25 })
                .to(15/60, { scaleX: 1.0, scaleY: 1.0 })
                .to(15/60, { scaleX: 1.25, scaleY: 1.25 })
                .to(15/60, { scaleX: 1.0, scaleY: 1.0 })
                .delay(20/60)
        ).start();
    }
}
