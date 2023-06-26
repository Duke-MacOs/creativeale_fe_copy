import { usePersistCallback } from '@byted/hooks';
import { message } from 'antd';
import { useCallback, useMemo } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { getChildrenOfNode } from '../../utils/getChildrenOfNode';

/**
 * 用于记录被选中的节点，以及提供全选功能
 * @param param0
 * @returns
 */
export function useOnSelect({
  nodes,
  edges,
  setNodes,
}: {
  nodes: Node<RikoScript>[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
}) {
  const ids = nodes.reduce((ids, node) => {
    if (node.selected) {
      ids.push(node.id);
    }
    return ids;
  }, [] as string[]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedIds = useMemo(() => ids, [JSON.stringify(ids)]);

  /**
   * 选中所有蓝图节点（除了输入和输出）
   */
  const onSelectAll = useCallback(() => {
    setNodes(nodes => nodes.map(node => (node.type === 'root' ? node : { ...node, selected: true })));
  }, [setNodes]);

  /**
   * 选中当前节点的所有子节点（包括自身）
   */
  const onSelectChildren = usePersistCallback((nodeId?: string) => {
    if (nodeId || selectedIds.length === 1) {
      const root = nodes.find(node => node.id === nodeId ?? selectedIds[0]);
      if (root) {
        try {
          const ids = getChildrenOfNode(root, nodes, edges);
          setNodes(nodes => nodes.map(node => (ids.some(id => id === node.id) ? { ...node, selected: true } : node)));
        } catch (error) {
          message.warning(error.message);
        }
      }
    }
  });

  return {
    selectedIds,
    onSelectAll,
    onSelectChildren,
  };
}
