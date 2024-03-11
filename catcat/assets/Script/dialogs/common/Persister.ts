/*
 * 常驻节点 
 */
import MyComponent from "../../common/MyComponent";

const hand_tip_scale = 0.7;
const hand_tip_show  = 7;
const hand_tip_wait  = 20;

const {ccclass, property} = cc._decorator;
@ccclass
export default class Persister extends MyComponent {
    @property(cc.Node)
    private tip_node: cc.Node = null;

    private hand_tip_node: cc.Node = null;
    private hand_tip_level: number = 0;

    onLoad () {
        super.onLoad && super.onLoad();
        cc.game.addPersistRootNode(this.node);
        this.node.setContentSize(cc.visibleRect.width*2, cc.visibleRect.height*2);
        this.listen(this._event_name.EVENT_SHOW_TIP, this.onShowTip, this);
        this.listen(this._event_name.EVENT_USER_UPDATE, this.onUserUpdate, this);
        this.listen(this._event_name.EVENT_CONDITION, this.onCondition, this);
        this.listen(this._event_name.EVENT_HAND_TIP, this.onHandTip, this);
        this.listen(this._event_name.EVENT_TRIGGER_GUIDE, this.onTriggerGuide, this);

        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this._event_manager.dispatch(this._event_name.EVENT_CLICK_SCREEN, {
                event: event,
            });
        })
        
        // @ts-ignore
        this.node._touchListener.setSwallowTouches(false);
    }

    private onShowTip (data) {
        let node = cc.instantiate(this.tip_node);
        node.active = true;
        node.setPosition(cc.visibleRect.width/2, cc.visibleRect.height/2);
        node.parent = this.node;
        let label = cc.find("Label", node).getComponent(cc.Label);
        label.string = data.msg;
        node.width = data.msg.length*40+260;
        node.opacity = 0;
        let speed = 140, y = node.y;
        cc.tween(node)
            .to(0.2, { opacity: 255, y: y+0.2*speed })
            .to(1, { y: y+1.2*speed })
            .to(0.2, { opacity: 0, y: y+1.4*speed })
            .removeSelf()
            .start();
    }

    private onUserUpdate (data) {
        // this._user.update(data);
    }

    private onCondition (data) {
        let type = data.type, args = data.args.join("-"), json = this._json_manager.getJson(this._json_name.STORY_INDEX);
        for (let key in json) {
            let value = json[key];
            if (value.condition == type && value.para == args) {
                if (cc.isValid(this.hand_tip_node)) {
                    this.hand_tip_node.opacity = 0;
                }
                this._dialog_manager.openDialog(this._dialog_name.StoryDialog, {
                    story_id: value.story_id,
                    skip: value.skip,
                    callback: () => {
                        if (cc.isValid(this.hand_tip_node)) {
                            this.hand_tip_node.opacity = 255;
                        }
                    },
                });
                break;
            }
        }
    }

    /**
     * 小手提示
     * param data.show 是否显示
     * param data.level 优先级
     * param data.node 触发的node
     * param data.clear
     */
    private onHandTip (data) {
        let level = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 1013).int_para;
        if (data.clear || this._user.getLevel() >= level) {
            if (cc.isValid(this.hand_tip_node)) {
                this.hand_tip_node.active = false;
            }
            this.hand_tip_level = 0;
            this._guide_manager.setHandTipLevel(this.hand_tip_level);
        }
        else if (data.show) {
            if (!this._dialog_manager.hasDialog()) {
                this.addGuideTip(data.node, data.level);
            }
        }
        else {
            this.removeGuideTip(data.level);
        }
    }

    private onTriggerGuide (data) {
        this.onHandTip({ clear: true, });
    }

    private addGuideTip(node: cc.Node, level: number) {
        // console.log("addGuideTip", level);
        if (this._guide_manager.getGuideFinish()) {
            if (level > this.hand_tip_level) {
                this.hand_tip_level = level;
                this._guide_manager.setHandTipLevel(this.hand_tip_level);
                let pos_w = node.parent.convertToWorldSpaceAR(node.position);
                if (cc.isValid(this.hand_tip_node)) {
                    this.hand_tip_node.active = true;
                    this.hand_tip_node.position = pos_w;
                    this.hand_tip_node.stopAllActions();
                    this.hand_tip_node.scale = hand_tip_scale;
                    cc.tween(this.hand_tip_node).repeatForever(
                        cc.tween().delay(hand_tip_show).to(0, { scale: 0 }).delay(hand_tip_wait).to(0, { scale: hand_tip_scale })
                    ).start();
                }
                else {
                    let path = `main_scene/prefabs/guide/GuideTip`;
                    this._resource_manager.getPrefab(path).then((prefab) => {
                        if (cc.isValid(prefab) && this.hand_tip_level > 0) {
                            if (!cc.isValid(this.hand_tip_node)) {
                                this.hand_tip_node = cc.instantiate(prefab);
                                this.node.addChild(this.hand_tip_node);
                                this.hand_tip_node.position = pos_w;
                                this.hand_tip_node.scale = hand_tip_scale;
                                this.hand_tip_node.stopAllActions();
                                cc.tween(this.hand_tip_node).repeatForever(
                                    cc.tween().delay(hand_tip_show).to(0, { scale: 0 }).delay(hand_tip_wait).to(0, { scale: hand_tip_scale })
                                ).start();
                            }
                            else {
                                this.hand_tip_node.position = pos_w;
                            }
                        }
                    });
                }
            }
        }
    }

    private removeGuideTip (level: number) {
        // console.log("removeGuideTip", level);
        if (level == this.hand_tip_level && cc.isValid(this.hand_tip_node)) {
            this.hand_tip_node.active = false;
            this.hand_tip_level = 0;
            this._guide_manager.setHandTipLevel(this.hand_tip_level);
        }
    }
}

