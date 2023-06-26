import { useEventBus } from '@byted/hooks';
import { useState } from 'react';
import { useNodesState, useEdgesState } from 'react-flow-renderer';
import {
  useOnDispatch,
  useLog,
  useRedoStack,
  useUndoStack,
  useOnSignal,
  useOnEdges,
  useOnNodes,
  useOnSave,
  useOnInit,
  useOnLayout,
  useOnPaste,
  useRegistryHotkeys,
  useOnCopy,
  useOnSelect,
  useOnGroup,
  useOnEnter,
  useLoading,
  useCoordinate,
  useOnCollapse,
  useOnPublish,
  useOnToggle,
} from '..';
import { IState } from '../../types';

/**
 * 该Hook实现蓝图最底层和核心的能力，并通过Context透传给下层组件，对于非核心逻辑应该在外部链式调用本Hook所暴露出的方法
 * @returns
 */
export const useBlueprint = () => {
  const { ref, getCoordinate, setCoordinate } = useCoordinate();
  const [loadingNodes, setLoadingNodes] = useLoading();
  const [nodes, setNodes] = useNodesState<RikoScript>([]);
  const [edges, setEdges] = useEdgesState([]);
  const { selectedIds, onSelectAll, onSelectChildren } = useOnSelect({
    nodes,
    edges,
    setNodes,
  });
  const { pushUndo, popUndo, clearUndoStack, length: undoLen } = useUndoStack();
  const { pushRedo, popRedo, clearRedoStack, length: redoLen } = useRedoStack();
  const { addNodes, removeNodes } = useOnNodes({ setLoadingNodes, setNodes, pushUndo, pushRedo });
  const { addEdges, removeEdges, freshEdges } = useOnEdges({ edges, setEdges, pushUndo, pushRedo });
  const { addSignal, removeSignal } = useOnSignal({ setNodes, setEdges, pushRedo, pushUndo });
  const dispatchAction = useOnDispatch({
    addNodes,
    removeNodes,
    addEdges,
    removeEdges,
    addSignal,
    removeSignal,
    popUndo,
    popRedo,
  });

  const [state, setState] = useState<IState>(null);
  const init = useOnInit({ clearUndoStack, clearRedoStack, setNodes, setEdges, state, setState });
  const save = useOnSave({ state, nodes, edges });

  // const { run: autoSave, cancel: cancelAutoSave } = useThrottleFn(async () => {
  //   save();
  // }, 1000);

  // useEffect(() => {
  //   if (nodes.length) {
  //     autoSave();
  //     return () => {
  //       cancelAutoSave();
  //     };
  //   }
  // }, [autoSave, cancelAutoSave, nodes]);
  useEventBus('Blueprint', init);

  const { canOnCopy, onCopy } = useOnCopy({ selectedIds, nodes, edges, removeNodes });
  const onPaste = useOnPaste({ setNodes, addNodes, addEdges });
  const { canOnGroup, onGroup } = useOnGroup({ nodes, edges, selectedIds, removeNodes, addNodes, addEdges });
  const onLayout = useOnLayout({ nodes, edges, setNodes, setEdges });
  const { canOnEnter, onEnter } = useOnEnter({ nodes, selectedIds, save, init, state });
  const { canOnCollapse, onCollapse, canOnExpand, onExpand, onExpandAll } = useOnCollapse({
    selectedIds,
    nodes,
    edges,
    setNodes,
    setEdges,
  });
  const { canOnPublish, onPublish } = useOnPublish({
    selectedIds,
    nodes,
  });
  const { canOnToggle, onEnabled, onDisabled } = useOnToggle({ nodes, selectedIds, setNodes });

  useRegistryHotkeys({ dispatchAction, onCopy, onPaste, onSelectAll });
  useLog(nodes, edges, selectedIds);

  return {
    ref,
    getCoordinate,
    setCoordinate,
    state,
    visible: state !== null,
    loadingNodes,
    undoLen,
    redoLen,
    init,
    save,
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedIds,
    onSelectChildren,
    addNodes,
    removeNodes,
    addEdges,
    removeEdges,
    freshEdges,
    addSignal,
    removeSignal,
    dispatchAction,
    onLayout,
    canOnCopy,
    onCopy,
    onPaste,
    canOnGroup,
    onGroup,
    canOnEnter,
    onEnter,
    canOnCollapse,
    onCollapse,
    canOnExpand,
    onExpand,
    onExpandAll,
    canOnPublish,
    onPublish,
    canOnToggle,
    onEnabled,
    onDisabled,
    setLoadingNodes,
  };
};
