import { UserDefault } from "../../common/Config";
import DialogManager from "../../common/DialogManager";
import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";
import CustomerManager from "../../customer/CustomerManager";
import MapGridView from "../../main/MapGridView";


const { ccclass, property } = cc._decorator;

@ccclass
export default class EntrustView extends MyComponent {

    @property(cc.Label)
    ttf_title: cc.Label = null

    @property(cc.Label)
    ttf_des: cc.Label = null

    @property(cc.Node)
    need_item: cc.Node = null

    @property(cc.Node)
    item_reward: cc.Node = null

    @property(cc.Label)
    ttf_time: cc.Label = null

    @property(cc.Node)
    btn1: cc.Node = null

    @property(cc.Node)
    btn2: cc.Node = null

    @property(cc.Node)
    btn3: cc.Node = null

    @property(cc.Sprite)
    cus_icon: cc.Sprite = null

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    private data = null
    private count_time = 0
    private isFinished: boolean = true

    onLoad() {
        this.data = this.getDialogData()
    }

    start() {
        this.setNeedItem()
        this.setRewardItem()

        this.ttf_des.string = this.data["order_text"] || ""
        let cus_id = this.data["cus_id"]
        let cus_config = this._json_manager.getJsonData(this._json_name.CUSTOMER_BASE, cus_id)
        if (cus_config) {
            this.ttf_title.string = `${cus_config["customer_name"]}的请求`
            this.dragonReplace(cus_config)
            // let path = `pic/customer/${cus_config["appearance"]}`
            // this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            //     if (cc.isValid(this.cus_icon)) {
            //         this.cus_icon.spriteFrame = sprite_frame
            //     }
            // })
        }

        if (this.data["isReveive"]) {
            this.countTime()
        }else {
            let time = this.data["time"]
            let seconds = time / 60 * 3600
            this.ttf_time.string = this._utils.formatTimeForSecond(seconds)
        }
    }

    /**
      *
      * @param name 需要从resources文件夹加载的名称
      * @param type 加载资源的类型
      */
    assetLoadRes(name: string, type: any) {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(name, type, (err, resAsset) => {
                err && reject('未找到资源')
                resolve(resAsset)
            })
        })
    }
    /**
     * 进行龙骨动画替换
     */
    async dragonReplace(config, callBack?: Function) {
        // 龙骨动画资源
        // ske 骨骼数据
        // tex 骨骼纹理数据
        let dragon = config["action"]
        let ske = `dragon/customer/${dragon}_ske`
        let tex = `dragon/customer/${dragon}_tex`
        // cc.error(ske, tex, "dump=[=============11")
        const s = await this.assetLoadRes(ske, dragonBones.DragonBonesAsset)
        const t = await this.assetLoadRes(tex, dragonBones.DragonBonesAtlasAsset)
        if (s && t) {
            // 进行龙骨动画替换
            if (s instanceof dragonBones.DragonBonesAsset) {
                this.dragon.dragonAsset = s
            }
            if (t instanceof dragonBones.DragonBonesAtlasAsset) {
                this.dragon.dragonAtlasAsset = t
            }

            this.dragon.armatureName = "zhengdaiji"
            this.dragon.playAnimation("newAnimation", -1)
            // this.yinying.active = true

            if (callBack) callBack()
        }
    }

    private countTime() {
        let end_time = Math.floor((this.data["end_time"] - Date.now()) / 1000)
        // cc.error(this.data["end_time"], "endtime===========66")
        if (end_time < 0) {
            this.close()
        }
        this.count_time = end_time
        this.ttf_time.string = this._utils.formatTimeForSecond(end_time)
        this.schedule(this.tickTime, 1)
    }

    private tickTime() {
        this.count_time -= 1
        if (this.count_time > 0) {
            this.ttf_time.string = this._utils.formatTimeForSecond(this.count_time)
        }else {
            this.close()
        }
    }

    private setRewardItem() {
        let reward = this.data["reward"]
        let reward_data = this._utils.changeConfigData(reward)
        let reward_item_list = this.item_reward.children
        for (let i = 0; i < reward_item_list.length; i++) {
            const node = reward_item_list[i]
            let item_data = reward_data[i]
            if (item_data) {
                node.active = true
                let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                let num = node.getChildByName("Num").getComponent(cc.Label)

                num.string = `+${item_data["item_num"]}`

                let item_id = Number(item_data["item_id"])

                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(icon)) {
                        icon.spriteFrame = sprite_frame
                        // let scale = this._utils.getNeedSceleBySprite(icon, 200, 200)
                        // icon.node.scale = scale
                        
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) {
                            icon.node.scale = 1
                        } else if (item_type == 2) {
                            icon.node.scale = 0.7
                        }
                    }
                })
            }
            else {
                node.active = false
            }
        }
    }

    private setNeedItem() {
        let merge_ele_item = this._utils.getMergeElementCountList() || {}

        let order = this.data["order"]
        let order_data = this._utils.changeConfigData(order)
        let need_item_list = this.need_item.children
        for (let i = 0; i < need_item_list.length; i++) {
            const node = need_item_list[i]
            let item_data = order_data[i]
            if (item_data) {
                node.active = true
                let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                let num = node.getChildByName("Num").getComponent(cc.Label)
                let name = node.getChildByName("Name").getComponent(cc.Label)
                let finished = node.getChildByName("Finished")

                let item_id = Number(item_data["item_id"])
                let ele_num = merge_ele_item[item_id] || 0
                let need_num = Number(item_data["item_num"])
                num.string = `${ele_num}/${need_num}`
                if (need_num > ele_num) {
                    this.isFinished = false
                    finished.active = false
                }else {
                    finished.active = true
                }
                
                name.string = this._utils.getItemNameById(item_id)
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(icon)) {
                        icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        if (item_type == 1) icon.node.scale = 0.5
                    }
                })
            } else {
                node.active = false
            }
        }

        if (this.isFinished && this.data["isReveive"]) {
            this.btn3.active = true
            this.btn2.active = false
        }else {
            this.btn3.active = false
            this.btn2.active = true
        }
    }

    private clickBtn1() {
        if (!this.data["isReveive"]) {
            if (this.data["callBack"]) this.data["callBack"](false)
        }else {
            let local_entrust_data = UserDefault.getItem(this._user.getUID() + GameConstant.ENTRUST_DATA)
            if (local_entrust_data) {
                local_entrust_data = JSON.parse(local_entrust_data)
                let key = this.data["key"]
                if (local_entrust_data[key]) {
                    delete local_entrust_data[key]
                    UserDefault.setItem(this._user.getUID() + GameConstant.ENTRUST_DATA, JSON.stringify(local_entrust_data))
                }
            }
            if (this.data["callBack"]) this.data["callBack"](false)
        }
        this.close()
    }

    private clickBtn2(...params) {
        let type = Number(params[1])
        if (!this.data["isReveive"]) {
            let time = this.data["time"]
            let seconds = time / 60 * 3600
            let end_time = Date.now() + seconds * 1000
            this.data["end_time"] = end_time
            if (this.data["callBack"]) this.data["callBack"](true)
        }

        if (type != 1) {
            DialogManager.removeDialogFromDialogList(this._dialog_name.EntrustView)
            this._resource_manager.loadBundle(this._config.game_2d ? "merge2d" : "merge").then((bundle) => {
                cc.director.loadScene(this._config.game_2d ? "Merge2d" : "Merge", () => {
                    
                });
            });
        } else{
            this.close()
        }
    }
    
    private clickBtn3() {
        if (this.isFinished) {
            if (this.data["callBack"]) this.data["callBack"](false)
            let reward = this.data["reward"]
            let reward_data = this._utils.changeConfigData(reward)
            this._dialog_manager.openDialog(this._dialog_name.RewardView, reward_data)   
            
            let order = this.data["order"]
            let order_data = this._utils.changeConfigData(order)
            let list = {}
            for (let i = 0; i < order_data.length; i++) {
                const item_data = order_data[i]
                list[item_data["item_id"]] = Number(item_data["item_num"])
            }
            this._utils.deleteMergeElement(list)
            let local_entrust_data = UserDefault.getItem(this._user.getUID() + GameConstant.ENTRUST_DATA)
            if (local_entrust_data) {
                local_entrust_data = JSON.parse(local_entrust_data)
                let key = this.data["key"]
                if (local_entrust_data[key]) {
                    delete local_entrust_data[key]
                    UserDefault.setItem(this._user.getUID() + GameConstant.ENTRUST_DATA, JSON.stringify(local_entrust_data))
                }

                CustomerManager.instance.removeEntrustCusToList(key)
                MapGridView.instance.checkEntrustIsFinished()
            }    
            this.close()
        }
    }

    // update (dt) {}
}
