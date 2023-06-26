import { delNode, delScript, groupActions, INodeState, selectNode, selectScript, ISceneState } from '../project';
import { findById, getNodes, getScene, getSelectedIds, isAnimation } from '../../utils';
import { useSelector, useStore } from 'react-redux';
import { Dispatch, useCallback } from 'react';
import { consumeEvent } from '.';
import zip from 'lodash/zip';

const findNextId = (nodeIds: number[], deletedIds: number[], parentId?: number) => {
  const index = nodeIds.findIndex(id => deletedIds.includes(id));
  return nodeIds.slice(index).find(id => !deletedIds.includes(id)) ?? nodeIds.slice(0, index).pop() ?? parentId;
};

const canDeleteScripts = (nodes: INodeState[], scriptIds: number[]) => {
  const deletableIds = {} as Record<number, boolean>;
  for (const scriptId of scriptIds) {
    if (deletableIds[scriptId]) {
      continue;
    }
    const [node] = findById(nodes, scriptId, true);
    if (node) {
      node.scripts.forEach(({ id }) => (deletableIds[id] = true));
      if (node.scripts.find(({ id }) => id === scriptId)?.type === 'Controller') {
        if (node.scripts.filter(({ type }) => type === 'Controller').every(({ id }) => scriptIds.includes(id))) {
          return false;
        }
      }

      if (isAnimation(node.type)) {
        if (node.scripts.filter(({ id }) => scriptIds.includes(id)).some(script => script.type === 'Blueprint')) {
          return false;
        }
      }
    }
  }
  return Object.values(deletableIds).some(Boolean);
};

const canDeleteCamera = (scene: ISceneState, nodeIds: number[]) => {
  const sceneNode = scene.nodes.find(i => i.type === 'Scene3D');

  return !sceneNode || sceneNode.nodes.some(i => i.type === 'Camera' && !nodeIds.includes(i.id));
};
const canDelete = (state: EditorState): 0 | 1 | 2 => {
  const scene = getScene(state.project);
  const { scriptIds, nodeIds } = getSelectedIds(scene.editor.selected);
  if (scriptIds.length) {
    return canDeleteScripts(getNodes(scene), scriptIds) ? 1 : 0;
  }
  if (nodeIds.some(i => scene.props[i].type === 'Camera')) {
    return canDeleteCamera(scene, nodeIds) ? 2 : 0;
  }
  if (nodeIds.some(id => scene.props[id].type === 'PVVideo')) {
    return 0;
  }
  if (nodeIds.some(id => scene.props[id].type === 'VRVideo')) {
    return 0;
  }
  if (nodeIds.some(id => scene.props[id].name === 'VR3D场景')) {
    return 0;
  }
  return nodeIds.length > 0 ? 2 : 0;
};

type IDS = { nodeIds?: number[]; scriptIds?: number[] };

export const useOnDelete = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return {
    canDelete: useSelector(canDelete),
    onDelete: useCallback(
      (ids?: IDS) => {
        const scene = getScene(getState().project);
        const { del } = consumeEvent();
        if (ids) {
          deleteByIds(dispatch, scene, ids);
        } else if (del()) {
          return;
        } else if (canDelete(getState())) {
          const { scriptIds, nodeIds } = getSelectedIds(scene.editor.selected);
          if (scriptIds.length) {
            deleteByIds(dispatch, scene, { scriptIds });
          } else {
            deleteByIds(dispatch, scene, { nodeIds });
          }
        }
      },
      [dispatch, getState]
    ),
  };
};

const deleteByIds = (dispatch: Dispatch<EditorAction>, scene: ISceneState, { nodeIds, scriptIds }: IDS) => {
  const nodes = getNodes(scene);
  if (scriptIds?.length) {
    dispatch(groupActions(scriptIds.map(id => delScript(id))));
    const nextIds = scriptIds.map(id => {
      const parents = findById(nodes, id, true);
      const scriptId = findNextId(
        parents[0].scripts
          .slice()
          .filter(({ type }) => type !== 'Blueprint')
          .sort(({ time: t1 }, { time: t2 }) => t1 - t2)
          .map(({ id }) => id),
        scriptIds
      );
      return { scriptId, parentIds: parents.map(({ id }) => id) };
    });
    const nextScriptIds = nextIds.map(({ scriptId }) => scriptId).filter(Boolean);
    if (nextScriptIds.length) {
      dispatch(selectScript(nextScriptIds as number[]));
    } else {
      const nodeIds = nextIds.map(({ parentIds }) => parentIds.reverse());
      const { length } = nodeIds.reduce((ids1, ids2) =>
        ids2.slice(0, zip(ids1, ids2).findIndex(([id1, id2]) => id1 !== id2) + 1)
      );
      if (length) {
        dispatch(selectNode(nodeIds.map(ids => ids[length - 1])));
      } else {
        dispatch(selectNode([]));
      }
    }
  } else if (nodeIds?.length) {
    dispatch(groupActions(nodeIds.map(id => delNode(id))));
    const { id: parentId, nodes: siblings = nodes } = findById(nodes, nodeIds[0])[1] || {};
    const nextId = findNextId(
      siblings.map(({ id }) => id),
      nodeIds,
      parentId
    );
    dispatch(selectNode(nextId ? [nextId] : []));
  }
};
