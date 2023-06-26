import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { changeProps, getInnerNodeId, groupActions, selectScript } from '../project';
import { findById, getScene, getSelectedIds } from '../../utils';

export const useOnArrowKeys = () => {
  const dispatch = useDispatch<EditorDispatch>();
  return useCallback(
    ({ key, shiftKey }: KeyboardEvent) => {
      return dispatch<void>((dispatch, getState) => {
        const {
          editor: { selected, scale, selectedInnerNode },
          nodes,
          props,
        } = getScene(getState().project);
        const { scriptIds, nodeIds } = getSelectedIds(selected);
        if (scriptIds.length) {
          dispatch(
            groupActions(
              scriptIds.map(scriptId => {
                const script = findById(nodes, scriptId, true)[0]?.scripts.find(({ id }) => id === scriptId);
                if (script) {
                  const delta = shiftKey ? scale : 10;
                  // TODO: set type into props.
                  // scriptProps = props[id];
                  const { type, time, duration = 0 } = script;
                  switch (key) {
                    case 'ArrowLeft':
                      return changeProps([scriptId], { time: Math.max(time - delta, 0) });
                    case 'ArrowRight':
                      return changeProps([scriptId], { time: time + delta });
                  }
                  if (type !== 'Script') {
                    switch (key) {
                      case 'ArrowDown':
                        return changeProps([scriptId], { duration: Math.max(duration - delta, 0) });
                      case 'ArrowUp':
                        return changeProps([scriptId], { duration: duration + delta });
                    }
                  }
                }
                return groupActions([]);
              })
            )
          );
          selectScript(scriptIds);
        } else if (nodeIds.length) {
          const delta = shiftKey ? 10 : 1;

          if (selectedInnerNode?.length) {
            dispatch(
              groupActions(
                selectedInnerNode.map(nodeId => {
                  const [pid, { id, props }] = getInnerNodeId(getScene(getState().project), nodeId);
                  if (pid) {
                    switch (key) {
                      case 'ArrowLeft':
                        return changeProps([pid, id], { x: (props as any).x - delta });
                      case 'ArrowRight':
                        return changeProps([pid, id], { x: (props as any).x + delta });
                      case 'ArrowUp':
                        return changeProps([pid, id], { y: (props as any).y - delta });
                      case 'ArrowDown':
                        return changeProps([pid, id], { y: (props as any).y + delta });
                      default:
                        return groupActions([]);
                    }
                  }
                  return groupActions([]);
                })
              )
            );
          } else {
            dispatch(
              groupActions(
                nodeIds.map(id => {
                  switch (key) {
                    case 'ArrowLeft':
                      return changeProps([id], { x: (props[id] as any).x - delta });
                    case 'ArrowRight':
                      return changeProps([id], { x: (props[id] as any).x + delta });
                    case 'ArrowUp':
                      return changeProps([id], { y: (props[id] as any).y - delta });
                    case 'ArrowDown':
                      return changeProps([id], { y: (props[id] as any).y + delta });
                  }
                  return groupActions([]);
                })
              )
            );
          }
        }
      });
    },
    [dispatch]
  );
};
