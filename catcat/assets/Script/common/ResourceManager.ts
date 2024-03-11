/*
 * 资源管理
 */
const bundle_name_list = ["reconnect", "merge", "merge2d", "main_scene", "audios", "jsons", "task", "train", "travel", "mail", "pokedex", "sevenday", "shop", "new_gift"];
export default class ResourceManager {
    private static bundle_list = new Map<string, cc.AssetManager.Bundle>;

    public static loadBundle (bundle_name: string): Promise<cc.AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            if (this.bundle_list[bundle_name]) {
                resolve(this.bundle_list[bundle_name]);
            }
            else {
                cc.assetManager.loadBundle(bundle_name, (err, bundle) => {
                    if (!err) {
                        this.bundle_list[bundle_name] = bundle;
                        resolve(bundle);
                    }
                    else {
                        console.error(err);
                        reject(null);
                    }
                });
            }
        });
    }

    public static hasBundle (bundle_name: string): cc.AssetManager.Bundle {
        return this.bundle_list[bundle_name];
    }

    public static getPrefab (url: string): Promise<cc.Prefab> {
        return this.get(url, cc.Prefab);
        // return new Promise((resolve, reject) => {
        //     let dir = url.split("/");
        //     if (bundle_name_list.indexOf(dir[0]) != -1) {
        //         let bundle_name = dir.shift();
        //         let prefab_url = dir.join("/");
        //         this.loadBundle(bundle_name).then((bundle) => {
        //             bundle.load(prefab_url, cc.Prefab, null, (err, prefab) => {
        //                 if (err) {
        //                     console.error(err);
        //                     reject(prefab);
        //                 }
        //                 else {
        //                     resolve(prefab as cc.Prefab);
        //                 }
        //             });
        //         });
        //     }
        //     else {
        //         cc.resources.load(url, cc.Prefab, null, (err, prefab) => {
        //             if (err) {
        //                 console.error(err);
        //                 reject(prefab);
        //             }
        //             else {
        //                 resolve(prefab as cc.Prefab);
        //             }
        //         });
        //     }
        // });
    }

    public static getAudioClip (url: string): Promise<cc.AudioClip> {
        return this.get(url, cc.AudioClip);
    }

    public static getJsonAsset (url: string): Promise<cc.JsonAsset> {
        return this.get(url, cc.JsonAsset);
    }

    public static get (url: string, type: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let dir = url.split("/");
            if (bundle_name_list.indexOf(dir[0]) != -1) {
                let bundle_name = dir.shift(), res_url = dir.join("/");
                this.loadBundle(bundle_name).then((bundle) => {
                    let res = bundle.get(res_url, type);
                    if (cc.isValid(res)) {
                        resolve(res);
                    }
                    else {
                        bundle.load(res_url, type, null, (err, res) => {
                            if (err) {
                                console.error(err);
                                reject(res);
                            }
                            else {
                                resolve(res);
                            }
                        });
                    }
                });
            }
            else {
                let res = cc.resources.get(url, type);
                if (cc.isValid(res)) {
                    resolve(res);
                }
                else {
                    cc.resources.load(url, type, null, (err, res) => {
                        if (err) {
                            console.error(err);
                            reject(res);
                        }
                        else {
                            resolve(res);
                        }
                    });
                }
            }
        });
    }

    public static getSpriteFrame (url: string): Promise<cc.SpriteFrame> {
        return this.get(url, cc.SpriteFrame);
        // return new Promise((resolve, reject) => {
        //     let dir = url.split("/");
        //     if (bundle_name_list.indexOf(dir[0]) != -1) {
        //         this.loadBundle(dir[0]).then((bundle) => {
        //             let sprite_frame = bundle.get(url, cc.SpriteFrame);
        //             if (cc.isValid(sprite_frame)) {
        //                 resolve(sprite_frame as cc.SpriteFrame);
        //             }
        //             else {
        //                 bundle.load(dir[1]+"/"+dir[2], cc.SpriteFrame, null, (err, sprite_frame) => {
        //                     if (err) {
        //                         console.error(err);
        //                         reject(sprite_frame);
        //                     }
        //                     else {
        //                         resolve(sprite_frame as cc.SpriteFrame);
        //                     }
        //                 });
        //             }
        //         });
        //     }
        //     else {
        //         let sprite_frame = cc.resources.get(url, cc.SpriteFrame);
        //         if (cc.isValid(sprite_frame)) {
        //             resolve(sprite_frame as cc.SpriteFrame);
        //         }
        //         else {
        //             cc.resources.load(url, cc.SpriteFrame, null, (err, sprite_frame) => {
        //                 if (err) {
        //                     console.error(err);
        //                     reject(sprite_frame);
        //                 }
        //                 else {
        //                     resolve(sprite_frame as cc.SpriteFrame);
        //                 }
        //             });
        //         }
        //     }
        // });
    }

    public static getDragon (url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let dir = url.split("/");
            if (bundle_name_list.indexOf(dir[0]) != -1) {
                this.loadBundle(dir[0]).then((bundle) => {
                    bundle.loadDir(dir[1]+"/"+dir[2], null, (err, assets) => {
                        if (err) {
                            console.error(err);
                            reject(assets);
                        }
                        else {
                            resolve(assets);
                        }
                    });
                });
            }
            else {
                cc.resources.loadDir(url, (err, assets) => {
                    if(err || assets.length <= 0)  return;
                    if (err) {
                        console.error(err);
                        reject(assets);
                    }
                    else {
                        resolve(assets);
                    }
                });
            }
        });
    }
}
