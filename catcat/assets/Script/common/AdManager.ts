/*
 * 广告管理
 */
import { Config, MIAOZHICHENG_WX, MEISHIMIZHEN_WX, MAOQIU_WX } from "./Config"
import Utils from "./Utils"
import NetManager from "./NetManager"
import AudioManager from "./AudioManager"


export default class AdManager {
    private static _ad_callback: Function = null;
    private static _wx_video_short: RewardedVideoAd = null;
    private static _wx_video: RewardedVideoAd = null;
    private static _wx_banner: BannerAd = null;
    private static _tt_video = null;

    public static init () {
        if (!Config.Advertise) { return; }
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            // @ts-ignore
            this._tt_video = tt.createRewardedVideoAd({
                adUnitId: "221o9ele578b10q7sa",
            });
            this._tt_video.onClose(
                (res) => {
                    if (res.isEnded) {
                        // do something
                    }
                    if (res.count) {
                        //在支持多例模式的版本上会返回该字段，并且是否返回该字段与multiton是否为true无关
                        //判断观看了几次广告
                        cc.warn("抖音广告video播放成功");
                        this.adRewardCallback(true);
                    }
                }
            );
        }
        else if (typeof(wx) != "undefined") {
            try {
                let ad_id = null;
                if (MIAOZHICHENG_WX) {
                    ad_id = "adunit-c831fca1cf084ff1";
                }
                else if (MEISHIMIZHEN_WX) {
                    ad_id = "adunit-90fe46eaba53cc94";
                }
                else if (MAOQIU_WX) {
                    ad_id = "adunit-da34cfdd56da7f27";
                }
                this._wx_video = wx.createRewardedVideoAd({ adUnitId: ad_id });
                this._wx_video.onLoad(() => { console.warn("微信广告video广告加载完成"); });
                this._wx_video.onError(() => { console.warn("微信广告video广告加载失败"); });
                this._wx_video.onClose(res => {
                    if (res && res.isEnded || res === undefined) { // 正常播放结束，可以下发游戏奖励
                        cc.warn("微信广告video播放成功");
                        this.adRewardCallback(true);
                    }
                    else { // 播放中途退出，不下发游戏奖励
                        cc.warn("微信广告video中途退出");
                    }
                });

            } catch(e) {}
        }
        else if (CC_JSB && cc.sys.os == cc.sys.OS_ANDROID) {
            try {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "adInit", "()V");
                setTimeout(() => {
                    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "loadAd", "()V");
                }, 1000);
            } catch(e) {}
        }

    }

    public static setAdCallback (fn: Function) {
        this._ad_callback = fn;
    }

    public static showAd () {
        if (!Config.Advertise) { return; }
        // @ts-ignore
        if (typeof(tt) != "undefined") {
            this._tt_video.show().then(() => {
                console.log("视频广告展示");
            });
        }
        else if (typeof(wx) != "undefined") {
            try {
                if (this._wx_video) {
                    this._wx_video.show().catch(err => {
                        this._wx_video.load().then(() => this._wx_video.show())
                    })
                }
                else {
                    console.log("微信广告video加载失败");
                }
            } catch(e) {}
        }
        else if (CC_JSB && cc.sys.os == cc.sys.OS_ANDROID) {
            let has_ad = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "hasAd", "()Z");
            if (has_ad) {
                console.log("有广告");
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "showAd", "()V");
            }
            else {
                console.log("没有广告");
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "loadAd", "()V");
            }
        }
        else {
            this.adRewardCallback(true);
        }
    }

    public static showBanner () {
        if (!Config.Advertise) { return; }
        try {
            if (typeof(wx) != "undefined" && !this._wx_banner) {
                this._wx_banner = wx.createBannerAd({ 
                    adUnitId: "adunit-5992dce7eff98e16",
                    adIntervals: 30,
                    // @ts-ignore
                    style: {
                        top: wx.getSystemInfoSync().windowHeight-105,
                        width: wx.getSystemInfoSync().windowWidth-100,
                        left: 50,
                    }
                });
                this._wx_banner.onLoad(() => { console.warn("微信广告banner加载成功"); });
                this._wx_banner.onError(() => { console.warn("微信广告banner加载失败"); });
                this._wx_banner.show();
            }
        } catch(e) {}
    }

    public static hideBanner () {
        if (!Config.Advertise) { return; }
        try {
            if (typeof(wx) != "undefined" && this._wx_banner) {
                cc.warn("隐藏微信banner广告");
                this._wx_banner.destroy();
                this._wx_banner = null;
            }
        } catch(e) {}
    }

    private static adRewardCallback (verify: boolean) {
        if (verify && this._ad_callback) {
            this._ad_callback();
            Utils.ttWatchVideo();
            if (CC_JSB && cc.sys.os == cc.sys.OS_ANDROID) {
                let has_ad = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "hasAd", "()Z");
                if (!has_ad) {
                    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "loadAd", "()V");
                }
            }
        }
        AudioManager.stopBackgroundMusic();
        AudioManager.playBackgroundMusic();
    }
}

window["AdManager"] = AdManager;

