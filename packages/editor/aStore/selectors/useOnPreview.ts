import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { changeMoment, INodeState, selectNode } from '../project';
import { findById, getScene } from '../../utils';
import { usePlaying } from './usePlaying';

export const joinDuration = (nodes: INodeState[], ids: number[]) => {
  const selectedNodes = ids.map(id => findById(nodes, Number(id))[0]).filter(node => node);
  const range = (nodes: typeof selectedNodes, start: number, end: number): [number, number] =>
    nodes.reduce(
      ([start, end], { nodes, scripts }) => {
        for (const { time, duration = 0 } of scripts.filter(({ type }) => type !== 'Script')) {
          start = Math.min(start, time);
          end = Math.max(end, time + duration);
        }
        return range(nodes, start, end);
      },
      [start, end]
    );
  const [start, end] = range(selectedNodes, Number.MAX_SAFE_INTEGER, 0);
  return [Math.min(start, end), end, selectedNodes] as const;
};

export const useOnPreview = () => {
  const { dispatch, getState, subscribe } = useStore<EditorState, EditorAction>();
  const { playing, onPlayOrStop } = usePlaying();
  return {
    playing,
    onPreview: useCallback(
      (id: number) => {
        const { nodes } = getScene(getState().project);
        const [startTime, endTime] = joinDuration(nodes, [id]);
        dispatch(changeMoment(startTime)); // ensure stop
        onPlayOrStop(); // start play and clear selection
        dispatch(selectNode([id])); // no effect playing
        const clearId = setTimeout(() => {
          if (getState().project.editor.playing) {
            dispatch(changeMoment(endTime)); // ensure stop
          }
        }, endTime - startTime);
        setTimeout(() => {
          const unsub = subscribe(() => {
            if (!getState().project.editor.playing) {
              clearTimeout(clearId);
              unsub();
            }
          });
        });
      },
      [dispatch, getState, onPlayOrStop, subscribe]
    ),
  };
};
