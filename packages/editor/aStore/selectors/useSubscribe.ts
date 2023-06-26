import { debounce } from 'lodash';
import { useEffect, useRef } from 'react';
import { useStore } from 'react-redux';

export const useSubscribe = (
  sub: (getState: () => EditorState, dispatch: (action: EditorAction) => void) => void,
  debounced = 1000
) => {
  const { getState, dispatch, subscribe } = useStore<EditorState, EditorAction>();
  const ref = useRef(sub);
  ref.current = sub;
  useEffect(() => {
    return subscribe(
      debounce(() => {
        ref.current(getState, dispatch);
      }, debounced)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
};
