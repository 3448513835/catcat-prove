/*
 * 滑动
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class SlideMap extends cc.Component {
    @property({
        type: cc.Node,
        tooltip: '目标节点'
    })
    public map: cc.Node = null

    @property({
        tooltip: '图片初始缩放'
    })
    public defaultScaling: number = 1.1

    @property({
        tooltip: '图片缩放最小scale'
    })
    public minScale: number = 1

    @property({
        tooltip: '图片缩放最大scale'
    })
    public maxScale: number = 3

    @property({
        tooltip: '单点触摸容忍误差'
    })
    public moveOffset: number = 2

    @property({
        tooltip: '滚轮缩放比率'
    })
    public increaseRate: number = 10000

    @property({
        displayName: '双指缩放速率',
        max: 10,
        min: 0.001,
    })
    public fingerIncreaseRate: number = 1

    @property({
        displayName: '惯性移动',
    })
    public inertia: boolean = true

    // 操作锁
    public locked: boolean = false
    // 点击回调函数
    private singleTouchCb: Function = null
    // 是否拖动地图flag
    private isMoving: boolean = false
    // 触摸点列表容器
    private mapTouchList: any[] = []
    /**是否触摸移动 */
    public isTouchMoved: boolean = false
    /**触摸开始点 */
    public firstClickPoint: cc.Vec2 = null

    private tick_scale_num: number = 0

    private dragging: boolean = false
    private velocity: number = 0
    private decelerationRate: number = 0.1
    private prevPosition: cc.Vec2 = new cc.Vec2()
    /**惯性速率系数 */
    private inertia_velocity_mul: number = 3
    /** 是否需要惯性移动 */
    private is_need_inertia_move: boolean = true
    private normalizeVec: cc.Vec2 = cc.v2()
    private touch_point_list: cc.Vec2[] = []

    public setSingleTouchEnd (fn: Function) {
        this.singleTouchCb = fn;
    }

    public setTouchStart (fn: Function) {
        let o_click_start = this.clickStart.bind(this);
        this.clickStart = (event): boolean => { return fn(event) && o_click_start(event); };
    }

    public setTouchMove (fn: Function) {
        let o_click_move = this.clickMove.bind(this);
        this.clickMove = (event): boolean => { return fn(event) && o_click_move(event); };
    }

    public setTouchEnd (fn: Function) {
        let o_click_end = this.clickEnd.bind(this);
        this.clickEnd = (event): boolean => { return fn(event) && o_click_end(event); };
    }

    public setTouchCancel (fn: Function) {
        let o_click_cancel = this.clickCancel.bind(this);
        this.clickCancel = (event): boolean => { return fn(event) && o_click_cancel(event); };
    }

    public lockSlide (lock: boolean) {
        this.locked = lock;
    }

    protected start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.clickStart, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.clickMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.clickEnd, this)
        this.node.on(cc.Node.EventType.MOUSE_WHEEL, this.mouseWheel, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.clickCancel, this)
    }

    private getMinScale() {
        let percentW = cc.winSize.width / this.map.width
        let percentH = cc.winSize.height / this.map.height
        return Math.max(Math.max(percentW, percentH), this.minScale)
    }

    // 有些设备单点过于灵敏，单点操作会触发TOUCH_MOVE回调，在这里作误差值判断
    private canStartMove(touch: any): boolean {
        let startPos: any = touch.getStartLocation()
        let nowPos: any = touch.getLocation()
        // 有些设备单点过于灵敏，单点操作会触发TOUCH_MOVE回调，在这里作误差值判断
        return (Math.abs(nowPos.x - startPos.x) > this.moveOffset
            || Math.abs(nowPos.y - startPos.y) > this.moveOffset)
    }

    private clickStart(event: any) {
        let touches: any[] = event.getTouches() // 获取所有触摸点
        let mPoint = touches[0].getLocation()
        this.firstClickPoint = mPoint

        this.velocity = 0
        this.dragging = true
        this.normalizeVec = cc.v2()
        this.is_need_inertia_move = true
        this.touch_point_list = []

        if (touches.length === 1) {
        }

        return true
    }

    private clickMove(event: cc.Event.EventTouch): boolean {
        if (this.locked) return
        let touches: any[] = event.getTouches() // 获取所有触摸点
        if (this.firstClickPoint != null) {
            let touchPos = touches[0].getLocation()
            let tempDistance = touchPos.sub(this.firstClickPoint).mag()
            if (tempDistance > 5) {
                this.isTouchMoved = true
            }
        }

        if (touches.length >= 2) {
            this.is_need_inertia_move = false
            this.isMoving = true
            let touch1: any = touches[0]
            let touch2: any = touches[1]
            let delta1: cc.Vec2 = cc.v2(touch1.getDelta())
            let delta2: cc.Vec2 = cc.v2(touch2.getDelta())
            let touchPoint1: cc.Vec2 = this.map.convertToNodeSpaceAR(cc.v2(touch1.getLocation()))
            let touchPoint2: cc.Vec2 = this.map.convertToNodeSpaceAR(cc.v2(touch2.getLocation()))
            let distance: cc.Vec2 = touchPoint1.sub(touchPoint2)
            const rateV2: cc.Vec2 = cc.v2(this.fingerIncreaseRate, this.fingerIncreaseRate)
            let delta: cc.Vec2 = delta1.sub(delta2).scale(rateV2)
            let scale: number = 1
            if (Math.abs(distance.x) > Math.abs(distance.y)) {
                scale = (distance.x + delta.x) / distance.x * this.map.scaleX
            }
            else {
                scale = (distance.y + delta.y) / distance.y * this.map.scaleY
            }
            let pos: cc.Vec2 = touchPoint2.add(cc.v2(distance.x / 2, distance.y / 2))
            this.smoothOperate(this.map, pos, scale)
        }
        else if (touches.length === 1) {
            if (this.isMoving || this.canStartMove(touches[0])) {
                this.isMoving = true
                let dir: cc.Vec2 = cc.v2(touches[0].getDelta())
                this.dealMove(dir, this.map, this.node)

                while (this.touch_point_list.length > 5) {
                    this.touch_point_list.shift()
                }

                this.touch_point_list.push(event.getLocation())
            }
        }
    }

    private clickEnd(event: cc.Event.EventTouch) {
        this.isTouchMoved = false
        this.firstClickPoint = null

        this.dragging = false

        if (this.locked) return

        let touches: any[] = event.getTouches()
        if (touches.length <= 1) {
            if (!this.isMoving) {
                let worldPos: cc.Vec2 = cc.v2(event.getLocation())
                let nodePos: cc.Vec2 = this.map.convertToNodeSpaceAR(worldPos)
                this.dealSelect(worldPos)
            }
            this.isMoving = false // 当容器中仅剩最后一个触摸点时将移动flag还原

            if (this.touch_point_list.length > 1) {
                let length = this.touch_point_list.length
                let pos1 = this.touch_point_list[length - 1]
                let pos2 = this.touch_point_list[length - 2]
                
                this.normalizeVec = pos1.sub(pos2).normalize()
            }
        }
    }

    private clickCancel(event: cc.Event.EventTouch) {
        this.dragging = false

        if (this.locked) return

        let touches: any[] = event.getTouches()
        // 当容器中仅剩最后一个触摸点时将移动flag还原
        if (touches.length <= 1) {
            this.isMoving = false

            if (this.touch_point_list.length > 1) {
                let length = this.touch_point_list.length
                let pos1 = this.touch_point_list[length - 1]
                let pos2 = this.touch_point_list[length - 2]
                
                this.normalizeVec = pos1.sub(pos2).normalize()
            }
        }
    }

    private mouseWheel(event: cc.Event.EventMouse) {
        if (this.locked) return

        let worldPos: cc.Vec2 = cc.v2(event.getLocation())
        let scrollDelta: number = event.getScrollY()
        let scale: number = (this.map.scale + (scrollDelta / this.increaseRate))

        let target: cc.Node = this.map
        let pos: cc.Vec2 = target.convertToNodeSpaceAR(worldPos)
        this.smoothOperate(target, pos, scale)
    }

    public removeTouchFromContent(event: any, content: any[]): void {
        let eventToucheIDs: number[] = event['getTouches']().map(v => v.getID())
        for (let len = content.length, i = len - 1; i >= 0; --i) {
            if (eventToucheIDs.indexOf(content[i].id) > -1)
                content.splice(i, 1) // 删除触摸
        }
    }

    public smoothOperate(target: cc.Node, pos: cc.Vec2, scale: number): void {
        // 放大缩小
        if (this.minScale <= scale && scale <= this.maxScale) {
            // 当前缩放值与原来缩放值之差
            let deltaScale: number = scale - target.scaleX
            // 当前点击的坐标与缩放值差像乘
            let gapPos: cc.Vec2 = pos.scale(cc.v2(deltaScale, deltaScale))
            // 当前node坐标位置减去点击 点击坐标和缩放值的值
            let mapPos: cc.Vec2 = cc.v2(target.position.sub(cc.v3(gapPos)))
            // 获取速率的小数后几位，防止速率过小时取整直接舍弃掉了变化
            const rateStr: string = this.fingerIncreaseRate.toString()
            const digit: number = rateStr.split('.')[1] ? rateStr.split('.')[1].length : 0
            const rate: number = Math.pow(10, 2 + digit)
            scale = Math.floor(scale * rate) / rate
            target.scale = scale
            this.dealScalePos(mapPos, target)
        }
        else {
            scale = cc.misc.clampf(scale, this.minScale, this.maxScale)
        }
    }

    private dealScalePos(pos: cc.Vec2, target: cc.Node): void {
        let worldPos: cc.Vec2 = this.node.convertToWorldSpaceAR(pos)
        let nodePos: cc.Vec2 = this.node.convertToNodeSpaceAR(worldPos)
        let edge: any = this.calculateEdge(target, this.node, nodePos)
        if (edge.left > 0) {
            pos.x -= edge.left
        }
        if (edge.right > 0) {
            pos.x += edge.right
        }
        if (edge.top > 0) {
            pos.y += edge.top
        }
        if (edge.bottom > 0) {
            pos.y -= edge.bottom
        }
        target.position = cc.v3(pos)
    }

    /**
     * 把位置移动到屏幕的中心
     * @param pos 格子在地图上的坐标
     */
    public moveToPos(data) {
        let pos = data.pos
        // 转化相对地图的世界坐标
        pos = this.map.convertToWorldSpaceAR(pos)
        let size = cc.view.getVisibleSize()
        let xx = size.width / 2 - pos.x
        let yy = size.height / 2 - pos.y

        let tempX = this.map.x + xx
        let tempY = this.map.y + yy
        let limitX = (this.map.width * this.map.scale - size.width) / 2
        let limitY = (this.map.height * this.map.scale - size.height) / 2
        if (tempX < -limitX) {
            this.map.x = -limitX
        } else if (tempX > limitX) {
            this.map.x = limitX
        } else {
            this.map.x += xx
        }

        if (tempY < -limitY) {
            this.map.y = -limitY
        } else if (tempY > limitY) {
            this.map.y = limitY
        } else {
            this.map.y += yy
        }

        // this.smoothOperate(this.map, data.pos, 2)
    }

    private dealMove(dir: cc.Vec2, map: cc.Node, container: cc.Node): void {
        let worldPos: cc.Vec2 = map.convertToWorldSpaceAR(cc.Vec2.ZERO)
        let nodePos: cc.Vec2 = container.convertToNodeSpaceAR(worldPos)
        nodePos.x += dir.x
        nodePos.y += dir.y
        let edge: any = this.calculateEdge(map, container, nodePos)
        if (edge.left <= 0 && edge.right <= 0) {
            map.x += dir.x
        }
        if (edge.top <= 0 && edge.bottom <= 0) {
            map.y += dir.y
        }
    }

    private dealSelect(nodePos: cc.Vec2): void {
        if (this.singleTouchCb) this.singleTouchCb(nodePos)
    }

    // 计算map的四条边距离容器的距离，为负代表超出去
    public calculateEdge(target: cc.Node, container: cc.Node, nodePos: cc.Vec2): any {
        let horizontalDistance: number = (container.width - target.width * target.scaleX) / 2
        let verticalDistance: number = (container.height - target.height * target.scaleY) / 2

        let left: number = horizontalDistance + nodePos.x
        let right: number = horizontalDistance - nodePos.x
        let top: number = verticalDistance - nodePos.y
        let bottom: number = verticalDistance + nodePos.y

        return { left, right, top, bottom }
    }

    public getIsTouchMoved(): boolean {
        return this.isTouchMoved
    }

    private calcInertia(deltaTime: number) {
        this.velocity *= Math.pow(this.decelerationRate, deltaTime)
        if (Math.abs(this.velocity) < 1) {
            this.velocity = 0
        }
        let deltaNum = this.velocity * deltaTime
        let dir = this.normalizeVec.mul(deltaNum)
        this.dealMove(dir, this.map, this.node)
    }

    private lerp(a: number, b: number, t: number) {
        return a + (b - a) * cc.misc.clamp01(t)
    }

    update(dt) {
        if (!this.is_need_inertia_move || !this.inertia) return
        if (!this.dragging && (this.velocity != 0)) {
            this.calcInertia(dt)
        }

        if (this.dragging) {
            var newVelocity = cc.Vec2.distance(cc.v2(this.map.position), this.prevPosition) / dt
            this.velocity = cc.misc.lerp(this.velocity, newVelocity, dt * this.inertia_velocity_mul)
        }

        if (!this.prevPosition.equals(cc.v2(this.map.position))) {
            this.prevPosition.set(cc.v2(this.map.position))
        }
    }
}
