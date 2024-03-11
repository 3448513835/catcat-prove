import MyComponent from "../common/MyComponent";
import ResourceManager from "../common/ResourceManager";
import CustomerFindWay from "../customer/CustomerFindWay";
import MapGridView from "../main/MapGridView";
import BuildConfig from "./BuildConfig";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainBuild extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property([cc.SpriteFrame])
    icon_frames: cc.SpriteFrame[] = []

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null

    @property(dragonBones.ArmatureDisplay)
    dragonSmoke: dragonBones.ArmatureDisplay = null

    @property(cc.Node)
    map: cc.Node = null

    @property(cc.Node)
    cat_node: cc.Node = null

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null

    @property(cc.Label)
    progress_lv: cc.Label = null

    @property(cc.Label)
    progress_percent: cc.Label = null

    private cur_style: string = "0"
    private is_init: boolean = true

    onLoad() {
        this.listen(this._event_name.EVENT_SHOW_MAIN_BUILD_LV_UP, this.userLvUp, this)
        this.listen(this._event_name.EVENT_HIDE_WELCOME_CAT, this.setCatState, this)

        this.dragon.on(dragonBones.EventObject.COMPLETE, (a) => {
            if (this.dragon.animationName == "chuxian") {
                this.dragon.playAnimation("daiji", -1)

                this.dragonSmoke.node.active = true
                this.dragonSmoke.playAnimation("chuxian", 1)
                this._audio_manager.playEffect(this._audio_name.MAIN_BUILD_YANHUA)
            }
        })
        this.dragonSmoke.on(dragonBones.EventObject.COMPLETE, (a) => {
            this.dragonSmoke.node.active = false
            this._event_manager.dispatch(this._event_name.EVENT_SET_IS_CAN_CLICK_LV, true)
            this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEW_GIFT)

            this.clickCity()
        })

        let mapIndex = BuildConfig.room_zindex[0]
        this.node.zIndex = mapIndex
    }

    private checkNextStage() {
        let json = this._json_manager.getJson(this._json_name.PLAYER_LV)
        let list = []
        let temp_list = []
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                const item_data = json[key]
                let build_res = item_data["build_res"]
                if (build_res != "0" && build_res != this.cur_style && temp_list.indexOf(build_res) == -1 && item_data["level"] >= this._user.getLevel()) {
                    temp_list.push(build_res)
                    list.push(item_data)
                }
            }
        }

        return list
    }

    start() {
        this.userLvUp(true)
        if (this._user.getIsInitWelcomeCat()) {
            this.cat_node.active = true
            this._user.setIsInitWelcomeCat(false)
        }
    }

    private userLvUp(isInit?: boolean) {
        let cur_lv = this._user.getLevel()
        let json_config = this._json_manager.getJsonData(this._json_name.PLAYER_LV, cur_lv)
        let build_res = json_config["build_res"]
        if (build_res != this.cur_style) {
            if (isInit) {
                this.setStyle(build_res, isInit)
            } else {
                let pos_w = this.node.parent.convertToWorldSpaceAR(this.node.position)
                let pos1 = this.map.convertToNodeSpaceAR(pos_w)
                let func = () => {
                    // this._utils.setSpriteFrame(this.icon, `pic/fac/main_build/${build_res}`)
                    let time = isInit ? 0 : 0.5
                    this.scheduleOnce(() => {
                        this.setStyle(build_res, isInit)
                    }, time)
                }
                this._event_manager.dispatch(this._event_name.EVENT_MOVE_MAP_TO_POS, { pos: pos1, isNotMoment: true, callBack: func, need_scale: 0.8, node: this.icon.node })
                this._event_manager.dispatch(this._event_name.EVENT_SET_IS_CAN_CLICK_LV, false)
            }

            this.cur_style = build_res
        }
        else {
            this._event_manager.dispatch(this._event_name.EVENT_CHECK_NEW_GIFT)
        }

        this.setCityLv()
    }

    private setCityLv() {
        let cur_lv = this._user.getLevel()
        let json_config = this._json_manager.getJson(this._json_name.PLAYER_LV)

        let lv_list = this._utils.objectToArray(json_config)
        lv_list.sort((a, b) => {
            return a["level"] - b["level"]
        })
        let max_lv = lv_list[lv_list.length - 1]["level"]

        if (cur_lv >= max_lv) {
            this.progress.node.active = false
        } else {
            let total_exp = 0
            let cur_exp = 0
            for (const key in json_config) {
                if (Object.prototype.hasOwnProperty.call(json_config, key)) {
                    const item_data = json_config[key]
                    let build_res = item_data["build_res"]
                    let level = item_data["level"]
                    if (this.cur_style == build_res) {
                        let need_exp = item_data["need_exp"]
                        total_exp += need_exp

                        if (cur_lv > level) {
                            cur_exp += need_exp
                        }
                    }
                }
            }

            let percent = this._utils.formatNumToFixed(cur_exp / total_exp, 2)
            this.progress.progress = cur_exp / total_exp
            this.progress_lv.string = cur_lv.toString()
            
            let need_percent = Math.round(percent * 100)
            this.progress_percent.string = need_percent + "%"
        }
    }

    private clickCity() {
        let cur_lv = this._user.getLevel()
        let json_config = this._json_manager.getJsonData(this._json_name.PLAYER_LV, cur_lv)
        let next_list = this.checkNextStage()
        this._dialog_manager.openDialog(this._dialog_name.MainBuildUp, { cur_data: json_config, next_list: next_list })
    }

    private setStyle(style: string, isInit: boolean) {
        this.dragon.node.active = true
        this.icon.node.active = false
        let path = `main_scene/dragon/${style}`
        ResourceManager.getDragon(path).then((assets) => {
            assets.forEach(asset => {
                if (asset instanceof dragonBones.DragonBonesAsset) {
                    this.dragon.dragonAsset = asset;
                }
                if (asset instanceof dragonBones.DragonBonesAtlasAsset) {
                    this.dragon.dragonAtlasAsset = asset;
                }
            })

            this.dragon.armatureName = "Armature"
            if (isInit) {
                this.dragon.playAnimation("daiji", -1)
            } else {
                this.dragon.playAnimation("chuxian", 1)
            }
        })
    }

    private setCatState() {
        this.cat_node.active = false
    }

    // private change() {
    //     cc.resources.loadDir(data.dragon, (err, assets) => {
    //         if(err || assets.length <= 0)  return;
    //         assets.forEach(asset => {
    //             if(asset instanceof dragonBones.DragonBonesAsset){
    //                 this.dragon.dragonAsset = asset;
    //             }
    //             if(asset instanceof dragonBones.DragonBonesAtlasAsset){
    //                 this.dragon.dragonAtlasAsset  = asset;
    //             }
    //         });
    //         this.dragon.armatureName = "gongzuo";
    //         this.dragon.animationName = "newAnimation";
    //         this.playDingAnimal();
    //     });
    // }



    // update (dt) {}
}
