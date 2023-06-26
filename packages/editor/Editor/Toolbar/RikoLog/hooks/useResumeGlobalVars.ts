import { updateGlobalVars } from '@editor/aStore';
import { getGlobalVars } from '@editor/utils';
import { useEffect, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

const useResumeGlobalVars = () => {
  const dispatch = useDispatch<EditorDispatch>();
  // 播放前将 Store 保存，用于播放结束后恢复
  const beforePlayStoreRef = useRef<any>(null);

  const { storeData, playing } = useSelector(({ project }: EditorState) => {
    return { storeData: getGlobalVars(project), playing: project.editor.playing };
  }, shallowEqual);

  useEffect(() => {
    if (playing && storeData) {
      beforePlayStoreRef.current = storeData;
    } else if (!playing && beforePlayStoreRef.current) {
      dispatch(updateGlobalVars(beforePlayStoreRef.current));
      beforePlayStoreRef.current = null;
    }
  }, [playing, dispatch]);
};

export default useResumeGlobalVars;
