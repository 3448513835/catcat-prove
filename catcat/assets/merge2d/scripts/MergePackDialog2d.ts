/*
 * 背包
 */
import MyComponent from "../../Script/common/MyComponent"
import MyButton from "../../Script/common/MyButton"
import MergeData from "./MergeData2d"
import { PackCellData, CellData, PackData } from "./MergeDataInterface2d"

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergePackDialog2d extends MyComponent {
    @property(cc.Label)
    private own_label: cc.Label = null;
    @property(cc.ScrollView)
    private scroll_view: cc.ScrollView = null;
    @property(cc.Prefab)
    private merge_item_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    private merge_add_prefab: cc.Prefab = null;

    onLoad () {
        super.onLoad && super.onLoad();
        this.init();
    }

    private init () {
        let content = this.scroll_view.content;
        let pack_data = MergeData.instance.pack_data;
        let pack_list = pack_data.pack_list;
        for (let i = 0; i < pack_data.own; ++i) {
            let cell_data = pack_list[i];
            let node = cc.instantiate(this.merge_item_prefab);
            node.parent = content;
            if (cell_data) {
                let button = cc.find("Icon", node).getComponent(MyButton);
                let event_handler = new cc.Component.EventHandler();
                event_handler.component = "MergePackDialog2d";
                event_handler.target = this.node;
                event_handler.handler = "clickItem";
                event_handler.customEventData = i.toString();
                button.clickEvents.push(event_handler);
            }
            this.setItem(node, cell_data);
        }
        let node = cc.instantiate(this.merge_add_prefab);
        node.parent = content;
        let event_handler = new cc.Component.EventHandler();
        event_handler.component = "MergePackDialog2d";
        event_handler.target = this.node;
        event_handler.handler = "clickAddItem";
        cc.find("Button", node).getComponent(MyButton).clickEvents.push(event_handler);
        node.getComponent(MyButton).clickEvents.push(event_handler);
        this.setAddNode();
    }

    private refrush () {
        let content = this.scroll_view.content;
        let pack_list = MergeData.instance.pack_data.pack_list;
        for (let i = 0; i < content.children.length-1; ++i) {
            let cell_data = pack_list[i];
            let node = content.children[i];
            this.setItem(node, cell_data);
        }
    }

    private setAddNode () {
        let pack_data = MergeData.instance.pack_data;
        let content = this.scroll_view.content;
        let node = content.children[content.children.length-1];
        this.own_label.string = pack_data.pack_list.length+"/"+pack_data.own;
        let json_data = this._json_manager.getJsonData(this._json_name.COM_BAG, pack_data.own+1);
        let cost_id: any = null, cost_count: any = null;
        [cost_id, cost_count] = json_data.unlock_para.split(":");
        let icon = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_id).icon;
        let label = cc.find("Button/Count", node).getComponent(cc.Label);
        let sprite = cc.find("Button/Icon", node).getComponent(cc.Sprite);
        label.string = cost_count;
        label.scheduleOnce(() => {
            let width = label.node.width+sprite.node.width+5;
            sprite.node.x = -width/2+sprite.node.width/2;
            label.node.x = width/2-label.node.width/2;
        }, 0);
        this._resource_manager.getSpriteFrame(`pic/icon/${icon}`).then((sprite_frame) => {
            if (cc.isValid(sprite)) {
                this.addSpriteFrameRef(sprite_frame);
                sprite.spriteFrame = sprite_frame;
            }
        });
    }

    private clickItem (event: cc.Event.EventTouch, param) {
        let index = Number(param);
        let node = this.scroll_view.content.children[index];
        let tip_node = node.getChildByName("Tip");
        let pos = tip_node.convertToNodeSpaceAR(event.getLocation());
        let pack_cell_data = MergeData.instance.pack_data.pack_list[index];
        if (Math.abs(pos.x) < tip_node.width/2 && Math.abs(pos.y) < tip_node.height/2) {
            this._dialog_manager.openDialog(this._dialog_name.MergeElementDialog2d, {
                element_id: pack_cell_data.element,
            });
        }
        else {
            this._event_manager.dispatch(this._event_name.EVENT_MERGE_TMP_PACK, pack_cell_data);
            this.refrush();
        }
    }

    private clickAddItem () {
        let json_data = this._json_manager.getJsonData(this._json_name.COM_BAG, MergeData.instance.pack_data.own+1);
        let cost_id: any = null, cost_count: any = null;
        [cost_id, cost_count] = json_data.unlock_para.split(":");
        cost_id = Number(cost_id); cost_count = Number(cost_count);
        let own = this._utils.getMyNumByItemId(cost_id);
        if (own >= cost_count) {
            this._utils.addResNum(cost_id, -cost_count);
            this._event_manager.dispatch(this._event_name.EVENT_MERGE_ADD_PACK);
            let content = this.scroll_view.content;
            let node = content.children[content.children.length-1];
            node.parent = null;
            cc.instantiate(this.merge_item_prefab).parent = content;
            node.parent = content;
            this.setAddNode();
        }
        else {
            this._dialog_manager.openDialog(this._dialog_name.VideoView);
        }
    }

    private setItem (node: cc.Node, cell_data: PackCellData) {
        if (cell_data) {
            this._resource_manager.getSpriteFrame(`merge2d/ele/${cell_data.icon}`).then((sprite_frame) => {
                if (cc.isValid(node)) {
                    this.addSpriteFrameRef(sprite_frame);
                    let icon_node = cc.find("Icon", node);
                    icon_node.getComponent(cc.Sprite).spriteFrame = sprite_frame;
                    let off = sprite_frame.getOffset();
                    icon_node.x = -off.x/2;
                    icon_node.y = -off.y/2;
                    icon_node.active = true;
                    node.getChildByName("Tip").active = true;
                }
            });
        }
        else {
            node.getChildByName("Icon").active = false;
            node.getChildByName("Tip").active = false;
        }
    }

    onDestroy () {
        this._event_manager.dispatch(this._event_name.EVENT_MERGE_USE_PACK);
        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 303) {
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.triggerGuide();
        }
        super.onDestroy && super.onDestroy();
    }
}
