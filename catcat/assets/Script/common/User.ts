import ChangeScene from "../main/ChangeScene";
import { UserDefault } from "./Config";
import EventManager from "./EventManager";
import GameConstant from "./GameConstant";
import PackManager from "./PackManager";

export interface DataType {
    diamond?: number,
    gold?: number,
    crystal?: number,
    experience?: number,
    level?: number,
    stamina?: number,
    fish?: number,
    video?: number,
    trave?: number,
}

/*
 * 用户数据
 */
export class User {
    private static data: DataType = {}
    private static id: string         = null;
    private static openid: string     = null;
    private static tt_data: any     = null;
    private static tt_token: any     = null;
    private static nickname: string   = null;
    private static headimg: string    = null;
    private static diamond: number    = 0; // 钻石
    private static gold: number       = 0; // 金币
    private static crystal: number    = 0; // 水晶
    private static experience: number = 0; // 经验
    private static level: number      = 0; // 等级
    private static stamina: number    = 0; // 体力
    private static fish: number       = 0; // 鱼干
    private static next_restore_djs: number = 0; // 恢复体力倒计时
    private static is_init_main_scene: boolean = true 
    private static is_init_new_gift: boolean = true 
    private static is_init_welcome_cat: boolean = true 
    private static main_scene_map_scale: number = 0
    private static main_scene_map_pos: cc.Vec2 = cc.v2()
    private static task_jump_data = null
    /** 进入游戏是否已经弹出弹窗 */
    private static is_init_pop_view: boolean = false

    private static isInitSdk: boolean = false

    public static init (data) {
        // cc.error(data, "data=============")
        // for (let key in data) {
        //     if (data.hasOwnProperty(key)) {
        //         this[key] = data[key];
        //     }
        //     else {
        //         console.log(`user 没有${key}属性`);
        //     }

        //     this.data[key] = data[key]
        // }

        // this.saveData()

        // if (data["bag"]) {
        //     PackManager.initItemData(data["bag"])
        // }
        // if (data["next_restore_djs"]) {
        //     this.next_restore_djs = data["next_restore_djs"]
        // }
    }

    public static update (data) {
        // for (let key in data) {
        //     if (this.hasOwnProperty(key)) {
        //         this[key] = data[key];
        //     }
        //     else {
        //         console.log(`user 没有${key}属性`);
        //     }
        // }

        this.data = data
        this.saveData()
    }

    public static setUID (id: string) {
        this.id = id
    }

    public static getUID (): string {
        return this.id;
    }

    public static getNickname (): string {
        return this.nickname;
    }

    public static getHeadImg (): string {
        return this.headimg;
    }

    public static getDiamond (): number {
        // return this.diamond;
        return this.data.diamond
    }

    public static setDiamond (diamond: number) {
        // this.diamond = diamond;
        this.data.diamond = diamond
        this.saveData()
    }

    public static getGold (): number {
        // return this.gold;
        return this.data.gold
    }

    public static setGold (gold: number) {
        // this.gold = gold;
        this.data.gold = gold
        this.saveData()
    }

    public static setLevel (lv: number) {
        this.data.level = lv
        this.saveData()
    }

    public static getLevel (): number {
        return this.data.level
    }

    public static getStamina (): number {
        // return this.stamina;
        return this.data.stamina
    }

    public static setStamina (stamina: number, notify: boolean = true) {
        // this.stamina = stamina;
        this.data.stamina = stamina
        this.saveData(notify)
        EventManager.dispatch(EventManager._event_name.EVENT_POWER_COUNT_DOWN)
    }

    public static setExperience (exp: number) {
        this.data.experience = exp
        this.saveData()
    }

    public static getExperience (): number {
        // return this.experience;
        return this.data.experience
    }

    public static setFish (fish: number, notify: boolean = true) {
        // this.fish = fish;
        this.data.fish = fish
        this.saveData(notify)
        EventManager.dispatch(EventManager._event_name.EVENT_CAN_LOCK_FAC)
    }
    public static getFish (): number {
        // return this.fish;
        return this.data.fish
    }

    public static setCrystal (crystal: number) {
        // this.crystal = crystal;
        this.data.crystal = crystal
        this.saveData()
    }

    public static getCrystal (): number {
        // return this.crystal;
        return this.data.crystal
    }

    public static setVideo (value: number) {
        this.data.video = value
        this.saveData()
    }

    public static getVideo (): number {
        return this.data.video || 0
    }

    public static setTrave (value: number) {
        this.data.trave = value
        this.saveData()
    }

    public static getTrave (): number {
        return this.data.trave || 0
    }

    public static getNextRestoreTime (): number {
        return this.next_restore_djs;
    }

    /**
     * param notify 是否发出通知
     */
    private static saveData (notify: boolean = true) {
        UserDefault.setItem(this.getUID() + GameConstant.USER_DATA, JSON.stringify(this.data))
        if (notify) {
            EventManager.dispatch(EventManager._event_name.EVENT_USER_UPDATE)
        }
    }

    public static getUserData() {
        return this.data
    }

    public static getIsInitMainScene() {
        return this.is_init_main_scene
    }

    public static setIsInitMainScene(value: boolean) {
        this.is_init_main_scene = value
    }

    public static getIsInitNewGift() {
        return this.is_init_new_gift
    }

    public static setIsInitNewGift(value: boolean) {
        this.is_init_new_gift = value
    }
    
    public static getIsInitWelcomeCat() {
        return this.is_init_welcome_cat
    }

    public static setIsInitWelcomeCat(value: boolean) {
        this.is_init_welcome_cat = value
    }

    public static getMainSceneMapScale() {
        return this.main_scene_map_scale
    }

    public static setMainSceneMapScale(value: number) {
        this.main_scene_map_scale = value
    }

    public static getMainSceneMapPos() {
        return this.main_scene_map_pos
    }

    public static setMainSceneMapPos(value: cc.Vec2) {
        this.main_scene_map_pos = value
    }

    public static setTaskJumpData(data: object) {
        this.task_jump_data = data
    }

    public static getTaskJumpData() {
        return this.task_jump_data
    }

    public static getElementRewwardList () {
        // let element_reward_list = cc.sys.localStorage.getItem("ELEMENT_REWARD_LIST");
        let element_reward_list = this.getItem("ELEMENT_REWARD_LIST");
        if (element_reward_list) {
            element_reward_list = JSON.parse(element_reward_list);
        }
        else {
            element_reward_list = [];
        }
        return element_reward_list;
    }

    public static setElementRewwardList (list) {
        // cc.sys.localStorage.setItem("ELEMENT_REWARD_LIST", JSON.stringify(list));
        this.setItem("ELEMENT_REWARD_LIST", JSON.stringify(list));
    }

    public static setTTData (data) {
        this.tt_data = data;
    }

    public static getTTData (): any {
        return this.tt_data;
    }

    public static setTTToken (data) {
        this.tt_token = data;
        this.tt_token.tm = data.expires_in*1000+Date.now();
    }

    public static getTTToken () {
        return this.tt_token;
    }

    public static getIsInitPopView() {
        return this.is_init_pop_view
    }

    public static setIsInitPopView(value: boolean) {
        this.is_init_pop_view = value
    }

    public static setIsInitSdk(value: boolean) {
        this.isInitSdk = value
    }

    public static getIsInitSdk() {
        return this.isInitSdk
    }

    /**
     * 根据UID每个账户保存本地数据
     */
    public static getItem (key: string) {
        return cc.sys.localStorage.getItem(this.getUID()+key);
    }

    public static setItem (key: string, value) {
        cc.sys.localStorage.setItem(this.getUID()+key, value);
    }
}
