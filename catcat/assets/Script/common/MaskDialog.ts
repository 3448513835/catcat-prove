/*
 * 遮罩层
 */
import { DialogManager, DialogCfg } from "./DialogManager"
import EventManager                 from "./EventManager"
import Utils                        from "./Utils"

const DURATION = 0.2;
const BLACK = 0;
const { ccclass, property } = cc._decorator;
@ccclass
export default class MaskDialog extends cc.Component {
    private _data: any = null;
    private _dialog_cfg: DialogCfg = null;
    private _dialog_node: cc.Node = null;
    private _prefab: cc.Prefab = null;

    onLoad () {
        EventManager.dispatch(EventManager._event_name.EVENT_HAND_TIP, { clear: true, });
    }

    public init (data, mount: cc.Node, child: cc.Node, dialog_cfg: DialogCfg, prefab: cc.Prefab) {
        this._data = data;
        this._dialog_cfg = Utils.clone(dialog_cfg);
        this._dialog_node = child;
        this._prefab = prefab;
        if (dialog_cfg.animal == 0) { 
            child.parent = this.node;
        }
        this.node.parent = mount;
        if (!dialog_cfg.hasOwnProperty("close") || dialog_cfg.close) {
            this.node.on(cc.Node.EventType.TOUCH_START, () => {
                if (!dialog_cfg.hasOwnProperty("animal") || dialog_cfg.animal == 1) {
                    this.playCloseAnimal(child);
                }
                else if (dialog_cfg.animal == 2 || dialog_cfg.animal == 3) {
                    this.playCloseAnimal2(child);
                }
                else {
                    DialogManager.closeDialog(this.getDialogCfg());
                }
            });
        }
        let mask_node = cc.find("Mask", this.node);
        if (!dialog_cfg.hasOwnProperty("mask") || dialog_cfg.mask) {
            mask_node.active = true;
        }
        if (!dialog_cfg.hasOwnProperty("animal") || dialog_cfg.animal == 1) {
            child.scale = 0.2;
            child.parent = this.node;
            cc.tween(child)
                .to(0.1, { scale: 1.1 })
                .to(0.1, { scale: 0.95 })
                .to(0.1, { scale: 1 })
                .call(() => {
                    EventManager.dispatch(EventManager._event_name.EVENT_OPENED_DIALOG, { dialog_cfg: dialog_cfg })
                })
                .start();
        }
        else if (dialog_cfg.animal == 2) {
            // EventManager.dispatch(EventManager._event_name.UI_ANIMAL, { duration: DURATION, black: BLACK, type: 1, });
            cc.tween(this.node)
                .delay(DURATION+BLACK)
                .call(() => {
                    child.parent = this.node;
                    EventManager.dispatch(EventManager._event_name.EVENT_OPENED_DIALOG, { dialog_cfg: dialog_cfg })
                })
                .start();
        }
        else if (dialog_cfg.animal == 3) {
            // EventManager.dispatch(EventManager._event_name.UI_ANIMAL, { duration: DURATION, black: BLACK, type: 2, });
            cc.tween(this.node)
                .delay(DURATION+BLACK)
                .call(() => {
                    child.parent = this.node;
                })
                .start();
        }
    }

    public getDialogCfg (): DialogCfg {
        return this._dialog_cfg;
    }

    public getData (): any {
        return this._data;
    }

    public playCloseAnimal (node?: cc.Node) {
        if (!node) { node = this._dialog_node; }
        cc.tween(node)
            .to(0.1, { scale: 1.1 })
            .to(0.1, { scale: 0.3 })
            .call(() => { 
                this._dialog_cfg.animal = 0;
                DialogManager.closeDialog(this._dialog_cfg); 
            })
            .start();
    }


    public playCloseAnimal2 (node?: cc.Node) {
        if (!node) { node = this._dialog_node; }
        if (this._dialog_cfg.animal == 2) {
            // EventManager.dispatch(EventManager._event_name.UI_ANIMAL, { duration: DURATION, black: BLACK, type: 1, });
        }
        else if (this._dialog_cfg.animal == 3) {
            // EventManager.dispatch(EventManager._event_name.UI_ANIMAL, { duration: DURATION,black: BLACK, type: 3, });
        }
        cc.tween(this.node)
            .to(DURATION, { scale: 1.1 })
            .delay(BLACK)
            .call(() => {
                this._dialog_cfg.animal = 0;
                DialogManager.closeDialog(this._dialog_cfg);
            })
            .start();
    }

    onDestroy () {
        /* if (cc.isValid(this._prefab)) {
            cc.assetManager.releaseAsset(this._prefab);
        } */
    }
}
export { DURATION, BLACK, MaskDialog }
