import React, { useCallback } from 'react';
import { useSelector, useStore } from 'react-redux';
import { findById, findEventById, getScene, getSelectedIds, onMacOS } from '../../utils';
import { selectNode, selectScript } from '../project';
import { isEqual, xor } from 'lodash';

export const useGetSelected = () => {
  const { getState } = useStore<EditorState>();
  return useCallback(() => {
    const {
      editor: { selected },
    } = getScene(getState().project);
    return getSelectedIds(selected);
  }, [getState]);
};

export const useOnSelectAll = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return useCallback(() => {
    const {
      editor: { selected },
      nodes,
    } = getScene(getState().project);
    const nodeIds = Object.keys(selected).map(Number);
    if (nodeIds.length) {
      const [, parent] = findById(nodes, nodeIds[0]);
      if (parent) {
        return dispatch(selectNode(parent.nodes.map(({ id }) => id)));
      }
    }
    return dispatch(selectNode(nodes.map(({ id }) => id)));
  }, [dispatch, getState]);
};

export function useSelected(id: 0): {
  selected: ReturnType<typeof getSelectedIds>;
  onSelectId: (event: Partial<React.MouseEvent>, ids: number[], isNodeId?: boolean, current?: boolean) => void;
  onSelect: never;
};
export function useSelected(
  id: number,
  isNodeId?: boolean,
  current?: boolean,
  strict?: boolean
): {
  selected: boolean;
  onSelect: (event: Partial<React.MouseEvent>) => void;
  onSelectId: (event: Partial<React.MouseEvent>, ids: number[], isNodeId?: boolean, current?: boolean) => void;
};
export function useSelected(): {
  onSelectId: (event: Partial<React.MouseEvent>, ids: number[], isNodeId?: boolean, current?: boolean) => void;
};
export function useSelected(id?: number, isNodeId = false, current = false, strict = false) {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();

  const selected = useSelector((state: EditorState) => {
    const {
      editor: { selected },
      props,
    } = getScene(state.project);
    if (id) {
      const scriptId = getScriptId(props, id, strict);
      return isNodeId
        ? id in selected && (!strict || selected[id].length === 0)
        : Object.values(selected).some(scriptIds => scriptIds.includes(scriptId));
    } else if (id === 0) {
      return getSelectedIds(selected);
    }
  }, isEqual);
  const onSelectId = useCallback(
    (
      { ctrlKey, metaKey, shiftKey, currentTarget, target }: Partial<React.MouseEvent>,
      ids: number[],
      isNodeId = false,
      current = false
    ): any => {
      if (current && currentTarget && currentTarget !== target) {
        return;
      }
      const ctrlMeta = onMacOS(metaKey, ctrlKey);
      const {
        editor: { selected },
        props,
      } = getScene(getState().project);
      if (!isNodeId) {
        if (!ctrlMeta) {
          return dispatch(selectScript(ids.map(id => getScriptId(props, id, strict))));
        }
        const { scriptIds } = getSelectedIds(selected);
        return dispatch(
          selectScript(
            xor(
              scriptIds,
              ids.map(id => getScriptId(props, id, strict))
            )
          )
        );
      }
      if (ids.length !== 1) {
        throw new Error('Please specify one and only on id when selecting nodes!');
      }
      const [id] = ids;
      if (!ctrlMeta && !shiftKey) {
        return dispatch(selectNode([id]));
      } else {
        const state = getState().project;
        if (state.editor.playing) {
          return dispatch(selectNode([id]));
        }
        const scene = getScene(state);
        const ids = Object.keys(scene.editor.selected).map(Number);
        if (ids.includes(id)) {
          if (ctrlMeta) {
            dispatch(selectNode(ids.filter(oldId => oldId !== id)));
          } else {
            dispatch(selectNode(ids.slice(0, ids.indexOf(id) + 1)));
          }
          // TODO: let scene extends node
        } else if (ids.length && findById([scene as any], ids[0])[1]?.nodes.some(node => node.id === id)) {
          if (ctrlMeta) {
            dispatch(selectNode(ids.concat(id)));
          } else {
            // TODO: let scene extends node
            const nodeIds = findById([scene as any], ids[0])[1]?.nodes.map(({ id }) => id) || [];
            const start = nodeIds.indexOf(ids[0]);
            const end = nodeIds.indexOf(id);
            if (start > end) {
              dispatch(selectNode(nodeIds.slice(end, start + 1).reverse()));
            } else {
              dispatch(selectNode(nodeIds.slice(start, end + 1)));
            }
          }
        } else {
          dispatch(selectNode([id]));
        }
      }
    },
    [dispatch, getState, strict]
  );
  return {
    selected,
    onSelectId,
    onSelect: useCallback(
      (event: Partial<React.MouseEvent>) => {
        return onSelectId(event, [id || 0], isNodeId, current);
      },
      [current, id, isNodeId, onSelectId]
    ),
  };
}

const getScriptId = (props: any, id: number, strict: boolean) => {
  if (props[id] || !strict) {
    return id;
  }
  try {
    const script = findEventById(props, id).pop()!;
    return script.id;
  } catch {
    return id;
  }
};
