import MyComponent from "../../Script/common/MyComponent"
import MyScrollview from "../../Script/common/MyScrollView"
import { MapData } from "./MergeDataInterface"
import MergeOrderDetailItem from "./MergeOrderDetailItem"

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeOrderDialog extends MyComponent {
    @property(cc.Label)
    private level_label: cc.Label = null;
    @property(cc.Label)
    private percent_label: cc.Label = null;
    @property(cc.Node)
    private progress_node: cc.Node = null;
    @property(MyScrollview)
    private my_scrollview: MyScrollview = null;

    private map_data: MapData = null;
    private order_list: any = null;
    private cell_count_list: any = null;

    onLoad () {
        super.onLoad && super.onLoad();
        let dialog_data = this.getDialogData();
        this.map_data = dialog_data.map_data;
        this.order_list = dialog_data.order_list;
        this.cell_count_list = dialog_data.cell_count_list;
        this.level_label.string = this.map_data.stage_name+"."+this.map_data.level;
        this.percent_label.string = this.map_data.cur_exp+"/"+this.map_data.next_exp;
        this.progress_node.width = this.progress_node.children[0].width*this.map_data.cur_exp/this.map_data.next_exp;
        this.my_scrollview.numItems = this.order_list.length;
        // console.log("所有订单", this.order_list);
    }

    private updateScrollviewItem(node: cc.Node, index: number) {
        node.getComponent(MergeOrderDetailItem).setData(this.order_list[index].id, this.cell_count_list, this.map_data);
    }
}
