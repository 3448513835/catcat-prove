// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import MyComponent from "../../common/MyComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GongGao extends MyComponent {

   @property(cc.Label)
   ttf_title: cc.Label = null

   @property(cc.Label)
   ttf_content: cc.Label = null

    // onLoad () {}

    start () {
        let json = this._json_manager.getJsonData(this._json_name.NOTICE, 1)
        let validity_end = json["validity_end"]
        let end_time = Date.parse(new Date(validity_end).toString())
        
        let title = json["title"]
        let index = json["index"]

        this.ttf_title.string = title
        this.ttf_content.string = index
    }

    // update (dt) {}
}
