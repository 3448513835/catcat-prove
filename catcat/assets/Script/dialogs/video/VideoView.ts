import GameConstant from "../../common/GameConstant";
import MyComponent from "../../common/MyComponent";
import MapGridView from "../../main/MapGridView";


const { ccclass, property } = cc._decorator;

@ccclass
export default class VideoView extends MyComponent {

    @property(cc.Sprite)
    item1_icon: cc.Sprite = null

    @property(cc.Label)
    item1_num: cc.Label = null

    @property(cc.Node)
    item1_time_node: cc.Node = null

    @property(cc.Label)
    item1_time_num: cc.Label = null

    @property(cc.Sprite)
    item2_icon: cc.Sprite = null

    @property(cc.Label)
    item2_num: cc.Label = null

    @property(cc.Node)
    item2_time_node: cc.Node = null

    @property(cc.Label)
    item2_time_num: cc.Label = null

    @property(cc.Sprite)
    item3_icon: cc.Sprite = null

    @property(cc.Label)
    item3_num: cc.Label = null

    @property(cc.Node)
    item3_time_node: cc.Node = null

    @property(cc.Label)
    item3_time_num: cc.Label = null

    @property(cc.Sprite)
    item4_icon: cc.Sprite = null

    @property(cc.Label)
    item4_num: cc.Label = null

    @property(cc.Sprite)
    item4_btn_icon: cc.Sprite = null

    @property(cc.Label)
    itme4_btn_num: cc.Label = null

    private data_num = null
    private send_index: number = 1

    onLoad() {
        this.listen(this._event_name.SOCKET_VIDEO_DATA, this.init, this)
        this.listen(this._event_name.SOCKET_VIDEO_GET_MONEY, this.getItem, this)
        this._net_manager.requestVideoData()
    }

    private init(data) {
        console.log(data);
        this.data_num = data
        this.setItem1()
        this.setItem2()
        this.setItem3()
        this.setItem4()
    }

    private getNum(id: number) {
        if (!this.data_num) return
        if (id == 10003) {
            return this.data_num["diamond_video_count"]
        }
        else if (id == 10004) {
            return this.data_num["crystal_video_count"]
        }
        else if (id == 10005) {
            return this.data_num["gold_video_count"]
        }
    }

    private setItem1() {
        let json_config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10003)
        let int_para = json_config["int_para"]
        let str_para = json_config["str_para"]
        let arr = str_para.split(":")
        this.item1_num.string = arr[1]

        if (int_para == 0) {
            this.item1_time_node.active = false
        } else {
            let num = this.getNum(10003)
            this.item1_time_num.string = `${int_para - num}/${int_para}`
        }
    }

    private setItem2() {
        let json_config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10004)
        let int_para = json_config["int_para"]
        let str_para = json_config["str_para"]
        let arr = str_para.split(":")
        this.item2_num.string = arr[1]

        if (int_para == 0) {
            this.item2_time_node.active = false
        } else {
            let num = this.getNum(10004)
            this.item2_time_num.string = `${int_para - num}/${int_para}`
        }
    }

    private setItem3() {
        let json_config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10005)
        let int_para = json_config["int_para"]
        let str_para = json_config["str_para"]
        let arr = str_para.split(":")
        this.item3_num.string = arr[1]

        if (int_para == 0) {
            this.item3_time_node.active = false
        } else {
            let num = this.getNum(10005)
            this.item3_time_num.string = `${int_para - num}/${int_para}`
        }
    }

    private setItem4() {
        let json_config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10006)
        let int_para = json_config["int_para"]
        let str_para = json_config["str_para"]
        let arr = str_para.split(":")
        this.item4_num.string = arr[1]

        let json_need_config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10007)
        let str_para2 = json_need_config["str_para"]
        let arr2 = str_para2.split(":")
        this.itme4_btn_num.string = arr2[1]
        let item_config = this._json_manager.getJsonData(this._json_name.ITEM_BASE, arr2[0])
        this._utils.setSpriteFrame(this.item4_btn_icon, `pic/icon/${item_config["icon"]}`)
    }

    private click(...params) {
        let index = Number(params[1])

        if (index < 4) {
            let id = 10003
            if (index == 2) {
                id = 10004
            }
            else if (index == 3) {
                id = 10005
            }

            let json_config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, id)
            let num = this.getNum(id)
            let int_para = json_config["int_para"]
            if (int_para == 0 || num < int_para) {
                if (this._user.getVideo() > 0) {
                    this._utils.addResNum(GameConstant.res_id.video, -1);
                    this.send_index = index
                    this._net_manager.requestVideoGetItem(id)
                }
                else {
                    this._ad_manager.setAdCallback(() => {
                        this.send_index = index
                        this._net_manager.requestVideoGetItem(id)
                        if (index == 1) {
                            this._net_manager.requestTablog(this._config.statistic.VIDEO_DIAMOND2);
                        }
                        else if (index == 2) {
                            this._net_manager.requestTablog(this._config.statistic.VIDEO_CRYSTAL2);
                        }
                        else if (index == 3) {
                            this._net_manager.requestTablog(this._config.statistic.VIDEO_GOLD2);
                        }
                    });
                    // this._net_manager.requestVideoGetItem(id)
                    if (index == 1) {
                        this._net_manager.requestTablog(this._config.statistic.VIDEO_DIAMOND);
                    }
                    else if (index == 2) {
                        this._net_manager.requestTablog(this._config.statistic.VIDEO_CRYSTAL);
                    }
                    else if (index == 3) {
                        this._net_manager.requestTablog(this._config.statistic.VIDEO_GOLD);
                    }
                    this._ad_manager.showAd();
                }
            } else {
                let tip = this._json_manager.getJsonData(this._json_name.TIPS, 10006)
                this._dialog_manager.showTipMsg(tip["tip"])
            }
        } else {
            let json_need_config = this._json_manager.getJsonData(this._json_name.CONST_PARAMETER, 10007)
            let str_para2 = json_need_config["str_para"]
            let arr2 = str_para2.split(":")
            let id = Number(arr2[0])
            let need_num = Number(arr2[1])

            let my_num = 0
            if (id == 100001) {
                my_num = this._user.getGold()
            } else if (id == 100002) {
                my_num = this._user.getDiamond()
            }

            if (my_num >= need_num) {
                this.send_index = index
                this._net_manager.requestVideoGetItem(10006)
                this._utils.addResNum(id, -Number(need_num))
                this._net_manager.requestTablog(this._config.statistic.BUY_GOLD);
            } else {
                this._dialog_manager.showTipMsg("货币不足")
            }
        }
    }

    private getItem(data) {
        // cc.error(data, "data========")
        let node: cc.Node
        if (this.send_index == 1) node = this.item1_icon.node
        else if (this.send_index == 2) node = this.item2_icon.node
        else if (this.send_index == 3) node = this.item3_icon.node
        else if (this.send_index == 4) node = this.item4_icon.node

        let item_data = data[0]
        if (cc.isValid(node) && item_data) {
            let pos_w = node.parent.convertToWorldSpaceAR(node.position)
            let eventData = {
                pos_w: pos_w,
                item_id: item_data["item_id"],
                item_num: item_data["item_num"],
            }
            this._event_manager.dispatch(this._event_name.EVENT_ADD_ITEM, eventData)
        }
    }

    onDestroy () {
        super.onDestroy && super.onDestroy()
        
        if (cc.director.getScene().name == "Main") {
            if (!MapGridView.instance.getIsHaveSkinViwe()) {
                this._event_manager.dispatch(this._event_name.EVENT_CHANGE_UI_TOP_RES, {id: 10001})
            }
        }else {
            this._event_manager.dispatch(this._event_name.EVENT_CHANGE_UI_TOP_RES, {id: 10001})
        }
    }

    // update (dt) {}
}
