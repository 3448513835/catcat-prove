/*
 * 窗口管理
 */
import EventManager                         from "./EventManager"
import { User }                             from "./User"
import MaskDialog                           from "./MaskDialog"
import JsonManager                          from "./JsonManager"
import AdManager                            from "./AdManager"
import { Config }                           from "./Config"
import ResourceManager                      from "./ResourceManager"

interface DialogCfg {
    prefab: string, // prefab路径
    action?: number, // 默认弹出动画
    mask?: boolean, // 默认黑色遮罩
    close?: boolean, // 默认点击关闭
    animal?: number, // 打开&关闭动画格式 0 无 1默认 2UI消失弹回 3UI消失+弹回 
    overlay?: number, // 相同时互相不能叠加
    banner?: boolean, // 是否含有banner广告
    zindex?: number, // 默认为0
};

export default class DialogManager {
    public static _dialog_name = {
        ReconnectDialog: { prefab: "reconnect/ReconnectDialog", close: false, },
        TipDialog: { prefab: "prefabs/common/TipDialog", close: false, },
        GoldTipDialog: { prefab: "prefabs/tips/GoldTipDialog", },
        HelpDialog: { prefab: "prefabs/help/HelpDialog", },

        MergeDialog: { prefab: "merge/MergeDialog", close: false, },
        MergeUnlockTipDialog: { prefab: "merge/MergeUnlockTipDialog", },
        MergeOrderDialog: { prefab: "merge/MergeOrderDialog", },
        MergeElementDialog: { prefab: "merge/MergeElementDialog", },
        MergeNewElementDialog: { prefab: "merge/MergeNewElementDialog", overlay: 1, },
        MergeShopDialog: { prefab: "merge/MergeShopDialog", },
        MergePackDialog: { prefab: "merge/MergePackDialog", },

        MergeDialog2d: { prefab: "merge2d/MergeDialog2d", close: false, },
        MergeUnlockTipDialog2d: { prefab: "merge2d/MergeUnlockTipDialog2d", },
        MergeOrderDialog2d: { prefab: "merge2d/MergeOrderDialog2d", },
        MergeElementDialog2d: { prefab: "merge2d/MergeElementDialog2d", },
        MergeNewElementDialog2d: { prefab: "merge2d/MergeNewElementDialog2d", overlay: 1, },
        MergeShopDialog2d: { prefab: "merge2d/MergeShopDialog2d", },
        MergePackDialog2d: { prefab: "merge2d/MergePackDialog2d", },
        MergeDailyRewardDialog: { prefab: "merge2d/MergeDailyRewardDialog", },

        TravelDialog: { prefab: "travel/TravelDialog", close: false, /* animal: 0, */ },
        TravelHelpDialog: { prefab: "travel/TravelHelpDialog", },
        TravelExploreDialog: { prefab: "travel/TravelExploreDialog", },
        TravelBoxDialog: { prefab: "travel/TravelBoxDialog", },

        ShopDialog: { prefab: "shop/ShopDialog" },

        GradeView: { prefab: "prefabs/grade/GradeView", },
        PowerView: { prefab: "prefabs/power/PowerView", },
        TaskView: { prefab: "task/TaskView", },
        
        VideoView: { prefab: "prefabs/video/VideoView", },

        SetingView: { prefab: "prefabs/seting/SetingView", },
        ChangeHead: { prefab: "prefabs/seting/ChangeHead", },
        ChangeName: { prefab: "prefabs/seting/ChangeName", },
        QQView: { prefab: "prefabs/seting/QQView", },
        CodeView: { prefab: "prefabs/seting/CodeView", },

        MainBuildUp: { prefab: "prefabs/builds/MainBuildUp", },
        SkinBuyView: { prefab: "prefabs/builds/SkinBuyView", },
        RoomShow: { prefab: "prefabs/rooms/RoomShow", close: false,},

        PokedexView: { prefab: "task/PokedexView", },
        PokedexCusInfo: { prefab: "task/PokedexCusInfo", },
        UnlockCusomer: { prefab: "task/UnlockCusomer", },

        SevenDay: { prefab: "sevenday/SevenDay", },
        EventGiftView: { prefab: "prefabs/eventgift/EventGiftView", },
        MailView: { prefab: "mail/MailView", },

        StoryDialog: { prefab: "main_scene/prefabs/guide/StoryDialog", close: false, overlay: 1, },
        RewardView: { prefab: "prefabs/reward/RewardView", overlay: 2, },

        NewGift: { prefab: "new_gift/NewGift", },
        DialyAd: { prefab: "new_gift/DialyAd", },
        WelfareCenter: { prefab: "new_gift/WelfareCenter", },
        NiuDan: { prefab: "new_gift/NiuDan" },
        MonthCard: { prefab: "prefabs/monthcard/MonthCard" },

        EntrustView: { prefab: "prefabs/entrust/EntrustView", close: false, },
        
        GameCenter: { prefab: "prefabs/gamecenter/GameCenter", },
        PickView: { prefab: "prefabs/gamecenter/PickView", },
        PickReviveView: { prefab: "prefabs/gamecenter/PickReviveView", close: false, },
        PickResultView: { prefab: "prefabs/gamecenter/PickResultView", },

        PrivacyDialog: { prefab: "prefabs/player/PrivacyDialog", },
        AgreenmentDialog: { prefab: "prefabs/player/AgreenmentDialog", },

        OnLineLayer: { prefab: "prefabs/online/OnLineLayer", },

        GongGao: { prefab: "prefabs/gonggao/GongGao", },
    };
    private static _dialog_list = {};
    private static _mask_dialog: cc.Prefab = null;
    private static _back_close_list = [];
    private static _overlay_msg: any[] = [];

    public static init (mask_dialog?: cc.Prefab) {
        if (mask_dialog) {
            this._mask_dialog = mask_dialog;
        }
        else {
            cc.resources.load("prefabs/common/MaskDialog", (err: Error, prefab: cc.Prefab) => {
                if (!err) { this._mask_dialog = prefab; }
            });
        }
        /* setInterval(() => {
            console.log(cc.assetManager.assets.count);
        }, 1000); */
    }

    /**
     * 打开界面
     * param prefab_url prefab路径(component名与prefab一致)
     * param dialog_data 传递的数据
     * param mount 挂载点
     * param callback 回掉
     */
    public static openDialog (dialog_cfg: DialogCfg, dialog_data?: any, mount?: cc.Node, callback?: Function) {
        if (dialog_cfg.overlay && this.hasOverlayDialog(dialog_cfg.overlay)) {
            this._overlay_msg.push({ dialog_cfg: dialog_cfg, dialog_data: dialog_data, mount: mount, callback: callback, });
            return;
        }
        if (this._dialog_list[dialog_cfg.prefab]) {
            console.error(`${dialog_cfg.prefab}已经存在`);
            return;
        }
        this._dialog_list[dialog_cfg.prefab] = true; // 占位
        console.warn(`打开 ${dialog_cfg.prefab}`);
        if (!mount) { mount = cc.find("Canvas/Dialogs", cc.director.getScene()); }
        if (cc.isValid(mount) && this._mask_dialog) {
            ResourceManager.getPrefab(dialog_cfg.prefab).then((prefab) => {
                if (cc.isValid(mount)) {
                    let node = cc.instantiate(prefab);
                    if (dialog_cfg.zindex) { node.zIndex = dialog_cfg.zindex; }
                    let mask_dialog = cc.instantiate(this._mask_dialog);
                    mask_dialog.getComponent(MaskDialog).init(dialog_data, mount, node, dialog_cfg, prefab);
                    this._dialog_list[dialog_cfg.prefab] = mask_dialog;
                    this._back_close_list.push(mask_dialog);
                    callback && callback(node);
                    if (dialog_cfg.banner) { AdManager.showBanner(); }
                }
                else {
                    this._dialog_list[dialog_cfg.prefab] = null;
                    // cc.error(err);
                }
            });
        }
    }

    private static hasOverlayDialog (overlay: number): boolean {
        for (let key in this._dialog_name) {
            let value = this._dialog_name[key];
            if (value.overlay == overlay && this.hasDialog(value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 关闭界面
     * param node 打开的界面
     */
    public static closeDialog (dialog_cfg: DialogCfg) {
        let node: cc.Node = this._dialog_list[dialog_cfg.prefab];
        if (cc.isValid(node)) {
            node.destroy();
            this._dialog_list[dialog_cfg.prefab] = null;
        }
        let index = this._back_close_list.indexOf(node);
        if (index != -1) {
            this._back_close_list.splice(index, 1);
        }
        if (dialog_cfg.overlay && this._overlay_msg.length > 0) {
            for (let i = this._overlay_msg.length-1; i >= 0; --i) {
                let msg = this._overlay_msg[i];
                if (msg.dialog_cfg.overlay == dialog_cfg.overlay) {
                    this._overlay_msg.splice(i, 1);
                    this.openDialog(msg.dialog_cfg, msg.dialog_data, msg.mount, msg.callback);
                    break;
                }
            }
        }
        let has_banner = false;
        for (let key in this._dialog_list) {
            let value = this._dialog_list[key];
            if (!cc.isValid(value) || typeof(value) != typeof({})) { continue; }
            let mask: MaskDialog = value.getComponent(MaskDialog);
            if (mask.getDialogCfg().banner) {
                has_banner = true; break;
            }
        }
        if (has_banner) { AdManager.showBanner(); }
        else { AdManager.hideBanner(); }
    }

    public static closeAllDialogs (except_cfg?: DialogCfg) {
        for (let key in this._dialog_list) {
            if (except_cfg && key == except_cfg.prefab) { continue; }
            let node = this._dialog_list[key];
            if (cc.isValid(node) && typeof(node) == typeof({})) {
                node.destroy();
                this._dialog_list[key] = null;
            }
            else {
                delete this._dialog_list[key];
            }
            let index = this._back_close_list.indexOf(node);
            if (index != -1) {
                this._back_close_list.splice(index, 1);
            }
        }
        AdManager.hideBanner();
    }

    public static hasDialog (dialog_cfg?: DialogCfg): boolean {
        if (dialog_cfg) {
            return cc.isValid(this._dialog_list[dialog_cfg.prefab]);
        }
        else {
            for (let key in this._dialog_list) {
                if (cc.isValid(this._dialog_list[key])) {
                    return true;
                }
            }
        }

        return false;
    }

    public static getDialog (dialog_cfg: DialogCfg): cc.Node {
        let node: cc.Node = this._dialog_list[dialog_cfg.prefab];
        if (cc.isValid(node)) {
            return node;
        }
        return null;
    }

    /**
     * 显示提示
     */
    public static showTipMsg (msg: string) {
        // if (!msg) { msg = "出错啦！"; }
        if (msg) {
            EventManager.dispatch(EventManager._event_name.EVENT_SHOW_TIP, { msg: msg, });
        }
    }

    /**
     * 打开提示界面
     */
    public static openTipDialog (content: string, confirm_fn?: Function, cancel_fn?: Function, confirm_msg?: string, cancel_msg?: string) {
        this.openDialog(this._dialog_name.TipDialog, {
            content: content,
            confirm_fn: confirm_fn,
            cancel_fn: cancel_fn,
            confirm_msg: confirm_msg,
            cancel_msg: cancel_msg,
        });
    }

    public static openReconnectDialog (content: string, confirm_fn?: Function, cancel_fn?: Function, confirm_msg?: string, cancel_msg?: string) {
        this.openDialog(this._dialog_name.ReconnectDialog, {
            content: content,
            confirm_fn: confirm_fn,
            cancel_fn: cancel_fn,
            confirm_msg: confirm_msg,
            cancel_msg: cancel_msg,
        }, cc.director.getScene().getChildByName("Canvas"));
    }

    /**
     * 打开帮助界面 id读表text
     */
    public static openHelpDialog (id: number) {
        this.openDialog(this._dialog_name.HelpDialog, { id: id });
    }

    public static openGoldTipDialog (need_gold: number) {
        this.openDialog(this._dialog_name.GoldTipDialog, {
            need_gold: need_gold,
        });
    }

    public static onKeyBack () {
        if (this._back_close_list.length > 0 && !Config.guide) {
            let node = this._back_close_list.pop();
            if (cc.isValid(node)) {
                let dialog_cfg: DialogCfg = node.getComponent(MaskDialog).getDialogCfg();
                if (!dialog_cfg.hasOwnProperty("animal") || dialog_cfg.animal == 1) {
                    node.getComponent(MaskDialog).playCloseAnimal();
                }
                else if (dialog_cfg.animal == 2 || dialog_cfg.animal == 3) {
                    node.getComponent(MaskDialog).playCloseAnimal2();
                }
                else {
                    DialogManager.closeDialog(dialog_cfg);
                }
            }
        }
    }

    /**
     * 跳转界面
     */
    public static jumpToDialog (id: number, data?: any) {
    }

    /**
     * 是否有打开的窗口
     */
    public static isHaveOpenDialog() {
        if (Object.keys(this._dialog_list).length > 0) {
            return true
        }else {
            return false
        }
    }

    public static removeDialogFromDialogList(dialog_cfg: DialogCfg) {
        delete this._dialog_list[dialog_cfg.prefab]
    }
}


export { DialogCfg, DialogManager };
