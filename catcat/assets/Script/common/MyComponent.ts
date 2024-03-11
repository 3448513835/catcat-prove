/*
 * 通用component
 */
import EventManager from "./EventManager"
import ResourceManager from "./ResourceManager"
import DialogManager from "./DialogManager"
import AudioManager from "./AudioManager"
import NetManager from "./NetManager"
import { Config } from "./Config"
import { User } from "./User"
import MaskDialog from "./MaskDialog"
import Utils from "./Utils"
import { i18nMgr } from "../i18n/i18nMgr"
import JsonAsset from "./JsonManager"
import AdManager from "./AdManager"
import GuideManager from "./GuideManager"

const { ccclass, property } = cc._decorator;
@ccclass
export default class MyComponent extends cc.Component {
    protected _event_manager = EventManager;
    protected _event_name = EventManager._event_name;
    protected _resource_manager = ResourceManager;
    protected _dialog_manager = DialogManager;
    protected _dialog_name = DialogManager._dialog_name;
    protected _audio_manager = AudioManager;
    protected _audio_name = AudioManager._audio_name;
    protected _config = Config;
    protected _user = User;
    protected _i18nmgr = i18nMgr;
    protected _net_manager = NetManager;
    protected _utils = Utils;
    protected _json_manager = JsonAsset;
    protected _json_name = JsonAsset._json_name;
    protected _ad_manager = AdManager;
    protected _guide_manager = GuideManager;

    private _sprite_list = {};
    private _event_list = {};

    protected addSpriteFrameRef (sprite_frame: cc.SpriteFrame) {
        // @ts-ignore
        let uuid = sprite_frame._uuid;
        this._sprite_list[uuid] = sprite_frame;
        sprite_frame.addRef();
    }

    protected getDialogData (): any {
        return this.node.parent.getComponent(MaskDialog).getData();
    }

    protected listen (event_name: string, fn: Function, target: cc.Component) {
        if (this._event_list[event_name]) {
            cc.error(`${target.name} listen`, event_name);
        }
        else {
            // console.warn(`${target.name} listen`, event_name);
            this._event_list[event_name] = target;
            EventManager.listen(event_name, fn, target);
        }
    }

    protected unlisten (event_name: string) {
        if (this._event_list[event_name]) {
            EventManager.remove(event_name, this._event_list[event_name]);
            delete this._event_list[event_name];
        }
    }

    protected close () {
        let dialog_cfg = this.node.parent.getComponent(MaskDialog).getDialogCfg();
        if (!dialog_cfg.hasOwnProperty("animal") || dialog_cfg.animal == 1) {
            this.node.parent.getComponent(MaskDialog).playCloseAnimal(this.node);
        }
        else if (dialog_cfg.animal == 2 || dialog_cfg.animal == 3) {
            this.node.parent.getComponent(MaskDialog).playCloseAnimal2(this.node);
        }
        else {
            this._dialog_manager.closeDialog(dialog_cfg);
        }
    }

    onDestroy () {
        /* for (let key in this._sprite_list) {
            let value: cc.SpriteFrame = this._sprite_list[key];
            value.decRef();
            if (value.refCount == 0) {
                cc.assetManager.releaseAsset(value);
            }
        } */
        for (let event_name in this._event_list) {
            let target = this._event_list[event_name];
            // console.warn(`${target.name} remove`, event_name, target);
            EventManager.remove(event_name, target);
        }
    }
}
