import { NodeType } from '@byted/riko';
import { IScriptState } from '.';
interface IEditor {
  isCollapsed?: boolean;
  isHidden?: boolean;
  isLocked?: boolean;
  /**
   * compProps 元信息
   */
  openKeys?: any[];
  /**
   * 组件默认false, 场景默认true
   */
  enabled?: boolean;
  /**
   * Spine动画可选动画列表;
   */
  animations?: Array<Array<string | number>>;
  // Model 控制器可选动画列表
  layerAnimations?: Array<Array<Array<string | number>>>;
  state?: Array<{ name: string; id: number; duration?: number }>;
  visitIndices?: Array<string | number>;
  /**
   * 粒子发射模式
   *
   * 0 - 重力模式
   *
   * 1 - 半径模式
   */
  emitterType?: 0 | 1;
}
export interface INodeState {
  id: number;
  type: NodeType;
  name: string;
  enabled?: boolean | undefined;
  visible?: boolean;
  scripts: IScriptState[];
  editor?: IEditor;
  asMask?: boolean;
  nodes: INodeState[];
}
