import MyComponent from "../../Script/common/MyComponent";
import PokedexCusGroupSingleItem from "./PokedexCusGroupSingleItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PokedexCusGroupItem extends MyComponent {

    @property([cc.Node])
    item_list: cc.Node[] = []

    // onLoad () {}

    start () {

    }

    initItem(data) {
        for (let i = 0; i < this.item_list.length; i++) {
            const item_node = this.item_list[i]
            if (data[i]) {
                item_node.active = true
                item_node.getComponent(PokedexCusGroupSingleItem).updateItem(data[i])
            }else {
                item_node.active = false
            }
        }
    }

    // update (dt) {}
}
