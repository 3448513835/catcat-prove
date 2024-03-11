/*
 * 旅行数据
 */
interface TravelMsg {
    percent: number,
    point_id: number,
    finish: boolean,
    refrush_tm: number,
    box_gain_list: any,
    // box_reward: any,
};
import Utils from "../../Script/common/Utils"
import { User } from "../../Script/common/User"
import JsonManager from "../../Script/common/JsonManager"

const LOCAL_KEY = "TRAVEL_DATA";
export default class TravelData {
    public static getTravelData (): TravelMsg {
        // let data = cc.sys.localStorage.getItem(LOCAL_KEY);
        let data = User.getItem(LOCAL_KEY);
        if (!data) {
            data = {
                percent: 0,
                point_id: 1,
                finish: false,
                refrush_tm: Utils.getDayEndTm(),
                box_gain_list: [],
                // box_reward: this.getBoxRewardList(),
            };
        }
        else {
            data = JSON.parse(data);
        }
        if (data.refrush_tm <= Date.now()) {
            data.box_gain_list = [];
            data.refrush_tm = Utils.getDayEndTm();
            this.saveTravelData(data);
        }
        return data;
    }

    public static saveTravelData (travel_data: TravelMsg) {
        // cc.sys.localStorage.setItem(LOCAL_KEY, JSON.stringify(travel_data));
        User.setItem(LOCAL_KEY, JSON.stringify(travel_data));
    }

    public static getBoxReward (id: number) {
        let explore_base_json = JsonManager.getJson(JsonManager._json_name.EXPLOER_BASE);
        let explore_reword_json = JsonManager.getJson(JsonManager._json_name.EXPLOER_REWORD);
        let [reward, count] = explore_base_json[id].reword.split(":");
        let sum = 0, list = [], reward_list = [];
        for (let key in explore_reword_json) {
            let value = explore_reword_json[key];
            if (value.reword == reward) {
                sum += value.weigt;
                list.push(value);
            }
        }
        count = Number(count);
        while (count > 0) {
            -- count;
            let random = sum*Math.random(), join = false;
            console.log(random);
            for (let item of list) {
                if (random <= item.weigt) {
                    reward_list.push(item.reword_index);
                    break;
                }
                else {
                    random -= item.weigt;
                }
            }
        }
        return reward_list;
    }

    // private static getBoxRewardList () {
    //     let list = [];
    //     let explore_base_json = JsonManager.getJson(JsonManager._json_name.EXPLOER_BASE);
    //     for (let key in explore_base_json) {
    //         let reward = explore_base_json[key].reword;
    //     }
    // }
}

export { TravelData, TravelMsg }
