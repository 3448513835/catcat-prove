import Customer from "./Customer";


const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomerPoolManager extends cc.Component {

    @property(cc.Prefab)
    private cusPrefab: cc.Prefab = null

    private cusPool: cc.NodePool = new cc.NodePool(Customer)

    private static instance: CustomerPoolManager = null

    protected onLoad() {
        CustomerPoolManager.instance = this
    }

    /**
     * 获取节点
     */
    public static get() {
        if (this.instance.cusPool.size() > 0) return this.instance.cusPool.get()
        else return cc.instantiate(this.instance.cusPrefab)
    }

    /**
     * 存入节点
     * @param node 
     */
    public static put(node: cc.Node) {
        cc.Tween.stopAllByTarget(node)
        if (this.instance.cusPool.size() < 30) this.instance.cusPool.put(node)
        else node.destroy()
    }
}
