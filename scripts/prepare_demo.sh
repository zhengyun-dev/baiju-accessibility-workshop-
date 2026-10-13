#!/bin/bash

echo "=== 白局视频录制环境准备 ==="

# 网页目录
WEB_DIR="/home/yunnn/baiju-accessibility-workshop/web/web-ui"

# skill trace目录
TRACE_DIR="/home/yunnn/baiju-accessibility-workshop/data/02_clean/skill_trace"


echo "[1/3] 检查网页目录..."

if [ ! -d "$WEB_DIR" ]; then
    echo "错误: 找不到网页目录"
    exit 1
fi


echo "[2/3] 启动网页服务器..."

cd "$WEB_DIR"

# 检查8080端口
if lsof -i :8080 >/dev/null 2>&1
then
    echo "网页服务器已经运行"
else
    nohup python3 -m http.server 8080 > ~/baiju_web.log 2>&1 &
    echo "网页服务器启动完成"
fi


echo "[3/3] 准备AGH证据目录..."

cd "$TRACE_DIR"

clear

echo ""
echo "================================"
echo "准备完成"
echo ""
echo "浏览器打开:"
echo "http://localhost:8080"
echo ""
echo "AGH证据目录:"
pwd
echo "================================"
