import TaskItem from "../../task/scripts/TaskItem";
import GameConstant from "../common/GameConstant";
import MyButton from "../common/MyButton";
import MyComponent from "../common/MyComponent";
import PackManager from "../common/PackManager";
import ChangeScene from "../main/ChangeScene";
import BuildConfig from "./BuildConfig";


const { ccclass, property } = cc._decorator;

@ccclass
export default class FacCanLockView extends MyComponent {

    @property(cc.Node)
    bg: cc.Node = null

    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Node)
    layoutItem: cc.Node = null

    @property(cc.Node)
    btn_buy: cc.Node = null

    @property(cc.Sprite)
    btn_buy_icon: cc.Sprite = null

    @property(cc.Label)
    btn_buy_num: cc.Label = null

    @property(cc.Node)
    btn_go: cc.Node = null

    @property(cc.Label)
    ttf_title: cc.Label = null

    @property(cc.Label)
    ttf_des: cc.Label = null

    @property(cc.Node)
    cus_tip: cc.Node = null

    private item_list: cc.Node[] = []

    private roomId: number = null
    private facId: number = null
    private isRoom: boolean = false
    private reward_list = []
    private buy_num: number = 0

    private sceneBuildId: number = null
    private sceneRubbishId: number = null
    private sceneBuildLockId: number = null
    private sceneBuildConfig: object = null

    private isCanClose: boolean = true

    onLoad() {
        this.node.height = cc.view.getVisibleSize().height
        this.node.width = cc.view.getVisibleSize().width

        this.listen(this._event_name.SOCKET_ROOM_UNLOCK_ROOM, this.unlockRoomFac, this)
        this.listen(this._event_name.SOCKET_ROOM_UNLOCK_FACILITY, this.unlockRoomFac, this)
        this.listen(this._event_name.SOCKET_ROOM_UNLOCK_UNIT, this.unlockRoomFac, this)
        this.listen(this._event_name.SOCKET_ROOM_CLEAN_RUBBISH, this.unlockRoomFac, this)
        this._event_manager.dispatch(this._event_name.EVENT_HAND_TIP, { clear: true, });
    }

    init(roomId: number, facId: number, isRoom: boolean) {
        this.roomId = roomId
        this.facId = facId
        this.isRoom = isRoom
        this.item_list = this.layoutItem.children
        if (isRoom) {
            this.setRoom()
        }
        else {
            this.setFac()
        }
    }

    private setFac() {
        let json = this._json_manager.getJsonData(this._json_name.FACILITY, this.facId)
        let icon = json["icon"]
        let des = json["des"]
        let name = json["name"]
        let reward = this._config.game_2d ? json["reward"] : json["reward_three"]
        let unlock_cost = json["unlock_cost"]

        this.setView(icon, des, unlock_cost, name, reward)
    }

    private setRoom() {
        let json = this._json_manager.getJsonData(this._json_name.ROOM, this.roomId)
        let icon = json["icon"]
        let des = json["des"]
        let name = json["name"]
        let reward = this._config.game_2d ? json["reward"] : json["reward_three"]
        let unlock_cost = json["unlock_cost"]

        this.setView(icon, des, unlock_cost, name, reward)
    }

    private setView(icon, des, unlock_cost, name, reward) {
        let task_item_data = null
        let task_json = this._json_manager.getJson(this._json_name.MISSION)
        if (this.isRoom) {
            this.ttf_title.string = `解锁${name}`
            for (const key in task_json) {
                if (Object.prototype.hasOwnProperty.call(task_json, key)) {
                    const item_data = task_json[key]
                    let unlock = item_data["unlock"]
                    if (unlock == this.roomId) {
                        task_item_data = item_data
                        break
                    }
                }
            }
        } else {
            for (const key in task_json) {
                if (Object.prototype.hasOwnProperty.call(task_json, key)) {
                    const item_data = task_json[key]
                    let unlock = item_data["unlock"]
                    if (unlock == this.facId) {
                        let name = item_data["name"]
                        this.ttf_title.string = name

                        task_item_data = item_data
                        break
                    }
                }
            }
        }

        if (task_item_data) {
            let new_customer = task_item_data["new_customer"]
            this.cus_tip.active = new_customer
        }

        this.ttf_des.string = des
        let path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[this.roomId]}/skin1/${icon}`
        this._utils.setSpriteFrame(this.icon, path)

        let reward_list = this.changeConfigData(reward)
        this.reward_list = reward_list
        let arr = unlock_cost.split(":")
        let cost_data = {
            id: arr[0],
            num: arr[1]
        }
        this.btn_buy_num.string = cost_data["num"]
        this.buy_num = Number(cost_data["num"])
        let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
        this._utils.setSpriteFrame(this.btn_buy_icon, `pic/icon/${json_item["icon"]}`)

        // let num = PackManager.getItemNumById(cost_data["id"])
        let num = this._user.getFish()
        if (num >= cost_data["num"]) {
            this.btn_buy.active = true
            this.btn_go.active = false
        } else {
            this.btn_buy.active = false
            this.btn_go.active = true
        }

        for (let i = 0; i < this.item_list.length; i++) {
            const item = this.item_list[i]
            let item_data = reward_list[i]

            if (item_data) {
                let item_id = item_data["item_id"]
                if (!GameConstant.customer_item_id_list.has(Number(item_id))) {
                    item.active = true
                    let item_num = item_data["item_num"]
                    let icon = item.getChildByName("Icon").getComponent(cc.Sprite)
                    let name = item.getChildByName("Name").getComponent(cc.Label)
                    let num = item.getChildByName("Num").getComponent(cc.Label)
                    num.string = item_num

                    name.string = this._utils.getItemNameById(item_id)
                    let path = this._utils.getItemPathById(item_id)
                    this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                        if (cc.isValid(icon)) {
                            icon.spriteFrame = sprite_frame
                            let item_type = this._utils.getItemTypeById(item_id)
                            if (item_type == 1) icon.node.scale = 0.3
                        }
                    })
                } else {
                    item.active = false
                }

            } else {
                item.active = false
            }
        }
    }

    private changeConfigData(config): any[] {
        let list = []
        let arr_list = config.split(",")
        for (let i = 0; i < arr_list.length; i++) {
            const element = arr_list[i]
            let arr = element.split(":")
            let data = {
                item_id: arr[0],
                item_num: arr[1]
            }
            list.push(data)
        }

        return list
    }

    start() {
        let height_half = cc.view.getVisibleSize().height / 2
        this.bg.y = -height_half - this.bg.height - 150
        let end_y = -height_half
        cc.tween(this.bg)
            .to(0.3, { y: end_y })
            .call(() => {
                let guide_id = this._guide_manager.getGuideId();
                if (guide_id == 10 || guide_id == 12 || guide_id == 19) {
                    cc.find("Bg/GuideItem", this.node).active = true;
                    this._guide_manager.triggerGuide();
                }
            })
            .start()
    }

    private click() {
        if (!this.isCanClose) return

        let height_half = cc.view.getVisibleSize().height / 2
        let end_y = -height_half - this.bg.height - 150
        cc.tween(this.bg)
            .to(0.2, { y: end_y })
            .call(() => {
                this.node.destroy()
            })
            .start()
    }

    private clickBtnBuy() {
        let func = () => {
            if (this.sceneBuildId) {
                this._net_manager.roomUnlockUnit(this.sceneBuildLockId)
                this._net_manager.requestChangeUserFish(-this.buy_num)
            }
            else if (this.sceneRubbishId) {
                this._net_manager.roomClearRubbish(this.sceneRubbishId)
                this._net_manager.requestChangeUserFish(-this.buy_num)
            }
            else {
                if (this.isRoom) {
                    this._net_manager.roomUnlockRoom(this.roomId)
                    this._net_manager.requestChangeUserFish(-this.buy_num)
                    // let data = {
                    //     reward: this.reward_list,
                    //     roomId: this.roomId
                    // }
                    // this._event_manager.dispatch(this._event_name.SOCKET_ROOM_UNLOCK_ROOM, data)
                }
                else {
                    this._net_manager.roomUnlockFacility(this.facId)
                    this._net_manager.requestChangeUserFish(-this.buy_num)
                    // let data = {
                    //     reward: this.reward_list,
                    //     roomId: this.roomId,
                    //     facilityId: this.facId
                    // }
                    // this._event_manager.dispatch(this._event_name.SOCKET_ROOM_UNLOCK_FACILITY, data)
                }
            }

            if (this.reward_list.length > 0) {
                for (let i = 0; i < this.reward_list.length; i++) {
                    const item_data = this.reward_list[i]
                    this._utils.addResNum(Number(item_data["item_id"]), Number(item_data["item_num"]))
                }
            }

            this.isCanClose = true
        }

        let pos_w = this.btn_buy.parent.convertToWorldSpaceAR(this.btn_buy.position)
        let data = {
            pos_w: pos_w,
            item_num: -this.buy_num,
            item_id: GameConstant.res_id.yugan,
            callBack: func
        }
        this._event_manager.dispatch(this._event_name.EVENT_UNLOCK_FAC_FISH_ANI, data)

        this.isCanClose = false
        this.btn_buy.getComponent(MyButton).enabled = false
    }

    private clickBtnGo() {
        let _resource_manager = this._resource_manager;
        let _guide_manager = this._guide_manager;
        let _config = this._config;
        let func = () => {
            let guide_id = _guide_manager.getGuideId();
            if (guide_id == 19) {
                _guide_manager.setGuideId(_guide_manager.GuideConfig[guide_id].next);
                _guide_manager.closeGuideDialog(guide_id);
                _guide_manager.setGuideMask(true);
            }
            var game_2d = _config.game_2d;
            _resource_manager.loadBundle(game_2d ? "merge2d" : "merge").then((bundle) => {
                cc.director.loadScene(game_2d ? "Merge2d" : "Merge");
            })
            if (cc.isValid(this)) {
                this.node.destroy()
            }
        }
        ChangeScene.instance.enter(func)
    }

    /**
     * 解锁设施
     */
    private unlockRoomFac(data) {
        // let reward = data["reward"]
        // let reward = this.reward_list

        // for (let i = 0; i < reward.length; i++) {
        //     const item_data = reward[i]
        //     let node = this.item_list[i]
        //     let pos_w = node.parent.convertToWorldSpaceAR(node.position)
        //     let data = {
        //         pos_w: pos_w,
        //         item_id: item_data["item_id"],
        //         item_num: item_data["item_num"],
        //     }
        //     this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, data)
        // }

        let guide_id = this._guide_manager.getGuideId();
        if (guide_id == 10 || guide_id == 12 || guide_id == 19) {
            this._guide_manager.setGuideId(this._guide_manager.GuideConfig[guide_id].next);
            this._guide_manager.closeGuideDialog(guide_id);
            this._guide_manager.setGuideMask(true);
        }
        /* if (guide_id == 12) {
            this._guide_manager.triggerGuide();
        } */

        this.checkEventGift()

        this.click()
    }

    private checkEventGift() {
        let id = null
        if (this.sceneBuildLockId) {
            id = this.sceneBuildLockId
        }
        else if (this.isRoom) {
            id = this.roomId
        }
        else {
            id = this.facId
        }
        if (id) {
            let json = this._json_manager.getJson(this._json_name.EVENT_GIFT)
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    const item_data = json[key]
                    if (item_data["event_type"] == 2) {
                        let event_value = item_data["event_value"]
                        if (event_value == id) {
                            this._event_manager.dispatch(this._event_name.EVENT_EVENT_GIFT_DATA, item_data)
                            break
                        }
                    }
                }
            }
        }
    }

    /**
     * 场景建筑
     */
    initSceneBuild(sceneBuildId, sceneBuildConfig, sceneBuildLockId) {
        this.sceneBuildId = sceneBuildId
        this.sceneBuildLockId = sceneBuildLockId
        this.sceneBuildConfig = sceneBuildConfig
        let unlock_cost = sceneBuildConfig["consume_item"]
        let arr = unlock_cost.split(":")
        let cost_data = {
            id: arr[0],
            num: arr[1]
        }

        this.btn_buy_num.string = cost_data["num"]
        this.buy_num = Number(cost_data["num"])
        let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
        this._utils.setSpriteFrame(this.btn_buy_icon, `pic/icon/${json_item["icon"]}`)

        let num = this._user.getFish()
        if (num >= cost_data["num"]) {
            this.btn_buy.active = true
            this.btn_go.active = false
        } else {
            this.btn_buy.active = false
            this.btn_go.active = true
        }

        let task_json = this._json_manager.getJson(this._json_name.MISSION)
        for (const key in task_json) {
            if (Object.prototype.hasOwnProperty.call(task_json, key)) {
                const item_data = task_json[key]
                let unlock = item_data["unlock"]
                if (unlock == this.sceneBuildLockId) {
                    let name = item_data["name"]
                    this.ttf_title.string = name
                    break
                }
            }
        }
        this.ttf_des.string = sceneBuildConfig["des"]
        let path = `pic/theme/fac/${BuildConfig.room_fac_icon_frames_name[sceneBuildId]}/${sceneBuildConfig["build_res"]}`
        this._utils.setSpriteFrame(this.icon, path)

        this.item_list = this.layoutItem.children
        let reward_list = this.changeConfigData(sceneBuildConfig["reward_item"])
        this.reward_list = reward_list
        for (let i = 0; i < this.item_list.length; i++) {
            const item = this.item_list[i]
            let item_data = reward_list[i]
            if (item_data) {
                let item_id = item_data["item_id"]
                if (!GameConstant.customer_item_id_list.has(Number(item_id))) {
                    item.active = true
                    let item_id = item_data["item_id"]
                    let item_num = item_data["item_num"]
                    let icon = item.getChildByName("Icon").getComponent(cc.Sprite)
                    let name = item.getChildByName("Name").getComponent(cc.Label)
                    let num = item.getChildByName("Num").getComponent(cc.Label)
                    let item_json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, item_id)
                    num.string = item_num
                    // name.string = item_json["name"]
                    // this._utils.setSpriteFrame(icon, `pic/icon/${item_json["icon"]}`)

                    name.string = this._utils.getItemNameById(item_id)
                    let path = this._utils.getItemPathById(item_id)
                    this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                        if (cc.isValid(icon)) {
                            icon.spriteFrame = sprite_frame
                            let item_type = this._utils.getItemTypeById(item_id)
                            if (item_type == 1) icon.node.scale = 0.3
                        }
                    })
                }
                else {
                    item.active = false
                }
            } else {
                item.active = false
            }
        }
    }
    /**
     * 场景垃圾
     */
    initSceneRubbish(sceneRubbishId) {
        this.sceneRubbishId = sceneRubbishId
        let config = this._json_manager.getJsonData(this._json_name.SCENE_RUBBISH, sceneRubbishId)
        let unlock_cost = config["cost"]
        let arr = unlock_cost.split(":")
        let cost_data = {
            id: arr[0],
            num: arr[1]
        }

        this.btn_buy_num.string = cost_data["num"]
        this.buy_num = Number(cost_data["num"])
        let json_item = this._json_manager.getJsonData(this._json_name.ITEM_BASE, cost_data["id"])
        this._utils.setSpriteFrame(this.btn_buy_icon, `pic/icon/${json_item["icon"]}`)

        let num = this._user.getFish()
        if (num >= cost_data["num"]) {
            this.btn_buy.active = true
            this.btn_go.active = false
        } else {
            this.btn_buy.active = false
            this.btn_go.active = true
        }

        let task_json = this._json_manager.getJson(this._json_name.MISSION)
        for (const key in task_json) {
            if (Object.prototype.hasOwnProperty.call(task_json, key)) {
                const item_data = task_json[key]
                let unlock = item_data["unlock"]
                if (unlock == this.sceneRubbishId) {
                    let name = item_data["name"]
                    this.ttf_title.string = name
                    break
                }
            }
        }
        this.ttf_des.string = config["des"]
        let path = `pic/scene_rubbish/${config["icon"]}`
        this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
            if (cc.isValid(this.icon)) {
                this.icon.spriteFrame = sprite_frame
                let scale = this._utils.getNeedSceleBySprite(this.icon, 180, 180)
                this.icon.node.scale = scale
            }
        })

        this.item_list = this.layoutItem.children
        let reward_list = this.changeConfigData(config["reward"])
        this.reward_list = reward_list
        for (let i = 0; i < this.item_list.length; i++) {
            const item = this.item_list[i]
            let item_data = reward_list[i]
            if (item_data) {
                let item_id = item_data["item_id"]
                if (!GameConstant.customer_item_id_list.has(Number(item_id))) {
                    item.active = true
                    let item_id = item_data["item_id"]
                    let item_num = item_data["item_num"]
                    let icon = item.getChildByName("Icon").getComponent(cc.Sprite)
                    let name = item.getChildByName("Name").getComponent(cc.Label)
                    let num = item.getChildByName("Num").getComponent(cc.Label)
                    let item_json = this._json_manager.getJsonData(this._json_name.ITEM_BASE, item_id)
                    num.string = item_num
                    // name.string = item_json["name"]
                    // this._utils.setSpriteFrame(icon, `pic/icon/${item_json["icon"]}`)

                    name.string = this._utils.getItemNameById(item_id)
                    let path = this._utils.getItemPathById(item_id)
                    this._resource_manager.getSpriteFrame(path).then((sprite_frame) => {
                        if (cc.isValid(icon)) {
                            icon.spriteFrame = sprite_frame
                            let item_type = this._utils.getItemTypeById(item_id)
                            if (item_type == 1) icon.node.scale = 0.3
                        }
                    })
                }
                else {
                    item.active = false
                }
            } else {
                item.active = false
            }
        }
    }
}
