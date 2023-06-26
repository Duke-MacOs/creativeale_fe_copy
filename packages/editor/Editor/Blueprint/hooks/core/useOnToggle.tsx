import { usePersistCallback } from '@byted/hooks';
import { message } from 'antd';
import { useMemo } from 'react';
import { Node } from 'react-flow-renderer';

/**
 * 批量禁用节点、启用节点
 * @param param0
 * @returns
 */
export function useOnToggle({
  selectedIds,
  nodes,
  setNodes,
}: {
  selectedIds: string[];
  nodes: Node<RikoScript>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
}) {
  const canOnToggle = useMemo(() => {
    if (
      selectedIds.length > 0 &&
      selectedIds.map(id => nodes.find(node => node.id === id)!).every(node => node.type === 'block')
    ) {
      return true;
    }

    return false;
  }, [nodes, selectedIds]);

  const onEnabled = usePersistCallback(async () => {
    if (canOnToggle) {
      try {
        setNodes(nodes =>
          nodes.map(node =>
            selectedIds.includes(node.id)
              ? { ...node, data: { ...node.data, props: { ...node.data.props, enabled: true } } }
              : node
          )
        );
      } catch (error) {
        message.error(error.message);
      }
    }
  });

  const onDisabled = usePersistCallback(async () => {
    if (canOnToggle) {
      try {
        setNodes(nodes =>
          nodes.map(node =>
            selectedIds.includes(node.id)
              ? { ...node, data: { ...node.data, props: { ...node.data.props, enabled: false } } }
              : node
          )
        );
      } catch (error) {
        message.error(error.message);
      }
    }
  });

  return {
    canOnToggle,
    onEnabled,
    onDisabled,
  };
}
