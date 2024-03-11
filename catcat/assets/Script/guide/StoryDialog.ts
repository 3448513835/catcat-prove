/*
 * 剧情
 */
import MyComponent from "../common/MyComponent"

const { ccclass, property } = cc._decorator;
@ccclass
export default class StoryDialog extends MyComponent {
    @property(cc.Node)
    private role_node1: cc.Node = null;
    @property(cc.Node)
    private role_node2: cc.Node = null;
    @property(cc.Node)
    private bg_node: cc.Node = null;
    @property(cc.Node)
    private next_node: cc.Node = null;
    @property(cc.Label)
    private story_label: cc.Label = null;
    @property([cc.Node])
    private item_node_list: cc.Node[] = [];

    private story_id: number = null;
    private skip: number = null;
    private story_list: any[] = null;
    private story_index: number = 0;
    private reward_list: any[] = null;
    private my_reward_list: any[] = [];

    onLoad () {
        this.bg_node.parent.y = -cc.visibleRect.height/2;
        let data = this.getDialogData();
        this.story_id = data.story_id;
        this.skip = data.skip;
        let story_list = [];
        let json = this._json_manager.getJson(this._json_name.STORY_TEXT);
        for (let key in json) {
            let value = json[key];
            if (value.story_id == this.story_id) {
                story_list.push(value);
            }
        }
        story_list.sort((a, b) => { return a.talk_id-b.talk_id; });
        this.story_list = story_list;
        this.initRole();
        this.showStory();
        this._audio_manager.playEffect(this._audio_name.TRANS_CAT);
        this._event_manager.dispatch(this._event_name.EVENT_LV_TIP, false);
        this.node.setContentSize(cc.visibleRect.width, cc.visibleRect.height);
    }

    private initRole () {
        let left_init = false, right_init = false;
        this.role_node1.active = false;
        this.role_node2.active = false;
        for (let story of this.story_list) {
            let choose_node = null, icon_sprite = null;
            if (story.place == 1 && !left_init) {
                choose_node = this.role_node1;
                let dragon: dragonBones.ArmatureDisplay = choose_node.getChildByName("Dragon").getComponent(dragonBones.ArmatureDisplay);
                dragon.armatureName = story.role_id;
                dragon.playAnimation("newAnimation", 0);
                left_init = true;
            }
            else if (story.place == 2 && !right_init) {
                choose_node = this.role_node2;
                let dragon: dragonBones.ArmatureDisplay = choose_node.getChildByName("Dragon").getComponent(dragonBones.ArmatureDisplay);
                this._resource_manager.get(`dragon/customer/${story.role_id}_ske`, dragonBones.DragonBonesAsset).then((res) => {
                    dragon.dragonAsset = res;
                    if (dragon.dragonAsset && dragon.dragonAtlasAsset) {
                        dragon.armatureName = "zhengdaiji";
                        dragon.playAnimation("newAnimation", 0);
                    }
                });
                this._resource_manager.get(`dragon/customer/${story.role_id}_tex`, dragonBones.DragonBonesAtlasAsset).then((res) => {
                    dragon.dragonAtlasAsset = res;
                    if (dragon.dragonAsset && dragon.dragonAtlasAsset) {
                        dragon.armatureName = "zhengdaiji";
                        dragon.playAnimation("newAnimation", 0);
                    }
                });
                right_init = true;
            }
            if (cc.isValid(choose_node)) {
                choose_node.active = true;
                // console.log(`pic/customer/${story.role_id}`);
                // this._resource_manager.get(`pic/customer/${story.role_id}`, cc.SpriteFrame).then((sprite_frame) => {
                //     if (cc.isValid(icon_sprite)) {
                //         icon_sprite.spriteFrame = sprite_frame;
                //     }
                // });
                cc.find("Label", choose_node).getComponent(cc.Label).string = story.role_name;
            }
            if (left_init && right_init) { break; }
        }
    }

    private showRole1 (show: boolean) {
        this.role_node1.active = show;
        this.role_node1.zIndex = show? 1:-1;
        // let material = cc.Material.getBuiltinMaterial(show? "2d-sprite":"2d-gray-sprite");
        // this.role_node1.getComponent(cc.Sprite).setMaterial(0, material);
        // cc.find("Sprite", this.role_node1).getComponent(cc.Sprite).setMaterial(0, material);
        // cc.find("Label", this.role_node1).getComponent(cc.Label).setMaterial(0, material);
    }

    private showRole2 (show: boolean) {
        this.role_node2.active = show;
        this.role_node2.zIndex = show? 1:-1;
        // let material = cc.Material.getBuiltinMaterial(show? "2d-sprite":"2d-gray-sprite");
        // cc.find("Icon", this.role_node2).getComponent(cc.Sprite).setMaterial(0, material);
        // cc.find("Sprite", this.role_node2).getComponent(cc.Sprite).setMaterial(0, material);
        // cc.find("Label", this.role_node2).getComponent(cc.Label).setMaterial(0, material);
    }

    private showStory () {
        if (this.story_index <= this.story_list.length-1) {
            let story = this.story_list[this.story_index];
            this.story_index ++;
            this.showRole1(story.place == 1);
            this.showRole2(story.place != 1);
            this.story_label.string = story.role_text;
            if (story.reply) {
                this.next_node.active = false;
                let list = [story.reply_text1, story.reply_text2, story.reply_text3];
                let choose_count = 0, y = 0;
                for (let i = 0; i < this.item_node_list.length; ++i) {
                    let node = this.item_node_list[i];
                    if (!list[i]) { node.active = false; continue; }
                    ++ choose_count;
                    node.active = true;
                    y = node.y+node.height/2;
                    cc.find("Label", node).getComponent(cc.Label).string = list[i];
                }
                this.scheduleOnce(() => {
                    y += 60+this.story_label.node.height;
                    this.story_label.node.y = y;
                    y += 60;
                    this.bg_node.height = y;
                    this.role_node1.getComponent(cc.Widget).updateAlignment();
                    this.role_node2.getComponent(cc.Widget).updateAlignment();
                }, 0);
                this.reward_list = [story.reward1, story.reward2, story.reward3];
            }
            else {
                this.next_node.active = true;
                for (let node of this.item_node_list) node.active = false;
                this.bg_node.height = 268;
                this.story_label.node.y = 216;
                this.role_node1.y = 338;
                this.role_node2.y = 338;
                this.role_node1.getComponent(cc.Widget).updateAlignment();
                this.role_node2.getComponent(cc.Widget).updateAlignment();
            }
        }
        else {
            this.close();
        }
    }

    private clickNext () {
        if (!this.reward_list) {
            this.showStory();
        }
    }

    private getReward (str) {
        let reward_list = [];
        let list = str.split(",");
        for (let item of list) {
            let [id, num] = item.split(":");
            reward_list.push({ item_id: Number(id), item_num: Number(num), });
        }
        return reward_list;
    }

    onDestroy () {
        let data = [];
        if (this.my_reward_list.length > 0) {
            for (let item of this.my_reward_list) {
                for (let reward of this.getReward(item)) {
                    data.push(reward);
                }
            }
        }
        for (let story of this.story_list) {
            if (story.reply && this.my_reward_list.length == 0) {
                for (let reward of this.getReward(story.reward1)) {
                    data.push(reward);
                }
            }
            if (!story.reply) {
                for (let reward_str of [story.reward1, story.reward2, story.reward3]) {
                    if (reward_str) {
                        for (let reward of this.getReward(reward_str)) {
                            data.push(reward);
                        }
                    }
                }
            }
        }
        if (data.length > 0) {
            let _dialog_manager = this._dialog_manager;
            _dialog_manager.openDialog(_dialog_manager._dialog_name.RewardView, data);
        }
        this._event_manager.dispatch(this._event_name.EVENT_LV_TIP, true);
        let dialog_data = this.getDialogData();
        if (dialog_data.callback) {
            dialog_data.callback();
        }
    }

    private clickItem (event, param) {
        if (this.reward_list) {
            let reward = this.reward_list[Number(param)];
            if (reward) { this.my_reward_list.push(reward); }
            this.reward_list = null;
        }
        this.showStory();
    }
}
