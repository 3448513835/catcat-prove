#!/bin/bash
CUR_DIR="$(dirname $0)"

function DeleteUnuseJson {
    echo "删除未用到的json文件"
    local file_path file_name
    find ./assets/jsons -name '*.json' | \
        while read file_path; do
            file_name=${file_path##*/}
            file_name=${file_name%.json}
            if [[ -z $(grep ${file_name} ./assets/Script/common/JsonManager.ts) ]]; then
                echo "删除json文件:${file_path}"
                rm ${file_path} ${file_path}.meta
            fi
        done
}

function DeleteUnuseGame {
    if [[ -z $(grep 'GAME_2D.*true' './assets/Script/common/Config.ts') ]]; then
        if [[ -n $(git status assets/merge2d | grep -o 'nothing to commit, working tree clean') ]]; then
            echo "删除无用的游戏模块assets/merge2d"
            rm -rf assets/merge2d assets/merge2d.meta
        else
            echo "assets/merge2d有未提交文件"
            exit
        fi
    else
        if [[ -n $(git status assets/merge | grep -o 'nothing to commit, working tree clean') ]]; then
            echo "删除无用的游戏模块assets/merge"
            rm -rf assets/merge assets/merge.meta
        else
            echo "assets/merge有未提交文件"
            exit
        fi
    fi
}

function RecoveryUnuseGame {
    echo "删除无用的游戏模块"
    if [[ -z $(grep 'GAME_2D.*true' ./assets/Script/common/Config.ts) ]]; then
        git checkout -- assets/merge2d assets/merge2d.meta
    else
        git checkout -- assets/merge assets/merge.meta
    fi
}

function CompressPng {
    echo "压缩png图片"
    local file_path dir
    dir="$1"
    find ${dir} -name '*.png' | \
        while read file_path; do
            echo "pngquant ${file_path} --force --quality 70 --output ${file_path}"
            pngquant ${file_path} --quality 60-80 --skip-if-larger --force --output ${file_path}
        done
}

# 打包Android
function AndroidPack {
    cp ./native/logo.png ./assets/login_scene/login/logo.png
    # DeleteUnuseGame
    /Applications/CocosCreator/Creator/2.4.11/CocosCreator.app/Contents/MacOS/CocosCreator \
        --path . \
        --build "platform=android"
    say -v Ting-Ting "编译结束"
    cd ./build/jsb-link/frameworks/runtime-src/proj.android-studio
    ./gradlew assembleRelease && cd -
    say -v Ting-Ting "打包结束"
    open ./build/jsb-link/frameworks/runtime-src/proj.android-studio/app/build/outputs/apk/release/
    # RecoveryUnuseGame
}

function WeChatId {
    local id="$1"
    gsed -i "s/wxcae3eec6cd22ee0e/${id}/g" ./settings/wechatgame.json
    gsed -i "s/wx1964b47b67c4f03c/${id}/g" ./settings/wechatgame.json
    gsed -i "s/wxd34319d5b34133cc/${id}/g" ./settings/wechatgame.json
}

function WeChatPack {
    local version=`grep -o '[^_]version:[^,]*' ./assets/Script/common/Config.ts | tr -d '"' | awk '{print $2}'`
    echo "${version}" | pbcopy
    local wechat_json="./settings/wechatgame.json"
    local remote_dir="/www/wwwroot/resource.stygame.com/miaomiao"
    local remote_url="https://resource.stygame.com/miaomiao"
    if [[ -n `grep "MAOQIU_WX.*true" ./assets/Script/common/Config.ts` ]]; then # 毛球派对
        WeChatId "wxd34319d5b34133cc"
        cp ./native/logo4.png ./assets/login_scene/login/logo.png
        remote_url="${remote_url}/maoqiu2d"
        remote_dir="${remote_dir}/maoqiu2d"
    elif [[ -n `grep "MIAOZHICHENG_WX.*true" ./assets/Script/common/Config.ts` ]]; then # 2d 喵之城
        WeChatId "wx1964b47b67c4f03c"
        cp ./native/logo2.png ./assets/login_scene/login/logo.png
        remote_url="${remote_url}/2d"
        remote_dir="${remote_dir}/2d"
    elif [[ -n `grep "MEISHIMIZHEN_WX.*true" ./assets/Script/common/Config.ts` ]]; then # 2d 美食迷阵
        WeChatId "wxcae3eec6cd22ee0e"
        cp ./native/logo3.png ./assets/login_scene/login/logo.png
        remote_url="${remote_url}/3d"
        remote_dir="${remote_dir}/3d"
    fi
    cp ./native/min.ttf ./assets/main_scene/fonts/bobo.ttf
    cp ./native/min.ttf ./assets/trans/trans.ttf
    json_content=$(jq ".REMOTE_SERVER_ROOT=\"${remote_url}/${version}\"" ${wechat_json})
    echo ${json_content} > ${wechat_json}

    # DeleteUnuseGame

    echo "开始编译小程序"
    /Applications/CocosCreator/Creator/2.4.11/CocosCreator.app/Contents/MacOS/CocosCreator --path . --build "platform=wechatgame"
    echo "编译小程序完成"
    cp ./native/bobo.ttf ./assets/main_scene/fonts/bobo.ttf
    cp ./native/trans.ttf ./assets/trans/trans.ttf

    CompressPng ./build/wechatgame
    if [[ -d ${CUR_DIR}/build/wechatgame/remote ]]; then
        find ${CUR_DIR}/build/wechatgame/remote | xargs chmod 777
        ssh ${company_server} "mkdir -p ${remote_dir}; rm -rf ${remote_dir}/${version}"
        rsync -rv ${CUR_DIR}/build/wechatgame/remote ${company_server}:${remote_dir}/${version}
        rm -rf ${CUR_DIR}/build/wechatgame/remote
    fi

    echo "配置game.json"
    local minigame='{ "version": "latest", "provider": "wxbd990766293b9dc4", "contexts": [ { "type": "isolatedContext" } ] }'
    local game_json_file="${CUR_DIR}/build/wechatgame/game.json"
    json_content=$(jq ".plugins.MinigameLoading=${minigame}" ${game_json_file})
    echo ${json_content} > ${game_json_file}
    if [[ -z $(grep 'GAME_2D.*true' './assets/Script/common/Config.ts') ]]; then
        gsed -i 's/{ "name": "merge2d", "root": "subpackages\/merge2d" },//' ./build/wechatgame/game.json
        if [[ -d ./build/wechatgame/subpackages/merge2d ]]; then
            rm -rf ./build/wechatgame/subpackages/merge2d
        fi
    else
        gsed  -i 's/{ "name": "merge", "root": "subpackages\/merge" },//' ./build/wechatgame/game.json
        if [[ -d ./build/wechatgame/subpackages/merge ]]; then
            rm -rf ./build/wechatgame/subpackages/merge
        fi
    fi
    # RecoveryUnuseGame
}

function BytedancePack {
    local version=`grep -o '[^_]version:[^,]*' ./assets/Script/common/Config.ts | tr -d '"' | awk '{print $2}'`
    echo "${version}" | pbcopy
    local byte_json="./settings/bytedance.json"
    local remote_dir="/www/wwwroot/resource.stygame.com/miaomiao"
    local remote_url="https://resource.stygame.com/miaomiao"
    if [[ -n `grep "GAME_2D.*true" ./assets/Script/common/Config.ts` ]]; then
        cp ./native/logo4.png ./assets/login_scene/login/logo.png
        remote_url="${remote_url}/byte_2d"
        remote_dir="${remote_dir}/byte_2d"
    else
        cp ./native/logo4.png ./assets/login_scene/login/logo.png
        remote_url="${remote_url}/byte_3d"
        remote_dir="${remote_dir}/byte_3d"
    fi
    cp ./native/min.ttf ./assets/main_scene/fonts/bobo.ttf
    cp ./native/min.ttf ./assets/trans/trans.ttf
    cp ./native/tt_icon_100008.png assets/main_scene/ui/Icon_100008.png
    cp ./native/tt_icon_100008.png assets/resources/pic/icon/Icon_100008.png
    cp ./native/tt_icon_100008.png assets/main_scene/common/guanggao.png
    json_content=$(jq ".REMOTE_SERVER_ROOT=\"${remote_url}/${version}\"" ${byte_json})
    echo ${json_content} > ${byte_json}

    DeleteUnuseGame

    echo "开始编译小程序"
    /Applications/CocosCreator/Creator/2.4.11/CocosCreator.app/Contents/MacOS/CocosCreator \
        --path . \
        --build "platform=bytedance"
    echo "编译小程序完成"
    cp ./native/bobo.ttf ./assets/main_scene/fonts/bobo.ttf
    cp ./native/trans.ttf ./assets/trans/trans.ttf
    cp ./native/icon_100008.png assets/main_scene/ui/Icon_100008.png
    cp ./native/icon_100008.png assets/resources/pic/icon/Icon_100008.png
    cp ./native/guanggao.png assets/main_scene/common/guanggao.png

    CompressPng ./build/bytedance
    if [[ -d ./build/bytedance/remote ]]; then
        find ./build/bytedance/remote | xargs chmod 777
        ssh ${company_server} "mkdir -p ${remote_dir}; rm -rf ${remote_dir}/${version}"
        rsync -rv ./build/bytedance/remote ${company_server}:${remote_dir}/${version}
        rm -rf ./build/bytedance/remote
    fi
    RecoveryUnuseGame
}

function Main {
    echo "从下面平台中选择一个进行打包:"
    local choose_list=("wechat" "android" "bytedance" "deljson")
    while [[ true ]]; do
        select choose in ${choose_list[@]}; do
            echo "你选择了: ${choose}"
            case ${choose} in
                wechat)
                    WeChatPack
                    exit
                    ;;
                android)
                    AndroidPack
                    exit
                    ;;
                bytedance)
                    BytedancePack
                    exit
                    ;;
                deljson)
                    DeleteUnuseJson
                    exit
                    ;;
            esac
        done
    done
}

Main
