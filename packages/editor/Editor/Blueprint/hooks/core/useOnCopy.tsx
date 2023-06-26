import { EntryKey } from '@shared/globals/localStore';
import { usePersistCallback, useStorage } from '@byted/hooks';
import { message } from 'antd';
import { useMemo } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { useStore } from 'react-redux';
import { isRoot, IStorage } from '../../types';
import { getConnectedEdgesOfNodes } from '../../utils';
import { useOnNodes } from './useOnNodes';

/**
 * 复制节点
 * @param param0
 * @returns
 */
export function useOnCopy({
  selectedIds,
  nodes,
  edges,
  removeNodes,
}: {
  selectedIds: string[];
  nodes: Node<RikoScript>[];
  edges: Edge[];
  removeNodes: ReturnType<typeof useOnNodes>['removeNodes'];
}) {
  const { getState } = useStore<EditorState>();
  const [_, copy] = useStorage<IStorage>(EntryKey.BLUEPRINT);
  const canOnCopy = useMemo(() => {
    return (
      selectedIds.length > 0 &&
      nodes
        .filter(node => selectedIds.includes(node.id))
        .every(node => node.type !== 'root' && !isRoot(node.data.editor?.nodeType))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  /**
   * 进行复制的时候需要同时复制选中的节点和节点内部的连线
   */
  const onCopy = usePersistCallback(({ remove = false } = {}) => {
    if (selectedIds.length > 0) {
      const targets = nodes
        .filter(node => selectedIds.includes(node.id))
        .filter(node => node.type !== 'root' && !isRoot(node.data.editor?.nodeType));
      const { innerEdges } = getConnectedEdgesOfNodes(edges, selectedIds);

      copy({
        nodes: targets,
        edges: innerEdges,
        projectId: getState().project.id,
      });
      if (remove) {
        removeNodes(
          selectedIds.filter(id => {
            const target = nodes.find(node => node.id === id);
            if (!target) {
              throw new Error(`不存在目标节点: ${id}`);
            }
            return target.type !== 'root' && !isRoot(target.data.editor?.nodeType);
          })
        );
        message.info('剪切成功');
      } else {
        message.info('复制成功');
      }
    }
  });
  return {
    canOnCopy,
    onCopy,
  };
}
