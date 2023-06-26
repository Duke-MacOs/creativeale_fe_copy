## 项目介绍

该项目为创意平台前端项目，主要包含以下三个部分：

- [素材库管理平台](https://clab.bytedance.net/library)（[相关文档](https://bytedance.feishu.cn/wiki/wikcnMX2P8woWZOD9TK6mqxnXP2)）：主要负责素材审核发布管理、权限管理、标签管理、素材效果分析等功能
- [素材展示平台](https://clab.bytedance.net/pub/)：主要提供成品素材的展示功能，使用户能简单快速的获取自己想要的创意和素材，并使用该素材快速完成项目开发。
- [编辑器](https://clab.bytedance.net/play/:id)（[相关文档](https://bytedance.feishu.cn/wiki/wikcnu0nTSO10e7hJNp4HI9boEc)）：主要提供项目的快速开发功能，解决 case 开发对专业度要求过高，普通用户难以达到的痛点。

### 项目目录结构

```
├─┬ src
│ ├── api 与服务端对接的接口管理目录
│ ├── assets 静态资源目录
│ ├── components 全局通用组件目录
│ ├── config 全局配置文件目录
│ ├─┬ entries 项目入口目录
│ │ ├── main 素材库管理平台
│ │ ├── template 素材展示平台
│ │ ├── editor 编辑器
│ ├── plugins 通用插件目录（插件库的二次配置封装、自开发插件）
│ ├── types 类型定义归集目录
│ ├── utils 工具函数目录
├── .env.development 开发环境配置文件
├── .env.production 生产环境配置文件
├── craco-multipage.js craco 配置多入口插件
├── craco.config.js craco 配置文件
├── paths.tsconfig.js ts alias 配置文件
├── scm_build.sh SCM 编译执行文件
```

### 项目相关工具

- [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ant design](https://ant.design/docs/react/introduce-cn): UI 组件库。
- [axios](https://github.com/axios/axios): 基于 Promise 的 HTTP 库。
- [emotion](https://github.com/emotion-js/emotion): 一个高性能 CSS-in-JS 库。
- [React](https://reactjs.org/docs/getting-started.html)
- [Redux](https://www.redux.org.cn/): 状态管理库。
- [craco](https://github.com/gsoft-inc/craco): 用于 create react app 的配置层。

### 样式规范

#### css in js

项目中大部分地方使用 [emotion](https://github.com/emotion-js/emotionhttps://github.com/emotion-js/emotion) 进行 css 样式填充，实现类 css module 效果。

## 流程介绍

### 项目开发流程

**获取项目并启动：**

```
$ git clone https://code.byted.org/ad/creativelab_fe.git
$ cd creativelab_fe
$ yarn && yarn start
```

**开发注意事项：**

- 明确自己的开发项目并在 `src/entries` 中找到项目目录。
- 通用的工具类函数、插件等在 `src` 对应目录获取。
- 项目单独使用的模块在项目目录内填充。
- 项目工具类中及现有依赖类库中支持的功能直接使用，避免重复造轮子。

### 项目提交流程

- 一个 MR 尽量只包含一个 commit
- 一个 MR 只包含一个独立完整的功能
- 每个 MR 不要超过 200 行代码增减

### 项目发布流程

- [项目发布操作流程](https://bytedance.feishu.cn/wiki/wikcnwlgBY1T6AYoZ9addOrbInh) 文档
- [项目上线发布规范](https://bytedance.feishu.cn/wiki/wikcnngstPLKpeUAUfdUfJByh1c) 文档
