import { usePersistCallback } from '@byted/hooks';
import { useCallback } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { IAction, ActionFlag } from '../../types';
import { getConnectedEdgesOfNodes, getSignals } from '../../utils';
import { useRedoStack } from './useRedoStack';
import { useUndoStack } from './useUndoStack';

/**
 * 新建连线和删除连线
 * @param param0
 * @returns
 */
export function useOnEdges({
  edges,
  pushRedo,
  pushUndo,
  setEdges,
}: {
  edges: Edge[];
  pushUndo: ReturnType<typeof useUndoStack>['pushUndo'];
  pushRedo: ReturnType<typeof useRedoStack>['pushRedo'];
  setEdges: React.Dispatch<React.SetStateAction<Edge<any>[]>>;
}) {
  const addEdges = useCallback(
    (edges: Edge[], flag: ActionFlag = 'undo') => {
      setEdges(oldEdges => [...oldEdges, ...edges]);
      const action = {
        type: 'removeEdges',
        data: edges.map(edge => edge.id),
      } as IAction;
      flag === 'undo' ? pushUndo(action) : pushRedo(action);
    },
    [pushRedo, pushUndo, setEdges]
  );

  const removeEdges = useCallback(
    (edgeIds: string[], flag: ActionFlag = 'undo') => {
      setEdges(edges => {
        const removedEdges = edges.filter(edge => edgeIds.includes(edge.id));
        const action = {
          type: 'addEdges',
          data: removedEdges,
        } as IAction;
        flag === 'undo' ? pushUndo(action) : pushRedo(action);
        return edges.filter(edge => !edgeIds.includes(edge.id));
      });
    },
    [pushRedo, pushUndo, setEdges]
  );

  /**
   * 有的时候，比如动态删除输入、输出信号的时候可能没有删除对应的连线，这时候统一刷新edges处理
   */
  const freshEdges = usePersistCallback((node: Node<RikoScript>) => {
    if (node) {
      const { inputs, outputs } = getSignals(node);
      const { inputEdges, outputEdges } = getConnectedEdgesOfNodes(edges, [node.id]);
      const newInputEdges = inputEdges.filter(edge => inputs.some(({ key }) => key === edge.targetHandle));
      const newOutputEdges = outputEdges.filter(edge => outputs.some(({ key }) => key === edge.sourceHandle));
      if (newInputEdges.length !== inputEdges.length || newOutputEdges.length !== outputEdges.length) {
        setEdges(edges =>
          edges
            .filter(edge => [...inputEdges, ...outputEdges].every(e => e.id !== edge.id))
            .concat([...newInputEdges, ...newOutputEdges])
        );
      }
    }
  });

  return {
    addEdges,
    removeEdges,
    freshEdges,
  };
}
