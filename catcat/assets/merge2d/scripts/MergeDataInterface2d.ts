/*
 * 数据类型
 */
export const MOVE_DURATION = 0.3; // 合成时移动时间
export const TILE_MOVE_SPEED = 3000; // 地块移动速度
export const USE_NET = false; // 是否联网
export const COL       = 7;
export const ROW       = 9;
export const TWIDTH    = 150;
export const THEIGHT   = 150;
// export const TOFF      = 10;

export interface UnlockElementData {
    unlock_list: number[],
    reward_list: number[],
};

export interface UseData {
    is_use: number,
    tm: number,
    count: number,
    max_count: number,
    cd: number,
    runing: number,
};

export interface PackCellData {
    element: number,
    icon: string,
    use: UseData,
    com_next: number,
};

export interface OrderData {
    id: number,
    complete: number,
    finish: boolean,
}

export interface MapData {
    stage: number,
    stage_name: string,
    stage_icon_eff: string,
    level: number,
    unlock_area: number[],
    total_exp: number,
    cur_exp: number,
    next_exp: number,
    order_list: OrderData[],
    element_record: number[],
};

export interface PackData {
    pack_list: PackCellData[],
    own: number,
};


export interface TileData {
    tile_x: number,
    tile_y: number,
    pos_x: number,
    pos_y: number,
    unlock: boolean,
    light: boolean,
    area: number, // nouse
    unlock_condition: number, // nouse
    unlock_para: string, // nouse
    tile_node: cc.Node,
    cloud_node: cc.Node,
    // com_next: number,
};

export interface CellData {
    tile_data: TileData,
    element: number,
    icon: string,
    element_node: cc.Node,
    use: UseData,
    com_next: number,
};

export interface ShopItem {
    id: number,
    buy_count: number,
    pool_id: number,
    reward_type: number,
    reward: number,
    sum: number,
    day_buy: number,
    buy_type: number,
    cost_sum: string,
};

export interface ShopData {
    refrush_tm: number,
    list: ShopItem[],
    video_count: number,
    video_tm: number,
};

export interface BubbleData {
    id: number,
    node: any,
};

export interface TmpBubbleData {
    id: number,
    node: any,
    tm: number,
    x: number,
    y: number,
}

export interface MergeDailyRewardData {
    tm: number,
    poped: boolean,
    list: any[],
}

export const SpecialElementTypes = [102, 103, 104, 105];
