#!/bin/bash

echo "检查资源,生产文件resout.txt"
dir="$1"

if [[ ! -d "$dir" ]]; then
    echo "$dir 不存在"; exit
fi
uuid_file=$(mktemp)
if [[ -d "./assets" ]]; then
    find "./assets" -name '*.meta' | xargs grep -H 'uuid' | sort | uniq >> "$uuid_file"
fi

resout_file="resout.txt" && cat /dev/null > "$resout_file"
echo "##############################################################" >> "$resout_file"
find "$dir" -name '*.fire' -o -name '*.prefab' | \
    while read -r res_file; do
        echo "正在解析 $res_file"
        echo -e "解析 $res_file :" >> "$resout_file"
        grep "__uuid__" "$res_file" | tr -d '"' | awk '{print $2}' | sort | uniq | \
            while read -r res_uuid; do
                grep "$res_uuid" "$uuid_file" >> "$resout_file"
            done
        echo "##############################################################" >> "$resout_file"
    done

