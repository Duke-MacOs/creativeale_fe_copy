import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { changeProps } from '@editor/aStore';
import { getScene, SCALE } from '@editor/utils';

export default () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return useCallback(
    (id: number, deltaDuration: number, deltaTime: number) => {
      const {
        editor: { scale },
        props: {
          [id]: { time, duration },
        },
      } = getScene(getState().project);
      dispatch(
        changeProps([id], {
          duration: (duration as number) + SCALE.px2ms(deltaDuration, scale),
          time: (time as number) + SCALE.px2ms(deltaTime, scale),
        })
      );
    },
    [dispatch, getState]
  );
};
