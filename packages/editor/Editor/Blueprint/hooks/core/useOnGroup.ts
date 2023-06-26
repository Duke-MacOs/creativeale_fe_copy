import { usePersistCallback } from '@byted/hooks';
import { useMemo } from 'react';
import { Node, Edge, getRectOfNodes } from 'react-flow-renderer';
import { isRoot } from '../../types';
import { createEdgeId, flowToScript, scriptToFlow, getConnectedEdgesOfNodes, createCustomSignal } from '../../utils';
import { createBlueprintScript } from './useOnInit';

/**
 * 将多个节点组合成一个复合蓝图节点
 * @param param0
 * @returns
 */
export function useOnGroup({
  nodes,
  edges,
  selectedIds,
  removeNodes,
  addNodes,
  addEdges,
}: {
  nodes: Node<RikoScript>[];
  edges: Edge[];
  selectedIds: string[];
  removeNodes: any;
  addNodes: any;
  addEdges: any;
}) {
  const canOnGroup = useMemo(() => {
    return (
      selectedIds.length > 1 &&
      nodes
        .filter(node => selectedIds.includes(node.id))
        .every(node => node.type !== 'root' && !isRoot(node.data.editor?.nodeType))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  const onGroup = usePersistCallback(() => {
    const selectedNodes = nodes.filter(node => selectedIds.includes(node.id));
    const rect = getRectOfNodes(selectedNodes);
    const { innerEdges, inputEdges, outputEdges } = getConnectedEdgesOfNodes(edges, selectedIds);
    const script = createBlueprintScript('复合节点', 'component');
    const { map: inputMap, signals: inputs } = handleEdges(inputEdges, 'in');
    const { map: outputMap, signals: outputs } = handleEdges(outputEdges, 'out');
    script.editor!.inputs = inputs.map(({ key, label, tooltip }) => ({ key, label, tooltip }));
    script.editor!.outputs = outputs.map(({ key, label, tooltip }) => ({ key, label, tooltip }));

    const flow = scriptToFlow(script);
    const newNodes = [...selectedNodes, ...flow.nodes];
    const newEdges = [
      ...innerEdges,
      ...uniqueEdges(
        inputEdges.map(edge => {
          return replaceEdge(edge, { source: '0', sourceHandle: inputMap.get(edge.id) });
        })
      ),
      ...uniqueEdges(
        outputEdges.map(edge => {
          return replaceEdge(edge, { target: String(script.id), targetHandle: outputMap.get(edge.id) });
        })
      ),
    ];
    const newBlueprintScript = flowToScript(newNodes, newEdges);

    removeNodes(selectedIds);
    addNodes([
      {
        id: String(script.id),
        position: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
        type: 'component',
        data: { ...newBlueprintScript },
      },
    ]);
    addEdges([
      ...uniqueEdges(
        inputEdges.map(edge =>
          replaceEdge(edge, { target: String(newBlueprintScript.id), targetHandle: inputMap.get(edge.id) })
        )
      ),
      ...uniqueEdges(
        outputEdges.map(edge =>
          replaceEdge(edge, { source: String(newBlueprintScript.id), sourceHandle: outputMap.get(edge.id) })
        )
      ),
    ]);
  });

  return {
    canOnGroup,
    onGroup,
  };

  function handleEdges(edges: Edge[], inOrOut: 'in' | 'out' = 'out') {
    const pointMap = (edge: Edge) =>
      inOrOut === 'in' ? `${edge.target}:${edge.targetHandle}` : `${edge.source}:${edge.sourceHandle}`;
    let key = 1;
    const map = new Map();
    const signals = [] as {
      key: string;
      label?: string | undefined;
      tooltip?: string | undefined;
      _edge: Edge;
    }[];
    for (const edge of edges) {
      const point = pointMap(edge);
      const target = signals.find(({ _edge }) => pointMap(_edge) === point);
      if (target) {
        map.set(edge.id, map.get(target._edge.id));
        continue;
      } else {
        const newKey = createCustomSignal(inOrOut === 'in' ? '$inputs' : '$outputs', key);
        signals.push({
          key: newKey,
          label: `${inOrOut === 'in' ? '输入' : '输出'}信号 ${key}`,
          _edge: edge,
        });
        map.set(edge.id, newKey);
        key++;
      }
    }

    return {
      map,
      signals,
    };
  }
}

function uniqueEdges(edges: Edge[]): Edge[] {
  const set: Edge[] = [];
  for (const edge of edges) {
    if (set.every(s => s.id !== edge.id)) {
      set.push(edge);
    }
  }
  return set;
}

/**
 * 替换Edge的部分属性和id
 * @param edge
 * @param partial
 * @returns
 */
function replaceEdge(edge: Edge, partial: Partial<Pick<Edge, 'source' | 'sourceHandle' | 'target' | 'targetHandle'>>) {
  const { source, sourceHandle, target, targetHandle } = edge as Required<Edge>;
  return {
    ...edge,
    ...partial,
    id: createEdgeId({ source, sourceHandle, target, targetHandle, ...partial }),
  };
}
