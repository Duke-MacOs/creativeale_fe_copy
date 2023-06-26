import { useSelector, useStore } from 'react-redux';
import { usePersistCallback } from '@byted/hooks';
import { getSceneByOrderId, getPanoramaDataList } from '@editor/utils';
import { useEmitter, restoreState, changeCategory, ICaseState, setSettings } from '@editor/aStore';
import { isEqual } from 'lodash';
import { message, Modal } from 'antd';
import { useSaveComponent, useCreateComponent } from '../headers/Component/CompButton';
import {
  useSavePanoramaComponents,
  useCreatePanoramaComponent,
  useSavePanoramaDataList,
} from '@editor/Template/Panorama/hooks';
import { removeState } from '@editor/Editor/Header/hooks/useRestore/getFromUrl';
import { useUpdatePanoramaMode } from '@editor/Template/Panorama/hooks';

export const isComponentChanged = ({ project: { type, scenes, editor } }: EditorState) => {
  if ((type !== 'Component' && type !== 'Model' && type !== 'Particle3D') || !editor.prevState) {
    return false;
  }
  const [
    {
      orderId,
      nodes,
      props,
      scripts,
      editor: { state },
    },
  ] = scenes;
  // 资源比对
  try {
    const oldComponent = getSceneByOrderId(editor.prevState, orderId);
    return (
      !isEqual(nodes, oldComponent.nodes) ||
      !isEqual(props, oldComponent.props) ||
      !isEqual(scripts, oldComponent.scripts) ||
      !isEqual(state, oldComponent.editor.state)
    );
  } catch {
    return true;
  }
};

const isPanoramaDataChanged = ({ project: { panoramaDataList, type, scenes, editor } }: EditorState) => {
  if (type !== 'PanoramaData' || !editor.prevState) return false;
  // 比较 Space Node Component
  for (let i = 0; i < scenes.length; i++) {
    const {
      nodes,
      props,
      editor: { state },
      orderId,
    } = scenes[i];
    const oldComponent = getSceneByOrderId(editor.prevState, orderId);
    if (
      !isEqual(nodes, oldComponent.nodes) ||
      !isEqual(props, oldComponent.props) ||
      !isEqual(state, oldComponent.editor.state)
    ) {
      return true;
    }
  }

  // 比较 panoramaDataList
  if (JSON.stringify(panoramaDataList) !== JSON.stringify(getPanoramaDataList(editor.prevState))) return true;
  return false;
};

/**
 * 组件的状态是否改变
 */
export default (editable: boolean) => {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  const saveComponent = useSaveComponent();
  const createComponent = useCreateComponent();
  const savePanoramaComponents = useSavePanoramaComponents();
  const createPanoramaComponents = useCreatePanoramaComponent();
  const savePanoramaDataList = useSavePanoramaDataList();
  const updatePanoramaMode = useUpdatePanoramaMode();

  const changed = useSelector(
    (state: EditorState) => editable && (isComponentChanged(state) || isPanoramaDataChanged(state))
  );
  const getStateByLevel = (currentState: ICaseState, level: number) => {
    while (level > 0 && currentState) {
      if (currentState.editor.prevState) {
        currentState = currentState.editor.prevState;
      }
      level--;
    }
    return currentState;
  };
  const saveCurrentState = async (state: ICaseState): Promise<ICaseState> => {
    // 保存“全景空间”
    if (state.type === 'PanoramaData') {
      state = savePanoramaComponents(await savePanoramaDataList(), await createPanoramaComponents());
      updatePanoramaMode({
        enabled: false,
      });
      return state;
    }

    // 保存“组件”
    return saveComponent(await createComponent());
  };
  const onReturn = (level = 0) => {
    const { project } = getState();
    const prevState = getStateByLevel(project, level);
    if (prevState) {
      if (!changed) {
        removeState(level);
        dispatch(restoreState(prevState));
        dispatch(changeCategory(''));
        updatePanoramaMode({
          enabled: false,
        });
      } else {
        Modal.confirm({
          title: '修改未保存',
          cancelText: '放弃修改',
          okText: '保存并返回',
          onOk: async () => {
            try {
              const state = await saveCurrentState(getState().project);
              dispatch(
                setSettings({
                  store: state.settings.store,
                })
              );
              dispatch(restoreState(getStateByLevel(state, level)));
              dispatch(changeCategory(''));
            } catch (error) {
              message.error(error?.message);
            }
          },
          onCancel() {
            updatePanoramaMode({
              enabled: false,
            });
            dispatch(restoreState(prevState));
            dispatch(changeCategory(''));
          },
        });
      }
    }
  };
  useEmitter(
    'LoadComponent',
    usePersistCallback(
      async ({ loadComponent, skip = false }: { loadComponent: () => Promise<void>; skip: boolean }) => {
        if (changed && !skip) {
          Modal.confirm({
            title: '修改未保存test',
            cancelText: '取消',
            okText: '保存并继续',
            onOk: async () => {
              const state = await saveCurrentState(getState().project);
              dispatch(
                setSettings({
                  store: state.settings.store,
                })
              );

              dispatch(restoreState(state));
              return loadComponent();
            },
          });
        } else {
          await loadComponent();
        }
      }
    )
  );
  return { changed, onReturn };
};
