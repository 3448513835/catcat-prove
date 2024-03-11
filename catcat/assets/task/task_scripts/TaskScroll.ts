import { ScrollAdapter } from "../adapter/abstract/ScrollAdapter";
import { WrapMode } from "../adapter/define/enum";
import { IElement } from "../adapter/define/interface";
import TaskItem from "./TaskItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class TaskScroll extends ScrollAdapter {

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
    }

    public setView(data) {
        if (data) {
            if (this.data) {
                this.data = data
                let modelList = this.modelManager.modelList

                let remove_index = null
                for (let i = 0; i < modelList.length; i++) {
                    const model = modelList[i]
                    let model_data = model.data
                    let isHave = false
                    for (let j = 0; j < data.length; j++) {
                        let item_data = data[j]
                        if (model_data.groupId == item_data.groupId) {
                            model.data = item_data
                            isHave = true
                            break
                        }
                    }
                    if (!isHave) {
                        remove_index = i
                    }
                }

                if (remove_index != null) {
                    let view = this.viewManager.getVisibleView(remove_index)
                    let holder = view.holderList[0]
                    let node = holder.node
                    if (cc.isValid(node)) {
                        let func = () => {
                            this.modelManager.remove(remove_index)
                            this.modelManager.update()
                        }
                        node.getComponent(TaskItem).playRemoveAction(func)
                    }
                }else {
                    this.modelManager.update()
                }
            } else {
                this.data = data
                this.modelManager.insert(data)
            }

        }
    }
    // update (dt) {}
}
