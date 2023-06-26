import {
  changeEditor,
  ICaseState,
  ISceneState,
  restoreState,
  IMaterialState,
  IPanoramaData,
  ICustomScriptState,
} from '@editor/aStore';
import { intoScene, intoSettings, cleanProject, getMainScene, getPanoramaDataList } from '@editor/utils';
import { Dispatch, useCallback, useEffect, useRef } from 'react';
import { updateScene, updateProject } from '@shared/api/project';
import { applyScene, applyState } from '../compatibles';
import { selectedSceneId } from '@shared/globals/localStore';
import { validateStateOrThrow } from './validateState';
import { useAutoRecord } from '../../../History/hooks';
import { isComponentChanged } from '../useChanged';
import { useEventBus } from '@byted/hooks';
import { useStore } from 'react-redux';
import { debounce, zip } from 'lodash';
import { uploadDataUri } from '@shared/api';
import getRestore from '../useRestore';
import { Unsubscribe } from 'redux';
import { isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';
import useLocalVersion from './useLocalVersion';
import { useUserInfo } from '@shared/userInfo';

export const updateProjectBy = (state: Pick<ICaseState, 'id' | 'name' | 'extra'>, values: Record<string, unknown>) => {
  if (state.extra) {
    return updateProject({
      id: state.id,
      name: state.name,
      shared: state.extra.shared,
      categoryId: state.extra.categoryId,
      ...values,
    });
  }
  throw new Error();
};

export const useAutoSaving = (onSaving: ((action?: string | undefined) => Promise<void>) | null) => {
  const { subscribe, getState } = useStore<EditorState, EditorAction>();
  const prevProjectTypeRef = useRef<string>('');
  const unsubscribeRef = useRef<Unsubscribe>();

  useEffect(() => {
    unsubscribeRef.current?.();
    if (onSaving) {
      unsubscribeRef.current = subscribe(
        debounce(() => {
          // 当 project type 发生变化时，不执行之前订阅的函数
          if (!prevProjectTypeRef.current || prevProjectTypeRef.current === getState().project.type) {
            onSaving();
          }
          prevProjectTypeRef.current = getState().project.type;
        }, 600)
      );
    }
    return () => {
      unsubscribeRef.current?.();
    };
  }, [onSaving, subscribe]);
};

export default () => {
  const { getState, subscribe, dispatch } = useStore<EditorState, EditorAction>();
  const nextState = useRef(Promise.resolve(getInitialState(getState().project)));
  const prevState = useRef(getInitialState(getState().project));
  const checkCurrentVersion = useLocalVersion();
  const covers = useRef<Record<number, string>>({});
  const { trigger } = useEventBus('SaveStatus');
  const autoRecord = useAutoRecord();
  const isSaved = useCallback(() => {
    const state = getInitialState(getState().project);
    if (state.editor.readOnly || !state.id) {
      return true;
    }
    if (isStateChanged(state, prevState.current)) {
      return false;
    }

    return !state.scenes.some(scene =>
      isSceneChanged(
        scene,
        prevState.current.scenes.find(({ orderId }) => orderId === scene.orderId)
      )
    );
  }, [getState]);
  const onSaving = useCallback(
    async (action?: string) => {
      const { project } = getState();
      const state = getInitialState(getState().project);
      if (state.editor.readOnly || !state.id) {
        return;
      }
      checkCurrentVersion(project.id);
      if (action) {
        await validateStateOrThrow(cleanProject(state), action);
      }
      const names = [] as string[];
      nextState.current = nextState.current.then(async saved => {
        trigger('保存中...');
        const state = getInitialState(getState().project);
        selectedSceneId.setValue(state.editor.selectedSceneId);
        try {
          covers.current = { ...covers.current, ...(await saveState(dispatch, state, saved)) };
        } catch (e) {
          console.error(e);
          names.push(state.name);
          return saved;
        }
        const [scenes, customScripts, materials, panoramaDataList] = await Promise.all([
          Promise.all(
            state.scenes.map(async scene => {
              try {
                await saveScene(
                  state.id,
                  scene,
                  saved.scenes.find(({ orderId }) => orderId === scene.orderId),
                  covers.current[scene.orderId]
                );
                return scene;
              } catch (e) {
                console.error(e);
                names.push(scene.name);
              }
            })
          ),
          Promise.all(
            state.customScripts.map(async scene => {
              try {
                await saveCustomScript(
                  state.id,
                  scene,
                  saved.customScripts.find(({ orderId }) => orderId === scene.orderId)
                );
                return scene;
              } catch (e) {
                console.error(e);
                names.push(scene.name);
              }
            })
          ),
          Promise.all(
            state.materials.map(async material => {
              try {
                await saveMaterial(
                  state.id,
                  material,
                  saved.materials.find(({ id }) => id === material.id)
                );
                return material;
              } catch (e) {
                console.error(e);
                names.push(material.name);
              }
            })
          ),
          Promise.all(
            getPanoramaDataList(state).map(async viewer => {
              try {
                await savePanoramaData(
                  state.id,
                  viewer,
                  getPanoramaDataList(saved).find(({ id }) => id === viewer.id)
                );
                return viewer;
              } catch (e) {
                console.error(e);
                names.push(viewer.id + '');
              }
              return viewer;
            })
          ),
        ]);

        return {
          ...state,
          scenes: scenes.filter(Boolean) as ISceneState[],
          customScripts: customScripts.filter(Boolean) as ICustomScriptState[],
          materials: materials.filter(Boolean) as IMaterialState[],
          panoramaDataList,
        };
      });

      const current = await nextState.current;
      if (names.length) {
        trigger(`${names.join('、')}保存失败`);
        throw new Error(`${names.join('、')}保存失败`);
      } else {
        trigger('已自动保存至云端');
      }
      autoRecord(project);
      prevState.current = current;
    },
    [autoRecord, dispatch, getState, trigger]
  );
  useEffect(() => {
    const promise = getRestore(getState().project).then(async state => {
      useUserInfo.getState().updateUserInfo();
      nextState.current = Promise.resolve(getInitialState(state));
      prevState.current = getInitialState(state);
      const beforeUnload = onBeforeUnload(() => {
        if (isVRCaseAndInEdit(getState().project)) return false;
        if (!getState().project.editor.readOnly) {
          if (isComponentChanged(getState())) {
            return true;
          }
          if (!isSaved()) {
            onSaving();
            return true;
          }
        }
      });
      dispatch(restoreState(await applyState({ ...state, scenes: await applyScene(state.id, state.scenes) })));
      return { beforeUnload };
    });
    return () => {
      promise.then(({ beforeUnload }) => {
        beforeUnload();
        onSaving();
      });
    };
  }, [isSaved, onSaving, subscribe, getState, dispatch]);
  return { isSaved, onSaving };
};

export const onBeforeUnload = (shouldTrigger?: () => boolean | undefined) => {
  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!shouldTrigger || shouldTrigger()) {
      (event || window.event).returnValue = '你确定吗？';
      return '你确定吗？';
    }
  };
  window.addEventListener('beforeunload', beforeUnload);
  return () => {
    window.removeEventListener('beforeunload', beforeUnload);
  };
};
export const getInitialState = (state: ICaseState): ICaseState => {
  if (state.editor.prevState) {
    return getInitialState(state.editor.prevState);
  }
  return state;
};

export const saveScene = async (
  projectId: number,
  scene: ISceneState,
  saved: ISceneState | undefined,
  cover?: string
) => {
  if (isSceneChanged(scene, saved)) {
    await updateScene({
      sceneContent: JSON.stringify(intoScene(scene)),
      cover: cover ?? (scene.editor.capture?.startsWith('https://') ? scene.editor.capture : undefined),
      name: scene.name || 'Scene',
      id: scene.sceneId,
      projectId,
    });
  }
};

export const saveCustomScript = async (
  projectId: number,
  scene: ICustomScriptState,
  saved: ICustomScriptState | undefined
) => {
  if (isCustomScriptChanged(scene, saved)) {
    await updateScene({
      sceneContent: JSON.stringify(scene),
      name: scene.name || 'Scene',
      id: scene.id,
      projectId,
    });
  }
};

export const saveMaterial = async (projectId: number, material: IMaterialState, saved: IMaterialState | undefined) => {
  if (isMaterialChanged(material, saved)) {
    await updateScene({
      sceneContent: JSON.stringify(material),
      name: material.name || 'Material',
      id: material.id,
      projectId,
    });
  }
};

export const savePanoramaData = async (projectId: number, viewer: IPanoramaData, saved: IPanoramaData | undefined) => {
  if (isPanoramaDataChanged(viewer, saved)) {
    await updateScene({
      sceneContent: JSON.stringify(viewer),
      name: viewer.name || 'PanoramaData',
      id: viewer.id,
      projectId,
    });
  }
};

export const isSceneChanged = (scene: ISceneState, saved: ISceneState | undefined) =>
  !saved ||
  saved.props !== scene.props ||
  saved.nodes !== scene.nodes ||
  saved.editor.position !== scene.editor.position ||
  saved.editor.dataVersion !== scene.editor.dataVersion ||
  saved.editor.lockCapture !== scene.editor.lockCapture ||
  (scene.editor.capture?.startsWith('https://') && saved.editor.capture !== scene.editor.capture);

export const isCustomScriptChanged = (scene: ICustomScriptState, saved: ICustomScriptState | undefined) =>
  !saved || scene.ideCode !== saved.ideCode;

const isMaterialChanged = (material: IMaterialState, saved: IMaterialState | undefined) => {
  return !saved || JSON.stringify(material) !== JSON.stringify(saved);
};

const isPanoramaDataChanged = (panoramaData: IPanoramaData, saved: IPanoramaData | undefined) => {
  return !saved || JSON.stringify(panoramaData) !== JSON.stringify(saved);
};

export const saveState = async (dispatch: Dispatch<EditorAction>, state: ICaseState, saved: ICaseState | undefined) => {
  if (isStateChanged(state, saved)) {
    const sceneCovers = Object.fromEntries(
      await Promise.all(
        state.scenes.map(async ({ orderId, editor: { capture } }): Promise<[number, string | undefined]> => {
          if (capture) {
            const { previewUrl } = await uploadDataUri(capture, `${orderId}`);
            return [orderId, previewUrl];
          } else {
            return [orderId, capture];
          }
        })
      )
    );
    const cover = getProjectCover(state, sceneCovers as any);
    const {
      settings: { componentInfo },
    } = state;
    await updateProjectBy(state, {
      cover,
      projectContent: JSON.stringify({
        id: state.id,
        settings: intoSettings(state.settings),
        sceneOrders: state.scenes.filter(({ type }) => type === 'Scene').map(({ orderId }) => orderId),
        version: state.extra?.version,
        dataVersion: state.editor.dataVersion,
      }),
      projectExtra: JSON.stringify({ sceneCovers, ...componentInfo }),
    });
    // 在进入保存后播放，这个action没有true会中止播放
    dispatch(changeEditor(0, { cover }, true));
    return sceneCovers;
  }
};

const isStateChanged = (state: ICaseState, saved: ICaseState | undefined) => {
  return (
    !saved ||
    saved.name !== state.name ||
    saved.settings !== state.settings ||
    saved.extra?.version !== state.extra?.version ||
    saved.editor.dataVersion !== state.editor.dataVersion ||
    saved.editor.selectedSceneId !== state.editor.selectedSceneId ||
    saved.editor.cover?.split('?orderId=')[1] !== state.editor.cover?.split('?orderId=')[1] ||
    zip(state.scenes, saved.scenes).some(([scene, saved]) => {
      return !saved || saved.editor.lockCapture !== scene?.editor.lockCapture || saved.orderId !== scene?.orderId;
    })
  );
};

const getProjectCover = ({ scenes, editor: { cover } }: ICaseState, sceneCovers: Record<number, string>) => {
  if (cover?.includes('?orderId=')) {
    const orderId = Number(cover.split('?orderId=').pop());
    if (sceneCovers[orderId]) {
      return `${sceneCovers[orderId]}?orderId=${orderId}`;
    }
  } else if (cover) {
    return cover;
  }
  const { orderId } = getMainScene(scenes);
  if (sceneCovers[orderId]) {
    return `${sceneCovers[orderId]}?orderId=${orderId}`;
  }
};
