import { useCallback, useRef, useEffect } from 'react';
import {
  getInitialState,
  onBeforeUnload,
  saveCustomScript,
  saveMaterial,
  savePanoramaData,
  saveScene,
  saveState,
} from '@editor/Editor/Header/hooks/useSaving';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { updateScene } from '@shared/api/project';
import { getPanoramaDataList, intoScene, popPlayState } from '@editor/utils';
import {
  changePanoramaSpaceInPrevState,
  getPanoramaSpacePropsById,
  isVRCaseAndInEdit,
} from '@editor/Template/Panorama/utils';
import { ICaseState, ICustomScriptState, IPanoramaData, ISceneState, useProject } from '@editor/aStore';
import { createComp } from '@editor/Editor/Header/headers/Component/createComp';
import { useEventBus } from '@byted/hooks';
import { message } from 'antd';
import { zip } from 'lodash';

const changePanoramaComponent = (state: ICaseState, component: ISceneState): ICaseState => {
  return {
    ...state,
    editor: {
      ...state.editor,
      prevState: state.editor.prevState ? changePanoramaComponent(state.editor.prevState, component) : undefined,
    },
    scenes: state.scenes.find(i => i.sceneId === component.sceneId)
      ? state.scenes.map(s => (s.sceneId === component.sceneId ? component : s))
      : [...state.scenes, component],
  };
};

const changePanoramaDataList = (state: ICaseState, newDataList: IPanoramaData[]): ICaseState => {
  if (!state.editor.prevState) {
    return {
      ...state,
      panoramaDataList: state.panoramaDataList?.map(view => {
        return newDataList.find(i => i.id === view.id) ?? view;
      }),
    };
  }
  return {
    ...state,
    editor: {
      ...state.editor,
      prevState: changePanoramaDataList(state.editor.prevState, newDataList),
    },
    panoramaDataList: state.panoramaDataList?.map(view => {
      return newDataList.find(i => i.id === view.id) ?? view;
    }),
  };
};

export const useSavePanoramaDataList = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  const { panoramaSpaceId, panoramas } = useSelector(
    ({
      project: {
        editor: {
          panoramaEdit: { panoramaSpaceId, panoramaDataOrderId },
        },
        panoramaDataList,
      },
    }: EditorState) => {
      return {
        panoramaSpaceId,
        panoramas: panoramaDataList?.find(i => i.orderId === panoramaDataOrderId)?.panoramas ?? [],
      };
    },
    shallowEqual
  );
  /**
   * 检查 PanoramaSpace 节点的 startPanoramaId 是否还存在（有可能被删除）
   * 如果该 panorama 被删除，需要把 startPanoramaId 设为 undefined
   */
  const checkStartPanoramaId = (state: ICaseState): ICaseState => {
    const props = getPanoramaSpacePropsById(getState().project, panoramaSpaceId);
    if (!panoramas.some(i => i.id === props.startPanoramaId)) {
      return changePanoramaSpaceInPrevState(getState().project, panoramaSpaceId, {
        ...props,
        startPanoramaId: undefined,
      });
    }
    return state;
  };
  return async () => {
    await Promise.all(
      getPanoramaDataList(getState().project).map(viewer => {
        return updateScene({
          sceneContent: JSON.stringify(viewer),
          name: viewer.name || 'PanoramaData',
          id: viewer.id,
          projectId: getState().project.id,
        });
      })
    );
    const state = checkStartPanoramaId(getState().project);
    return changePanoramaDataList(state, getPanoramaDataList(state));
  };
};

export const useSavePanoramaComponents = () => {
  return (state: ICaseState, panoramaComponents: ISceneState[]): ICaseState => {
    panoramaComponents.forEach(panoramaComponent => {
      state = changePanoramaComponent(state, panoramaComponent);
    });
    return state;
  };
};

export const useCreatePanoramaComponent = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  return async () => {
    const {
      editor: { prevState },
      scenes,
      settings,
    } = popPlayState(getState().project);
    return await Promise.all(
      scenes.reduce((prev: Promise<ISceneState>[], panoramaComponent) => {
        const scene = {
          ...panoramaComponent,
          editor: { ...panoramaComponent.editor, store: settings.store },
        };
        if (prevState && scene.type === 'Animation3D') {
          prev.push(createComp(prevState, scene));
        }
        return prev;
      }, [])
    );
  };
};

export const useSavePanoramaSpaceNode = () => {
  const { scene, projectId } = useSelector(
    ({
      project: {
        id,
        editor: {
          panoramaEdit: { panoramaSpaceId },
          prevState,
        },
      },
    }: EditorState) => {
      return {
        scene: prevState?.scenes.find(scene => scene.props[panoramaSpaceId]),
        projectId: id,
      };
    },
    shallowEqual
  );
  return async () => {
    if (scene) {
      await updateScene({
        sceneContent: JSON.stringify(intoScene(scene)),
        name: scene.name || 'PanoramaSpaceNode',
        id: scene.sceneId,
        projectId,
      });
    }
  };
};

const isPanoramaDataStateChanged = (state: ICaseState, saved: ICaseState | undefined) => {
  return (
    !saved ||
    saved.name !== state.name ||
    saved.settings !== state.settings ||
    saved.editor.cover?.split('?orderId=')[1] !== state.editor.cover?.split('?orderId=')[1] ||
    zip(state.scenes, saved.scenes).some(([scene, saved]) => {
      return !saved || saved.orderId !== scene?.orderId;
    })
  );
};

/**
 * VR Case 中保存
 * 在 VR Case 中，直接进入 type = PanoramaData，不再暴露 type = project 顶层给用户
 * @returns
 */
export const useSavingInVRCase = () => {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  const { trigger } = useEventBus('SaveStatus');
  const prevState = useRef<ICaseState>();
  const projectType = useProject('type');
  const savingRef = useRef<boolean[]>([]);
  const prevCustomScriptsRef = useRef<ICustomScriptState[]>();

  useEffect(() => {
    if (projectType === 'PanoramaData') prevState.current = getState().project;
    // 切换状态时，需要将主场景手动保存一次，因为场景节点 url 在自动保存机制生效前发生改变
    const mainScene = getState().project.scenes.find(s => s.orderId === 2);
    mainScene && saveScene(getState().project.id, mainScene, undefined);
  }, [projectType, getState]);

  useEffect(() => {
    const unload = onBeforeUnload(() => {
      return isVRCaseAndInEdit(getState().project) ? savingRef.current.length !== 0 : false;
    });
    return () => {
      unload();
    };
  }, [getState]);

  const onSaving = useCallback(async () => {
    try {
      const names = [] as string[];
      const customScripts = getInitialState(getState().project).customScripts;
      if (getState().project.type === 'PanoramaData' && prevState.current) {
        const {
          scenes: prevScenes,
          panoramaDataList: prevPanoramaDataList,
          materials: prevMaterials,
        } = prevState.current;
        const { scenes, panoramaDataList, materials } = getState().project;
        const prevCustomScripts = prevCustomScriptsRef.current;

        savingRef.current.push(true);
        trigger('保存中...');

        isPanoramaDataStateChanged(getState().project, prevState.current) &&
          (await saveState(dispatch, getState().project, prevState.current));

        // 保存 PanoramaData
        if (JSON.stringify(prevPanoramaDataList) !== JSON.stringify(panoramaDataList) && panoramaDataList) {
          await Promise.all(
            panoramaDataList.map(async data => {
              try {
                await savePanoramaData(
                  getState().project.id,
                  data,
                  prevPanoramaDataList?.find(({ id }) => id === data.id)
                );
              } catch (e) {
                console.error(e);
                names.push(data.id + '');
              }
              return data;
            })
          );
        }

        // 保存 Scenes
        if (prevScenes) {
          await Promise.all(
            scenes.map(async scene => {
              try {
                await saveScene(
                  getState().project.id,
                  scene,
                  prevScenes.find(({ orderId }) => orderId === scene.orderId)
                );
                return scene;
              } catch (e) {
                console.error(e);
                names.push(scene.name);
              }
            })
          );
        }

        // 保存材质
        await Promise.all(
          materials.map(async material => {
            try {
              await saveMaterial(
                getState().project.id,
                material,
                prevMaterials.find(({ id }) => id === material.id)
              );
              return material;
            } catch (e) {
              console.error(e);
              names.push(material.name);
            }
          })
        );

        // 保存脚本
        await Promise.all(
          customScripts.map(async scene => {
            try {
              await saveCustomScript(
                getState().project.id,
                scene,
                prevCustomScripts?.find(({ orderId }) => orderId === scene.orderId)
              );
              return scene;
            } catch (e) {
              console.error(e);
              names.push(scene.name);
            }
          })
        );

        // 错误捕获
        if (names.length !== 0) {
          message.error(`${names.reduce((prev, cur) => `${prev}${cur}、`, '')}保存失败`);
        }
      }
      prevState.current = getState().project;
      prevCustomScriptsRef.current = customScripts;
      savingRef.current.shift();
      trigger('已自动保存至云端');
    } catch (error) {
      savingRef.current = [];
    }
  }, [getState, dispatch, trigger]);

  return {
    onSaving,
  };
};
