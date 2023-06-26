import type { MenuProps } from 'antd';
type MenuItem = Required<MenuProps>['items'][number];

export function getDocSrc(route: string) {
  const map = {
    // 首页
    '/help/': 'https://bytedance.feishu.cn/docs/doccn2zE554ALqlIG3JCHaEAlpe',

    /* 基础教程 */
    //整体介绍
    '/help/primary/one': 'https://bytedance.feishu.cn/docs/doccnDr1DlPm1s61j8Tdz1RgCLd',
    // 时间轴介绍
    '/help/primary/two': 'https://bytedance.feishu.cn/docs/doccn7IUFhmpTLW5t6cslJiCsld',
    // 场景及全局配置介绍
    '/help/primary/three': 'https://bytedance.feishu.cn/docs/doccnAe6rEOwy3XQ2AgNi1euRoc',
    // 画布操作说明
    '/help/primary/four': 'https://bytedance.feishu.cn/docs/doccnZ6uLtrHzoi6DOyMhQLazlb',
    // 属性面板配置
    '/help/primary/five': 'https://bytedance.feishu.cn/docs/doccnuTBp58LptMBBbJylG080Sb',
    // 蒙版及混合模式
    '/help/primary/six': 'https://bytedance.feishu.cn/docs/doccnSs1ffmZeQBjwBI6TyLpgTd',
    // 特效使用
    '/help/primary/seven': 'https://bytedance.feishu.cn/docs/doccniBg8YKAz3BTbYvePNsGrcW',
    // 动画介绍
    '/help/primary/eight': 'https://bytedance.feishu.cn/docs/doccnsMuNI3kj3HfU8vq8zqv3Zf',
    // 加载完成率优化
    '/help/primary/nine': 'https://bytedance.feishu.cn/docs/doccnG8jFEb2RaQA5VFzF8Ps2Hd',
    // 自定义适配
    '/help/primary/ten': 'https://bytedance.feishu.cn/docs/doccnCqUBkfgYyxC0DXsFbsdXeg',

    /* 中级教程 */
    // 事件介绍1
    '/help/middle/one': 'https://bytedance.feishu.cn/docs/doccnd9eNoMCUS3uyIpYpz14V4r',
    // 事件介绍2
    '/help/middle/two': 'https://bytedance.feishu.cn/docs/doccnwlFEcnN8Bnb5BSCrHoHRkh',
    // 事件介绍3
    '/help/middle/three': 'https://bytedance.feishu.cn/docs/doccnRdohYUdqtKB2BNTM7WuguJ',
    // 事件介绍4
    '/help/middle/four': 'https://bytedance.feishu.cn/docs/doccnkF3aLLgFHkE6drhgtLeSTg',
    // 事件介绍5
    '/help/middle/five': 'https://bytedance.feishu.cn/docs/doccnzSaFxqSQE6ajVY8AQGVosc',
    // 互动组件
    '/help/middle/six': 'https://bytedance.feishu.cn/docs/doccnkaWUz1TWs3ZUp8NJKo0ksf',
    // 直出互动教程
    '/help/middle/seven': 'https://bytedance.feishu.cn/docs/doccnDr1DlPm1s61j8Tdz1RgCLd',

    /* 高级教程 */
    // 基本物理系统
    '/help/senior/one': 'https://bytedance.feishu.cn/docs/doccnmmA91I4BLmcEzzP3HCmYHb',
    //高级物理系统
    '/help/senior/two': 'https://bytedance.feishu.cn/docs/doccnRW5z0mrbXktoMy2Kpth8Mh',
    // 自定义脚本的基本使用
    '/help/senior/three': 'https://bytedance.feishu.cn/docs/doccnlUtebnVeoZhlQx3qQAYyPb',
    // 自定义脚本的属性配置
    '/help/senior/four': 'https://bytedance.feishu.cn/docs/doccnnUJIakYed78QxWPI0j2l3L',

    /* 案例教程 */
    //套圈
    '/help/case/one': 'https://bytedance.feishu.cn/docs/doccnVkuA0c4rPokqF8Q7dJhJsX',
    // 红包雨
    '/help/case/two': 'https://bytedance.feishu.cn/docs/doccnbcstXOLl9EcUobr5SpUSpf',
    // 大转盘
    '/help/case/three': 'https://bytedance.feishu.cn/docs/doccnK2XWfwCNxqrW9ECXOgC9Gb',
    // 砸金蛋
    '/help/case/four': 'https://bytedance.feishu.cn/docs/doccnlOsA7g5xrjTSaHhnuEhUFe',
    // 打地鼠
    '/help/case/five': 'https://bytedance.feishu.cn/docs/doccnJg23pgJIrZNFLrBGqz1ZUc',
    // 接元宝
    '/help/case/seven': 'https://bytedance.feishu.cn/docs/doccnYOvR9EplOwmB9TP0wuosLe',
    // Birdy Bird
    '/help/case/eight': 'https://bytedance.feishu.cn/docs/doccn523xGpCZ6IszhNlfnf8BVg',
    // 飞机大战
    '/help/case/six': 'https://bytedance.feishu.cn/docs/doccnFUmUBy5y02okqted0BEm4D',

    /* 帮助文档 */
    // AE导入
    '/help/docs/import-ae': 'https://bytedance.feishu.cn/docs/doccnFBBhLyD6bPa4CejqrzuV2C#g1zrPE',
    // psd导入
    '/help/docs/import-psd': 'https://bytedance.feishu.cn/docs/doccnU0S2OBcQKIMwHCulBkxWbh',
    // figma导入
    '/help/docs/import-figma': 'https://bytedance.feishu.cn/docs/doccnFRhjF5iXbtCm95Dh1YULUf',
    //PlayableMaker资源上传说明
    '/help/docs/resource-upload': 'https://bytedance.feishu.cn/docs/doccnxn0Z0wqEMDtzVJnPwa1b9c',
    // 代码模式帮助文档
    '/help/docs/code-mode': 'https://bytedance.feishu.cn/docs/doccnlALwFJS7LKtxOsX1VDSTNd',
    // 时间轴操作小技巧、快捷键
    '/help/docs/time-line-tips': 'https://bytedance.feishu.cn/docs/doccnryB5nFeEMfoVS3c0rfXxSe',
    // PlayableMaker常见问题
    '/help/docs/question-answer': 'https://bytedance.feishu.cn/docs/doccn2BBmRuOd87q3GlHSmmrmgj',
  };

  return map[route as keyof typeof map] || 'https://bytedance.feishu.cn/docs/doccn2zE554ALqlIG3JCHaEAlpe';
}

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

export const items = [
  getItem('基础教程', 'sub1', undefined, [
    getItem('整体介绍', '/primary/one'),
    getItem('时间轴介绍', '/primary/two'),
    getItem('场景及全局配置介绍', '/primary/three'),
    getItem('画布操作说明', '/primary/four'),
    getItem('属性面板配置', '/primary/five'),
    getItem('蒙版及混合模式', '/primary/six'),
    getItem('特效使用', '/primary/seven'),
    getItem('动画介绍', '/primary/eight'),
    getItem('加载完成率优化', '/primary/nine'),
    getItem('自定义适配', '/primary/ten'),
  ]),
  getItem('中级教程', 'sub2', undefined, [
    getItem('事件机制', '/middle/one'),
    getItem('互动方式', '/middle/two'),
    getItem('常用事件', '/middle/three'),
    getItem('赋值及逻辑判断', '/middle/four'),
    getItem('克隆事件', '/middle/five'),
    getItem('互动组件', '/middle/six'),
    getItem('直出互动教程', '/middle/seven'),
  ]),
  getItem('高级教程', 'sub3', undefined, [
    getItem('基本物理系统', '/senior/one'),
    getItem('高级物理系统', '/senior/two'),
    getItem('自定义脚本的基本使用', '/senior/three'),
    getItem('自定义脚本的属性配置', '/senior/four'),
  ]),
  getItem('案例教程', 'sub4', undefined, [
    getItem('打地鼠', '/case/five'),
    getItem('砸金蛋', '/case/four'),
    getItem('大转盘', '/case/three'),
    getItem('红包雨', '/case/two'),
    getItem('接元宝', '/case/seven'),
    getItem('flappy bird', '/case/eight'),
    getItem('套圈(高级)', '/case/one'),
    getItem('飞机大战(高级)', '/case/six'),
  ]),
  getItem('帮助文档', 'sub5', undefined, [
    getItem('AE导入', '/docs/import-ae'),
    getItem('PSD导入', '/docs/import-psd'),
    getItem('Figma导入', '/docs/import-figma'),
    getItem('资源上传说明', '/docs/resource-upload'),
    getItem('编码模式', '/docs/code-mode'),
    getItem('时间轴操作小技巧、快捷键', '/docs/time-line-tips'),
    getItem('常见问题', '/docs/question-answer'),
  ]),
];
