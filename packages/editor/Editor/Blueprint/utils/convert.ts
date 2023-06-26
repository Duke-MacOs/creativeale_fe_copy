import { Node, Edge } from 'react-flow-renderer';
import { getHandles } from '../components/BlueBlock';
import { createEdge } from './createEdge';
import { getRikoSignals, getSignals } from './signals';

const defaultInputPosition = { x: 100, y: 400 };
const defaultOutputPosition = { x: 900, y: 400 };

/**
 * 蓝图脚本转化为flow数据Nodes和Edges
 * @param script
 * @returns
 */
export const scriptToFlow = (
  script: RikoScript,
  hiddenOutput = false
): { nodes: Node<RikoScript>[]; edges: Edge[] } => {
  const nodes: Node<RikoScript>[] = [];
  const edges: Edge[] = [];
  const {
    id,
    props: { scripts = [] },
    editor: { inputPosition = defaultInputPosition, outputPosition = defaultOutputPosition } = {},
  } = script;
  nodes.push(
    {
      id: '0',
      position: inputPosition,
      type: 'root',
      data: script,
    },
    {
      id: String(id),
      position: outputPosition,
      type: 'root',
      data: script,
      hidden: hiddenOutput,
    }
  );
  for (const script of scripts) {
    const { id, editor: { position = defaultInputPosition, nodeType } = {} } = script;
    const node = {
      id: String(id),
      position,
      type: nodeType,
      data: script,
    };
    // const { inputs, outputs } = getSignals(node);
    nodes.push({
      ...node,
      // hidden: nodeType === 'node' && inputs.filter(({ key }) => key !== 'onStart').length === 0 && outputs.length === 0,
    });
  }

  for (const node of nodes) {
    if (node.type !== 'root' || node.id === '0') {
      putEdges(node);
    }
  }

  return { nodes, edges };

  /**
   * 根据单个Node获取对应的Edges
   * @param node
   */
  function putEdges(node: Node<RikoScript>) {
    const {
      id: source,
      type,
      data: { editor: { inputs = [], outputs = [] } = {}, props },
    } = node;
    const { inputs: inputs_connections, outputs: outputs_connections } = props;
    const connections: RikoScript['props']['outputs'] =
      (type === 'root' ? inputs_connections : outputs_connections) || {};

    for (const [sourceHandle, targetEntries] of Object.entries(connections)) {
      const { inputs: $inputs, outputs: $outputs } = getRikoSignals(props);
      const allowedSourceHandle = (type === 'root' ? [...inputs, ...$inputs] : [...outputs, ...$outputs]).map(
        signal => signal.key
      );
      if (allowedSourceHandle.includes(sourceHandle)) {
        for (const [targetId, targetHandle, data] of targetEntries) {
          const target = nodes.find(node => node.data.id === targetId);
          if (target) {
            const { inputs, outputs } = getSignals(target);
            const allowedTargetHandle = (target.type === 'root' ? outputs : inputs).map(signal => signal.key);
            if (allowedTargetHandle.includes(targetHandle)) {
              edges.push(
                createEdge({
                  source,
                  target: String(targetId),
                  sourceHandle,
                  targetHandle,
                  data,
                })
              );
            }
          }
        }
      }
    }
  }
};

/**
 * flow数据Nodes和Edges转化为蓝图脚本
 * @param nodes
 * @param edges
 * @returns
 */
export const flowToScript = (nodes: Node<RikoScript>[], edges: Edge[]): RikoScript => {
  const isConnect = getIsConnected(nodes);
  const connections = edges.reduce((map, edge) => {
    if (isConnect(edge)) {
      const { source, target, sourceHandle, targetHandle, data } = edge;
      if (!map[source][sourceHandle!]) {
        map[source][sourceHandle!] = [];
      }
      map[source][sourceHandle!].push([Number(target), targetHandle!, data]);
    }
    return map;
  }, Object.fromEntries(nodes.map(({ id }) => [id, {} as Record<string, Array<[number, string, Record<string, string>]>>])));
  const { data: root, position: inputPosition } = nodes.find(({ id }) => id === '0')!;
  const { position: outputPosition } = nodes.find(({ id, data }) => id !== '0' && data.id === root.id)!;
  const scripts = nodes.reduce((scripts, { id, data: script, position }) => {
    if (id !== '0' && script.id !== root.id) {
      scripts.push({
        ...script,
        editor: { ...script.editor, position },
        props: { ...script.props, outputs: connections[script.id] },
      });
    }
    return scripts;
  }, [] as RikoScript[]);
  return {
    ...root,
    editor: {
      ...root.editor,
      inputPosition,
      outputPosition,
    },
    props: {
      ...root.props,
      scripts,
      inputs: connections[0],
    },
  };
};

const getIsConnected = (nodes: Node<RikoScript>[]) => {
  const map = nodes.reduce((map, { id, type, data: script }) => {
    map[id] = getHandles(id, script, type === 'root');
    return map;
  }, {} as Record<string, ReturnType<typeof getHandles>>);
  return ({ source, target, sourceHandle, targetHandle }: Edge) => {
    return (
      map[source] &&
      map[target] &&
      map[source].outputs.find(({ key }) => key === sourceHandle) &&
      map[target].inputs.find(({ key }) => key === targetHandle)
    );
  };
};
