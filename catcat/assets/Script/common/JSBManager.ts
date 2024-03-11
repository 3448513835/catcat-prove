/*
 * jsb管理
 */
import DialogManager from "./DialogManager"
import EventManager from "./EventManager";
import { User } from "./User";
import Utils from "./Utils";

export default class JSBManager {
    private static goods_id = null;
    private static onKeyBack () {
        DialogManager.onKeyBack();
    }

    private static test() {
        Utils.test()
    }

    private static mainScene(data: string) {
        Utils.mainScene(data)
    }

    private static sdkInit() {
        User.setIsInitSdk(true)
        EventManager.dispatch("sdk_is_init", true)
    }

    private static sendSdkIsInit(data) {
        let isInit = JSON.parse(data)
        EventManager.dispatch("sdk_is_init", isInit)
    }

    public static setGoodsId (goods_id) {
        this.goods_id = goods_id;
    }
    private static onPaySuccess() {
        console.log("支付成功回调=================11")
        EventManager.dispatch(EventManager._event_name.EVENT_ON_PAY_SUCCESS_CALLBACK, {
            goods_id: this.goods_id,
        });
    }
    
}

// @ts-ignore
window.JSBManager = JSBManager;
