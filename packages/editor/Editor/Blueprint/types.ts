import { IScriptData } from '@byted/riko';
import { Node, Edge, NodeChange, EdgeChange, NodeRemoveChange, EdgeRemoveChange } from 'react-flow-renderer';

export type Signal = {
  key: string;
  label?: string;
  tooltip?: string;
  parameters?: string[];
};

/**
 * 用于管理蓝图内的状态
 */
export type IState = {
  type: 'Script' | 'Node' | 'Scene' | 'Project';
  id: number;
  script: IScriptData;
  parent?: IState;
} | null;

/**
 * root - 输入/输出节点
 *
 * scene - 场景图块
 *
 * node - 节点图块
 *
 * block - 普通逻辑图块
 *
 * component - 通过组合生成的复用蓝图图块
 */
export type INodeTypes = Exclude<NonNullable<RikoScript['editor']>['nodeType'], 'project' | undefined> | 'root';

export function isRoot(type?: string): type is 'project' | 'scene' | 'node' {
  return type !== undefined && ['project', 'scene', 'node'].includes(type);
}
/**
 * 复制/粘贴
 */
export type IStorage = {
  projectId: number;
  nodes: Node<RikoScript>[];
  edges: Edge[];
};

/**
 * 基本数据操作
 */
export type IAction =
  | IAddNodesAction
  | IRemoveNodesAction
  | IAddEdgesAction
  | IRemoveEdgesAction
  | IAddSignal
  | IRemoveSignal;
export type ActionFlag = 'undo' | 'redo';

interface IAddNodesAction {
  type: 'addNodes';
  data: Node[];
}

interface IRemoveNodesAction {
  type: 'removeNodes';
  data: string[];
}

interface IAddEdgesAction {
  type: 'addEdges';
  data: Edge[];
}

interface IRemoveEdgesAction {
  type: 'removeEdges';
  data: string[];
}

interface IAddSignal {
  type: 'addSignal';
  data: {
    id: string;
    type: 'inputs' | 'outputs';
    signal: {
      key: string;
      label?: string;
      tooltip?: string;
    };
  };
}

interface IRemoveSignal {
  type: 'removeSignal';
  data: IAddSignal['data'];
}

export function assertNodeRemoveChange(nodes: NodeChange[]): asserts nodes is NodeRemoveChange[] {
  if (nodes.some(node => !('id' in node) || !('type' in node))) {
    throw new Error('assert Error');
  }
}

export function assertEdgeRemoveChange(edges: EdgeChange[]): asserts edges is EdgeRemoveChange[] {
  if (edges.some(edge => !('id' in edge) || !('type' in edge))) {
    throw new Error('assert Error');
  }
}

export type BlueprintScript = RikoScript & {
  type: 'Blueprint';
};
