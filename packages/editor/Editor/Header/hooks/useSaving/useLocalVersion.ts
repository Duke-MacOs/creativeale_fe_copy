import { shallowEqual, useSelector, useStore } from 'react-redux';
import { ICaseState, restoreState } from '@editor/aStore';
import { useEffect } from 'react';
import { message } from 'antd';

const CURRENT_VERSION = Date.now();

const getLocalVersion = (): Record<number, number> => {
  return JSON.parse(localStorage.getItem('multipleTabEditableVersion') ?? '{}');
};
const setLocalVersion = (versions: Record<number, number | undefined>) => {
  localStorage.setItem('multipleTabEditableVersion', JSON.stringify(versions));
};

const checkCurrentVersion = (id: number) => {
  if (getLocalVersion()[id] !== CURRENT_VERSION) {
    throw new Error('项目已在其它标签打开，若要编辑请刷新页面');
  }
};

const updateReadOnly = (state: ICaseState | undefined, readOnly: boolean): ICaseState => {
  if (state) {
    return {
      ...state,
      editor: {
        ...state.editor,
        prevState: updateReadOnly(state.editor.prevState, readOnly),
        readOnly,
      },
    };
  }
  return state!;
};

/**
 * 多 Tab 打开同一项目时，将非最新页面改为 readOnly
 * 解决状态不同步问题
 */
export default () => {
  const { dispatch, getState } = useStore();
  const { projectId, readOnly } = useSelector(({ project }: EditorState) => {
    return { projectId: project.id, readOnly: project.editor.readOnly };
  }, shallowEqual);

  useEffect(() => {
    if (projectId && !readOnly) {
      setLocalVersion({ ...getLocalVersion(), [projectId]: CURRENT_VERSION });
    }
  }, [projectId, readOnly]);

  useEffect(() => {
    const onWindowFocus = () => {
      const { project } = getState();
      const versions = getLocalVersion();

      if (project.id && versions[project.id] !== CURRENT_VERSION && !project.editor.readOnly) {
        message.warning('项目已在其它标签打开，若要编辑请刷新页面');
        dispatch(restoreState(updateReadOnly(project, true)));
      }
    };

    window.addEventListener('focus', onWindowFocus);

    return () => {
      window.removeEventListener('focus', onWindowFocus);
      const versions = getLocalVersion();
      const { project } = getState();
      if (versions[project.id] === CURRENT_VERSION) {
        setLocalVersion({ ...getLocalVersion(), [project.id]: undefined });
      }
    };
  }, [dispatch, getState]);
  return checkCurrentVersion;
};
