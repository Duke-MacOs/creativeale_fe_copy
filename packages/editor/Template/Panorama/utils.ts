/* eslint-disable @typescript-eslint/no-unused-vars */
import { createMaterialByUrls } from '@shared/api/library';
import { relativeUrl } from '@shared/utils';
import { INodeData } from '@byted/riko';
import { getNewNode, ICaseState, IPanorama, IPanoramaData, ISceneState, newCase } from '@editor/aStore';
import { ResourceType } from '@editor/Resource/upload/accepted';
import {
  getPanoramaDataList,
  newID,
  getAllByOrderId,
  intoScene,
  fromScene,
  isAnimation,
  openKeysToCompProps,
  getScene,
  popPlayState,
} from '@editor/utils';
import { InputNumberProps } from 'antd';
import axios from 'axios';
import { cloneDeep } from 'lodash';
import { DEFAULT_PLAN_VIEWER_URL, DEFAULT_LANK_MARK_URL } from './config';
import { db } from './indexdb';

export const createPanorama = async (
  spaceId: number,
  createComp: (spaceId: number, panoramaId: number, name?: string) => Promise<number>
) => {
  const id = newID();
  const newPanorama = {
    id,
    type: 'Panorama',
    name: '未命名',
    pathways: [],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    cubemapUrl: 0,
    groundPosition: [0, 0, 0],
  } as any;
  newPanorama.nodesComponentUrl = await createComp(spaceId, id);

  return newPanorama;
};

const translateRotation = (val = 0): number => {
  return (val / Math.PI) * 180;
};

export const createSpace = async (name = '区域') => {
  return {
    id: newID(),
    name: name,
    panoramaIds: [],
    type: 'Space',
  };
};

export const translateXingfuli = async (
  data: any,
  handlePanoramaUrl: (urls: string[], name?: string) => Promise<number | string>,
  handleNodeComponent: (panoramaId: number, panoramaDataId: number, name: string) => Promise<number>,
  handleModel: (_originUrl: string) => Promise<number>
) => {
  const panoramaList: IPanoramaData[] = [];
  const _totalSize = data?.interactionData?.totalSize;
  for (let i = 0; i < data?.interactionData?.scenesData.length; i++) {
    const pathPrefix = data.interactionData.mapPathPrefix ?? '';
    const pathSuffix = data.interactionData.mapPathSuffix ?? '';
    const scene = data?.interactionData?.scenesData[i];
    // 处理 space、panorama
    const panoramaDataId = newID();
    const state: IPanoramaData = {
      id: panoramaDataId,
      type: 'PanoramaData',
      spaces: [],
      modelUrl: '',
      totalSize: _totalSize ? [_totalSize.x, _totalSize.y, _totalSize.z] : [0, 0, 0],
      panoramas: [],
      landMarkUrl: '',
      plan: {
        viewerUrl: '',
        planUrl: '',
      },
    };
    const mapCache: Record<string, any> = {};
    const pathWayCache: Record<string, number> = {};
    for (let j = 0; j < scene?.panoBoxes.length; j++) {
      const box = scene?.panoBoxes[j];
      if (!box) continue;
      let spaceId = mapCache[box.space]?.id;
      // 设置区域
      if (spaceId === undefined) {
        spaceId = newID();
        mapCache[box.space] = {
          id: spaceId,
          names: [],
        };
        state.spaces.push({
          id: spaceId,
          name: box.spaceName,
          panoramaIds: [],
          type: 'Space',
        } as any);
      }
      // 设置热点
      const panoramaId = newID();
      const names = mapCache[box.space].names?.filter((i: any) => i === box.name) ?? [];
      pathWayCache[box.id] = panoramaId;
      const name = box.name ? `${box.name}${names.length + 1}` : '未命名';
      state.panoramas.push({
        id: panoramaId,
        name,
        type: 'Panorama',
        pathways: box.pathways,
        position: [box.position?.x, box.position?.y, box.position?.z],
        rotation: [
          translateRotation(box.rotation?.x),
          translateRotation(box.rotation?.y),
          translateRotation(box.rotation?.z),
        ],
        groundPosition: [box.groundPosition?.x, box.groundPosition?.y, box.groundPosition?.z],
        bestCameraView: box.bestCameraView,
        cubemapUrl: await handlePanoramaUrl(
          box.panoUrl.map((path: string) => `${pathPrefix}${path}${pathSuffix}`),
          name
        ),
        nodesComponentUrl: await handleNodeComponent(panoramaId, panoramaDataId, box.name ?? '未命名'),
      });
      mapCache[box.space].names?.push(box.name);
      state.spaces.find(area => area.id === spaceId)?.panoramaIds?.push(panoramaId);
    }
    // 替换 pathways 为对应的 panoramaId
    state.panoramas.forEach(panorama => {
      panorama.pathways = panorama.pathways.map(key => pathWayCache[key]).filter(i => i);
    });

    // 设置默认区域标记图
    state.landMarkUrl = relativeUrl(DEFAULT_LANK_MARK_URL);

    // 户型图配置
    state.plan.viewerUrl = relativeUrl(DEFAULT_PLAN_VIEWER_URL);
    if (scene.scenePlane) {
      const data = await createMaterialByUrls({
        0: {
          type: ResourceType['Sprite'],
          url: `${pathPrefix}${scene.scenePlane}${pathSuffix}`,
        },
      });
      state.plan = {
        ...state.plan,
        planUrl: relativeUrl(data[0].url),
      };
    }

    panoramaList.push(state);
  }

  // 处理模型
  if (data.modelUrl) {
    await handleModel(data.modelUrl);
  }

  return panoramaList;
};

export const getNodesComponentByPanoramaId = (state: ICaseState, panoramaId: number): ISceneState | undefined => {
  const panoramaDataList = getPanoramaDataList(state);
  let target;
  panoramaDataList.forEach(data => {
    const orderId = data.panoramas.find(i => i.id === panoramaId)?.nodesComponentUrl;
    if (typeof orderId === 'number') target = getAllByOrderId(state, orderId);
  });
  return target;
};

export const getNodesComponentBySpaceId = (state: ICaseState, spaceId: number): ISceneState | undefined => {
  const panoramaDataList = getPanoramaDataList(state);
  let target: IPanorama | undefined;
  panoramaDataList.forEach(data => {
    data.spaces.forEach(space => {
      if (space.id === spaceId) {
        target = data.panoramas.find(i => i.id === space.panoramaIds[0]);
      }
    });
  });
  return target ? (getAllByOrderId(state, target.nodesComponentUrl) as ISceneState) : undefined;
};

/**
 * 按照 space 获取第一个 panorama
 */
export const getFirstPanorama = (state: IPanoramaData): IPanorama | undefined => {
  for (let i = 0; i < state.spaces.length; i++) {
    const space = state.spaces[i];
    const target = state.panoramas.find(i => space.panoramaIds.find(id => id === i.id));
    if (target) return target;
  }
};

export const changePanoramaSpaceInPrevState = (state: ICaseState, panoramaSpaceId: number, props: any): ICaseState => {
  const selectedScene = state.editor.prevState?.scenes.find(
    scene => scene.id === state.editor.prevState?.editor.selectedSceneId
  );
  return selectedScene && state.editor.prevState
    ? {
        ...state,
        editor: {
          ...state.editor,
          prevState: {
            ...state.editor.prevState,
            scenes: state.editor.prevState.scenes.map(scene => {
              if (selectedScene.id !== scene.id) return scene;
              const _props = cloneDeep(scene.props);
              if (_props[panoramaSpaceId]) {
                _props[panoramaSpaceId] = {
                  ..._props[panoramaSpaceId],
                  ...props,
                };
              }
              return {
                ...scene,
                props: _props,
              };
            }),
          },
        },
      }
    : state;
};

export const getPanoramaSpacePropsById = (state: ICaseState, id: number): any => {
  const selectedScene = state.scenes.find(scene => scene.id === state.editor.selectedSceneId);
  const props = selectedScene?.props[id];
  return props ?? (state.editor.prevState ? getPanoramaSpacePropsById(state.editor.prevState, id) : undefined);
};

export const checkPanoramaData = (data: IPanoramaData) => {
  if (data.panoramas.length === 0) throw new Error('数据错误：缺少全景节点');
  // 检查 space 中的 panorama 是否存在
  const spacePanoramaIds = data.spaces.reduce((prev: number[], cur) => {
    return [...prev, ...cur.panoramaIds];
  }, []);
  for (let i = 0; i < data.panoramas.length; i++) {
    const id = data.panoramas[i].id;
    if (spacePanoramaIds.includes(id)) return;
  }
  throw new Error('数据错误：缺少全景节点');
};

/**
 * VR 看房“寻宝”玩法
 */
export const giftMode = async (state: ICaseState, orderId: number, config: any): Promise<ICaseState> => {
  const nodesComponentUrl = state.panoramaDataList?.find(i => i.orderId === orderId)?.panoramas[0].nodesComponentUrl;
  let component = state.scenes.find(i => i.orderId === nodesComponentUrl);
  if (!component) return state;
  const nodes: any[] = await Promise.all(
    config.map(async ({ mime, url, name, props }: any) => {
      const node = await getNewNode(mime, name, url);
      if (isAnimation(node.type) && node.props) {
        const { data } = await axios.get(url);
        node.editor = {
          ...node.editor,
          state: [{ name: '默认状态', id: -1, duration: data.props?.duration }, ...(data.editor?.state ?? [])],
        };
        if (!(node.props.compProps as any)?.length) {
          const {
            props: {
              [data.id]: { compProps },
            },
          } = openKeysToCompProps(fromScene(data));
          node.props.compProps = compProps;
        }
      }
      return {
        ...node,
        props: {
          ...node.props,
          ...props,
        },
      };
    })
  );
  const _component = intoScene(component);
  _component.nodes = [...(_component?.nodes ?? []), ...nodes];
  component = fromScene(_component);
  return {
    ...state,
    scenes: state.scenes.map(i => (i.orderId === nodesComponentUrl ? component! : i)),
  };
};

/**
 * 是否为 VR Case
 */
export const isVRCase = (state: ICaseState): boolean => {
  if (state.editor.prevState) return isVRCase(state.editor.prevState);
  return state.settings.category === 2;
};

/**
 * 是否为 VR Case 并且在编辑页面
 */
export const isVRCaseAndInEdit = (state: ICaseState): boolean => {
  return isVRCase(state) && state.type === 'PanoramaData';
};

/**
 * 获取第一个有数据 space node 节点
 */
export const getPanoramaSpaceNodeShift = (state: ICaseState): INodeData | undefined => {
  const currentScene = state.scenes.find(i => i.name === '主场景');
  if (!currentScene) return undefined;
  const panoramaSpaceNode = intoScene(currentScene)
    ?.nodes?.find(i => i.type === 'Scene3D')
    ?.nodes?.find(
      i =>
        i.type === 'PanoramaSpace' &&
        i.props?.dataUrl &&
        state.panoramaDataList?.some(k => k.orderId === i.props?.dataUrl)
    );

  return panoramaSpaceNode;
};

/**
 * 获取最后一个有数据 space node 节点
 */
export const getPanoramaSpaceNodePop = (state: ICaseState): INodeData | undefined => {
  const currentScene = state.scenes.find(i => i.name === '主场景');
  if (!currentScene) return undefined;
  const panoramaSpaceNode = intoScene(currentScene)
    ?.nodes?.find(i => i.type === 'Scene3D')
    ?.nodes?.reverse()
    ?.find(
      i =>
        i.type === 'PanoramaSpace' &&
        i.props?.dataUrl &&
        state.panoramaDataList?.some(k => k.orderId === i.props?.dataUrl)
    );

  return panoramaSpaceNode;
};

/**
 * 编辑"全景节点"，返回全新 state
 */
export const getPanoramaEditState = (
  state: ICaseState,
  oldOne: ICaseState,
  panoramaDataOrderId: number,
  panoramaSpaceId: number
): ICaseState => {
  const mainScene = getScene(state);
  const panoramaDataList = getPanoramaDataList(state);
  const panoramaData = panoramaDataList.find(i => i.orderId === panoramaDataOrderId);
  if (!panoramaData) throw new Error();
  const panoramaId = panoramaData.panoramas[0]?.id ?? 0;
  const panoramaComponents: ISceneState[] = panoramaData.panoramas
    .map(p => {
      return getAllByOrderId(state, p.nodesComponentUrl);
    })
    .filter(i => i !== undefined) as any;

  const startPanorama =
    panoramaData.panoramas.find(i => {
      return (
        i.id ===
        oldOne.scenes.find(i => i.id === oldOne.editor.selectedSceneId)?.props?.[panoramaSpaceId]?.startPanoramaId
      );
    }) ?? getFirstPanorama(panoramaData);

  const newOne = newCase([mainScene, ...panoramaComponents], 'PanoramaData', oldOne);
  newOne.editor.readOnly = oldOne.editor.readOnly;
  newOne.editor.panoramaEdit = {
    ...oldOne.editor.panoramaEdit,
    panoramaDataOrderId: panoramaData.orderId ?? 0,
    panoramaId: startPanorama?.id ?? panoramaId,
    panoramaSpaceId,
    type: 'panorama',
  };
  // 设置选中 panorama node component 组件
  console.error('startPanorama :', startPanorama);
  if (startPanorama) {
    newOne.editor.selectedSceneId = getAllByOrderId(state, startPanorama?.nodesComponentUrl)?.id;
  }
  newOne.settings.enabled3d = true;
  newOne.settings.store = oldOne.settings.store;
  newOne.settings.layerCollisions = oldOne.settings.layerCollisions;
  newOne.settings.layerCollisionName = oldOne.settings.layerCollisionName;
  newOne.panoramaDataList = panoramaDataList;
  newOne.materials = oldOne.materials;
  // TODO:删除
  newOne.settings.typeOfPlay = oldOne.settings.typeOfPlay;

  // 保留project id用于更新
  newOne.id = oldOne.id;

  return newOne;
};

export const dbServer = {
  set: async (id: number, files: File[]) => {
    try {
      db.transaction('rw', db.VRUpload, () => {
        db.VRUpload.toArray().then(data => {
          if (data.length > 20) {
            db.VRUpload.limit(1).delete();
          }
          db.VRUpload.add({
            id,
            files,
          });
        });
      });
    } catch (err) {
      console.log(err);
    }
  },
  get: async (id: number) => {
    return await db.VRUpload.where({ id }).first();
  },
};
