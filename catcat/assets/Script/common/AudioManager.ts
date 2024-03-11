/*
 * 音频管理
 */
import ResourceManager from "./ResourceManager"
import { User } from "./User"

export default class AudioManager {
    public static _audio_name = {
        BACKGROUND_MUSIC: "audios/bgm",
        BUTTON: "audios/button",
        MERGE_APPEAR: "audios/appear",
        MERGE_THREE: "audios/bubble",
        MERGE_FIVE: "audios/compound1",
        MERGE_ORDER: "audios/order",
        MERGE_GOLD: "audios/gold",
        MERGE_GREAT: "audios/great",
        MERGE_UNLOCK: "audios/energy",
        MERGE2D: "audios/merge2d",
        FAC_UNLOCK: "audios/buildset",
        GET_ITEM: "audios/getitem",
        LEVEL_UP: "audios/levelup",
        MAIN_BUILD_YANHUA: "audios/mainbuild2",
        UNLOCK: "audios/unlock",
        TRANS_BG: "audios/trainbgm",
        TRANS_CAT: "audios/cat",
        NIUDANJI: "audios/niudanji",
        GONGXIHUODE: "audios/gongxihuode",
        ELF1: "audios/Elf1",
        CURRENCY: "audios/Currency",
        MERGE1: "audios/1",
        MERGE2: "audios/2",
        MERGE3: "audios/3",
        MERGE4: "audios/4",
        MERGE5: "audios/5",
        MERGE6: "audios/6",
        MERGE7: "audios/7",
        MERGE8: "audios/8",
        MERGE9: "audios/9",
    };
    private static _music_on: number = 1;
    private static _effect_on: number = 1;
    private static _bg_music_played: boolean = false;

    public static init () {
        // this._music_on = (cc.sys.localStorage.getItem("_music_on") != "0")? 1:0;
        this._music_on = (User.getItem("_music_on") != "0")? 1:0;
        // this._effect_on = (cc.sys.localStorage.getItem("_effect_on") != "0")? 1:0;
        this._effect_on = (User.getItem("_effect_on") != "0")? 1:0;
    }

    public static setMusicOn (on: boolean) {
        if (!!this._music_on != on) {
            this._music_on = on? 1:0;
            // cc.sys.localStorage.setItem("_music_on", this._music_on);    
            User.setItem("_music_on", this._music_on);    
            if (on) {
                this.playBackgroundMusic();
            }
            else {
                this.stopBackgroundMusic();
            }
        }
    }

    public static getMusicOn (): boolean {
        return !!this._music_on;
    }

    public static setEffctOn (on: boolean) {
        if (!!this._effect_on != on) {
            this._effect_on = on? 1:0;
            // cc.sys.localStorage.setItem("_effect_on", this._effect_on);
            User.setItem("_effect_on", this._effect_on);
        }
    }

    public static getEffectOn (): boolean {
        return !!this._effect_on;
    }

    public static playClickEffect () {
        this.playEffect(this._audio_name.BUTTON, false, 1);
    }

    public static playBackgroundMusic () {
        if (this._music_on && !this._bg_music_played) {
            cc.audioEngine.setMusicVolume(1);
            ResourceManager.getAudioClip(this._audio_name.BACKGROUND_MUSIC).then((clip) => {
                this._bg_music_played = true;
                cc.audioEngine.playMusic(clip, true);
            });
        }
    }

    public static playTransBackgroundMusic () {
        this._bg_music_played = false;
        if (this._music_on) {
            cc.audioEngine.setMusicVolume(1);
            ResourceManager.getAudioClip(this._audio_name.TRANS_BG).then((clip) => {
                cc.audioEngine.playMusic(clip, true);
            });
        }
    }

    public static stopBackgroundMusic () {
        this._bg_music_played = false;
        cc.audioEngine.stopMusic();
        cc.audioEngine.setMusicVolume(0);
    }

    public static playEffect (url: string, loop: boolean = false, volume: number = 1) {
        if (this._effect_on) {
            ResourceManager.getAudioClip(url).then((clip) => {
                cc.audioEngine.play(clip, loop, volume);
            });
        }
    }
}
