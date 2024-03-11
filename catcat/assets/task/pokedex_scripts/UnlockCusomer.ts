import { UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";
import { User } from "../../Script/common/User";
import MapGridView from "../../Script/main/MapGridView";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UnlockCusomer extends MyComponent {

    @property(cc.Node)
    light: cc.Node = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    private data = null

    onLoad () {
        this.data = this.getDialogData()
        cc.tween(this.light).repeatForever(
            cc.tween().by(1, { angle: -60 })
        ).start()
        this._audio_manager.playEffect(this._audio_name.UNLOCK);
    }

    start () {
        let id = this.data["id"]
        let cus_config = this._json_manager.getJsonData(this._json_name.CUSTOMER_BASE, id)
        let pokedex_customer_info = UserDefault.getItem(User.getUID() + GameConstant.POKEDEX_CUSTOMER_LOCK_INFO)
        let record_data
        if (pokedex_customer_info) {
            record_data = JSON.parse(pokedex_customer_info)
            
        }else {
            record_data = {}
        }
        record_data[id] = {
            isLock: true,
            isGetReward: false
        }
        UserDefault.setItem(User.getUID() + GameConstant.POKEDEX_CUSTOMER_LOCK_INFO, JSON.stringify(record_data))
        let isCusRed = this._utils.getPokedexCusIsHaveRed()
        this._event_manager.dispatch(this._event_name.EVENT_RED_TIP, { pokedex_cus: isCusRed })

        let customer_unlock_list = UserDefault.getItem(User.getUID() + GameConstant.CUSTOMER_UNLOCK_LIST)
        let record_cus_list: any[]
        if (customer_unlock_list) {
            record_cus_list = JSON.parse(customer_unlock_list)
        }else {
            record_cus_list = []
        }
        record_cus_list.push(Number(id))
        UserDefault.setItem(User.getUID() + GameConstant.CUSTOMER_UNLOCK_LIST, JSON.stringify(record_cus_list))

        let role_num = record_cus_list.length
        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1006,
            args: [role_num],
        })

        if (cus_config) {
            this.ttf_name.string = cus_config["customer_name"]
            let path = `pic/customer/${cus_config["appearance"]}`
            this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                if (cc.isValid(this.icon)) {
                    this.icon.spriteFrame = sprite_frame
                }
            })
        }
    }

    private clickBtn() {
        this.close()
    }

    onDestroy () {
        super.onDestroy && super.onDestroy()
        this._event_manager.dispatch(this._event_name.EVENT_CONDITION, {
            type: 1005,
            args: [Number(this.data["id"])],
        })
    }

    // update (dt) {}
}
