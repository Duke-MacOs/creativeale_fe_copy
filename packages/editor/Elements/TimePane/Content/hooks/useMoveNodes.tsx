import { useCallback, useRef } from 'react';
import { useModifier } from '@editor/hooks';
import { changeProps, groupActions, INodeState, minStartTime } from '@editor/aStore';
import { findById } from '@editor/utils';
import { useActivateMovement, useMovement } from './useMovement';

export default (selected: boolean, edges: number[], setReflines: any) => {
  const callbackRef = useRef<boolean | ((value: boolean) => void)>(false);
  const ctrlMeta = useModifier(
    'ctrlMeta',
    useCallback(value => {
      if (typeof callbackRef.current === 'boolean') {
        callbackRef.current = value;
      } else {
        callbackRef.current(value);
      }
    }, [])
  );
  const { accumulative: nodeMovement } = useMovement('Nodes', selected);
  const activate = useActivateMovement(
    'Nodes',
    useCallback(
      ({ nodeIds, scriptIds, nodes, setStartEndTime }) => {
        if (scriptIds.length || typeof callbackRef.current !== 'boolean') {
          throw new Error();
        }
        const selectedNodes = nodeIds.map(nodeId => findById(nodes, nodeId)[0]);
        if (!selectedNodes.length) {
          throw new Error();
        }
        let current = callbackRef.current;
        callbackRef.current = value => {
          current = value;
          setStartEndTime(minStartTime(selectedNodes, value));
        };
        callbackRef.current(current);
        return {
          getAlignment(movement: number) {
            return setReflines(edges, movement);
          },
          onFinish(dispatch, deltaTime) {
            callbackRef.current = current;
            setReflines([], 0);
            if (deltaTime) {
              const reduce = (nodes: INodeState[], actions: any[] = []): any[] =>
                nodes.reduce((actions, { scripts, nodes }) => {
                  scripts.forEach(({ id, time }) => actions.push(changeProps([id], { time: time + deltaTime })));
                  if (current) {
                    return reduce(nodes, actions);
                  }
                  return actions;
                }, actions);
              dispatch(groupActions(reduce(selectedNodes)));
            }
          },
        };
      },
      [edges, setReflines]
    ),
    true
  );
  return { onMoveNode: activate, nodeMovement, passMovement: ctrlMeta ? nodeMovement : 0 };
};
