import { usePersistCallback } from '@byted/hooks';
import dagre from 'dagre';
import { Node, Edge } from 'react-flow-renderer';

const nodeWidth = 172 + 40;
const nodeHeight = 224 + 40;

/**
 * 蓝图节点自动布局
 * @param props
 * @returns
 */
export function useOnLayout({
  nodes,
  edges,
  setNodes,
  setEdges,
}: {
  nodes: Node<RikoScript>[];
  edges: Edge<any>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge<any>[]>>;
}) {
  return usePersistCallback((direction: 'TB' | 'LR' = 'LR') => {
    const { nodes: newNodes, edges: newEdges } = transformFlow(nodes, edges, direction);

    setNodes([...newNodes]);
    setEdges([...newEdges]);
  });
}

export const transformFlow = (nodes: Node[] = [], edges: Edge[] = [], direction = 'LR') => {
  const Graph = new dagre.graphlib.Graph();
  Graph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  Graph.setGraph({ rankdir: direction });

  nodes.forEach(node => {
    Graph.setNode(node.id, { width: node.width || nodeWidth, height: node.height || nodeHeight });
  });

  edges.forEach(edge => {
    Graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(Graph);

  nodes.forEach(node => {
    const nodeWithPosition = Graph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : ('top' as any);
    node.sourcePosition = isHorizontal ? 'right' : ('bottom' as any);
    node.position = {
      x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
      y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
    };

    return node;
  });

  return { nodes, edges };
};
