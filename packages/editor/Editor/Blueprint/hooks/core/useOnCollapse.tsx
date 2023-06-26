import { usePersistCallback } from '@byted/hooks';
import { message } from 'antd';
import { Edge, Node, useUpdateNodeInternals } from 'react-flow-renderer';
import { getConnectedEdgesOfNodes } from '../../utils';
import { getChildrenOfNode } from '../../utils/getChildrenOfNode';

/**
 * 用于折叠和展开子节点
 */
export function useOnCollapse({
  selectedIds,
  nodes,
  edges,
  setNodes,
  setEdges,
}: {
  nodes: Node<RikoScript>[];
  edges: Edge[];
  selectedIds: string[];
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}) {
  const updateNodeInternals = useUpdateNodeInternals();
  const root = nodes.find(node => node.id === selectedIds[0]);
  const canOnExpand = selectedIds.length === 1 && root?.data.editor?.collapsed;
  const onExpand = usePersistCallback(() => {
    const root = nodes.find(node => node.id === selectedIds[0]);

    if (root) {
      try {
        const ids = getChildrenOfNode(root, nodes, edges);
        const { innerEdges } = getConnectedEdgesOfNodes(edges, ids);
        setNodes(nodes =>
          nodes.map(node =>
            ids.includes(node.id)
              ? { ...node, hidden: false, data: { ...node.data, editor: { ...node.data.editor, collapsed: false } } }
              : node
          )
        );
        setEdges(edges =>
          edges.map(edge => (innerEdges.some(e => e.id === edge.id) ? { ...edge, hidden: false } : edge))
        );
        setTimeout(() => {
          for (const id of ids) {
            updateNodeInternals(String(id));
          }
        });
      } catch (error) {
        message.warning(error.message);
      }
    }
  });

  const onExpandAll = usePersistCallback(() => {
    setNodes(nodes =>
      nodes.map(node => ({
        ...node,
        hidden: false,
        data: { ...node.data, editor: { ...node.data.editor, collapsed: false } },
      }))
    );
    setEdges(edges =>
      edges.map(edge => ({
        ...edge,
        hidden: false,
      }))
    );
  });

  const canOnCollapse = selectedIds.length === 1 && !canOnExpand;
  const onCollapse = usePersistCallback(() => {
    const root = nodes.find(node => node.id === selectedIds[0]);
    if (root) {
      try {
        const ids = getChildrenOfNode(root, nodes, edges);
        if (ids.length > 1) {
          const { innerEdges } = getConnectedEdgesOfNodes(edges, ids);
          setNodes(nodes =>
            nodes.map(node =>
              node.id === root.id
                ? { ...node, data: { ...node.data, editor: { ...node.data.editor, collapsed: true } } }
                : ids.filter(id => id !== root.id).includes(node.id)
                ? { ...node, hidden: true }
                : node
            )
          );
          setEdges(edges =>
            edges.map(edge => (innerEdges.some(e => e.id === edge.id) ? { ...edge, hidden: true } : edge))
          );
        }
      } catch (error) {
        message.warning(error.message);
      }
    }
  });

  return {
    canOnCollapse,
    onCollapse,
    canOnExpand,
    onExpand,
    onExpandAll,
  };
}
