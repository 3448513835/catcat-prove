import MyComponent from "../../Script/common/MyComponent"
import MyButton from "../../Script/common/MyButton"

const speed = 80;
const speak = 0.15; // 文字速度

const { ccclass, property } = cc._decorator;
@ccclass
export default class Trans extends MyComponent {
    @property(cc.Node)
    private map_node: cc.Node = null;
    @property(dragonBones.ArmatureDisplay)
    private player: dragonBones.ArmatureDisplay = null;
    @property(cc.Label)
    private tip_label: cc.Label = null;
    @property(cc.Node)
    private tip_bg: cc.Node = null;
    @property(cc.Node)
    private tip_node: cc.Node = null;
    @property(MyButton)
    private help_button: MyButton = null;
    @property(cc.Node)
    private jump_button: cc.Node = null;
    @property(cc.AudioClip)
    private rain_clip: cc.AudioClip = null;
    @property(cc.Node)
    private hand_node: cc.Node = null;
    @property([cc.SpriteFrame])
    private hand_spriteframes: cc.SpriteFrame[] = [];

    private cur_state: number = 0;
    private rain_id = null;

    onLoad () {
        this._utils.wxReportScene(1002);
        this._net_manager.requestTablog(this._config.statistic.TRANS_ENTER);
        this._audio_manager.playTransBackgroundMusic();
        this.rain_id = cc.audioEngine.playEffect(this.rain_clip, true);
        this._resource_manager.loadBundle("main_scene").then(() => {
            console.log("main_scene loaded");
            cc.director.preloadScene("Main");
        });
        this.showAnimal1();
        this.jump_button.active = true;
        this.jump_button.scale = 0;
        cc.tween(this.jump_button)
            .delay(3)
            .to(0, { scale: 1 })
            .start();
    }

    private showAnimal1 () {
        this.cur_state = 1;
        let start_pos = new cc.Vec2(1200, -360);
        let end_pos = new cc.Vec2(840, -130);
        this.player.node.setPosition(0, 0);
        this.player.armatureName = "zou";
        this.player.playAnimation("newAnimation", 0);
        this.map_node.setPosition(start_pos);
        let tm = start_pos.sub(end_pos).mag()/speed;
        cc.tween(this.map_node)
            .to(tm, { x: end_pos.x, y: end_pos.y })
            .call(() => {
                this.showAnimal2();
            })
            .start();
        let tip1 = "一个风雨交加的晚上...";
        let tip2 = "喵喵伤心的离开了家";
        this.tip_label.string = "";
        this.tip_bg.active = false;
        let count = 0, extra = 5;
        this.schedule(() => {
            ++ count;
            if (count <= tip1.length) {
                this.tip_label.node.width = 602;
                this.tip_label.string = tip1.slice(0, count);
                this.tip_bg.active = true;
                this.tip_bg.width = this.tip_label.node.width+80;
            }
            else if (count > tip1.length && count < tip1.length+extra) {
                this.tip_bg.active = false;
                this.tip_label.string = "";
            }
            else {
                this.tip_label.node.width = 540;
                this.tip_label.string = tip2.slice(0, count-(tip1.length+extra));
                this.tip_bg.active = true;
                this.tip_bg.width = this.tip_label.node.width+80;
            }
        }, speak, tip1.length+tip2.length+extra);
    }

    private showAnimal2 () {
        this._net_manager.requestTablog(this._config.statistic.TRANS_ANIMAL_FINISH1);
        this.cur_state = 2;
        let start_pos = new cc.Vec2(-950, 360);
        let end_pos = new cc.Vec2(-590, 360);
        this.player.node.setPosition(0, -70);
        this.player.node.scaleX = -0.4;
        this.map_node.setPosition(start_pos);
        let tm = start_pos.sub(end_pos).mag()/speed;
        this.map_node.stopAllActions();
        cc.tween(this.map_node)
            .to(tm, { x: end_pos.x, y: end_pos.y })
            .call(() => {
                this.showAnimal3();
            })
            .start();
        let tip = "这里只有一个废弃的纸箱";
        this.tip_label.string = "";
        this.tip_bg.active = false;
        let count = 0;
        this.unscheduleAllCallbacks();
        this.tip_label.node.width = 660;
        this.tip_bg.width = this.tip_label.node.width+80;
        this.schedule(() => {
            this.tip_bg.active = true;
            ++ count;
            this.tip_label.string = tip.slice(0, count);
        }, speak, tip.length-1);
    }

    private showAnimal3 () {
        this._net_manager.requestTablog(this._config.statistic.TRANS_ANIMAL_FINISH2);
        this.cur_state = 3;
        this.map_node.stopAllActions();
        this.unscheduleAllCallbacks();
        this.player.node.scaleX = 0.4;
        this.player.node.setPosition(0, -70);
        this.map_node.setPosition(-590, 360);
        this.tip_label.string = "";
        this.tip_bg.active = false;
        this.player.on(dragonBones.EventObject.COMPLETE, () => {
            this.showAnimal4();
        });
        this.player.armatureName = "kan";
        this.player.playAnimation("newAnimation", 1);
    }

    private showAnimal4 () {
        this._net_manager.requestTablog(this._config.statistic.TRANS_ANIMAL_FINISH3);
        this.player.armatureName = "zuo";
        this.player.playAnimation("newAnimation", 0);
        this.map_node.stopAllActions();
        this.unscheduleAllCallbacks();
        this.cur_state = 4;
        this._audio_manager.playEffect(this._audio_name.TRANS_CAT);
        let tip1 = "她想在这里活下去...";
        let tip2 = "你...愿意帮助她吗？";
        this.tip_label.string = "";
        let tm = speak*(tip1.length+tip2.length);
        let count = 0, extra = 5;
        this.schedule(() => {
            this.tip_bg.active = true;
            ++ count;
            if (count <= tip1.length) {
                this.tip_label.node.width = 542;
                this.tip_label.string = tip1.slice(0, count);
                this.tip_bg.width = this.tip_label.node.width+80;
            }
            else if (count > tip1.length && count < tip1.length+extra) {
                this.tip_bg.active = false;
                this.tip_label.string = "";
            }
            else {
                if (count == tip1.length+extra) {
                    this._audio_manager.playEffect(this._audio_name.TRANS_CAT);
                }
                this.tip_label.node.width = 542;
                this.tip_label.string = tip2.slice(0, count-(tip1.length+extra));
                this.tip_bg.width = this.tip_label.node.width+80;
            }
        }, speak, tip1.length+tip2.length+extra);
        this.scheduleOnce(() => {
            this.help_button.node.active = true;
            cc.tween(this.help_button.node).repeatForever(
                cc.tween().to(1.0, { scale: 1.2 }).to(1.0, { scale: 1 })
            ).start();
            this.jump_button.active = false;
            this._net_manager.requestTablog(this._config.statistic.TRANS_ANIMAL_FINISH4);
        }, tm);
    }

    private clickGo () {
        this._net_manager.requestTablog(this._config.statistic.TRANS_GO);
        this.help_button.interactable = false;
        cc.audioEngine.stopEffect(this.rain_id);
        this._resource_manager.loadBundle("main_scene").then(() => {
            cc.director.loadScene("Main");
        });
    }

    private clickNext () {
        if (this.cur_state == 1) {
            this.showAnimal2();
        }
        else if (this.cur_state == 2) {
            this.showAnimal3();
        }
        else if (this.cur_state == 3) {
            this.showAnimal4();
        }
    }

    private clickJump () {
        this.cur_state = 4;
        this._audio_manager.playEffect(this._audio_name.TRANS_CAT);
        this._net_manager.requestTablog(this._config.statistic.TRANS_JUMP);
        this.map_node.setPosition(-590, 360);
        this.map_node.stopAllActions();
        this.unscheduleAllCallbacks();
        this.player.node.setPosition(0, -70);
        this.player.node.scaleX = 0.4;
        this.player.armatureName = "zuo";
        this.player.playAnimation("newAnimation", 0);
        this.tip_label.string = "你...愿意帮助她吗？";
        this.tip_label.node.width = 542;
        this.tip_bg.width = this.tip_label.node.width+80;
        this.tip_bg.active = true;
        this.help_button.node.active = true;
        this.hand_node.active = true;
        this._utils.addAnimationBySpriteFrames(this.hand_node, [this.hand_spriteframes[0], this.hand_spriteframes[1]], cc.WrapMode.Loop, 1);
        this.jump_button.active = false;
        cc.tween(this.help_button.node).repeatForever(
            cc.tween().to(1.0, { scale: 1.2 }).to(1.0, { scale: 1 })
        ).start();
    }
}
