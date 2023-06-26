import { newID } from '@editor/utils';
import { Node, Edge } from 'react-flow-renderer';

/**
 * 批量更新蓝图脚本及其子脚本ID
 *
 * @param script
 * @returns
 */
export function updateBlueprintIds(script: RikoScript): {
  newScript: RikoScript;
  map: {
    [oldId: number]: number;
  };
} {
  const oldIds = Array.from(collectId(script));
  const map = Object.fromEntries(oldIds.map(id => [id, newID()]));

  return {
    newScript: updateIds(script, map),
    map,
  };

  function* collectId(script: RikoScript): Generator<number> {
    yield script.id;
    for (const key of ['scripts', 'elseScripts'] as const) {
      for (const s of script.props[key] || []) {
        yield* collectId(s);
      }
    }
  }
}

/**
 * 批量更新nodes和edges的ID，主要用于粘贴节点操作
 * @param nodes
 * @param edges
 * @returns
 */
export function updateFlowIds(nodes: Node<RikoScript>[], edges: Edge[]) {
  const newNodes = [] as typeof nodes;
  const map = {} as Record<number, number>;
  for (const node of nodes) {
    const { newScript, map: m } = updateBlueprintIds(node.data);
    newNodes.push({
      ...node,
      data: newScript,
      id: String(newScript.id),
    });
    Object.assign(map, m);
  }

  return {
    nodes: newNodes,
    edges: edges.map(edge => updateIds(edge, map)),
  };
}

/**
 * 批量更新ID
 * @param data
 * @param map
 * @returns
 */
export function updateIds(data: Record<string, any>, map: Record<number, number>) {
  return JSON.parse(
    JSON.stringify(data).replace(new RegExp(Object.keys(map).join('|'), 'g'), id => String(map[Number(id)]))
  );
}
