#!/bin/bash

set -e # 遇到返回值非零退出
set +x # 不打印执行脚本
set +v # 不打印标准输入

#-- 准备环境
. /etc/profile
. /home/tiger/.nvm/nvm.sh # 加载scm机器上的nvm脚本

nvm install 16
nvm use 16

#-- 设置环境变量
# https://create-react-app.dev/docs/adding-custom-environment-variables/
# export https_proxy=http://10.20.47.147:3128 http_proxy=http://10.20.47.147:3128 no_proxy="*.byted.org"
if [[ "$BUILD_REPO_NAME" == 'ad/creativelab/interactive_platform_fe' ]]; then
  export PUBLIC_URL=https://lf6-cdn2-tos.bytegoofy.com/byte-creativelab/platform/fe/
else
  export PUBLIC_URL=https://lf6-cdn2-tos.bytegoofy.com/byte-creativelab/clab/fe/
fi
export REACT_APP_BUILD_VERSION="SCM$BUILD_REPO_ID@$BUILD_VERSION#$BUILD_BASE_COMMIT_HASH"
export REACT_APP_BUILD_REPO_ID="$BUILD_REPO_ID"
export REACT_APP_BUILD_TYPE="$BUILD_TYPE"
export REACT_APP_VERSION="$BUILD_VERSION"
export PUPPETEER_SKIP_DOWNLOAD=1

#--- 删掉可能的 node_modules
rm -rf ./node_modules

#--- 前端构建
npm set registry https://bnpm.byted.org

npx yarn@1.22.11 install
# npm install --registry=https://registry.npm.taobao.org
# npm install --registry=http://bnpm.byted.org/
BUILD_PATH=build npx yarn@1.22.11 build

#--- 移动文件
# ./build: webpack输出文件夹
# ./output: 该目录会被打包入容器
# ./output_resource: 该目录会被上传CDN
find ./build -type f | while read file; do
  if [[ "$file" == *.html ]]; then
    dest="${file/build/output}"
  else
    dest="${file/build/output_resource}"
  fi
  mkdir -p "$(dirname "$dest")"
  mv "$file" "$dest"
done

mv scripts/public/output/* output/
