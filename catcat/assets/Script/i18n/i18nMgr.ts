import * as i18nLabel from "./i18nLabel";
import * as i18nSprite from "./i18nSprite";
import { LanguageType } from "../common/Config"

export class i18nMgr {
    private static language = LanguageType.CHINESE;     // 当前语言
    private static labelArr: i18nLabel.i18nLabel[] = [];        // i18nLabel 列表
    private static labelData: { [key: string]: string } = {};   // 文字配置
    private static spriteArr: i18nSprite.i18nSprite[] = [];       // i18nSprite 列表

    public static init (language: LanguageType, json_asset: cc.JsonAsset) {
        this.labelData = json_asset.json;
        this.setLanguage(language);
    }

    public static getTextById (id: number): string  {
        return this.labelData[id][this.language];
    }

    /**
     * 设置语言
     */
    public static setLanguage(language: LanguageType) {
        if (this.language === language) { return; }
        this.language = language;
        this.reloadLabel();
        // this.reloadSprite();
    }

    /**
     * 添加或移除 i18nLabel
     */
    public static _addOrDelLabel(label: i18nLabel.i18nLabel, isAdd: boolean) {
        if (isAdd) {
            this.labelArr.push(label);
        } 
		else {
            let index = this.labelArr.indexOf(label);
            if (index !== -1) {
                this.labelArr.splice(index, 1);
            }
        }
    }

    public static _getLabel(opt: string, params?: string[]): string {
        // console.log("opt", opt);
        if (!params || params.length === 0) {
            return this.labelData[opt][this.language] || opt;
        }
        let str = this.labelData[opt][this.language] || opt;
        for (let i = 0; i < params.length; i++) {
            let reg = "{"+i+"}";
            str = str.replace(reg, params[i]);
        }
        return str;
    }


    /**
     * 添加或移除 i18nSprite
     */
    public static _addOrDelSprite(sprite: i18nSprite.i18nSprite, isAdd: boolean) {
        if (isAdd) {
            this.spriteArr.push(sprite);
        } else {
            let index = this.spriteArr.indexOf(sprite);
            if (index !== -1) {
                this.spriteArr.splice(index, 1);
            }
        }
    }

    public static _getSprite(path: string, cb: (spriteFrame: cc.SpriteFrame) => void) {
        cc.resources.load("i18n/sprite/" + this.language + "/" + path, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                return cb(null);
            }
            cb(spriteFrame);
        });
    }


    private static reloadLabel() {
        for (let one of this.labelArr) {
            one._resetValue();
        }
    }

    private static reloadSprite() {
        for (let one of this.spriteArr) {
            one._resetValue();
        }
    }

}
