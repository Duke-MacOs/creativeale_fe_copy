import {
  ICaseState,
  ICubemap,
  IPanoramaData,
  ICustomScriptState,
  IMaterialState,
  ISceneState,
  newCase,
  newSceneAsync,
  newScene,
} from '@editor/aStore';
import { fetchProject, createScenes, updateProject, createScene, updateScene } from '@shared/api/project';
import { parseJson, getUrlHead, replaceWithProxy, absoluteUrl } from '@shared/utils';
import { isPrivateComponent } from '@editor/utils/assertFunc';
import { selectedSceneId } from '@shared/globals/localStore';
import initVideoScene from './initVideoScene';
import { createNode, RIKO_VERSION } from '@byted/riko';
import { IProject } from '@/types/project';
import { isReadOnly } from '../compatibles';
import { getFromUrl } from './getFromUrl';
import { capitalize } from 'lodash';
import { message } from 'antd';
import Axios from 'axios';
import {
  fromScene,
  intoScene,
  compPropsToOpenKeys,
  openKeysToCompProps,
  getMainScene,
  neverThrow,
  newID,
} from '@editor/utils';
import initVRVideoScene from './initVRVideoScene';
/**
 * 根据URL获取项目数据和场景数据
 */
export default async (oldProject: ICaseState) => {
  try {
    const state = await getFromUrl();
    switch (state.type) {
      case 'project': {
        return await initProject(state.id, state.orderId);
      }
      case 'component': {
        return await initComponent(state.url);
      }
      default: {
        return neverThrow(state);
      }
    }
  } catch (error) {
    message.error(error?.data?.message || error?.message || String(error) || '项目数据无法加载');
    throw error;
  }

  async function initProject(projectId?: number, orderId?: string | null) {
    if (!projectId) {
      throw new Error('无效ID, 请检查URL链接是否正确');
    }
    //只读项目另起接口
    const detail = await initAndFetchProject(projectId);
    const state = await detailToState(detail, undefined);
    let scenes = state.scenes.map(compPropsToOpenKeys);
    if (state.editor.sceneMode == 'Product') {
      scenes = scenes.map(scene => (scene.type === 'Scene' ? openKeysToCompProps(scene) : scene));
    }
    const project = {
      ...state,
      scenes,
      editor: {
        ...state.editor,
        count: oldProject.editor.count,
        loading: false,
        readOnly: isReadOnly() || !detail.editable || (detail.editable === 1 && !isReadOnly(0)),
      },
    };

    if (orderId) {
      const targetScene = isPrivateComponent(orderId)
        ? scenes.find(scene => scene.type === 'Animation' && scene.orderId === Number(orderId))
        : fromScene((await Axios.get(absoluteUrl(String(orderId)))).data);
      if (targetScene) {
        if (!isPrivateComponent(orderId)) {
          targetScene.orderId = 0;
        }

        const component = newCase([targetScene], 'Component', project);
        component.editor.selectedSceneId =
          scenes.find(scene => String(scene.orderId) === orderId)?.sceneId ?? state.editor.selectedSceneId;
        component.editor.readOnly = !isPrivateComponent(orderId) || project.editor.readOnly;
        component.settings.store = project.settings.store;
        component.materials = project.materials;
        component.id = project.id;

        return component;
      }
    }
    return project;
  }

  async function initComponent(url = '') {
    const { data } = await Axios.get(isFinite(Number(url)) ? url : absoluteUrl(url));
    const state = newCase([fromScene(data)], 'Component');
    state.editor.readOnly = true;
    return state;
  }
};

export const getProjectState = async (projectId: number) => await initAndFetchProject(projectId).then(detailToState);

export const initAndFetchProject = async (projectId: number) => {
  const data = await fetchProject(projectId);
  const contentExtra = await updateProjectContent(data);

  if (contentExtra) {
    await updateProject({
      id: data.id,
      name: data.name,
      shared: data.shared,
      categoryId: data.categoryId,
      projectContent: JSON.stringify({
        id: data.id,
        version: RIKO_VERSION,
        ...contentExtra[0],
      }),
      projectExtra: JSON.stringify(contentExtra[1]),
    });
    return fetchProject(data.id);
  }
  return data;
};

const updateProjectContent = async ({
  id,
  scenes,
  projectContent,
  typeOfPlay = 0,
  category = 0,
  projectExtra,
  editable,
}: IProject) => {
  const readOnly = isReadOnly() || !editable || (editable === 1 && !isReadOnly(0));

  const isVRVideo = typeOfPlay === 3 && category === 3;
  const enabled3d = category === 1 || isVRVideo;
  if (!scenes.length) {
    if (readOnly) {
      throw new Error('无法初始化只读项目');
    }
    if (isVRVideo) {
      const url = await initVRVideoScene(id);
      const mainScene = newScene('主场景', {
        ...{ edit3d: false, enabled3d: true },
        nodes: [await createNode('VR视频', 'VRVideo', newID, url), await createNode('VR3D场景', 'Scene3D', newID, '')],
      });
      return initSceneOrders(
        id,
        [await newSceneAsync('加载页', { playable: true, width: 686, height: 386 }), mainScene],
        typeOfPlay,
        enabled3d
      );
    }
    return initSceneOrders(id, await initScenes(id, typeOfPlay, enabled3d), typeOfPlay, enabled3d);
  }

  const validScenes = scenes
    .map(({ sceneContent }) => JSON.parse(sceneContent))
    .filter(scene => scene.type === 'Scene');

  if (!readOnly && (typeOfPlay === 0 || typeOfPlay === 3)) {
    if (validScenes.filter(({ editor: { loading } }) => loading).length < 2) {
      const newScene = await newSceneAsync('加载页', { playable: typeOfPlay === 0, loading: true });
      const sceneContent = intoScene(newScene);
      const { id: sceneId, orderId } = await createScene({
        projectId: id,
        name: newScene.name,
        sceneContent: JSON.stringify(sceneContent),
      });
      await updateScene({
        projectId: id,
        name: newScene.name,
        id: sceneId,
        sceneContent: JSON.stringify({ ...sceneContent, orderId }),
      });

      const content = JSON.parse(projectContent);
      return [
        {
          ...content,
          settings: {
            ...content.settings,
            playable: content.settings.playable,
            [typeOfPlay === 0 ? 'playable' : 'loading']: orderId,
          },
        },
        JSON.parse(projectExtra),
      ];
    }
  }

  if (!projectContent) {
    throw new Error('项目不可用，请重新创建');
  }
};

const initSceneOrders = async (
  projectId: number,
  scenes: ISceneState[],
  typeOfPlay: number,
  enabled3d: boolean,
  initOrderId?: number
) => {
  const sceneOrders = (
    await createScenes(
      projectId,
      scenes.map((scene, index) => ({
        name: scene.name,
        orderId: initOrderId ? ++initOrderId : index + 1,
        sceneContent: JSON.stringify(intoScene(scene)),
      }))
    )
  ).map(({ orderId }) => orderId);
  const sceneCovers = Object.fromEntries(scenes.map(({ editor: { capture } }, index) => [sceneOrders[index], capture]));
  const maskSettings = () => {
    switch (typeOfPlay) {
      case 2:
        return { width: 686, height: 386 };
      case 4:
        return { width: 720, height: 1280 };
    }
  };
  return [
    {
      sceneOrders,
      settings: {
        enabled3d,
        scaleMode: 1, // 默认居中适配
        basePath: getUrlHead(),
        multiTouchEnabled: false,
        loading: sceneOrders[scenes.findIndex(({ editor: { loading, playable } }) => loading && !playable)],
        playable: sceneOrders[scenes.findIndex(({ editor: { loading, playable } }) => loading && playable)],
        ...maskSettings(),
      },
    },
    { sceneCovers },
  ] as const;
};

const initScenes = async (id: number, typeOfPlay: number, enabled3d: boolean) => {
  switch (typeOfPlay) {
    case 2: // 轻互动
      return [
        await newSceneAsync('加载页', { loading: true, width: 686, height: 386 }),
        await newSceneAsync('主场景', { enabled3d }),
      ];
    case 4:
      return await initVideoScene(id);

    default:
      // 其他类型
      return [
        await newSceneAsync('加载页', { playable: true }),
        await newSceneAsync('加载页', { loading: true }),
        await newSceneAsync('主场景', { enabled3d }),
      ];
  }
};

export const detailToState = async (data: IProject, rewriteBasePath = true): Promise<ICaseState> => {
  data.scenes = data.scenes.map(scene => ({
    ...scene,
    sceneContent: scene.sceneContent.replaceAll('PVHotArea', 'PVClickArea'),
  }));
  const {
    id,
    name,
    type = 0,
    cover,
    shared,
    skinBy,
    teamId,
    categoryId,
    category,
    editMode,
    typeOfPlay,
    description,
    projectExtra,
    isAuthControl,
    projectContent,
    scenes: iScenes,
  } = data;

  const {
    settings = {},
    sceneOrders = [],
    captures = {},
    store = {},
    dataVersion = 0,
    version,
  } = JSON.parse(projectContent);
  const { sceneCovers = captures } = parseJson(projectExtra, {});
  const sceneMode = getSceneMode(type, editMode, typeOfPlay);

  let scenes = iScenes
    .filter(({ sceneContent }) => {
      const scene = JSON.parse(sceneContent);
      if (scene.type === 'Scene' && scene.editor.loading) {
        switch (typeOfPlay) {
          case 3:
            return !!scene.editor.playable;
          default: {
            return !scene.editor.playable;
          }
        }
      }

      return (
        scene.type !== 'Texture2D' &&
        scene.type !== 'PanoramaData' &&
        scene.type !== 'CustomScript' &&
        scene.type?.indexOf('Material') != 0 &&
        scene.type?.indexOf('Cubemap') !== 0
      );
    })
    .map(({ id, orderId, sceneContent }) => {
      const scene = JSON.parse(sceneContent);
      return fromScene({
        ...scene,
        id,
        sceneId: id,
        orderId,
        editor: {
          ...scene.editor,
          capture: replaceWithProxy(sceneCovers[orderId]),
        },
      });
    })
    .sort((scene1, scene2) => {
      if (scene1.type === scene2.type) {
        const a = sceneOrders.indexOf(scene1.orderId);
        const b = sceneOrders.indexOf(scene2.orderId);
        if (a > -1 && b > -1) {
          return a - b;
        }
        if (scene1.editor.loading) {
          return -1;
        }

        if (scene2.editor.loading) {
          return 1;
        }
        return scene1.orderId - scene2.orderId;
      }
      return [scene1, scene2]
        .map(({ type }) => ['Animation', 'Scene', 'Animation3D'].indexOf(type))
        .reduce((a, b) => a - b);
    });

  const customScripts = iScenes
    .filter(({ sceneContent }) => {
      const scene = JSON.parse(sceneContent);
      return scene.type === 'CustomScript';
    })
    .map(({ id, orderId, name, sceneContent }): ICustomScriptState => {
      const scene = JSON.parse(sceneContent);
      return { ...scene, id, orderId, name };
    })
    .sort(() => -1);

  const materials = iScenes
    .filter(({ sceneContent }) => {
      const scene = JSON.parse(sceneContent);
      return /Material$/.test(scene.type); // MobileDiffuseMaterial
    })
    .map(({ id, orderId, name, sceneContent }): IMaterialState => {
      return { ...JSON.parse(sceneContent), id, orderId, name };
    });

  const cubemaps = iScenes
    .filter(({ sceneContent }) => {
      const scene = JSON.parse(sceneContent);
      return /Cubemap$/.test(scene.type); // MobileDiffuseMaterial
    })
    .map(({ id, orderId, name, sceneContent }): ICubemap => {
      return { ...JSON.parse(sceneContent), id, orderId, name };
    });

  const texture2Ds = iScenes
    .filter(({ sceneContent }) => {
      const scene = JSON.parse(sceneContent);
      return /Texture2D$/.test(scene.type);
    })
    .map(({ id, orderId, name, sceneContent: sceneContentStr }) => {
      const sceneContent = JSON.parse(sceneContentStr);
      return { props: sceneContent.props, type: sceneContent.type, id, orderId, name };
    });

  const panoramaDataList = (iScenes as any[])
    .filter(({ sceneContent }) => {
      const viewer = JSON.parse(sceneContent);
      return viewer.type === 'PanoramaData';
    })
    .map(({ id, orderId, name, sceneContent }): IPanoramaData => {
      return { ...JSON.parse(sceneContent), id, orderId, name };
    });

  if (sceneMode === 'Product') {
    scenes = scenes.map(scene => ({ ...scene, editor: { ...scene.editor, moment: 0 } }));
  }
  return {
    id,
    type: 'Project',
    name,
    teamId,
    description,
    extra: { shared, categoryId, version },
    editor: {
      selectedSceneId: getSelectedSceneId(
        typeOfPlay,
        scenes.filter(({ type }) => type === 'Scene')
      ),
      propsMode: sceneMode == 'Template' ? 'Project' : sceneMode, // 默认编辑模式
      protectedTemplate: isAuthControl,
      editorTaskStack: [],
      settingsOn: false,
      soundVolume: 100,
      canvasScale: 1,
      skinning: skinBy !== undefined,
      playRate: 1,
      readOnly: false,
      loading: false,
      playing: 0,
      count: 200,
      sceneMode,
      cover,
      dataVersion,
      panoramaEdit: {
        panoramaDataOrderId: 0,
        panoramaId: 0,
        spaceId: 0,
        panoramaSpaceId: 0,
        mainSceneId: 0,
        type: undefined,
      },
    },
    scenes,
    customScripts,
    texture2Ds,
    materials: materials.map((item: any) => {
      if (item.material?.value) item.material = item.material.value;
      return item;
    }),
    cubemaps,
    panoramaDataList,
    settings: rewriteBasePath
      ? {
          ...settings,
          category,
          store: { ...store, ...(settings.store || {}) },
          basePath: getUrlHead(),
          typeOfPlay,
        }
      : {
          basePath: getUrlHead(),
          ...settings,
          store: { ...store, ...(settings.store || {}) },
          typeOfPlay,
          category,
        },
  };
};

const getSceneMode = (type: number, editMode: number, typeOfPlay = 0) => {
  const sceneModes = ['Project', 'Template', 'Product'] as const;
  const sceneMode = new URLSearchParams(location.search).get('sceneMode') as any;
  if (sceneModes.includes(sceneMode)) {
    return sceneMode;
  }
  const segment = location.pathname.split('/')[2];
  switch (segment) {
    case 'template':
    case 'project':
    case 'product':
      return capitalize(segment);
    case 'simple':
      return 'Project';
  }
  switch (editMode) {
    case 2:
      return 'Project'; // 简易模式废弃，也进入项目模式
    case 1:
      return 'Product';
    default:
      if (typeOfPlay === 3) {
        return 'Project';
      }
      return sceneModes[type % 2];
  }
};

const getSelectedSceneId = (typeOfPlay: number | undefined, scenes: ISceneState[]) => {
  let selectedId = Number(new URLSearchParams(location.search).get('scene'));
  let scene = scenes.find(({ orderId }) => orderId === selectedId);
  if (scene) {
    return scene.id;
  }
  selectedId = selectedSceneId.getValue();
  scene = scenes.find(({ id }) => id === selectedId);
  if (scene) {
    return scene.id;
  }
  if (typeOfPlay === 3) {
    return scenes[0].id;
  }
  return getMainScene(scenes).id;
};
