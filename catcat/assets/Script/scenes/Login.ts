/*
 * 登陆界面
 */
import { Config, UserDefault } from "../common/Config";
import GameConstant from "../common/GameConstant";
import MyComponent from "../common/MyComponent"

const CELL_HEIGHT = 180;
const CELL_WIDTH = 200;
const SPEED = 2;

const { ccclass, property } = cc._decorator;
@ccclass
export default class Login extends MyComponent {
    @property(cc.Node)
    private progress_node: cc.Node = null;
    @property(cc.Label)
    private percent_label: cc.Label = null;
    @property(cc.Node)
    private fish_node: cc.Node = null;
    @property(cc.Node)
    private foot_node: cc.Node = null;
    @property(cc.Node)
    private bg_node: cc.Node = null;
    @property(cc.Node)
    private clear_node: cc.Node = null;
    @property(cc.Prefab)
    private mask_prefab: cc.Prefab = null;

    @property(cc.Node)
    pro_node: cc.Node = null
    @property(cc.Node)
    login_btn: cc.Node = null
    @property(cc.Toggle)
    checkSelect: cc.Toggle = null
    @property(cc.Node)
    node_privacy: cc.Node = null
    @property(cc.Node)
    node_agreenment: cc.Node = null

    private percent: number = 0;

    private scene_loaded: boolean = false;
    private layout_height: number = null;
    private has_login: boolean = false;
    private bundle_load: boolean = false;
    private loaded_trans: boolean = false;

    onLoad() {
        if (this._config.clear && this._config.debug) { cc.sys.localStorage.clear(); }
        super.onLoad && super.onLoad();
        this.listen(this._event_name.SOCKET_LOGIN, this.onSocketLogin, this);
        this.listen("sdk_is_init", this.setSdkInit, this);
        if (!Config.isAndroidPay) {
            this.setOpenId();
        }
        this._json_manager.init();
        this._audio_manager.init();
        this._ad_manager.init();
        this._guide_manager.init();
        this._dialog_manager.init(this.mask_prefab);
        this.clear_node.active = this._config.debug;
        this._utils.wxReportScene(1001);
        this._utils.wxCheckUpdate();
        this._resource_manager.loadBundle("reconnect").then(() => {
            if (!Config.isAndroidPay) {
                this._net_manager.init();
            }
        });
        if (!Config.isAndroidPay) {
            this.login();
        }
        this._audio_manager.stopBackgroundMusic();

        this.login_btn.active = false
        this.checkSelect.node.active = Config.isAndroidPay
        this.node_privacy.active = Config.isAndroidPay
        this.node_agreenment.active = Config.isAndroidPay
        let isSelect = cc.sys.localStorage.getItem("protocol_is_select")
        if (!isSelect || isSelect == 0) {
            this.checkSelect.isChecked = false
        }else {
            this.checkSelect.isChecked = true
        }

        if (Config.isAndroidPay) {
            this.node.getChildByName("logo").active = false
        }
    }

    start() {
        let percent = 0;
        this.schedule(() => {
            if (typeof (wx) != "undefined") {
                percent += 1 / 60;
            }
            else {
                percent += 1 / 30;
            }
            if (percent >= 1) {
                percent = 1;
                this.percent = 1
            }
            this.percent_label.string = "加载中..." + Math.floor(percent * 100) + "%";
            this.progress_node.width = this.progress_node.children[0].width * percent;
            this.loadMainScene();
        }, 1 / 60);
        // @ts-ignore
        let guide_id = this._guide_manager.guide_id;
        if (guide_id == 0) {
            this._net_manager.requestTablog(this._config.statistic.ENTER_LOGIN_SCENE);
        }
        this.addFishAndFoot();
        this.loaded_trans = cc.sys.localStorage.getItem("LOAD_TRANS");
        if (!this.loaded_trans) {
            cc.sys.localStorage.setItem("LOAD_TRANS", 1);
        }
        // this.loaded_trans = true; // 跳过动画
        let _resource_manager = this._resource_manager,
            _net_manager = this._net_manager,
            _config = this._config,
            loaded_trans = this.loaded_trans;
        this._resource_manager.loadBundle(this.loaded_trans ? "main_scene" : "trans").then((bundle) => {
            if (guide_id == 0) {
                _net_manager.requestTablog(_config.statistic.LOAD_MAIN_SCENE);
            }
            cc.director.preloadScene(loaded_trans ? "Main" : "Trans", () => {
                if (!loaded_trans) {
                    _resource_manager.loadBundle("main_scene");
                }
            });
            this.bundle_load = true;

        });
        this._utils.wxShare();
        this._utils.ttShare();
    }

    private addFishAndFoot() {
        let count = Math.ceil(cc.visibleRect.height / CELL_HEIGHT);
        count += (count % 2 == 0) ? 4 : 5;
        let height = count * CELL_HEIGHT;
        for (let x = -2; x <= 2; ++x) {
            for (let y = 0; y < count; ++y) {
                let node = cc.instantiate((x % 2 == 0) ? this.fish_node : this.foot_node);
                node.parent = this.bg_node;
                node.setPosition(x * CELL_WIDTH, (y - (count - 1) / 2 - x % 2 / 2) * CELL_HEIGHT);
            }
        }
        this.layout_height = height;
    }

    private setOpenId() {
        let open_id = cc.sys.localStorage.getItem("OPEN_ID");
        if (!open_id) {
            open_id = Date.now() + Math.floor(1000 + 9000 * Math.random());
            cc.sys.localStorage.setItem("OPEN_ID", open_id)
        }
        this._user.setUID(open_id)
    }

    private login() {
        this._utils.ttLaunch();
        let clickid = cc.sys.localStorage.getItem("CLICKID");
        this._net_manager.login(this._user.getUID().toString(), clickid);
    }

    private onSocketLogin(data) {
        this._user.setUID(data.openid)
        this._guide_manager.init();
        // @ts-ignore
        let guide_id = this._guide_manager.guide_id;
        if (guide_id == 0) {
            this._net_manager.requestTablog(this._config.statistic.LOGIN_SUCCESS);
        }
        // cc.sys.localStorage.setItem("OPEN_ID", data.openid);
        this._user.setItem("OPEN_ID", data.openid);
        this.has_login = true;
        this._user.init(data);
        cc.director.loadScene(this.loaded_trans ? "Main" : "Trans");
    }

    private loadMainScene() {
        if (Config.isAndroidPay) {
            if (this.percent == 1 && !this.scene_loaded) {
                this.scene_loaded = true;
                this.pro_node.active = false
                this.login_btn.active = true
            }
        }
        else {
            if (this.has_login && this.bundle_load && !this.scene_loaded) {
                this.scene_loaded = true;
                cc.director.loadScene(this.loaded_trans ? "Main" : "Trans");
            }
        }
    }

    update() {
        let top = this.layout_height / 2;
        for (let node of this.bg_node.children) {
            node.y += SPEED;
            if (node.y >= top) { node.y = -top; }
        }
    }

    private tempClearLocalData() {
        cc.sys.localStorage.clear()
    }

    private setSdkInit(isInit) {
        if (this.percent == 1 && isInit) {
            this.login_btn.active = true
        }
    }

    private loginSdk() {
        if (!this.checkSelect.isChecked) {
            this._dialog_manager.showTipMsg("请勾选协议")
            return
        }
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            if (jsb) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utils", "sdkLogin", "()V");
            }
            if (typeof (wx) == "undefined") {
                this._ad_manager.init();
            }
        }
        this.login_btn.active = false
    }

    private clickProtocol() {
        let isSelect = this.checkSelect.isChecked ? 1: 0
        cc.sys.localStorage.setItem("protocol_is_select", isSelect)
    }

    private clickPrivacy() {
        this._dialog_manager.openDialog(this._dialog_name.PrivacyDialog)
    }

    private clickAgreement() {
        this._dialog_manager.openDialog(this._dialog_name.AgreenmentDialog)
    }

    private clickYearTip() {
        let str = "1、本游戏是一款模拟经营类游戏，适用于年满12周岁及以上的用户，建议未成年人在家长监护下使用游戏产品。\n2、本游戏中有用户实名认证系统，游戏中部分玩法和道具需要付费，认证为未成年人的用户将接受以下管理：\n未满12周岁未成年人禁止在游戏内消费；12周岁以上未满16周岁的未成年用户，单次充值金额不得超过50元人民币，每月充值金额累计不得超过200元人民币；16周岁以上的未成年人用户，单次充值金额不得超过100元人民币，每月充值金额累计不得超过400元人民币。\n根据国家相关要求，游戏中有用户实名认证系统，未通过实名认证的用户不可进入游戏。认证为未成年的用户除周五、周六、周日及法定节假日周日20时至21时外，其他时间均不可进入游戏。\n3、本游戏以通过种植获取原材料，然后制作零食，上架到货柜进行销售为主玩法，有助于锻炼玩家合理安排各游戏环节的时间，本游戏中无血腥、恐怖、色情等不良内容和画面，内容健康向上。综合游戏内容、内置消费点、游戏时长等因素，建议该游戏适龄级别为12+。"
        this._dialog_manager.openDialog(this._dialog_name.HelpDialog, {str: str})
    }
}
