import MyComponent from "../../common/MyComponent";
import HeadSingleItem from "./HeadSingleItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class HeadItem extends MyComponent {

    @property({type: cc.Node})
    childs: cc.Node[] = []

    // onLoad () {}

    start () {

    }

    updateView(data) {
        for (let index = 0; index < this.childs.length; index++) {
            const node = this.childs[index]
            if (index < data.length && data[index]) {
                node.active = true
                node.getComponent(HeadSingleItem).updateItem(data[index])
            }else {
                node.active = false
            }
        }
    }

    // update (dt) {}
}
