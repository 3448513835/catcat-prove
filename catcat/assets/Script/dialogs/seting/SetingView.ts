import { UserDefault } from "../../common/Config";
import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";
import { User } from "../../common/User";
import ChangeScene from "../../main/ChangeScene";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SetingView extends MyComponent {

    @property(cc.Sprite)
    head_icon: cc.Sprite = null

    @property(cc.Label)
    ttf_name: cc.Label = null

    @property(cc.Label)
    id: cc.Label = null

    @property(cc.Node)
    effect_on_node: cc.Node = null

    @property(cc.Node)
    effect_off_node: cc.Node = null

    @property(cc.Node)
    music_on_node: cc.Node = null

    @property(cc.Node)
    music_off_node: cc.Node = null

    @property(cc.Node)
    gonggao_node: cc.Node = null

    onLoad () {
        // this.listen("change_name", this.setName, this)
    }

    start () {
        this.id.string = this._user.getUID().toString()
        this.ttf_name.string = this._user.getLevel().toString();
        // this.setName()

        let effect_on = this._audio_manager.getEffectOn()
        this.effect_off_node.active = !effect_on
        this.effect_on_node.active = effect_on

        let music_on = this._audio_manager.getMusicOn()
        this.music_off_node.active = !music_on
        this.music_on_node.active = music_on

        let json = this._json_manager.getJsonData(this._json_name.NOTICE, 1)
        let validity_end = json["validity_end"]
        let end_time = Date.parse(new Date(validity_end).toString())
        if (Number(end_time) <= Number(Date.now())) {
            this.gonggao_node.active = false
        }else {
            this.gonggao_node.active = true
        }
    }

    private clickCopyID () {
        this._utils.webCopyString(this._user.getUID().toString());
        this._dialog_manager.showTipMsg("玩家ID已经复制到粘贴板");
    }

    private clickEffect () {
        if (this._audio_manager.getEffectOn()) {
            this._audio_manager.setEffctOn(false)
            this.effect_on_node.active = false
            this.effect_off_node.active = true
        }else {
            this._audio_manager.setEffctOn(true)
            this.effect_on_node.active = true
            this.effect_off_node.active = false
        }
        
    }

    private clickMusic () {
        if (this._audio_manager.getMusicOn()) {
            this._audio_manager.setMusicOn(false)
            this.music_on_node.active = false
            this.music_off_node.active = true
        }else {
            this._audio_manager.setMusicOn(true)
            this.music_on_node.active = true
            this.music_off_node.active = false
        }
    }

    private clickChangeName() {
        this._dialog_manager.openDialog(this._dialog_name.ChangeName)
    }

    private clickChangeHead() {
        this._dialog_manager.openDialog(this._dialog_name.ChangeHead)
    }

    private setName() {
        let str_name = UserDefault.getItem(User.getUID() + GameConstant.USER_NAME) || ""
        this.ttf_name.string = str_name
    }

    private clickQQ() {
        this._dialog_manager.openDialog(this._dialog_name.QQView)
    }

    private clearAccount () {
        this._guide_manager.setGuideMask(true);
        this._dialog_manager.closeAllDialogs();
        cc.director.preloadScene("Login", () => {
            cc.sys.localStorage.clear();
            ChangeScene.instance.setOnLineTime(0)
            // cc.sys.localStorage.setItem("LOAD_TRANS", 1);
            cc.director.loadScene("Login");
        });
    }

    private clickDuiHuanMa() {
        this._dialog_manager.openDialog(this._dialog_name.CodeView)
    }

    private clickGongGao() {
        this._dialog_manager.openDialog(this._dialog_name.GongGao)
    }

    // update (dt) {}
}
