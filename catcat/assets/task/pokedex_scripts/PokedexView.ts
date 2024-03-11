import { UserDefault } from "../../Script/common/Config";
import GameConstant from "../../Script/common/GameConstant";
import MyComponent from "../../Script/common/MyComponent";
import PokedexCusScroll from "./PokedexCusScroll";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PokedexView extends MyComponent {

    @property([cc.Node])
    btn_list: cc.Node[] = []

    @property(PokedexCusScroll)
    pokedexCusScroll: PokedexCusScroll = null
    @property(cc.Node)
    element_scroll_node: cc.Node = null;

    @property([cc.SpriteFrame])
    btn_frames: cc.SpriteFrame[] = []

    private default_select: number = 0

    onLoad () {
        let data = this.getDialogData()
        if (data && data["index"]) {
            this.default_select = data["index"]
        }
        this.listen(this._event_name.EVENT_RED_TIP, this.onRedTip, this);
    }

    start () {
        this.clickBtn(null, this.default_select)
        let element_reward_list = this._user.getElementRewwardList();
        this.btn_list[0].getChildByName("Red").active = (element_reward_list.length > 0);
        let isCusRed = this._utils.getPokedexCusIsHaveRed()
        this.btn_list[1].getChildByName("Red").active = isCusRed
    }

    private onRedTip (data) {
        if (data.hasOwnProperty("pokedex_element")) {
            this.btn_list[0].getChildByName("Red").active = data.pokedex_element;
        }
        if (data.hasOwnProperty("pokedex_cus")) {
            this.btn_list[1].getChildByName("Red").active = data.pokedex_cus
        }
    }

    private clickBtn(...params) {
        let index = Number(params[1])
        for (let i = 0; i < this.btn_list.length; i++) {
            const btn_node = this.btn_list[i]
            let ttf = btn_node.getChildByName("ttf")
            let sp = btn_node.getComponent(cc.Sprite)
            if (index == i) {
                sp.spriteFrame = this.btn_frames[1]
                ttf.color = cc.color(255, 255, 255)
                ttf.getComponent(cc.LabelOutline).enabled = true

                this.pokedexCusScroll.node.active = index == 1
                this.element_scroll_node.active = false;

                UserDefault.setItem(this._user.getUID() + GameConstant.POKDEX_PAGE_INDEX, index)
            }else {
                sp.spriteFrame = this.btn_frames[0]
                ttf.color = cc.color(149, 91, 48)
                ttf.getComponent(cc.LabelOutline).enabled = false
                this.pokedexCusScroll.node.active = false;
                this.element_scroll_node.active = true;
            }
        }
    }

    // update (dt) {}
}
