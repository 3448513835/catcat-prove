/*
 * 元素
 */

import MyComponent from "../../Script/common/MyComponent"
import { CellData } from "./MergeData"

const { ccclass, property } = cc._decorator;
@ccclass
export default class MergeElement extends MyComponent {
    @property(cc.Sprite)
    private element_sprite: cc.Sprite = null;

    private tile_x: number = null;
    private tile_y: number = null;
    private data: CellData = null;

    onLoad () {
        super.onLoad && super.onLoad();
    }

    public setData (data: CellData) {
    }

    public getData (): CellData {
        return this.data;
    }

    public getTilePoint (): cc.Vec2 {
        return new cc.Vec2(this.tile_x, this.tile_y);
    }

    public setTilePoint (x: number, y: number) {
        this.tile_x = x;
        this.tile_y = y;
    }

    public setOccupy () {
        this.element_sprite.node.setPosition(-20, -20);
    }

    public setUnOccupy () {
        this.element_sprite.node.setPosition(0, 0);
    }
}
