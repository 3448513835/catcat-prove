/*
@example
设置模板  初始化可视区子节点
this.mPrefab  模板预制
this.data.length 设置的数据长度

 this.scroll.setTemplateItem(this.mPrefab, this.data.length);

 更新数据 新增或者删掉数据之后重新设置数据长度
 this.scroll.numItems = this.data.length;

  根据下标单独更新某个节点的数据
  this.scroll.UpdateItem(index);

* 滚动到对应下标的item的位置
scrollToIndex(index: number, timer: number = 0)
*/
let overFlowCount = 2; //定义超过显示范围的item数量
let deltaPos = 0;
let checkTimes = 0;

const { ccclass, property, disallowMultiple, menu } = cc._decorator;
@ccclass
@disallowMultiple()
@menu('自定义组件/MyScrollView')
export default class MyScrollView extends cc.ScrollView {
    protected itemPrefab: any = null;

    mDirect: string = 'x';
    mValue: string = 'width';
    mAnchor: string = 'anchorX';
    dataCount: number = 0;
    maxItemCount: number = overFlowCount;
    curItemCount: number = 0;

    curShowItemIndex: number[] = [];//记录当前显示的data序号
    showTopPos: number = 0; //记录显示的最小值
    showDownPos: number = 0;//记录显示的最大值
    hideTopPos: number = 0;//记录隐藏的最小值
    hideDownPos: number = 0;//记录隐藏的最大值
    itemActiveList: cc.Node[] = [];//存储使用中的item
    itemDeactivePool: cc.NodePool = new cc.NodePool();//存储回收的item
    lastContentPos: number = 0;//记录上一帧的content的位置 x/y
    checkdelta: number = 0;//检测差值
    itemway: number = -1;
    itemSynPos: cc.Vec2 = cc.Vec2.ZERO;
    viewMask: cc.Node = null;
    @property({
        type: cc.Component.EventHandler,
        displayName: '渲染函数',
    })
    public renderEvent: cc.Component.EventHandler = new cc.Component.EventHandler();
    @property({
        type: cc.Prefab,
        displayName: '模板节点',
    })
    protected tempNode: cc.Node = null; //模板节点
    public spacing: number = 0; //节点之间的间隔:
    public spacPading: number = 0; //节点之间的间隔:
    protected paddingBtm: number = 0; //距离底部的距离:
    public paddingTop: number = 0; //距离头部的距离:
    onLoad() {
    }

    GetItem(): cc.Node {
        let item: any = this.itemDeactivePool.get();
        if (!item)
            item = cc.instantiate(this.itemPrefab);
        item.active = true;
        this.content.addChild(item);
        return item;
    }

    //数组末尾增加一个item
    PopItem() {
        if (this.curItemCount >= this.maxItemCount)
            return;
        let item: cc.Node = this.GetItem();
        this.itemActiveList.push(item);
        this.itemSynPos[this.mDirect] = this.itemway * this.curShowItemIndex[1] * this.spacing + this.paddingTop * this.itemway + (this.spacing - this.spacPading) / 2 * this.itemway;
        item.setPosition(this.itemSynPos);
        this.renderEvent && cc.Component.EventHandler.emitEvents([this.renderEvent], item, this.curShowItemIndex[1]);
        this.curShowItemIndex[1]++;
        this.curItemCount++;
    }

    //回收末尾item
    PushItem() {
        this.itemDeactivePool.put(this.itemActiveList[this.curItemCount - 1]);
        this.itemActiveList.splice(this.curItemCount - 1, 1);
        this.curShowItemIndex[1]--;
        this.curItemCount--;
    }
    /*
    在数组的头部增加一个item
    */
    UnshiftItem() {
        let item = this.GetItem();
        this.itemActiveList.unshift(item);
        this.curShowItemIndex[0]--;
        this.itemSynPos[this.mDirect] = this.itemway * this.curShowItemIndex[0] * this.spacing + this.paddingTop * this.itemway + (this.spacing - this.spacPading) / 2 * this.itemway;
        item.setPosition(this.itemSynPos);
        if (this.renderEvent)
            cc.Component.EventHandler.emitEvents([this.renderEvent], item, this.curShowItemIndex[0]);
        this.curItemCount++;
    }
    /*
    回收顶部的item
    */
    ShiftItem() {
        this.itemDeactivePool.put(this.itemActiveList[0]);
        this.itemActiveList.splice(0, 1);
        this.curShowItemIndex[0]++;
        this.curItemCount--;
    }
    /*
    检测顶部回收
    */
    CheckTopPop() {
        if (!this.itemActiveList[0])
            return;
        if (this.horizontal) {
            if (this.content[this.mDirect] + this.itemActiveList[0][this.mDirect] < this.hideTopPos)
                this.ShiftItem();
        } else if (this.content[this.mDirect] + this.itemActiveList[0][this.mDirect] > this.hideTopPos) {
            this.ShiftItem();
        }
    }
    /*
    检测顶部创建
    */
    CheckTopPush() {
        if (this.curShowItemIndex[0] == 0)
            return;
        if (!this.itemActiveList[0])
            return;
        if (this.horizontal) {
            if (this.content[this.mDirect] + this.itemActiveList[0][this.mDirect] > this.showTopPos)
                this.UnshiftItem();
        } else if (this.content[this.mDirect] + this.itemActiveList[0][this.mDirect] < this.showTopPos) {
            this.UnshiftItem();
        }
    }
    /*
    检测底部回收
    */
    CheckDownPop() {
        if (!this.itemActiveList[this.curItemCount - 1])
            return;
        if (this.horizontal) {
            if (this.content[this.mDirect] + this.itemActiveList[this.curItemCount - 1][this.mDirect] > this.hideDownPos)
                this.PushItem();
        } else if (this.content[this.mDirect] + this.itemActiveList[this.curItemCount - 1][this.mDirect] < this.hideDownPos) {
            this.PushItem();
        }
    }
    /*
    检测底部创建
    */
    CheckDownPush() {
        if (this.curShowItemIndex[1] == this.dataCount) {
            return;
        }
        if (!this.itemActiveList[this.curItemCount - 1])
            return;
        if (this.horizontal) {
            if (this.content[this.mDirect] + this.itemActiveList[this.curItemCount - 1][this.mDirect] < this.showDownPos) {
                this.PopItem();
            }
        } else if (this.content[this.mDirect] + this.itemActiveList[this.curItemCount - 1][this.mDirect] > this.showDownPos) {
            this.PopItem();
        }
    }
    /*
    刷新item位置
    */
    UpdateItemPos() {
        deltaPos = this.content[this.mDirect] - this.lastContentPos;
        if (Math.abs(deltaPos) < this.checkdelta)
            return;
        checkTimes = Math.ceil(Math.abs(deltaPos) / this.spacing)
        while (checkTimes > 0) {
            checkTimes--;
            if (this.horizontal) {
                if (deltaPos < 0 && this.curShowItemIndex[1] < this.dataCount) { //向上滑动
                    this.CheckTopPop(); //检测顶部回收
                    this.CheckDownPush(); //检测底部创建
                } else if (deltaPos > 0 && this.curShowItemIndex[0] > 0) { //向下滑动
                    this.CheckDownPop(); //检测底部回收
                    this.CheckTopPush(); //检测顶部创建
                }
            } else {
                if (deltaPos > 0 && this.curShowItemIndex[1] < this.dataCount) { //向上滑动
                    this.CheckTopPop(); //检测顶部回收
                    this.CheckDownPush(); //检测底部创建
                } else if (deltaPos < 0 && this.curShowItemIndex[0] > 0) { //向下滑动
                    this.CheckDownPop(); //检测底部回收
                    this.CheckTopPush(); //检测顶部创建
                }
            }
        }
        this.lastContentPos = this.content[this.mDirect];
    }
    InitItemData(count) {
        this.dataCount = count;
        this.content[this.mValue] = this.paddingTop + this.dataCount * this.spacing + this.paddingBtm - this.spacPading;
        if (count > this.maxItemCount)
            count = this.maxItemCount;
        for (let index = 0; index < count; index++) {
            this.PopItem();
        }
    }
    //对外接口-*--------------------------------------------------------
    /**
     * 设置模板预制  和 节点数量
     */
    setTemplateItem(prefab?: cc.Prefab, len?: number) {
        this.viewMask = this.content.parent;
        this.itemPrefab = this.tempNode || prefab;
        if (!this.itemPrefab) {
            return
        }
        for (let index = 0; index < overFlowCount; index++) {
            this.itemDeactivePool.put(cc.instantiate(this.itemPrefab));
        }
        let temp = this.itemDeactivePool.get();
        this.spacing = this.horizontal ? temp.width : temp.height;
        this.itemDeactivePool.put(temp);
        let layout = this.content.getComponent(cc.Layout);
        if (layout) {
            this.spacPading = this.horizontal ? layout.spacingX : layout.spacingY;
            this.spacing += this.spacPading;
            this.paddingBtm = this.horizontal ? layout.paddingRight : layout.paddingBottom;
            this.paddingTop = this.horizontal ? layout.paddingLeft : layout.paddingTop;
            layout.enabled = false;
            // this.content.removeComponent(layout);
        }


        this.curShowItemIndex = [0, 0];
        this.checkdelta = 0.25 * this.spacing;
        //设置滑动方向,目前只支持一个方向的滑动
        this.vertical = !this.horizontal;
        this.mDirect = this.horizontal ? "x" : "y";
        this.mValue = this.horizontal ? "width" : "height";
        this.mAnchor = this.horizontal ? "anchorX" : "anchorY";
        this.itemway = this.horizontal ? 1 : -1;
        //计算最大item数量
        this.maxItemCount = Math.floor(this.viewMask[this.mValue] / this.spacing) + overFlowCount;
        //注册滑动响应事件
        this.content.on(cc.Node.EventType.POSITION_CHANGED, this.UpdateItemPos.bind(this));
        this.lastContentPos = this.content[this.mDirect];
        //设定位置相关数据
        this.showTopPos = this.lastContentPos - this.itemway * this.spacing + this.itemway * (this.spacing - this.spacPading) / 2;
        this.showDownPos = this.lastContentPos + this.itemway * (this.viewMask[this.mValue] + this.spacing / 2) + this.itemway * (this.spacing - this.spacPading) / 2;
        this.hideTopPos = this.lastContentPos - this.itemway * 1.5 * this.spacing + this.itemway * (this.spacing - this.spacPading);
        this.hideDownPos = this.lastContentPos + this.itemway * (this.viewMask[this.mValue] + 1.5 * this.spacing) - this.itemway * (this.spacing - this.spacPading);

        this.numItems = len || 0;
    }

    /**
     * 设置item的长度用来刷新列表的数据
     */
    set numItems(len: number) {
        if (!this.itemPrefab) {
            this.setTemplateItem(null, len);
            return;
        }
        if (len <= 0) {
            this.ClearData();
            return;
        }
        if (!this.dataCount && len > 0) { //如果count不存在说明是初始化
            this.ClearData();
            this.InitItemData(len);
            return
        }
        this.dataCount = len;
        this.content[this.mValue] = this.paddingTop + this.dataCount * this.spacing + this.paddingBtm - this.spacPading;
    }

    // 刷新一个item
    // */
    UpdateItem(index) {
        if (this.curShowItemIndex[0] <= index && index <= this.curShowItemIndex[1]) {
            if (this.renderEvent) {
                let _index = index - this.curShowItemIndex[0];
                this.itemActiveList[_index] && cc.Component.EventHandler.emitEvents([this.renderEvent], this.itemActiveList[_index], index);
            }
        }
    }

    /**
     * 获取当前index
     */
    curItemIndex(): number {
        let index = 0
        let offset = this.getScrollOffset()
        index = Math.abs(offset[this.mDirect] - this.paddingTop * this.itemway) / (this.itemway * this.spacing)
        return Math.round(index);
    }
    /**
     * 滚动到对应下标的item的位置
     */
    scrollToIndex(index: number, timer: number = 0): void {
        this.stopAutoScroll();
        if (!index) {
            if (this.horizontal) {
                this.scrollToLeft(timer)
            } else {
                this.scrollToTop(timer);
            }
        } else {
            let len = Math.abs(this.itemway * index * this.spacing + this.paddingTop * this.itemway)
            !index && (len = 0);
            let pos = cc.Vec2.ZERO;
            this.horizontal ? (pos.y = 0) : (pos.x = 0);
            pos[this.mDirect] = len;
            this.scrollToOffset(pos, timer);
        }
    }
    /*
    清除所有数据
    */
    ClearData() {
        this.stopAutoScroll();
        if (this.horizontal)
            this.itemSynPos[this.mDirect] = -this.viewMask[this.mValue] * this.viewMask[this.mAnchor]
        else
            this.itemSynPos[this.mDirect] = this.viewMask[this.mValue] * (1 - this.viewMask[this.mAnchor])

        this.content.setPosition(this.itemSynPos);
        for (let index = 0; index < this.itemActiveList.length; index++) {
            const element = this.itemActiveList[index];
            this.itemDeactivePool.put(element);
        }
        this.itemActiveList.splice(0, this.curItemCount);
        this.curItemCount = 0;
        this.content.height = 0;
        this.curShowItemIndex = [0, 0];
        this.dataCount = 0;
        this.lastContentPos = this.itemSynPos[this.mDirect];
    }
}
