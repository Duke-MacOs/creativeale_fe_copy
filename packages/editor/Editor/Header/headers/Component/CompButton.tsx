/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useCallback, useState } from 'react';
import { useStore } from 'react-redux';
import { Button, message } from 'antd';
import { changeCategory, ICaseState, ICustomScriptState, ISceneState, restoreState, setSettings } from '@editor/aStore';
import { fromScene, getTopState, intoScene, onMacOS, popPlayState, updateCompProps } from '@editor/utils';
import { useOnCapture } from '@editor/Preview';
import { createComp, publishComp } from './createComp';
import PublishModal from '@editor/Editor/Scenes/SceneModal/PublishModal';
import { usePersistCallback } from '@byted/hooks';
import { getScene } from '@editor/utils';
import { updateScene } from '@shared/api/project';
import Axios from 'axios';
import applyScene from '@editor/Editor/Scenes/applyScene';
import { absoluteUrl } from '@shared/utils';
import { resetState } from '@editor/Editor/Header/hooks/useRestore/getFromUrl';
import { cloneDeep } from 'lodash';
import { useEditorHotkeys } from '@editor/aStore/selectors/useHotKeys';
import { useUpdateModelCover } from '@editor/Resource/upload';
/**
 * 在组件嵌套的情况下，所有组件都保存在最上层的 state 中
 * @param prevState
 * @param component
 */
const changeScenes = (state: ICaseState, component: ISceneState): ICaseState => {
  const _state = cloneDeep(state);
  if (_state.editor.prevState) {
    _state.editor.prevState = changeScenes(_state.editor.prevState, component);
  } else if (_state.scenes.find(scene => scene.sceneId === component.sceneId)) {
    _state.scenes = _state.scenes.map(scene => (scene.sceneId === component.sceneId ? component : scene));
  } else {
    _state.scenes.push(component);
  }
  return _state;
};

export const useSaveComponent = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  return (component: ISceneState, changed = true) => {
    let state = changeScenes(getState().project, component);
    if (changed) {
      state = updateCompProps(state, component);
    }
    return state;
  };
};

export const useCreateComponent = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  const onCapture = useOnCapture();
  return async (saveAs = false) => {
    const {
      editor: { prevState },
      scenes: [component],
      settings,
    } = popPlayState(getState().project);

    const capture = await onCapture();
    const oldNames = prevState?.scenes.filter(scene => scene.type === 'Animation').map(scene => scene.name);
    const name = intoScene(component).props?.name as string;

    let newName = name;
    if (oldNames?.includes(name)) {
      const suffix = new RegExp(`\\((\\d+)\\)$`).exec(name);
      const nameString = suffix ? name.substring(0, suffix.index) : name;
      const oldSuffixNum = oldNames?.map((oldName: string) => {
        const suffix = new RegExp(`${nameString}\\((\\d+)\\)$`).exec(oldName);
        return suffix ? Number(suffix[1]) : 0;
      });
      const newSuffixNum = Math.max(...oldSuffixNum) + 1;
      newName = `${nameString}(${newSuffixNum})`;
    }

    const newComponent = {
      ...intoScene(component),
      props: { ...intoScene(component).props, name: saveAs ? newName : name },
    };
    const scene = {
      ...fromScene(newComponent),
      editor: {
        ...component.editor,
        store: settings.store,
        capture: capture || component.editor.capture,
      },
    }; // 放入全局变量
    if (prevState) {
      return createComp(prevState, scene, saveAs);
    } else {
      throw new Error('无法创建组件');
    }
  };
};

export default memo(
  ({
    children,
    publish,
    changed,
    saveAs = false,
    disabled,
  }: {
    disabled: boolean;
    publish?: boolean;
    saveAs?: boolean;
    changed: boolean;
    children: React.ReactNode;
  }) => {
    const [visible, setVisible] = useState(false);
    const onClose = useCallback(() => {
      setVisible(false);
    }, []);
    const saveComponent = useSaveComponent();
    const createComponent = useCreateComponent();
    const updateModelCover = useUpdateModelCover();
    const [submitting, setSubmitting] = useState(false);
    const { dispatch, getState } = useStore<EditorState, EditorAction>();
    const resourceType = getState().project.type as any;
    const is3D = ['Animation3D', 'Model', 'Particle3D'].includes(getScene(getState().project)?.type);

    /**
     * 另存为时，替换选中节点的 orderId
     */
    const updateSceneOrderId = async (scene: ISceneState, orderId: number, projectId: number) => {
      // 是否为新增还未保存的场景化数据
      const isAddScene = !getState().project.scenes[0]?.orderId;
      const nodeId = Object.keys(scene.editor.selected)[0];
      const node = Object.entries(scene.props).find(([key]) => key === nodeId)?.[1];
      // 是否为编辑组件状态
      // 是的话则编辑中的节点 url 进行替换
      if (node && isAddScene) {
        node.url = orderId;
        scene.props = { ...scene.props };
      }
      await updateScene({
        sceneContent: JSON.stringify(intoScene(scene)),
        name: scene.name || 'Scene',
        id: scene.sceneId,
        projectId,
      });
    };

    const onClick = usePersistCallback(async (params?: Record<string, any>) => {
      const {
        editor,
        type,
        scenes: [component],
        id: projectId,
        materials,
      } = getState().project;
      let prevState = editor.prevState!;
      if (prevState) {
        return new Promise<ISceneState>(async (resolve, reject) => {
          if (!component.nodes.length && !component.scripts?.length) {
            reject('互动组件没任何内容');
          } else if ((changed || saveAs) && !component.editor.sourceJson) {
            setSubmitting(true);
            resolve(createComponent(saveAs));
          } else {
            resolve(component);
          }
        })
          .then(async component => {
            if (publish) {
              await publishComp(prevState, component, params);
            }
            if (saveAs) {
              if (component.editor.sourceJson) {
                setSubmitting(true);
                try {
                  const {
                    data: { scenes, customScripts },
                  } = await Axios.get<{
                    scenes: ISceneState[];
                    customScripts: ICustomScriptState[];
                  }>(absoluteUrl(component.editor.sourceJson));
                  scenes[0].editor.isOpen = true;
                  const { project } = getState();
                  await applyScene(
                    dispatch,
                    prevState,
                    scenes.map((scene: any) => fromScene(scene)),
                    project.scenes.length + scenes.length - 1,
                    customScripts,
                    true
                  );
                  const {
                    editor: { prevState: p },
                  } = getState().project;
                  const newComponent = getTopState(getState().project).scenes[0];
                  const scene = prevState.scenes.find(scene => scene.id === prevState.editor.selectedSceneId);
                  if (scene) await updateSceneOrderId(scene, newComponent.orderId, projectId);
                  dispatch(restoreState(p!));
                  return message.success('成功另存为项目组件');
                } catch (err) {
                  console.log(err);
                } finally {
                  setSubmitting(false);
                }
              } else {
                prevState = changeScenes(prevState, component);
                const scene = prevState.scenes.find(scene => scene.id === prevState.editor.selectedSceneId);
                if (scene) {
                  await updateSceneOrderId(scene, component.orderId, projectId);
                }
                dispatch(restoreState(prevState));
              }
            } else {
              const state = saveComponent(component, changed);
              dispatch(
                restoreState({
                  ...state.editor.prevState!,
                  materials,
                })
              );
            }
            resetState();
            dispatch(changeCategory(''));
            dispatch(
              setSettings({
                store: getState().project.settings.store,
              })
            );
            if (component.type === 'Model') updateModelCover(component.orderId);
            setSubmitting(false);
          })
          .catch(error => {
            message.error(error?.data?.message || error?.message || error);
            setSubmitting(false);
          });
      }
    });
    useEditorHotkeys(
      `${onMacOS('command', 'control')}${saveAs ? '+shift' : ''}+s`,
      event => {
        event.preventDefault();
        if (!publish) {
          onClick();
        }
      },
      undefined,
      [onClick]
    );
    return (
      <>
        <Button
          style={{ marginLeft: '8px' }}
          size="large"
          disabled={disabled}
          type={saveAs || publish ? 'default' : 'primary'}
          loading={submitting}
          onClick={publish ? () => setVisible(true) : onClick}
        >
          {children}
        </Button>
        {publish && visible && (
          <PublishModal
            resourceType={resourceType}
            is3D={is3D}
            onPublish={onClick}
            onClose={onClose}
            requireCover={false}
          />
        )}
      </>
    );
  }
);
