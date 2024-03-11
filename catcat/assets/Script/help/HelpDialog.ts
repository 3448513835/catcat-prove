/*
 * 说明
 */

import MyComponent from "../common/MyComponent";

const { ccclass, property } = cc._decorator;
@ccclass
export default class HelpDialog extends MyComponent {
    @property(cc.Node)
    private content_node: cc.Node = null;
    @property(cc.Node)
    private item_node: cc.Node = null;

    onLoad () {
        let data = this.getDialogData();
        let id = data["id"]
        let list = []
        if (id) {
            // let json_data = this._json_manager.getJsonData(this._json_name.TEXT, id);
            // list = json_data.text.split('\n');
        }else {
            if (data["str"]) {
                list = data["str"].split('\n');
            }
        }
        
        this.schedule(() => {
            let node = cc.instantiate(this.item_node);
            node.parent = this.content_node;
            node.getComponent(cc.RichText).string = list.shift();
        }, 0, list.length-1);
    }
}
