import { Config, UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";
import Utils from "../../Script/common/Utils";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NewGiftView extends MyComponent {

    @property([cc.Node])
    item_list: cc.Node[] = []
    @property([cc.SpriteFrame])
    private video_spriteframes: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    private video_sprite: cc.Sprite = null;

    @property(cc.Node)
    btn_video_node: cc.Node = null

    @property(cc.Node)
    price_node: cc.Node = null

    @property(cc.Label)
    price_origin: cc.Label = null

    @property(cc.Label)
    price_dis: cc.Label = null

    @property(cc.Label)
    ttf_discount: cc.Label = null

    private android_pay_config = {}
    private reward_list = []
    private pay_price = 0

    private init_pop_type = null

    onLoad() {
        let data = this.getDialogData()
        if (data) {
            this.init_pop_type = data["init_pop_type"]
        }

        this.listen(this._event_name.EVENT_VIDEO_CARD, this.onVideoCard, this);
        this.video_sprite.spriteFrame = this.video_spriteframes[(this._user.getVideo() > 0) ? 1 : 0];

        // this.listen(this._event_name.SOCKET_PAY_CHECKCALLBACK_URL, this.payCallBack, this)
        this.listen(this._event_name.EVENT_ON_PAY_SUCCESS_CALLBACK, this.payCallBack, this)
    }

    start() {
        let reward_list
        if (Config.isAndroidPay) {
            let json = this._json_manager.getJsonData(this._json_name.NEW_HAND_REWARD, 1)
            this.android_pay_config = json
            let index = json["index"]
            reward_list = this._utils.changeConfigData(index)
            this.reward_list = reward_list

            this.btn_video_node.active = false
            this.price_node.active = true

            this.price_dis.string = "¥" + ((json["price"] * json["discount"]).toFixed(1)).toString()
            this.price_origin.string = "¥" + json["price"]
            this.ttf_discount.string = (10 * json["discount"]).toString() + "折"

            this.pay_price = Number((json["price"] * json["discount"]).toFixed(1))

        } else {
            let json = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10017)
            let str_para = json["str_para"]
            reward_list = this._utils.changeConfigData(str_para)
            this.reward_list = reward_list

            this.btn_video_node.active = true
            this.price_node.active = false
        }


        for (let j = 0; j < this.item_list.length; j++) {
            const node = this.item_list[j]
            let item_data = reward_list[j]
            if (item_data) {
                node.active = true
                let icon = node.getChildByName("Icon").getComponent(cc.Sprite)
                let num = node.getChildByName("Num").getComponent(cc.Label)
                // let name = node.getChildByName("Name").getComponent(cc.Label)
                num.string = item_data["item_num"]

                let item_id = item_data["item_id"]
                let path = this._utils.getItemPathById(item_id)
                this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                    if (cc.isValid(icon)) {
                        icon.spriteFrame = sprite_frame
                        let item_type = this._utils.getItemTypeById(item_id)
                        icon.node.scale = 0.7
                        if (item_type == 1) icon.node.scale = 0.5
                    }
                })

            } else {
                node.active = false
            }
        }
    }

    /**
     * 
    支付成功回调
     */
    private payCallBack() {
        this._dialog_manager.openDialog(this._dialog_name.RewardView, this.reward_list)
        UserDefault.setItem(this._user.getUID() + GameConstant.NEW_GIFT_IS_GET, 1)
        this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEW_GIFT)
        this.close()
    }

    private clickBtn() {
        if (Config.isAndroidPay) {
            let name = this.android_pay_config["tag_name"]
            let ex_price = this.pay_price
            let user_id = this._user.getUID()
            let other = Date.now().toString() + Math.floor(Math.random() * 999)
            let order_num = `${user_id}${other}`
            let product_id = this.android_pay_config["id"]

            // ex_price = 0.01
            /**
             * order_num 订单编号
             * goods_id 商品id
             * uid 用户ID
             * type 1 会员卡 2 商城
             */
            let post_data = {
                order_num: order_num,
                goods_id: product_id,
                uid: this._user.getUID(),
                type: 3
            }
            this._net_manager.requestOrderRecode(post_data, () => {
                Utils.submitOrder(name, ex_price, product_id, order_num)
            })
        }
        else {
            if (this._user.getVideo() > 0) {
                this._utils.addResNum(GameConstant.res_id.video, -1);
                this._dialog_manager.openDialog(this._dialog_name.RewardView, this.reward_list)
                UserDefault.setItem(this._user.getUID() + GameConstant.NEW_GIFT_IS_GET, 1)
                this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEW_GIFT)
                this.close()
            }
            else {
                this._ad_manager.setAdCallback(() => {
                    this._net_manager.requestTablog(this._config.statistic.NEWGIFT1);
                    this._dialog_manager.openDialog(this._dialog_name.RewardView, this.reward_list)
                    UserDefault.setItem(this._user.getUID() + GameConstant.NEW_GIFT_IS_GET, 1)
                    this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEW_GIFT)
                    this.close()
                });
                this._net_manager.requestTablog(this._config.statistic.NEWGIFT0);
                this._ad_manager.showAd();
            }
        }
    }

    private onVideoCard() {
        this.video_sprite.spriteFrame = this.video_spriteframes[(this._user.getVideo() > 0) ? 1 : 0];
    }

    onDestroy() {
        if (this.init_pop_type) {
            this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEXT_POP_VIEW, this.init_pop_type)
        }
        super.onDestroy && super.onDestroy()
    }

    // update (dt) {}
}
