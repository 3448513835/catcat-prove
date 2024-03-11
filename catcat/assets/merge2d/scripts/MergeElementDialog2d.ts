/*
 * 元素详情
 */
import MyComponent from "../../Script/common/MyComponent"
import MyButton from "../../Script/common/MyButton"
import { MergeData, MapData } from "./MergeData2d"
import { SpecialElementTypes } from "./MergeDataInterface2d"


const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeElementDialog2d extends MyComponent {
    @property(cc.Label)
    private title_label: cc.Label = null;
    @property(cc.Node)
    private element_layout: cc.Node = null;
    @property(cc.Node)
    private from_layout: cc.Node = null;
    @property(cc.Node)
    private element_tip_node: cc.Node = null;
    @property(cc.Node)
    private from_tip_node: cc.Node = null;
    @property([cc.SpriteFrame])
    private item_bg_spriteframs: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame)
    private unlock_spriteframe: cc.SpriteFrame = null;

    private element_id: number = null;
    private map_data: MapData = null;
    private group_element_list = [];

    onLoad () {
        super.onLoad && super.onLoad();
        this.element_id = this.getDialogData().element_id;
        // this.map_data = this.getDialogData().map_data;
        this.map_data = MergeData.instance.map_data;
        let group = this._json_manager.getJsonData(this._json_name.ELE_2D, this.element_id).group;
        let ele_json = this._json_manager.getJson(this._json_name.ELE_2D);
        for (let key in ele_json) {
            let value = ele_json[key];
            if (value.group == group) {
                this.group_element_list.push(value);
            }
        }
        this.group_element_list.sort((a, b) => {
            return a.id-b.id;
        });
        this.setElementLayout();
        this.setFromLayout();
        this.listen(this._event_name.EVENT_CLICK_SCREEN, this.onClickScreen, this);
    }

    private setElementLayout () {
        for (let i = 0; i < this.group_element_list.length; ++i) {
            let ele_json = this.group_element_list[i];
            let node = this.element_layout.children[i];
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.element_layout.children[0]);
                node.parent = this.element_layout;
            }
            node.active = true;
            let sprite = cc.find("Icon", node).getComponent(cc.Sprite);
            let index = this.map_data.element_record.indexOf(ele_json.id);
            if (ele_json.id == this.element_id || index != -1) { 
                if (ele_json.is_use != 0) {
                    cc.find("Use", node).active = true;
                }
                this._resource_manager.getSpriteFrame(`merge2d/ele/${ele_json.icon}`).then((sprite_frame) => {
                    if (cc.isValid(sprite)) {
                        this.addSpriteFrameRef(sprite_frame);
                        sprite.spriteFrame = sprite_frame;
                        sprite.node.scale = 0.5;
                    }
                });
                let button = node.getComponent(MyButton);
                if (!button) {
                    button = node.addComponent(MyButton);
                    let handler = new cc.Component.EventHandler();
                    handler.component = "MergeElementDialog2d";
                    handler.target = this.node;
                    handler.handler = "clickElement";
                    button.clickEvents.push(handler);
                }
            }
            else {
                node.removeComponent(MyButton);
                sprite.spriteFrame = this.unlock_spriteframe;
                sprite.node.scale = 1;
            }
            cc.find("Level", node).getComponent(cc.Label).string = ele_json.item_level;
            node.getComponent(cc.Sprite).spriteFrame = this.item_bg_spriteframs[(ele_json.id == this.element_id)? 1:0];
        }
        for (let i = this.group_element_list.length; i < this.element_layout.children.length; ++i) {
            let node = this.element_layout.children[i];
            node.active = false;
        }
    }

    private setFromLayout () {
        let json_data = this._json_manager.getJsonData(this._json_name.ELE_2D, this.element_id);
        this.title_label.string = json_data.groupname;
        let output_way = [];
        if (json_data.output_way) { output_way = json_data.output_way.split(","); }
        for (let i = 0; i < output_way.length; ++i) {
            let node = this.from_layout.children[i];
            if (!cc.isValid(node)) {
                node = cc.instantiate(this.from_layout.children[0]);
                node.parent = this.from_layout;
            }
            node.active = true;
            let out_json = this._json_manager.getJsonData(this._json_name.ELE_2D, output_way[i]);
            let sprite = cc.find("Icon", node).getComponent(cc.Sprite);
            if (true || this.map_data.element_record.indexOf(out_json.id) != -1) {
                let button = node.getComponent(MyButton);
                if (!button) {
                    button = node.addComponent(MyButton);
                    let handler = new cc.Component.EventHandler();
                    handler.component = "MergeElementDialog2d";
                    handler.target = this.node;
                    handler.handler = "clickFromItem";
                    button.clickEvents.push(handler);
                }
                this._resource_manager.getSpriteFrame(`merge2d/ele/${out_json.icon}`).then((sprite_frame) => {
                    if (cc.isValid(sprite)) {
                        this.addSpriteFrameRef(sprite_frame);
                        sprite.spriteFrame = sprite_frame;
                        sprite.node.scale = 0.5;
                    }
                });
            }
            else {
                sprite.spriteFrame = this.unlock_spriteframe;
                sprite.node.scale = 1;
            }
        }
        for (let i = output_way.length; i < this.from_layout.children.length; ++i) {
            let node = this.from_layout.children[i];
            node.active = false;
        }
    }

    private clickElement (event: cc.Event.EventTouch) {
        let index = this.element_layout.children.indexOf(event.target);
        let ele_json = this.group_element_list[index];
        this.element_id = ele_json.id;
        this.setElementLayout();
        this.setFromLayout();
        if (ele_json.is_use && ele_json.use_value && SpecialElementTypes.indexOf(ele_json.type) == -1) {
            this.element_tip_node.active = false;
            this.from_tip_node.active = true;
            let output_way = ele_json.output_way.split(",");
            let from_ele_json = this._json_manager.getJsonData(this._json_name.ELE_2D, output_way[index]);
            let sprite = cc.find("Item/Icon", this.from_tip_node).getComponent(cc.Sprite);
            this._resource_manager.getSpriteFrame(`merge2d/ele/${ele_json.icon}`).then((sprite_frame) => {
                if (cc.isValid(sprite)) {
                    this.addSpriteFrameRef(sprite_frame);
                    sprite.spriteFrame = sprite_frame;
                }
            });
            cc.find("Name", this.from_tip_node).getComponent(cc.Label).string = 
                `${ele_json.name} ${ele_json.item_level}级`;
            cc.find("Desc", this.from_tip_node).getComponent(cc.Label).string = ele_json.description;
            let drop_id = ele_json.use_value;
            let drop_json = this._json_manager.getJsonData(this._json_name.DROP, drop_id);
            let layout = cc.find("From/Layout", this.from_tip_node);
            let reward_ele_list = drop_json.reward_ele.split(",");
            for (let i = 0; i < reward_ele_list.length; ++i) {
                let [id, _] = reward_ele_list[i].split(":");
                let node = layout.children[i];
                let data = reward_ele_list[i];
                if (!node) {
                    node = cc.instantiate(layout.children[0]);
                    node.parent = layout;
                }
                node.active = true;
                let sprite = cc.find("Icon", node).getComponent(cc.Sprite);
                let icon = this._json_manager.getJsonData(this._json_name.ELE_2D, id).icon;
                this._resource_manager.getSpriteFrame(`merge2d/ele/${icon}`).then((sprite_frame) => {
                    if (cc.isValid(sprite)) {
                        this.addSpriteFrameRef(sprite_frame);
                        sprite.spriteFrame = sprite_frame;
                    }
                });
            }
            if (reward_ele_list.length > 4) {
                layout.getComponent(cc.Layout).type = cc.Layout.Type.GRID;
            }
            else {
                layout.getComponent(cc.Layout).type = cc.Layout.Type.HORIZONTAL;
            }
            for (let i = reward_ele_list.length; i < layout.children.length; ++i) {
                layout.children[i].active = false;
            }
            let w_pos = this.element_layout.convertToWorldSpaceAR(event.target.position);
            let line = Math.floor((reward_ele_list.length-1)/4);
            layout.parent.height = 235+line*170;
            this.from_tip_node.height = 530+line*170;
            let tip_pos = this.node.convertToNodeSpaceAR(w_pos);
            this.from_tip_node.y = tip_pos.y+123.5-221;
            let arrow_node = cc.find("Arrow", this.from_tip_node);
            arrow_node.y = -5; arrow_node.angle = 180;
            let arrow_pos = arrow_node.parent.convertToNodeSpaceAR(w_pos);
            arrow_node.x = arrow_pos.x;
        }
        else {
            this.element_tip_node.active = true;
            this.from_tip_node.active = false;
            let sprite = cc.find("Item/Icon", this.element_tip_node).getComponent(cc.Sprite);
            this._resource_manager.getSpriteFrame(`merge2d/ele/${ele_json.icon}`).then((sprite_frame) => {
                if (cc.isValid(sprite)) {
                    this.addSpriteFrameRef(sprite_frame);
                    sprite.spriteFrame = sprite_frame;
                    sprite.node.scale = 0.5;
                }
            });
            cc.find("Name", this.element_tip_node).getComponent(cc.Label).string = 
                `${ele_json.name} ${ele_json.item_level}级`;
            cc.find("Desc", this.element_tip_node).getComponent(cc.Label).string = ele_json.description;
            let w_pos = this.element_layout.convertToWorldSpaceAR(event.target.position);
            let arrow_pos = this.element_tip_node.convertToNodeSpaceAR(w_pos);
            cc.find("Arrow", this.element_tip_node).x = arrow_pos.x;
            let tip_pos = this.node.convertToNodeSpaceAR(w_pos);
            this.element_tip_node.y = tip_pos.y-221;
        }
    }

    private clickFromItem (event: cc.Event.EventTouch, param) {
        this.element_tip_node.active = false;
        this.from_tip_node.active = true;
        let index = this.from_layout.children.indexOf(event.target);
        let ele_json = this._json_manager.getJsonData(this._json_name.ELE_2D, this.element_id);
        let output_way = ele_json.output_way.split(",");
        var _dialog_manager = this._dialog_manager;
        _dialog_manager.closeDialog(this._dialog_name.MergeElementDialog2d);
        var ele_id = output_way[index];
        _dialog_manager.openDialog(this._dialog_name.MergeElementDialog2d, {
            element_id: ele_id,
        });

        // let from_ele_json = this._json_manager.getJsonData(this._json_name.ELE_2D, output_way[index]);
        // let sprite = cc.find("Item/Icon", this.from_tip_node).getComponent(cc.Sprite);
        // this._resource_manager.getSpriteFrame(`merge2d/ele/${from_ele_json.icon}`).then((sprite_frame) => {
        //     if (cc.isValid(sprite)) {
        //         sprite.spriteFrame = sprite_frame;
        //     }
        // });
        // cc.find("Name", this.from_tip_node).getComponent(cc.Label).string = 
        //     `${from_ele_json.name} ${from_ele_json.item_level}级`;
        // cc.find("Desc", this.from_tip_node).getComponent(cc.Label).string = from_ele_json.description;
        // let drop_id = this._json_manager.getJsonData(this._json_name.ELE_2D, ele_json.output_way.split(",")[index]).use_value;
        // let drop_json = this._json_manager.getJsonData(this._json_name.DROP, drop_id);
        // let layout = cc.find("From/Layout", this.from_tip_node);
        // let reward_ele_list = drop_json.reward_ele.split(",");
        // for (let i = 0; i < reward_ele_list.length; ++i) {
        //     let [id, _] = reward_ele_list[i].split(":");
        //     let node = layout.children[i];
        //     let data = reward_ele_list[i];
        //     if (!node) {
        //         node = cc.instantiate(layout.children[0]);
        //         node.parent = layout;
        //     }
        //     node.active = true;
        //     let sprite = cc.find("Icon", node).getComponent(cc.Sprite);
        //     let icon = this._json_manager.getJsonData(this._json_name.ELE_2D, id).icon;
        //     this._resource_manager.getSpriteFrame(`merge2d/ele/${icon}`).then((sprite_frame) => {
        //         if (cc.isValid(sprite)) {
        //             sprite.spriteFrame = sprite_frame;
        //         }
        //     });
        // }
        // if (reward_ele_list.length > 4) {
        //     layout.getComponent(cc.Layout).type = cc.Layout.Type.GRID;
        // }
        // else {
        //     layout.getComponent(cc.Layout).type = cc.Layout.Type.HORIZONTAL;
        // }
        // for (let i = reward_ele_list.length; i < layout.children.length; ++i) {
        //     layout.children[i].active = false;
        // }
        // let line = Math.floor((reward_ele_list.length-1)/4);
        // layout.parent.height = 235+line*170;
        // this.from_tip_node.height = 530+line*170;
        // this.from_tip_node.y = 200+line*170;
        // let arrow_node = cc.find("Arrow", this.from_tip_node);
        // arrow_node.y = -this.from_tip_node.height+5;
        // arrow_node.angle = 0;
        // let pos = event.target.parent.convertToWorldSpaceAR(event.target.position);
        // pos = arrow_node.parent.convertToNodeSpaceAR(pos);
        // arrow_node.x = pos.x;
    }

    private onClickScreen (data) {
        let event: cc.Event.EventTouch = data.event;
        let pos = event.getLocation();
        if (this.element_tip_node.active) {
            let n_pos = this.element_tip_node.convertToNodeSpaceAR(pos);
            if (Math.abs(n_pos.x) > this.element_tip_node.width/2 || Math.abs(n_pos.y) > this.element_tip_node.height/2) {
                this.element_tip_node.active = false;
            }
        }
        if (this.from_tip_node.active) {
            let n_pos = this.from_tip_node.convertToNodeSpaceAR(pos);
            if (Math.abs(n_pos.x) > this.from_tip_node.width/2 || n_pos.y > 0 || n_pos.y < -this.from_tip_node.height) {
                this.from_tip_node.active = false;
            }
        }
    }
}
