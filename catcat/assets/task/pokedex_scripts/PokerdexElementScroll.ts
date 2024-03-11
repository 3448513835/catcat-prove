/*
 * 图鉴
 */
import MyComponent from "../../Script/common/MyComponent";
import MyButton from "../../Script/common/MyButton";


const {ccclass, property} = cc._decorator;
@ccclass
export default class PokedexElementScroll extends MyComponent {
    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.Prefab)
    private element_prefab: cc.Prefab = null;
    @property(cc.SpriteFrame)
    private unknow_spriteframe: cc.SpriteFrame = null;
    @property([cc.SpriteFrame])
    private item_bg_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Node)
    private element_tip_node: cc.Node = null;

    private group_list = {};

    onLoad () {
        super.onLoad && super.onLoad();
        this.listen(this._event_name.EVENT_CLICK_SCREEN, this.onClickScreen, this);
        this.genGroupList();
        this.scheduleOnce(() => { this.init(); }, 0.1);
    }

    private genGroupList () {
        let json = this._json_manager.getJson(this._config.game_2d? this._json_name.HANDBOOK_2D:this._json_name.HANDBOOK);
        for (let key in json) {
            let value = json[key];
            if (value.handbook_type == 1) {
                if (!this.group_list[value.group]) {
                    this.group_list[value.group] = [value];
                }
                else {
                    this.group_list[value.group].push(value);
                }
            }
        }
        for (let key in this.group_list) {
            let list = this.group_list[key];
            list.sort((a, b) => { return a.ele_id-b.ele_id; });
        }
    }

    private init () {
        let key_list = Object.keys(this.group_list);
        let unlock_list = [];
        // let local_data = cc.sys.localStorage.getItem(this._config.game_2d? "MERGE_DATA2":"MERGE_DATA");
        let local_data = this._user.getItem(this._config.game_2d? "MERGE_DATA2":"MERGE_DATA");
        if (local_data) {
            local_data = JSON.parse(local_data);
            unlock_list = local_data.map_data.element_record;
        }
        let reward_list = this._user.getElementRewwardList();
        let scroll_to_reward = false, index = 0, key_len = key_list.length;
        let spacing_y = 20, content_height = 0, jump_y = 0;

        for (let i = 0; i < key_len; ++i) {
            let list = this.group_list[key_list[i]];
            content_height += this.getPrefabHeight(list.length);
            if (i > 0) { content_height += spacing_y; }
            if (!scroll_to_reward) {
                for (let key in list) {
                    if (reward_list.indexOf(list[key].ele_id) != -1) {
                        scroll_to_reward = true;
                        break;
                    }
                }
                if (scroll_to_reward) {
                    jump_y = content_height - this.getPrefabHeight(list.length);
                    if (i > 0) { jump_y -= spacing_y; }
                }
            }
        }
        this.content.height = content_height;
        if (content_height-jump_y < this.content.parent.height) {
            jump_y = content_height-this.content.parent.height;
        }
        this.content.y = jump_y;
        let item_pos_y = 0;
        let v_top = -this.content.y+400;
        let v_bottom = -this.content.y-this.content.parent.height-400;
        this.schedule(() => {
        // while (index < key_len) {
            let key = key_list[index];
            let list = this.group_list[key];
            let element_node_panel = cc.instantiate(this.element_prefab);
            element_node_panel.parent = this.content;
            let height = this.getPrefabHeight(list.length);
            element_node_panel.setPosition(0, item_pos_y);
            if (item_pos_y-height <= v_top && item_pos_y >= v_bottom) {
                element_node_panel.active = true;
            }
            else {
                element_node_panel.active = false;
            }
            item_pos_y -= spacing_y + height;
            this.setElementPanel(element_node_panel, list, unlock_list, reward_list);
            ++ index;
        // }
        }, 0, key_len-1);
        this.content.on(cc.Node.EventType.POSITION_CHANGED, this.onScroll, this);
    }

    private setElementPanel (panel: cc.Node, data, unlock_list, reward_list) {
        let layout = cc.find("Layout", panel);
        let item = cc.find("Item", panel);
        cc.find("Bg", panel).height = this.getPrefabHeight(data.length);
        for (let i = 0; i < data.length; ++i) {
            let node = cc.instantiate(item);
            node.parent = layout;
            let element = data[i].ele_id;
            let ele_json = this._json_manager.getJsonData(this._config.game_2d? this._json_name.ELE_2D:this._json_name.ELE, element);
            cc.find("Level", node).getComponent(cc.Label).string = ele_json.item_level;
            cc.find("Label", panel).getComponent(cc.Label).string = ele_json.groupname;
            let icon_id = data[i].unlock_reward.split(":")[0];
            let icon = this._json_manager.getJsonData(this._json_name.ITEM_BASE, icon_id).icon;
            this.setItem(node, element, unlock_list, reward_list, ele_json, `pic/icon/${icon}`);
        }
    }

    private setItem (node, element, unlock_list, reward_list, ele_json, icon) {
            let icon_sprite = cc.find("Icon", node).getComponent(cc.Sprite);
            if (unlock_list.indexOf(element) != -1) {
                let icon_url = this._config.game_2d? `merge2d/ele/${ele_json.icon}`:`merge/ele/${ele_json.icon}`;
                this._resource_manager.getSpriteFrame(icon_url).then((sprite_frame) => {
                    if (cc.isValid(icon_sprite)) {
                        icon_sprite.trim = false;
                        icon_sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                        icon_sprite.node.setContentSize(250, 250);
                        icon_sprite.spriteFrame = sprite_frame;
                        let pos = sprite_frame.getOffset();
                        icon_sprite.node.setPosition(-pos.x/2, -pos.y/2);
                    }
                });
                let button = icon_sprite.node.addComponent(MyButton);
                button.transition = cc.Button.Transition.SCALE;
                let event_handler = new cc.Component.EventHandler();
                event_handler.component = "PokerdexElementScroll";
                event_handler.handler = "clickItem";
                event_handler.target = this.node;
                event_handler.customEventData = element;
                button.clickEvents.push(event_handler);
                if (reward_list.indexOf(element) != -1) {
                    node.getComponent(cc.Sprite).spriteFrame = this.item_bg_spriteframes[1];
                    let btn = cc.find("Btn", node);
                    btn.active = true;
                    let event_handler = new cc.Component.EventHandler();
                    event_handler.component = "PokerdexElementScroll";
                    event_handler.handler = "clickButton";
                    event_handler.target = this.node;
                    event_handler.customEventData = element;
                    btn.getComponent(MyButton).clickEvents.push(event_handler);
                    btn.stopAllActions();
                    cc.tween(btn.getChildByName("Btn")) .repeatForever(
                        cc.tween().to(0.5, { scale: 0.95 }).to(0.5, { scale: 1 })
                    ).start();
                    this._resource_manager.getSpriteFrame(icon).then((sprite_frame) => {
                        if (cc.isValid(btn)) {
                            btn.getChildByName("Icon").getComponent(cc.Sprite).spriteFrame = sprite_frame;
                        }
                    });
                }
            }
            else {
                node.removeComponent(MyButton);
            }
    }

    private clickItem (event: cc.Event.EventTouch, param) {
        let element_id = Number(param);
        let node = event.target.parent;
        if (cc.find("Btn", node).active) {
            this.clickButton(event, param);
            event.target.active = true;
            cc.find("Btn", node).active = false;
        }
        else {
            this.element_tip_node.active = true;
            let ele_json = this._json_manager.getJsonData(this._config.game_2d? this._json_name.ELE_2D:this._json_name.ELE, element_id);
            cc.find("Item/Icon", this.element_tip_node).getComponent(cc.Sprite).spriteFrame =
                cc.find("Icon", node).getComponent(cc.Sprite).spriteFrame;
            cc.find("Name", this.element_tip_node).getComponent(cc.Label).string = 
                `${ele_json.name} ${ele_json.item_level}级`;
            cc.find("Desc", this.element_tip_node).getComponent(cc.Label).string = ele_json.description;
            let pos = node.parent.convertToWorldSpaceAR(node.getPosition());
            pos = this.element_tip_node.parent.convertToNodeSpaceAR(pos);
            cc.find("Arrow", this.element_tip_node).x = pos.x;
            this.element_tip_node.y = pos.y-200;
        }
    }

    private clickButton (event: cc.Event.EventTouch, param) {
        let element_id = Number(param);
        let node = event.target.parent;
        node.getComponent(cc.Sprite).spriteFrame = this.item_bg_spriteframes[0];
        event.target.active = false;
        let json = this._json_manager.getJson(this._config.game_2d? this._json_name.HANDBOOK_2D:this._json_name.HANDBOOK);
        for (let key in json) {
            if (json[key].ele_id == element_id) {
                let [reward_id, reward_count] = json[key].unlock_reward.split(":");
                let data = {
                    pos_w: node.parent.convertToWorldSpaceAR(node.position),
                    item_id: Number(reward_id),
                    item_num: Number(reward_count),
                };
                this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
                break;
            }
        }
        let reward_ele_list = this._user.getElementRewwardList();
        let index = reward_ele_list.indexOf(element_id);
        if (index != -1) {
            reward_ele_list.splice(index, 1);
        }
        this._user.setElementRewwardList(reward_ele_list);
        this._event_manager.dispatch(this._event_name.EVENT_RED_TIP, { pokedex_element: (reward_ele_list.length > 0) });
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
    }

    private getPrefabHeight (item_count: number): number {
        return 70+195*Math.ceil(item_count/4)-10+20;
    }

    private onScroll (event: cc.Event.EventTouch) {
        let v_top = -this.content.y+400;
        let v_bottom = -this.content.y-this.content.parent.height-400;
        let key_len = Object.keys(this.group_list).length;
        let min = key_len, max = 0;
        for (let i = 0; i < this.content.children.length; ++i) {
            let node = this.content.children[i];
            if (node.active) {
                if (i < min) { min = i; }
                if (i > max) { max = i; }
            }
        }
        for (let i = min-1; i <= min+1; ++i) {
            if (i >= 0 && i < this.content.children.length) {
                let node = this.content.children[i];
                if (node.y-node.height < v_top && node.y > v_bottom) {
                    node.active = true;
                }
                else {
                    node.active = false;
                }
            }
        }
        for (let i = max-1; i <= max+1; ++i) {
            if (i >= 0 && i < this.content.children.length) {
                let node = this.content.children[i];
                if (node.y-node.height < v_top && node.y > v_bottom) {
                    node.active = true;
                }
                else {
                    node.active = false;
                }
            }
        }
    }
}
