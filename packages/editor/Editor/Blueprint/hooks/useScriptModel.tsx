import { usePersistCallback } from '@byted/hooks';
import { OnChange } from '@editor/Editor/Property/cells';
import { useUpdateNodeInternals } from 'react-flow-renderer';
import { useBlueprint } from './core/useBlueprint';

/**
 * 获取选中节点的脚本数据
 * @param param0
 * @returns
 */
export function useScriptModel({ nodes, selectedIds, setNodes, freshEdges }: ReturnType<typeof useBlueprint>) {
  const node = nodes.find(node => node.id === selectedIds[0]);
  /**
   * 动态修改handles数量时需要通知ReactFlow
   * @link https://reactflow.dev/docs/api/hooks/use-update-node-internals/
   */
  const updateNodeInternals = useUpdateNodeInternals();
  return {
    script: node?.data,
    onChange: usePersistCallback((partial: Partial<RikoScript>, { ids }: Parameters<OnChange>[1] = {}) => {
      try {
        // 异步修改数据时通过ids指定目标节点，而不是根据选中的节点
        const targetId = String(ids?.[0] ?? selectedIds[0]);
        setNodes(nodes => {
          return nodes.map(n => {
            if (n.type === 'root') {
              const root = nodes.find(node => node.type === 'root');
              if (targetId === '0' || targetId === String(root!.data.id)) {
                return { ...n, data: { ...n.data, ...partial } };
              }
            } else if (n.id === targetId) {
              freshEdges({ ...n, data: { ...n.data, ...partial } });
              return { ...n, data: { ...n.data, ...partial } };
            }
            return n;
          });
        });
        setTimeout(() => {
          updateNodeInternals(String(selectedIds[0]));
        });
      } catch (error) {
        console.error(error.message);
      }
    }),
  };
}
