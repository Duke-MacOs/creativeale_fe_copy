import { INodeState } from '../../types';

export const extractNode = (nodes: INodeState[], id: number): [INodeState[], INodeState?] => {
  for (const node of nodes) {
    if (node.id === id) {
      const newNodes = nodes.filter(node => node.id !== id);
      return [newNodes, node];
    }
    const [newNodes, newNode] = extractNode(node.nodes, id);
    if (newNode) {
      const { id } = node;
      return [nodes.map(node => (node.id === id ? { ...node, nodes: newNodes } : node)), newNode];
    }
  }
  return [nodes];
};

export const putNode = (
  id: number,
  nodes: INodeState[],
  putId: number,
  putIndex: number,
  newNode: INodeState
): INodeState[] => {
  for (const { id, nodes: children } of nodes) {
    const newNodes = putNode(id, children, putId, putIndex, newNode);
    if (newNodes !== children) {
      return nodes.map(node => (node.id === id ? { ...node, nodes: newNodes } : node));
    }
  }
  if (id === putId) {
    if (putIndex < 0 || putIndex >= nodes.length) {
      return nodes.concat(newNode);
    }
    return [...nodes.slice(0, putIndex), newNode, ...nodes.slice(putIndex)];
  }
  return nodes;
};
export const replaceNode = (nodes: INodeState[], map: (oldNode: INodeState) => INodeState): INodeState[] => {
  for (const node of nodes) {
    const newNode = map(node);
    const { id } = node;
    if (newNode !== node) {
      return nodes.map(node => (node.id === id ? newNode : node));
    }
    const newNodes = replaceNode(node.nodes, map);
    if (newNodes !== node.nodes) {
      return nodes.map(node => (node.id === id ? { ...node, nodes: newNodes } : node));
    }
  }
  return nodes;
};

export function replaceAllNodes(nodes: INodeState[], map: (oldNode: INodeState) => INodeState) {
  return nodes.reduce((nodes, node) => {
    const newNode = map(node);
    if (newNode.nodes.length) {
      newNode.nodes = replaceAllNodes(newNode.nodes, map);
    }
    nodes.push(newNode);
    return nodes;
  }, [] as INodeState[]);
}
