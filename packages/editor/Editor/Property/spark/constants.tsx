import { QuestionCircleOutlined } from '@ant-design/icons';
import { ShapeConfig } from '@editor/Resource/entries/3d/Basic3D';
import { Tooltip } from 'antd';

export const ALIGN_TYPE = [
  { label: 'left', value: 'left' },
  { label: 'center', value: 'center' },
  { label: 'right', value: 'right' },
] as const;
export const VALIGN_TYPE = [
  { label: 'top', value: 'top' },
  { label: 'middle', value: 'middle' },
  { label: 'bottom', value: 'bottom' },
] as const;
export const BEHAVIOR_TYPE = [
  { label: '施加力', value: 'force' },
  { label: '设置速度', value: 'velocity' },
  { label: '施加扭矩', value: 'torque' },
  { label: '移除物理', value: 'destroy' },
] as const;
export const PHYSICS_COLLIDE_WHEN_TYPE = [
  { label: '碰撞开始', value: 'enter' },
  { label: '碰撞持续', value: 'stay' },
  { label: '碰撞结束', value: 'exit' },
] as const;
export const PARENT_TYPE = [
  { label: '当前场景下', value: 'scene' },
  { label: '当前节点下', value: 'target' },
  { label: '指定节点下', value: 'node' }, // for blueprint
] as const;
export const FOLLOW_MODE_TYPE = [
  { label: '自由移动', value: 'none' },
  { label: '水平移动', value: 'horizontal' },
  { label: '垂直移动', value: 'vertical' },
] as const;
export const RIGID_TYPE = [
  { label: '动态', value: 'dynamic' },
  { label: '静态', value: 'static' },
  { label: '运动', value: 'kinematic' },
] as const;
export const COLLIDER_TYPE = [
  { label: '矩形', value: 'box' },
  { label: '圆', value: 'circle' },
  { label: '多边形', value: 'polygon' },
] as const;
export const COLLIDER_3D_TYPE = [
  { label: '立方体', value: 'box3d' },
  { label: '球体', value: 'sphere' },
  { label: '网格', value: 'mesh' },
] as const;

export const OVERFLOW_TYPE = [
  { label: 'visible', value: 'visible' },
  { label: 'hidden', value: 'hidden' },
  { label: 'scroll', value: 'scroll' },
] as const;
export const ARRAY_FUNCTION = [
  { label: '取值', value: 'get' },
  { label: '更新', value: 'update' },
  { label: '末尾添加', value: 'push' },
  { label: '末尾删除', value: 'pop' },
  { label: '插入', value: 'insert' },
  { label: '删除', value: 'delete' },
  { label: '长度', value: 'length' },
] as const;
export const MATH_FUNCTION = [
  { label: '加', value: 'math.plus' },
  { label: '减', value: 'math.subtract' },
  { label: '乘', value: 'math.multiply' },
  { label: '除', value: 'math.divide' },
  { label: '四舍五入', value: 'math.round' },
  { label: '向下取整', value: 'math.floor' },
  { label: '向上取整', value: 'math.ceil' },
  { label: '取余数', value: 'math.remain' },
  { label: '随机数', value: 'math.random' },
  { label: '当前时间', value: 'math.now' },
  { label: '最大值', value: 'math.max' },
  { label: '最小值', value: 'math.min' },
  { label: '正弦', value: 'math.sin' },
  { label: '余弦', value: 'math.cos' },
  { label: '数组长度', value: 'array.length' }, // 以下为数组操作
  { label: '数组取值', value: 'array.get' },
  { label: '对象取值', value: 'object.get' },
] as const;
export const FUNCTION_LIST = [
  {
    label: '数学计算',
    value: 'math',
    children: MATH_FUNCTION,
  },
  {
    label: '数组计算',
    value: 'array',
    children: ARRAY_FUNCTION,
  },
] as const;
export const MODE_TYPE = [
  { label: '=', value: '=', reserved: { tooltip: '等于' } },
  { label: '+=', value: '+', reserved: { tooltip: '加等于' } },
  { label: '-=', value: '-', reserved: { tooltip: '减等于' } },
  { label: '×=', value: 'x', reserved: { tooltip: '乘等于' } },
  { label: '÷=', value: '÷', reserved: { tooltip: '除等于' } },
] as const;
export const COMPARE_TYPE = [
  { label: '=', value: '=', reserved: { tooltip: '等于' } },
  { label: '≠', value: '!=', reserved: { tooltip: '不等于' } },
  { label: '<', value: '<', reserved: { tooltip: '小于' } },
  { label: '≤', value: '<=', reserved: { tooltip: '小于等于' } },
  { label: '>', value: '>', reserved: { tooltip: '大于' } },
  { label: '≥', value: '>=', reserved: { tooltip: '大于等于' } },
] as const;
export const GESTURE_TYPE = [
  { label: '右滑', value: 1 },
  { label: '左滑', value: 0 },
  { label: '上滑', value: 2 },
  { label: '下滑', value: 3 },
] as const;
export const NODE_TYPE = [
  { label: '精灵', value: 'Sprite' },
  { label: '音频', value: 'Sound' },
  { label: '视频', value: 'Video' },
  { label: '场景', value: 'Scene' },
  { label: '文字', value: 'Text' },
  { label: '图形', value: 'Shape' },
  { label: '脚本', value: 'Script' },
  { label: '控制器', value: 'Controller' },
  { label: '动效', value: 'Effect' },
  { label: '互动组件', value: 'Animation' },
  { label: '粒子', value: 'Particle' },
  { label: 'Lottie', value: 'Lottie' },
  { label: 'Spine', value: 'Spine' },
  { label: '龙骨', value: 'DragonBones' },
  { label: '序列帧', value: 'FrameAnime' },
  { label: '容器', value: 'Container' },
  { label: '转化按钮', value: 'Button' },
] as const;
export const EFFECT_TYPE = [
  { label: '粒子', value: 'Particle' },
  { label: '序列帧', value: 'FrameAnime' },
  { label: 'Lottie', value: 'Lottie' },
  { label: 'Spine', value: 'Spine' },
  { label: '龙骨', value: 'DragonBones' },
] as const;
export const TRACK_TYPE = [
  { label: '结束试玩', value: 'playableEnd' },
  { label: '场景埋点', value: 'enterSection' },
  { label: '点击区域', value: 'clickArea' },
] as const;

export const PLAYABLE_COMPONENT_EVENT_TYPE = [
  { label: '上报完成埋点', value: 'finishEvent' },
  { label: '正常关闭', value: 'requestClose' },
  { label: '主动关闭', value: 'requestCloseTrue' },
  { label: '互动抵时长成功', value: 'playableDurationSuccess' },
  { label: '互动抵时长失败', value: 'playableDurationFail' },
  { label: '互动抵时长关闭', value: 'playableDurationClose' },
  { label: '显示Bar', value: 'showBar' },
  { label: '隐藏Bar', value: 'hideBar' },
  { label: '继续播放视频', value: 'resumeVideoPlay' },
] as const;

export const EASE_BEZIER_LIST = [
  { label: '默认', value: undefined },
  { label: '线性', value: 'linearNone', reserved: { enLabel: 'Linear' } },
  {
    label: '缓动',
    value: 'cubic',
    reserved: { enLabel: 'Ease' },
    children: [
      { label: '进出', value: 'cubicInOut' },
      { label: '进入', value: 'cubicIn' },
      { label: '退出', value: 'cubicOut' },
    ],
  },
  {
    label: '弹性',
    value: 'elastic',
    reserved: { enLabel: 'Spring' },
    children: [
      { label: '在前', value: 'elasticIn' },
      { label: '在后', value: 'elasticOut' },
      { label: '双边', value: 'elasticInOut' },
    ],
  },
  {
    label: '弹跳',
    value: 'bounce',
    reserved: { enLabel: 'Bounce' },
    children: [
      { label: '在前', value: 'bounceIn' },
      { label: '在后', value: 'bounceOut' },
      { label: '双边', value: 'bounceInOut' },
    ],
  },
  {
    label: '惯性',
    value: 'back',
    reserved: { enLabel: 'Back' },
    children: [
      { label: '在前', value: 'backIn' },
      { label: '在后', value: 'backOut' },
      { label: '双边', value: 'backInOut' },
    ],
  },
  { label: '自定义', value: 'custom' },
] as const;

export const EASE_LIST = [
  { label: 'linearNone', value: 'linearNone' },
  { label: 'linearIn', value: 'linearIn' },
  { label: 'linearInOut', value: 'linearInOut' },
  { label: 'linearOut', value: 'linearOut' },
  { label: 'bounceIn', value: 'bounceIn' },
  { label: 'bounceInOut', value: 'bounceInOut' },
  { label: 'bounceOut', value: 'bounceOut' },
  { label: 'backIn', value: 'backIn' },
  { label: 'backInOut', value: 'backInOut' },
  { label: 'backOut', value: 'backOut' },
  { label: 'elasticIn', value: 'elasticIn' },
  { label: 'elasticInOut', value: 'elasticInOut' },
  { label: 'elasticOut', value: 'elasticOut' },
  { label: 'strongIn', value: 'strongIn' },
  { label: 'strongInOut', value: 'strongInOut' },
  { label: 'strongOut', value: 'strongOut' },
  { label: 'sineInOut', value: 'sineInOut' },
  { label: 'sineIn', value: 'sineIn' },
  { label: 'sineOut', value: 'sineOut' },
  { label: 'quintIn', value: 'quintIn' },
  { label: 'quintInOut', value: 'quintInOut' },
  { label: 'quintOut', value: 'quintOut' },
  { label: 'quartIn', value: 'quartIn' },
  { label: 'quartInOut', value: 'quartInOut' },
  { label: 'quartOut', value: 'quartOut' },
  { label: 'cubicIn', value: 'cubicIn' },
  { label: 'cubicInOut', value: 'cubicInOut' },
  { label: 'cubicOut', value: 'cubicOut' },
  { label: 'quadIn', value: 'quadIn' },
  { label: 'quadInOut', value: 'quadInOut' },
  { label: 'quadOut', value: 'quadOut' },
  { label: 'expoIn', value: 'expoIn' },
  { label: 'expoInOut', value: 'expoInOut' },
  { label: 'expoOut', value: 'expoOut' },
  { label: 'circIn', value: 'circIn' },
  { label: 'circInOut', value: 'circInOut' },
  { label: 'circOut', value: 'circOut' },
] as const;
export const CANVAS_SIZE = [
  { label: '竖版全屏 750 * 1334', value: [750, 1334] },
  { label: '横版全屏 1334 * 750', value: [1334, 750] },
  { label: '信息流 640 * 480', value: [640, 480] },
  { label: '信息流 686 * 386', value: [686, 386] },
] as const;
export const BLEND_MODE_TYPE = [
  { label: '正常模式', value: 'normal' },
  { label: '正片叠底', value: 'multiply' },
  { label: '滤色', value: 'screen' },
  { label: '叠加', value: 'overlay' },
  { label: '增加', value: 'add' },
] as const;
export const TRANSITION_TYPE = [
  { label: '无动画', value: 'none' },
  { label: '渐变', value: 'alpha' },
  { label: '滑入', value: 'move' },
] as const;
export const DIRECTION_TYPE = [
  { label: '从左至右', value: 'right' },
  { label: '从右至左', value: 'left' },
  { label: '从上到下', value: 'bottom' },
  { label: '从下到上', value: 'top' },
] as const;
export const JOINT_TYPE = [
  { label: '距离关节', value: 'distance' },
  { label: '平移关节', value: 'prismatic' },
  { label: '旋转关节', value: 'revolute' },
  { label: '齿轮关节', value: 'gear' },
  { label: '马达关节', value: 'motor' },
  { label: '轮子关节', value: 'wheel' },
  { label: '滑轮关节', value: 'pulley' },
  { label: '焊接关节', value: 'weld' },
  { label: '鼠标关节', value: 'mouse' },
] as const;

export const TARGET_NODE_FILTER_TYPE = [
  { label: '本身', value: 'self' },
  { label: '所有的子节点', value: 'children' },
  { label: '所有的父节点', value: 'parents' },
] as const;

export const EVENT_PROPERTIES = [
  {
    label: '目标节点',
    value: 'target',
    children: [
      { label: '名称', value: 'name' },
      { label: '宽度', value: 'width' },
      { label: '高度', value: 'height' },
      { label: 'X', value: 'x' },
      { label: 'Y', value: 'y' },
      { label: '透明度', value: 'alpha' },
      { label: '锚点 X', value: 'anchorX' },
      { label: '锚点 Y', value: 'anchorY' },
      { label: '水平缩放', value: 'scaleX' },
      { label: '垂直缩放', value: 'scaleY' },
      { label: '旋转角度', value: 'rotation' },
      { label: '是否可见', value: 'visible' },
      { label: '是否可点', value: 'mouseEnabled' },
    ],
  },
] as const;

export const COLLIDE_GROUP_TYPE = [
  { label: '默认碰撞组', value: 0 },
  { label: '碰撞组1', value: 1 },
  { label: '碰撞组2', value: 2 },
  { label: '碰撞组3', value: 3 },
  { label: '碰撞组4', value: 4 },
  { label: '碰撞组5', value: 5 },
  { label: '碰撞组6', value: 6 },
  { label: '碰撞组7', value: 7 },
  { label: '碰撞组8', value: 8 },
  { label: '碰撞组9', value: 9 },
] as const;

export const SCALE_MODE_TYPE = [
  {
    label: '默认居中适配',
    value: 1,
    reserved: {
      tooltip: '默认居中适配：在任何设备中，作品都会呈现在屏幕中央',
    },
  },
  {
    label: (
      <div>
        <span>自定义适配</span>
        <Tooltip arrowPointAtCenter placement="bottomRight" title="使用教程">
          <QuestionCircleOutlined
            style={{ marginLeft: '4px' }}
            onClick={event => {
              event.stopPropagation();
              window.open(`https://magicplay.oceanengine.com/tutorials/primary/ten`);
            }}
          />
        </Tooltip>
      </div>
    ),
    value: 0,
    reserved: {
      tooltip: '自定义适配：按照自身意愿，对作品进行适配。点击 ？查看如何适配各机型',
    },
  },
] as const;

export const DESTROY_TYPE = [
  {
    label: '节点',
    value: 'node',
  }, // for blueprint
  {
    label: '自身',
    value: 'self',
  },
  {
    label: '当前场景',
    value: 'scene',
  },
  {
    label: '当前互动组件',
    value: 'root',
  },
] as const;

export const HORIZONTAL_POSITION = [
  {
    label: '左端对齐',
    value: ['left'],
  },
  {
    label: '右端对齐',
    value: ['right'],
  },
  {
    label: '左右对齐',
    value: ['left', 'right'],
  },
  {
    label: '水平居中对齐',
    value: ['center'],
  },
] as const;

export const VERTICAL_POSITION = [
  {
    label: '顶端对齐',
    value: ['top'],
  },
  {
    label: '底端对齐',
    value: ['bottom'],
  },
  {
    label: '上下对齐',
    value: ['top', 'bottom'],
  },
  {
    label: '垂直居中对齐',
    value: ['middle'],
  },
] as const;

export const POSITION_TYPE = [
  {
    label: '自由模式',
    value: 'FREE',
  },
  {
    label: '相对模式',
    value: 'RELATIVE',
  },
  {
    label: '组合模式',
    value: 'GROUPED',
  },
] as const;

export const SETTING_TYPE = [
  {
    label: '全局背景音乐',
    value: 0,
  },
  {
    label: '修改全局背景音乐音量',
    value: 1,
  },
  {
    label: '禁用动画或事件',
    value: 2,
  },
  {
    label: '启用动画或事件',
    value: 3,
  },
  {
    label: '淡出背景音乐',
    value: 4,
  },
] as const;

export const FRAMES_PLAYING_TYPE = [
  {
    label: '默认',
    value: 'normal',
  },
  {
    label: '倒序',
    value: 'reverse',
  },
  {
    label: '乒乓',
    value: 'pingpong',
  },
] as const;

export const SCREEN_ADAPTION = [
  {
    label: '自动翻转屏幕',
    value: 0,
  },
  {
    label: '固定横竖屏幕',
    value: 1,
  },
] as const;

export const FOG_MODE = [
  {
    label: '无',
    value: 0,
  },
  {
    label: '线性',
    value: 1,
  },
] as const;

export const LAYER_TYPE = [
  {
    label: 'Default',
    value: 'Default',
  },
  {
    label: 'TransparentFX',
    value: 'TransparentFX',
  },
  {
    label: 'Ignore Raycast',
    value: 'Ignore Raycast',
  },
  {
    label: 'Test',
    value: 'Test',
  },
  {
    label: 'Water',
    value: 'Water',
  },
  {
    label: 'UI',
    value: 'UI',
  },
] as const;

export const MESH_TYPE = ShapeConfig.map(i => ({
  label: i.name,
  value: i.key,
}));

export const LIGHT_TYPE = [
  {
    label: '方向光',
    value: 'directional',
  },
  {
    label: '聚光灯',
    value: 'spot',
  },
  {
    label: '点光源',
    value: 'point',
  },
] as const;

export const SHADOW_TYPE = [
  {
    label: 'none',
    value: 0,
  },
  {
    label: 'hard',
    value: 1,
  },
  {
    label: 'softLow',
    value: 2,
  },
  {
    label: 'softHigh',
    value: 3,
  },
] as const;

export const SHADOW_CASCADES_TYPE = [
  {
    label: '无级联',
    value: 0,
  },
  {
    label: '二级级联',
    value: 1,
  },
  {
    label: '四级级联',
    value: 2,
  },
] as const;

export const CLEAR_FLAG_TYPE = [
  {
    label: '纯色',
    value: 0,
  },
  {
    label: '天空盒',
    value: 1,
  },
  {
    label: '深度信息',
    value: 2,
  },
] as const;

export const PROJECTION_TYPE = [
  {
    label: '透视投影',
    value: 0,
  },
  {
    label: '正交投影',
    value: 1,
  },
] as const;

export const ORIENTATION_3D_TYPE = [
  { label: 'x轴', value: 0 },
  { label: 'y轴', value: 1 },
  { label: 'z轴', value: 2 },
] as const;

export const RENDER_MODES_1 = [
  {
    label: '叠加',
    value: 0,
  },
  {
    label: '混合',
    value: 1,
  },
] as const;

export const RENDER_MODES_2 = [
  {
    label: '不透明',
    value: 0,
  },
  {
    label: '镂空',
    value: 1,
  },
  {
    label: '透明',
    value: 2,
  },
  {
    label: '叠加',
    value: 3,
  },
] as const;

export const RENDER_MODES_3 = [
  {
    label: '不透明',
    value: 0,
  },
  {
    label: '镂空',
    value: 1,
  },
  {
    label: '淡入淡出',
    value: 2,
  },
  {
    label: '透明',
    value: 3,
  },
] as const;

export const RENDER_MODES_4 = [
  {
    label: '不透明',
    value: 0,
  },
  {
    label: '镂空',
    value: 1,
  },
  {
    label: '透明',
    value: 2,
  },
] as const;

export const MOTION_TYPE = [
  { label: '锁定', value: 0 },
  { label: '限制', value: 1 },
  { label: '自由', value: 2 },
] as const;

export const STANDARD_SMOOTHNESS_TYPE = [
  {
    label: '金属',
    value: 0,
  },
  {
    label: '反照率',
    value: 1,
  },
] as const;

export const SPECULAR_SMOOTHNESS_TYPE = [
  {
    label: '高光',
    value: 0,
  },
  {
    label: '反照率',
    value: 1,
  },
] as const;

// export const PHYSICS_3D_TYPE = [
//   { label: '无', value: 'none' },
//   { label: '静态', value: 'collider3D' },
//   { label: '动态', value: 'rigidbody3D' },
//   { label: '运动学', value: 'kinematic' },
// ] as const;

export const PHYSICS_3D_TYPE = [
  { label: '无', value: 'none' },
  { label: '静态', value: 'static' },
  { label: '动态', value: 'dynamic' },
  { label: '运动学', value: 'kinematic' },
] as const;

// ---

export const RELATION_TYPE = [
  {
    label: '顶层',
    value: 0,
  },
  {
    label: '上一层',
    value: 1,
  },
  {
    label: '下一层',
    value: 2,
  },
] as const;
