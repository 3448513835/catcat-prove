/*
 * 解锁提示
 */
import MyComponent from "../../Script/common/MyComponent"
import { CellData, MapData } from "./MergeData2d"

const COL = 12;
const ROW = 10;
const SCALE = 0.65;
const TWIDTH = 272*SCALE;
const THEIGHT = 140*SCALE;
const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeUnlockTipDialog2d extends MyComponent {
    @property(cc.Node)
    private panel_node1: cc.Node = null;
    @property(cc.Node)
    private panel_node2: cc.Node = null;
    @property(cc.Node)
    private tiles_layout: cc.Node = null;
    @property(cc.Node)
    private tile_node: cc.Node = null;
    @property([cc.SpriteFrame])
    private land_spritefrmaes: cc.SpriteFrame[] = [];

    private cell_data: CellData = null;
    private map_data: MapData = null;
    private cell_data_list: CellData[] = null;
    private callback: Function = null;

    onLoad () {
        super.onLoad && super.onLoad();
        let dialog_data = this.getDialogData();
        this.cell_data = dialog_data.cell_data;
        this.map_data = dialog_data.map_data;
        this.cell_data_list = dialog_data.list;
        this.callback = dialog_data.callback;
        if (this.cell_data.tile_data.unlock_condition == 101) { // 等级
            this.showLockPanel();
        }
        else if (this.cell_data.tile_data.unlock_condition == 102) { // 道具
            this.showUnlockPanel();
        }
        else if (this.cell_data.tile_data.unlock_condition == 103) { // 付费
            this.showUnlockPanel();
        }
        // this.tiles_layout.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        // this.tiles_layout.addComponent(cc.BlockInputEvents);
    }

    private showLockPanel () {
        this.panel_node1.active = true;
        this.panel_node2.active = false;
        cc.find("Level", this.panel_node1).getComponent(cc.Label).string = `${this.map_data.stage_name}.${this.map_data.level}`;
        cc.find("Tip", this.panel_node1).getComponent(cc.Label).string = `${this.map_data.stage_name}.${this.cell_data.tile_data.unlock_para} 可解锁`;
        let progress = cc.find("Progress/Mask", this.panel_node1);
        let json = this._json_manager.getJson(this._json_name.COM_LV_2D);
        let need_exp = 0;
        for (let key in json) {
            let value = json[key];
            if (value.stage == 1 && value.lv <= this.cell_data.tile_data.unlock_para) {
                need_exp += value.exp;
            }
        }
        progress.width = progress.children[0].width*this.map_data.total_exp/need_exp;
        cc.find("Percent", this.panel_node1).getComponent(cc.Label).string = `${this.map_data.total_exp}/${need_exp}`;
    }

    private showUnlockPanel () {
        this.panel_node1.active = false;
        this.panel_node2.active = true;
        let label_node = cc.find("Confirm/Label", this.panel_node2);
        let icon_node = cc.find("Confirm/Icon", this.panel_node2);
        if (this.cell_data.tile_data.unlock_condition == 102) { // 道具
            let [id, count] = this.cell_data.tile_data.unlock_para.split(":");
            let icon = this._json_manager.getJsonData(this._json_name.ITEM_BASE, id).icon;
            this._resource_manager.getSpriteFrame(`pic/icon/${icon}`).then((sprite_frame) => {
                if (cc.isValid(icon)) {
                    this.addSpriteFrameRef(sprite_frame);
                    icon_node.getComponent(cc.Sprite).spriteFrame = sprite_frame;
                }
            });
            label_node.getComponent(cc.Label).string = count;
            let width = count.length*42+icon_node.width+10;
            icon_node.x = -width/2+icon_node.width/2;
            label_node.x = width/2-count.length*42/2;
            icon_node.active = true;
        }
        else {
            label_node.getComponent(cc.Label).string = "¥ "+this.cell_data.tile_data.unlock_para;
            icon_node.active = false;
            label_node.x = 0;
        }
        this.showTiles();
    }

    private showTiles () {
        for (let cell of this.cell_data_list) {
            let node = cc.instantiate(this.tile_node);
            node.scale = SCALE;
            node.parent = this.tiles_layout;
            node.getComponent(cc.Sprite).spriteFrame = this.land_spritefrmaes[(cell.tile_data.tile_x+cell.tile_data.tile_y)%2];
            let pos = this.tileToPosition(new cc.Vec2(cell.tile_data.tile_x, cell.tile_data.tile_y));
            node.setPosition(pos);
            let element_sprite = cc.find("Element", node).getComponent(cc.Sprite);
            // this._utils.setSpriteFrame(element_sprite, `pic/icon/${cell.icon}`);
            this._resource_manager.getSpriteFrame(`merge2d/ele/${cell.icon}`).then((sprite_frame) => {
                if (cc.isValid(element_sprite)) {
                    this.addSpriteFrameRef(sprite_frame);
                    element_sprite.spriteFrame = sprite_frame;
                }
            });
        }
        const layout_pos = [ null, null, new cc.Vec2(135, -224), new cc.Vec2(-141, -115), new cc.Vec2(-210, -397),
            new cc.Vec2(129, -455), new cc.Vec2(-141, -590), new cc.Vec2(-612, -664), new cc.Vec2(-661, -430),
        ];
        this.tiles_layout.setPosition(layout_pos[this.cell_data.tile_data.area]);
    }

    private touchMove (event: cc.Event.EventTouch) {
        this.tiles_layout.x += event.getDeltaX();
        this.tiles_layout.y += event.getDeltaY();
        console.log(this.tiles_layout.x, this.tiles_layout.y);
    }

    /**
     * 转换瓦片位置在地图上实际位置
     * param p cc.Vec2
     */
    private tileToPosition (p: cc.Vec2): cc.Vec2 {
        let sx = (p.x-p.y)*TWIDTH/2;
        let sy = (p.x+p.y+1)*THEIGHT/2;
        return new cc.Vec2(sx, sy);
    }

    private clickConfirm () {
        if (this.cell_data.tile_data.unlock_condition == 102) { // 道具
            let id: any = null, count: any = null;
            [id, count] = this.cell_data.tile_data.unlock_para.split(":");
            id = Number(id); count = Number(count);
            let my_count = this._utils.getMyNumByItemId(id);
            if (my_count >= count) {
                this._utils.addResNum(id, -count);
                this.callback();
                this.close();
            }
            else {
                let name = this._json_manager.getJsonData(this._json_name.ITEM_BASE, id).name;
                // this._dialog_manager.showTipMsg(`${name}不足`);
                this._dialog_manager.openDialog(this._dialog_name.VideoView)
            }
        }
        else {
            this._dialog_manager.showTipMsg(`人民币不足`);
        }
    }
}
