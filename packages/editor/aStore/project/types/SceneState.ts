import { SceneReducerAction } from '..';
import { IScriptState } from './ScriptState';
import { INodeState } from './NodeState';
export interface IEditor {
  dataVersion?: number;
  store?: Record<string | symbol, unknown>; // 互动组件全局变量
  compProps?: ICompProp[];
  lockCapture?: boolean;
  loading?: boolean; // 是否加载场景
  playable?: boolean; // 是否直出互动配置场景
  // 交互视频故事板位置
  position?: { x: number; y: number };
  capture?: string; // base64 截屏
  moment: number;
  scale: number;
  selected: {
    // [nodeId]: scriptId[];
    [key: number]: number[];
  };
  selectedInnerNode?: number[];
  selectedCubemap?: number;
  /**
   * 当前是否为3D编辑模式
   */
  edit3d?: boolean;
  /**
   * 所有状态
   */
  state?: Array<{ name: string; id: number; duration?: number }>;
  /**
   * 当前选中状态
   */
  stateId?: number;
  visitIndices?: Array<string | number>;
  sourceJson?: string;
  /**
   * 是否开放使用
   */
  isOpen?: boolean;
  cover?: string;
}
export interface ICompProp {
  ids: Array<number>;
  enabled?: boolean;
  type: string; // 节点类型
  name: string; // 节点名称
  props: Array<{ key: string; default: unknown; value?: unknown; enabled?: boolean }>;
  state?: {
    [stateId: number]: Partial<Omit<IProps, 'state'>>;
  };
}
export interface ISceneState {
  /**
   * 场景内部ID, 主要于redux actions参数
   */
  id: number;
  /**
   * 数据库场景表ID, 主要用于保存数据
   */
  sceneId: number;
  /**
   * 主要用于场景跳转脚本，复制项目时orderId不变
   */
  orderId: number;
  parentId?: number | string;
  type: 'Scene' | 'Animation' | 'Animation3D' | 'Model' | 'Particle3D';
  name: string;
  editor: IEditor;
  props: {
    [id: number]: IProps;
  };
  nodes: INodeState[];
  scripts?: IScriptState[];
  history: {
    undoStack: SceneReducerAction[];
    redoStack: SceneReducerAction[];
  };
}

export interface IProps {
  state?: {
    [stateId: number]: Partial<Omit<IProps, 'state'> & Pick<INodeState, 'scripts' | 'enabled' | 'asMask'>>;
  };
  stateId?: number;
  type: ISceneState['type'] | INodeState['type'] | IScriptState['type'] | 'Cubemap';
  jumpSceneId?: number;
  compProps?: ICompProp[];
  scripts?: RikoScript[];
  duration?: number;
  enabled?: boolean;
  sceneId?: number;
  script?: string;
  asMask?: boolean;
  height?: number;
  width?: number;
  time?: number;
  loop?: boolean;
  text?: string;
  name?: string;
  materialUrls?: Array<number | string>;
  cubemapUrl?: number | string;
  url?: string | number;
  fontSize?: number;
  italic?: boolean;
  bold?: boolean;
  x?: number;
  y?: number;
  _editor?: any;
  gestureType?: number;
  distance?: number;
  targetId?: number;
  [key: string]: unknown;
}
