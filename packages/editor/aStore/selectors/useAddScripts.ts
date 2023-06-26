import { useCallback } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { ActionType, IScriptData } from '@byted/riko';
import { addScript, delScript, groupActions, selectScript, IScriptState, ISceneState } from '@editor/aStore';
import { findById, getNodes, getScene, getSelectedIds, newID } from '@editor/utils';

const getActions = (
  { editor: { selected, scale }, props, nodes }: ISceneState,
  replacing: boolean,
  newScript: (time: number) => IScriptData
) => {
  if (replacing) {
    return Object.entries(selected).reduce((actions, [nodeId, scriptIds]) => {
      scriptIds.forEach(scriptId => {
        actions.push(delScript(scriptId));
        actions.push(addScript(Number(nodeId), newScript(props[scriptId].time as number)));
      });
      return actions;
    }, [] as Parameters<typeof groupActions>[0]);
  }
  const { scriptIds, nodeIds } = getSelectedIds(selected);
  const endTime = (scripts: IScriptState[]) => {
    if (scriptIds.length) {
      scripts = scripts.filter(({ id }) => scriptIds.includes(id));
    }
    return scripts.reduce((endTime, { time, duration }) => Math.max(endTime, time + (duration || scale)), 0);
  };
  return nodeIds.map(nodeId => addScript(nodeId, newScript(endTime(findById(nodes, nodeId)[0].scripts) + scale)));
};

export const useCanAddScripts = () => {
  return useSelector((state: EditorState) => {
    const { type: caseType } = state.project;
    const scene = getScene(state.project);
    const {
      editor: { selected },
      props,
    } = scene;
    const nodes = getNodes(scene);
    const { nodeIds } = getSelectedIds(selected);
    const canAddEffect =
      caseType !== 'Model' && nodeIds.length > 0 && nodeIds.every(nodeId => props[nodeId]?.type !== 'Sound');
    const canAddBlueprint =
      nodeIds.length === 1 && findById(nodes, nodeIds[0])?.[0].scripts.every(({ script }) => script !== 'Blueprint');
    // nodeIds.every(nodeId => props[nodeId]?.type !== 'Blueprint');
    return {
      canAddBlueprint,
      canAddEffect,
      canAddScript:
        canAddEffect &&
        nodeIds.every(nodeId => {
          return props[nodeId]?.type !== 'Button';
        }),
    };
  }, shallowEqual);
};

export const useOnAddScripts = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return useCallback(
    (type: IScriptData['type'], props: IScriptData['props'], editor: IScriptData['editor'] = {}, replacing = false) => {
      const actions = getActions(getScene(getState().project), replacing, time => ({
        id: newID(),
        type,
        props: replacing || (props.time ?? 0) < 0 ? { ...props, time } : props,
        editor,
      }));
      if (actions.length) {
        dispatch(groupActions(actions));
        dispatch(
          selectScript(actions.filter(({ type }) => type === ActionType.AddScript).map(({ script: { id } }: any) => id))
        );
      }
    },
    [dispatch, getState]
  );
};
