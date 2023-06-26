import { INodeState, ISceneState } from '@editor/aStore';
import { getScene, getSelectedIds, SCALE } from '@editor/utils';
import { useState, useEffect, useCallback, Dispatch } from 'react';
import { useStore } from 'react-redux';

type Namespace = 'Nodes' | 'Scripts' | 'LeftOfScripts' | 'RightOfScripts';

const data = { namespace: '' as Namespace | '', movement: 0, min: 0, max: 0, alignment: 0 };
const setActivatedList: Record<Namespace, Array<(activated: boolean) => void>> = {
  Scripts: [],
  Nodes: [],
  LeftOfScripts: [],
  RightOfScripts: [],
};
const setMovementList: Record<Namespace, Array<(movement: number) => void>> = {
  Scripts: [],
  Nodes: [],
  LeftOfScripts: [],
  RightOfScripts: [],
};

const addSetActivated = (namespace: Namespace, setActivated: (activated: boolean) => void, unshift = false) => {
  if (unshift) {
    setActivatedList[namespace].unshift(setActivated);
  } else {
    setActivatedList[namespace].push(setActivated);
  }
  return () => {
    setActivatedList[namespace].splice(setActivatedList[namespace].indexOf(setActivated), 1);
  };
};
const addSetMovement = (namespace: Namespace, setMovement: (movement: number) => void, unshift = false) => {
  if (unshift) {
    setMovementList[namespace].unshift(setMovement);
  } else {
    setMovementList[namespace].push(setMovement);
  }
  return () => {
    setMovementList[namespace].splice(setMovementList[namespace].indexOf(setMovement), 1);
  };
};

const setNamespaceActivated = (namespace: Namespace, activated: boolean) => {
  setActivatedList[namespace].slice().forEach(setActivated => setActivated(activated));
};
const setNamespaceMovement = (namespace: Namespace, movement: number) => {
  setMovementList[namespace].slice().forEach(setMovement => setMovement(movement));
};

for (const event of ['mouseleave', 'mouseup'] as const) {
  document.addEventListener(event, () => {
    if (data.namespace) {
      setNamespaceActivated(data.namespace, false);
      data.namespace = '';
    }
  });
}

const client = { clientX: 0 };

document.addEventListener('mousemove', ({ clientX }) => {
  if (data.namespace) {
    if (data.movement === 0) {
      setNamespaceActivated(data.namespace, true);
    }
    const movement = (data.movement -= client.clientX - (client.clientX = clientX));
    setNamespaceMovement(data.namespace, movement);
  }
});

export const useActivateMovement = (
  namespace: Namespace,
  moving: (args: {
    scriptIds: number[];
    nodeIds: number[];
    props: ISceneState['props'];
    nodes: INodeState[];
    scale: number;
    setStartEndTime(startTime: number, endTime?: number): void;
  }) => {
    onFinish(dispatch: Dispatch<EditorAction>, deltaTime: number): void;
    getAlignment(movement: number): number;
  },
  current = false
) => {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  return useCallback(
    (event: React.MouseEvent, callback?: (maxDistance: number) => void) => {
      if (event.button === 0 && (!current || event.currentTarget === event.target)) {
        const {
          editor: { selected, scale },
          nodes,
          props,
        } = getScene(getState().project);
        const { scriptIds, nodeIds } = getSelectedIds(selected);
        try {
          const { onFinish, getAlignment } = moving({
            scriptIds,
            nodeIds,
            nodes,
            props,
            scale,
            setStartEndTime(startTime: number, endTime: number = Number.MAX_SAFE_INTEGER) {
              data.min = -SCALE.ms2px(startTime, scale);
              data.max = SCALE.ms2px(endTime, scale);
              setNamespaceActivated(namespace, data.namespace === namespace);
            },
          });
          client.clientX = event.clientX;
          data.namespace = namespace;
          data.alignment = 0;
          data.movement = 0;
          let maxDistance = 0;
          const removeSetMovement = addSetMovement(
            namespace,
            movement => {
              maxDistance = Math.max(maxDistance, Math.abs(movement));
              data.alignment = getAlignment(movement);
            },
            true
          );
          const removeSetActivated = addSetActivated(
            namespace,
            activated => {
              if (!activated) {
                callback?.(maxDistance);
                onFinish(
                  dispatch,
                  SCALE.px2ms(Math.min(Math.max(data.movement + data.alignment, data.min), data.max), scale)
                );
                removeSetActivated();
                removeSetMovement();
              }
            },
            true
          );
        } catch {
          callback?.(0);
        }
      } else {
        callback?.(0);
      }
    },
    [namespace, current, dispatch, getState, moving]
  );
};

export const useMovement = (namespace: Namespace, selected: boolean) => {
  const [activated, setActivated] = useState(false);
  const [movement, setMovement] = useState(0);
  useEffect(() => {
    const removeSetActivated = addSetActivated(namespace, setActivated);
    const removeSetMovement = addSetMovement(namespace, setMovement);
    return () => {
      removeSetActivated();
      removeSetMovement();
    };
  }, [namespace]);
  return {
    accumulative: selected && activated ? Math.min(Math.max(movement + data.alignment, data.min), data.max) : 0,
    activated: selected && activated,
  };
};
