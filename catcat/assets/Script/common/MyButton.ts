import AudioManager from "./AudioManager"

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu("自定义组件/CustomBtn")
export default class MyButton extends cc.Button {
    @property({
        type: cc.Float,
        displayName: "点击间隔",
        tooltip: "设置按钮点击间隔"
    })
    clickDuration: number = 0.2;
    @property({
        tooltip: '是否有缩放动作'
    })
    public isActionScale: boolean = false
    _isEventable: boolean = true;
    private default_scale: number = 1
    private action_scale_tag: number = 123

    onLoad() {
        super.onLoad && super.onLoad();
        // for (let item of this.node.getComponents(cc.BlockInputEvents)) {
        //     this.node.removeComponent(item);
        // }
        if (!this.node.getComponent(cc.BlockInputEvents)) {
            this.node.addComponent(cc.BlockInputEvents);
        }

        this.default_scale = this.node.scale
        if (this.isActionScale) {
            this.playActionScale()
        }
    }

    _onTouchBegan(event) {
        if (this.isActionScale) {
            this.node.stopActionByTag(this.action_scale_tag)
            this.node.scale = this.default_scale
        }

        if (this._isEventable) {
            //@ts-ignore
            super._onTouchBegan(event);
            AudioManager.playClickEffect();
            this._isEventable = false;
        }
    }

    _onTouchCancel() {
        //@ts-ignore
        super._onTouchCancel();
        this.scheduleOnce(() => { this._isEventable = true; }, this.clickDuration);
        if (this.isActionScale) {
            this.node.scale = this.default_scale
            this.playActionScale()
        }
    }

    _onTouchEnded(event) {
        // @ts-ignore
        super._onTouchEnded(event);
        this.scheduleOnce(() => { this._isEventable = true; }, this.clickDuration);
        if (this.isActionScale) {
            this.node.scale = this.default_scale
            this.playActionScale()
        }
    }

    private playActionScale() {
        cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .to(0.25, { scale: 1.05 })
                    .to(0.25, { scale: 1.0 })
                    .to(0.25, { scale: 1.05 })
                    .to(0.25, { scale: 1.0 })
                    .delay(1)
            )
            .tag(this.action_scale_tag)
            .start()
    }

    public closeActionScale() {
        if (this.isActionScale) {
            this.node.stopActionByTag(this.action_scale_tag)
            this.node.scale = this.default_scale
        }
    }
}

