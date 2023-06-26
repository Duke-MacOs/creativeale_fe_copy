import { useCallback } from 'react';
import { ActionFlag, IAction } from '../../types';
import { useRedoStack } from './useRedoStack';
import { useUndoStack } from './useUndoStack';
import { Node, Edge } from 'react-flow-renderer';

/**
 * 新增信号和删除信号
 * @param param0
 * @returns
 */
export function useOnSignal({
  setNodes,
  pushRedo,
  pushUndo,
}: {
  pushUndo: ReturnType<typeof useUndoStack>['pushUndo'];
  pushRedo: ReturnType<typeof useRedoStack>['pushRedo'];
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge<any>[]>>;
}) {
  const addSignal = useCallback(
    (
      {
        id,
        type,
        signal,
      }: { id: string; type: 'inputs' | 'outputs'; signal: { key: string; label?: string; placeholder?: string } },
      flag: ActionFlag = 'undo'
    ) => {
      setNodes(nodes => {
        const target = nodes.find(node => node.id === id)!;
        const script = {
          ...target.data,
          editor: {
            ...target.data.editor,
            [type]: [...(target.data.editor?.[type] ?? []), signal],
          },
        };

        return nodes.map(node =>
          node.data === target!.data
            ? {
                ...node,
                data: script,
              }
            : node
        );
      });

      const action = {
        type: 'removeSignal',
        data: { id, type, signal },
      } as IAction;
      flag === 'undo' ? pushUndo(action) : pushRedo(action);
    },
    [pushRedo, pushUndo, setNodes]
  );

  const removeSignal = useCallback(
    (
      {
        id,
        type,
        signal,
      }: { id: string; type: 'inputs' | 'outputs'; signal: { key: string; label?: string; placeholder?: string } },
      flag: ActionFlag = 'undo'
    ) => {
      setNodes(nodes => {
        const target = nodes.find(node => node.id === id)!;
        const script = {
          ...target.data,
          editor: {
            ...target.data.editor,
            [type]: target.data.editor?.[type]?.filter(item => item.key !== signal.key) ?? [],
          },
        };

        return nodes.map(node => (node.data === target.data ? { ...node, data: script } : node));
      });

      const action = {
        type: 'addSignal',
        data: { id, type, signal },
      } as IAction;
      flag === 'undo' ? pushUndo(action) : pushRedo(action);
    },
    [pushRedo, pushUndo, setNodes]
  );

  return { addSignal, removeSignal };
}
