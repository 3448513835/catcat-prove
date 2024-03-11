import MyComponent from "../common/MyComponent";
import { User } from "../common/User";
import MapGridView from "../main/MapGridView";
import FacCanLockView from "./FacCanLockView";
import FacLockView from "./FacLockView";
import RoomMgr from "./RoomMgr";


const {ccclass, property} = cc._decorator;

@ccclass
export default class BuildBubble extends MyComponent {

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    num: cc.Label = null

    @property(cc.Animation)
    ani: cc.Animation = null

    @property(cc.Node)
    guide_item11: cc.Node = null

    @property(cc.Node)
    guide_item18: cc.Node = null

    private roomId: number = null
    private facId: number = null
    private isRoom: boolean = false

    private sceneRubbishId: number = null

    private sceneBuildId: number = null
    private sceneBuildLockId: number = null
    private sceneBuildConfig: object = null

    private fish_need_num: number = 0

    onLoad () {
        this.ani.on("finished", () => {
            let ani_name = this.ani.currentClip.name
            if (ani_name == "jiesuoqipao") {
                this.ani.play("jiesuoqipao2")
            }
        })
    }

    start () {

    }

    init(roomId: number, facId: number, isRoom: boolean) {
        this.roomId = roomId
        this.facId = facId
        this.isRoom = isRoom

        if (isRoom) {
            let json = this._json_manager.getJsonData(this._json_name.ROOM, this.roomId)
            let unlock_cost = json["unlock_cost"]
            let arr = unlock_cost.split(":")
            let cost_data = {
                id: arr[0],
                num: arr[1]
            }
            this.num.string = "x" + cost_data["num"]
            let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
            this._utils.setSpriteFrame(this.icon, `pic/icon/${json_item["icon"]}`)

            this.fish_need_num = Number(cost_data["num"])
        }
        else {
            let json = this._json_manager.getJsonData(this._json_name.FACILITY, this.facId)
            let unlock_cost = json["unlock_cost"]
            let arr = unlock_cost.split(":")
            let cost_data = {
                id: arr[0],
                num: arr[1]
            }
            this.num.string = "x" + cost_data["num"]
            let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
            this._utils.setSpriteFrame(this.icon, `pic/icon/${json_item["icon"]}`)

            this.fish_need_num = Number(cost_data["num"])
        }

        this.ani.play("jiesuoqipao")

        if (this.facId == 1003) {
            this.guide_item11.active = true
        }
        else if (this.facId == 1004) {
            this.guide_item18.active = true
        }
    }

    getRoomId() {
        return this.roomId
    }

    getFacId() {
        return this.facId
    }

    getIsRoom() {
        return this.isRoom
    }

    // click() {
    //     if (this.sceneBuildId) {
    //         this.popSceneBuildView()
    //     }
    //     else {
    //         if (this.isRoom) {
    //             let json_mission = this._json_manager.getJson(this._json_name.MISSION)
    //             let need_misson_data = null
    //             for (const key in json_mission) {
    //                 if (Object.prototype.hasOwnProperty.call(json_mission, key)) {
    //                     const data = json_mission[key]
    //                     if (data["unlock"] == this.roomId) {
    //                         need_misson_data = data
    //                         break
    //                     }
    //                 }
    //             }
    
    //             if (need_misson_data) {
    //                 let level = need_misson_data["level"]
    //                 if (User.getLevel() >= level) {
    //                     this.popView1()
    //                 }else {
    //                     this.popView2(level)
    //                 }
    //             }
    //         }else {
    //             this.popView1()
    //         }
    //     }
    // }

    // private popView1() {
    //     cc.resources.load("prefabs/builds/FacCanLockView", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
    //         if (!err) {
    //            let node = cc.instantiate(prefab)
    //            let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
    //            parent.addChild(node)

    //            let script = node.getComponent(FacCanLockView)
    //            script.init(this.roomId, this.facId, this.isRoom)
    //         }
    //     })
    // }

    // private popView2(lv: number) {
    //     cc.resources.load("prefabs/builds/FacLockView", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
    //         if (!err) {
    //            let node = cc.instantiate(prefab)
    //            let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
    //            parent.addChild(node)

    //            let script = node.getComponent(FacLockView)
    //            script.init(this.roomId, this.facId, this.isRoom, lv)
    //         }
    //     })
    // }

    initSceneBuild(buildId: number, config: object, lockId: number) {
        this.sceneBuildId = buildId
        this.sceneBuildLockId = lockId
        this.sceneBuildConfig = config
        if (config) {
            let consume_item = config["consume_item"]
            let arr = consume_item.split(":")
            let cost_data = {
                id: arr[0],
                num: arr[1]
            }
            this.num.string = "x" + cost_data["num"]
            let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
            this._utils.setSpriteFrame(this.icon, `pic/icon/${json_item["icon"]}`)

            this.fish_need_num = Number(cost_data["num"])
        }

        this.ani.play("jiesuoqipao")
    }

    initSceneRubbish(rubbishId: number) {
        this.sceneRubbishId = rubbishId
        let config = this._json_manager.getJsonData(this._json_name.SCENE_RUBBISH, rubbishId)
        if (config) {
            let consume_item = config["cost"]
            let arr = consume_item.split(":")
            let cost_data = {
                id: arr[0],
                num: arr[1]
            }
            this.num.string = "x" + cost_data["num"]
            let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
            this._utils.setSpriteFrame(this.icon, `pic/icon/${json_item["icon"]}`)

            this.fish_need_num = Number(cost_data["num"])
        }

        this.ani.play("jiesuoqipao")
    }

    // private popSceneBuildView() {
    //     cc.resources.load("prefabs/builds/FacCanLockView", cc.Prefab, (err: Error, prefab: cc.Prefab) => {
    //         if (!err) {
    //            let node = cc.instantiate(prefab)
    //            let parent = cc.find("Canvas/Dialogs", cc.director.getScene())
    //            parent.addChild(node)

    //            let script = node.getComponent(FacCanLockView)
    //            script.initSceneBuild(this.sceneBuildId, this.sceneBuildConfig, this.sceneBuildLockId)
    //         }
    //     })
    // }

    public getSceneRubbishId() {
        return this.sceneRubbishId
    }

    public getSceneBuildId() {
        return this.sceneBuildId
    }

    public getSceneBuildLockId() {
        return this.sceneBuildLockId
    }

    public getSceneBuildConfig() {
        return this.sceneBuildConfig
    }

    public getNeedFishNum() {
        return this.fish_need_num
    }
}
