
import { ScrollAdapter } from "../adapter/abstract/ScrollAdapter";
import { WrapMode } from "../adapter/define/enum";
import { IElement } from "../adapter/define/interface";
import JsonManager from "../../Script/common/JsonManager";
import Utils from "../../Script/common/Utils";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PokedexCusScroll extends ScrollAdapter {

    @property(cc.Prefab)
    prefab: cc.Prefab = null

    private data = null

    public getPrefab(data: any): cc.Prefab {
        return this.prefab
    }

    // public getView(): View<any, ScrollAdapter<any>> {
    //     return new MyView(this)
    // }
    // public getHolder(node: cc.Node, code: string): Holder<any, ScrollAdapter<any>> {
    //     return new MyHolder(node, code, this)
    // }
    public initElement(element: IElement, data: any): void {
        element.wrapBeforeMode = WrapMode.Wrap
    }

    onLoad() {
        
    }

    start() {
        let list = {}
        let json = JsonManager.getJson(JsonManager._json_name.CUSTOMER_BASE)
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let group = item_data["group"]
                if (!list[group]) {
                    list[group] = {}
                    let group_name = item_data["group_name"]
                    list[group]["group_name"] = group_name
                    list[group]["cus_list"] = []
                    list[group]["group"] = group
                }
                let cus_list = list[group]["cus_list"]
                cus_list.push(item_data)
            }
        }

        let data = []
        for (const key in list) {
            if (Object.prototype.hasOwnProperty.call(list, key)) {
                const item_data = list[key]
                let cus_list = item_data["cus_list"]
                let change_data = Utils.dataChangte(cus_list, 3)
                item_data["cus_list"] = change_data
                data.push(item_data)
            }
        }
        // cc.error(data, "data==========")

        this.setView(data)
    }

    public setView(data) {
        if (data) {
            if (this.data) {
                this.data = data
                let modelList = this.modelManager.modelList

                for (let i = 0; i < data.length; i++) {
                    const element = data[i]
                    let model = modelList[i]
                    if (model) {
                        model.data = element
                    }
                }
                this.modelManager.update()
            } else {
                this.data = data
                this.modelManager.insert(data)
            }

        }
    }
    // update (dt) {}
}
