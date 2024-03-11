import EventManager from "./EventManager"



export default class PackManager {

    private static _itemData = []

    public static initItemData(data: any[]) {
        // cc.error(data, "data========")
        this._itemData = data
        EventManager.dispatch(EventManager._event_name.EVENT_PACK_DATA_CHANGE)
    }

    public static getItemData() {
        return this._itemData
    }

    public static getItemDataById(id: number) {
        for (let i = 0; i < this._itemData.length; i++) {
            const data = this._itemData[i]
            if (id == Number(data["item_id"])) {
                return data
            }
        }

        return undefined
    }

    public static getItemNumById(id: number) {
        for (let i = 0; i < this._itemData.length; i++) {
            const data = this._itemData[i]
            if (id == Number(data["item_id"])) {
                return Number(data["item_num"])
            }
        }

        return 0
    }
}
