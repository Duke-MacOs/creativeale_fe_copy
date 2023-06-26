import {
  ICaseState,
  INodeState,
  ISceneState,
  ICustomScriptState,
  IMaterialState,
  ICubemap,
  IPanoramaData,
  IGlobalSettings,
  ITexture2D,
} from '../aStore';
import { IScriptData } from '@byted/riko';
import { memoPrev } from './memoPrev';
import { absoluteUrl, amIHere } from '@shared/utils';
import { pickBy } from 'lodash';
import { intoRikoHook } from './rikoHooks';
import Axios from 'axios';
import { fromScene } from './intoFrom';
import { applyScene } from '@editor/Editor/Header/hooks/compatibles';
import { hasSearchFlag } from './hasSearchFlag';

export * as SCALE from './SCALE';
export * from './hasSearchFlag';
export * from './pickupScenes';
export * from './collectEvent';
export * from './manageIdeTab';
export * from './formatBytes';
export * from './downloadUri';
export * from './neverThrow';
export * from './centerNode';
export * from './classnest';
export * from './rikoHooks';
export * from './compProps';
export * from './intoFrom';
export * from './memoPrev';
export * from './sorters';
export * from './onMacOS';
export * from './newID';

export function popPlayState(state?: ICaseState, _count = 0): ICaseState {
  if (!state) {
    throw new Error(`Can not return from play state: ${_count}`);
  }
  return state.editor.playing ? popPlayState(state.editor.prevState, _count + 1) : state;
}

export function getScene(state: ICaseState, targetId?: number, mockSceneAsNode = true) {
  const { editor, scenes } = state;
  const sceneId = targetId ?? editor.selectedSceneId;
  const scene = scenes?.find(({ id }) => id === sceneId) || scenes[0];
  if (!scene) {
    throw new Error(`Scene not exist: ${editor.selectedSceneId}`);
  }
  if (
    mockSceneAsNode &&
    isSceneResource(scene.type) &&
    (amIHere({ release: false }) || hasSearchFlag('componentRoot', '1'))
  ) {
    return {
      ...scene,
      nodes: [{ scripts: [], ...scene }] as INodeState[],
    };
  }
  return scene;
}
export function getNodes(scene: ISceneState) {
  const {
    editor: { stateId },
  } = scene;
  return getNodesByStateId(scene, stateId);
}
export function getNodesByStateId(scene: ISceneState, stateId = 0) {
  const { nodes, props, type } = scene;
  if (!isAnimation(type)) {
    return nodes;
  }
  const mapNodes = (nodes: INodeState[]): INodeState[] =>
    nodes.map(node => ({
      ...node,
      scripts: props[node.id].state?.[stateId]?.scripts ?? node.scripts,
      enabled: props[node.id].state?.[stateId]?.enabled ?? props[node.id].enabled,
      asMask: props[node.id].state?.[stateId]?.asMask ?? props[node.id].asMask,
      nodes: mapNodes(node.nodes),
    }));
  return mapNodes(nodes);
}
export function getAllByOrderId(
  project: ICaseState,
  id: number
): ISceneState | ICustomScriptState | IMaterialState | ICubemap | ITexture2D | IPanoramaData {
  const { editor, scenes, customScripts, materials, cubemaps, panoramaDataList, texture2Ds } = project;
  const target =
    scenes.find(({ orderId }) => orderId === id) ||
    customScripts.find(({ orderId }) => orderId === id) ||
    materials.find(({ orderId }) => orderId === id) ||
    cubemaps?.find(({ orderId }) => orderId === id) ||
    texture2Ds?.find(({ orderId }) => orderId === id) ||
    panoramaDataList?.find(({ orderId }) => orderId === id);
  return target || getAllByOrderId(editor.prevState!, id);
}
export function getGlobalVars({ editor, settings }: ICaseState): Pick<IGlobalSettings, 'store'> {
  if (editor.prevState && editor.playing === 0) return getGlobalVars(editor.prevState);
  return settings.store ?? {};
}
export function getSceneByOrderId(project: ICaseState, id: number): ISceneState {
  const { editor, scenes } = project;
  const scene = scenes.find(({ orderId }) => orderId === id);
  return scene || getSceneByOrderId(editor.prevState!, id);
}
export function getMaterialByOrderId(project: ICaseState, id: number): IMaterialState {
  const { editor, materials } = project;
  const scene = materials.find(({ orderId }) => orderId === id);
  return scene || getMaterialByOrderId(editor.prevState!, id);
}
export function getCubemaps(project: ICaseState, prev: ICubemap[] = []): ICubemap[] {
  project.cubemaps.forEach(i => {
    const orderIds = prev.map(i => i.orderId);
    if (!orderIds.includes(i.orderId)) {
      prev.push(i);
    }
  });
  if (project.editor.prevState) {
    getCubemaps(project.editor.prevState, prev);
  }
  return prev;
}
export function getModels(project: ICaseState, prev: ISceneState[] = []): ISceneState[] {
  project.scenes.forEach(i => {
    const orderIds = prev.map(i => i.orderId);
    if (!orderIds.includes(i.orderId) && i.type === 'Model') {
      prev.push(i);
    }
  });
  if (project.editor.prevState) {
    getModels(project.editor.prevState, prev);
  }
  return prev;
}
export function getCubemapByOrderId(project: ICaseState, orderId: number | string): ICubemap | undefined {
  return getCubemaps(project)?.find(i => i.orderId === orderId);
}
export function getPanoramaDataList(project: ICaseState): IPanoramaData[] {
  if (!project) return [];
  const panoramaDataList = project.panoramaDataList;
  return panoramaDataList || getPanoramaDataList(project.editor.prevState!);
}
export function updatePanoramaDataList(state: ICaseState, panoramaDataList: IPanoramaData[]): ICaseState {
  if (state.panoramaDataList) {
    return {
      ...state,
      panoramaDataList,
    };
  }
  return {
    ...state,
    editor: {
      ...state.editor,
      prevState: state.editor.prevState ? updatePanoramaDataList(state.editor.prevState, panoramaDataList) : undefined,
    },
  };
}
export function getCustomScriptByOrderId({ editor, customScripts }: ICaseState, id: number): ICustomScriptState {
  const script = customScripts.find(({ orderId }) => orderId === id);
  if (script) {
    return script;
  }
  if (editor.prevState) {
    return getCustomScriptByOrderId(editor.prevState, id);
  }
  throw new Error(`无法根据orderId: ${id}查询到对应的组件`);
}
export const getSelectedIds = memoPrev((selected: ISceneState['editor']['selected']) => ({
  scriptIds: Object.values(selected).reduce((scriptIds, ids) => scriptIds.concat(ids), []),
  nodeIds: Object.keys(selected).map(Number),
}));

export const sortedNodes = (nodes: INodeState[], ids: number[]) => {
  if (!ids.length) {
    return [];
  }
  const siblings = findById(nodes, ids[0])[1]?.nodes || nodes;
  const sorted = siblings.filter(({ id }) => ids.includes(id));
  if (sorted.length !== ids.length) {
    throw new Error(`All ids of ${ids} should be valid and with the same parent.`);
  }
  return sorted;
};
export function findPropById(props: ISceneState['props'], id: number): ISceneState['props'][number] {
  if (props[id]) {
    return props[id];
  }
  const [script] = findEventById(props, id);
  return (script?.props ?? {}) as any;
}

// 查找事件
export function findEventById(props: ISceneState['props'], eventId: number): IScriptData[] {
  for (const [key, prop] of Object.entries(props)) {
    const scripts = findEventByScripts(prop.scripts, eventId);
    if (scripts.length) {
      return [...scripts, { id: Number(key), props: prop } as any];
    }
  }
  throw new Error(`No such event id: ${eventId}`);
}

export const findEventByScripts = (scripts: IScriptData[] = [], eventId: number): IScriptData[] => {
  for (const script of scripts) {
    if (script.id === eventId) {
      return [script];
    }
    for (const key of ['scripts', 'elseScripts'] as const) {
      const rest = findEventByScripts(script.props[key], eventId);
      if (rest.length) {
        return rest.concat(script);
      }
    }
  }
  return [];
};
/**
 * Find the path of [currentNode, parent, grandparent, ...].
 * @param nodes where to find.
 * @param id the target node or script id.
 * @param byScript if the target is a script, must specify this as true.
 */
export function findById(nodes: INodeState[], id: number, byScript = false): INodeState[] {
  for (const node of nodes) {
    if (byScript) {
      if ((node.scripts || []).find(script => script.id === id)) {
        return [node];
      }
    } else if (node.id === id) {
      return [node];
    }
    const result = findById(node.nodes, id, byScript);
    if (result.length) {
      result.push(node);
      return result;
    }
  }
  return [];
}

/**
 * 检测互动组件是否正在被使用
 * @param param0
 * @param orderId
 * @returns
 */
export function componentInUsed({ scenes, editor: { prevState } }: EditorState['project'], orderId: number): boolean {
  const usedInProps = (props: Record<string, any>): boolean => {
    return Object.values(props).some(({ callee, type, default: d, value = d, defaultItem }) => {
      switch (callee) {
        case 'Riko.useArray':
          return usedInProps({ ...value.map((value: any) => intoRikoHook(defaultItem, value)) });
        case 'Riko.useRes':
          return type === 'Component' && value === orderId;
        case 'Riko.useObject':
        case 'object':
          return usedInProps(value);
        default:
          return false;
      }
    });
  };
  const usedInScripts = (scripts: RikoScript[] = []): boolean => {
    return scripts.some(({ props }) => {
      const { url, script, scripts } = props;
      if (url === orderId) {
        return true;
      }
      if (script === 'CustomScript' && usedInProps(pickBy(props, (value, key) => value && key.startsWith('$')))) {
        return true;
      }
      return usedInScripts(scripts as any);
    });
  };
  const usedInScene = ({ props }: ISceneState) => {
    return Object.values(props).some(({ type, url, scripts, compProps = [] }) => {
      if (isSceneResource(type)) {
        if (url === orderId) {
          return true;
        }
        if (
          compProps.some(({ props }) =>
            usedInProps(
              Object.fromEntries(
                props.filter(({ key, value }) => value && key.startsWith('$')).map(({ key, value }) => [key, value])
              )
            )
          )
        ) {
          return true;
        }
      }
      if ((type === 'Script' || type === 'Blueprint') && usedInScripts(scripts)) {
        return true;
      }
    });
  };
  if (scenes.some(scene => usedInScene(scene))) {
    return true;
  }
  return prevState ? componentInUsed(prevState, orderId) : false;
}

export function getUseMaterialNodes(
  { scenes, editor: { prevState } }: EditorState['project'],
  orderId: number
): { id: number; materialUrls: Array<string | number> }[] {
  const list: { id: number; materialUrls: Array<string | number> }[] = [];
  const usedInScene = ({ props }: ISceneState) => {
    Object.entries(props).forEach(([id, { materialUrls }]) => {
      if (materialUrls?.includes(orderId)) {
        list.push({ id: Number(id), materialUrls });
      }
    });
  };
  scenes.forEach(scene => usedInScene(scene));
  return prevState ? getUseMaterialNodes(prevState, orderId) : list;
}

export function materialInUsed({ scenes, editor: { prevState } }: EditorState['project'], orderId: number): boolean {
  const usedInScene = ({ props }: ISceneState) => {
    return Object.values(props).some(({ materialUrls = [], skyboxMaterialUrl }) => {
      return materialUrls.includes(orderId) || skyboxMaterialUrl === orderId;
    });
  };

  if (scenes.some(scene => usedInScene(scene))) {
    return true;
  }

  return prevState ? materialInUsed(prevState, orderId) : false;
}

export function cubemapInUsed(state: EditorState['project'], orderId: number): boolean {
  const reg = new RegExp(`"cubemapUrl":${orderId}`, 'g');
  return reg.exec(JSON.stringify(state)) !== null;
}

export function layerCollisionInUsed({ scenes, editor: { prevState } }: EditorState['project'], key: string): boolean {
  const usedInScene = ({ props }: ISceneState) => {
    return Object.values(props).some(({ layer = 0 }) => {
      return `${layer}` === key;
    });
  };

  if (scenes.some(scene => usedInScene(scene))) {
    return true;
  }

  return prevState ? layerCollisionInUsed(prevState, key) : false;
}

export type MemberOf<A> = Pick<
  A,
  { [K in keyof A]: A[K] extends (...args: readonly any[]) => any ? never : K }[keyof A]
>;
export type MethodOf<A> = Pick<
  A,
  { [K in keyof A]: A[K] extends (...args: readonly any[]) => any ? K : never }[keyof A]
>;

/**
 * 判断是否是互动组件（包括2D和3D互动组件）
 * @param type
 * @returns
 */
export function isAnimation(type: string): type is 'Animation' | 'Animation3D' {
  return ['Animation', 'Animation3D'].includes(type);
}

/**
 * 判断是否为场景化数据的资源
 * @param type
 * @returns
 */
export function isSceneResource(
  type: string
): type is 'Animation' | 'Animation3D' | 'Model' | 'Particle3D' | 'Cubemaps' {
  return ['Animation', 'Animation3D', 'Model', 'Particle3D', 'Cubemaps'].includes(type);
}

export const getSceneFromUrl = async (project: EditorState['project'], url: string | number) => {
  if (typeof url === 'number') {
    return getSceneByOrderId(project, url);
  }
  const sourceJson = url.replace(/data\.json(?:\?mid=\d+)?$/, 'source.json');

  const [res, sourceRes] = await Promise.allSettled([Axios.get(absoluteUrl(url)), Axios.get(absoluteUrl(sourceJson))]);
  if (res.status === 'fulfilled') {
    const { data } = res.value;
    const [scene] = await applyScene(project.id, [fromScene(data)]);
    scene.orderId = 0;
    if (sourceRes.status === 'fulfilled' && /\/data\.json(?:\?mid=\d+)?$/.test(url)) {
      scene.editor.sourceJson = sourceJson;
    }
    return scene;
  } else {
    return Promise.reject(res);
  }
};

/**
 * 获取图片宽高、是否包含透明通道
 * @param url 图片地址
 * @returns
 */
export function getImageData(url: string): Promise<{ width: number; height: number; isAlpha: boolean }> {
  return new Promise((resolve, reject) => {
    // 是否含透明背景的标志量
    let isAlpha = false;

    // 缩放图片需要的canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = function () {
      // 图片原始尺寸
      const originWidth = img.width;
      const originHeight = img.height;
      // canvas尺寸设置
      canvas.width = originWidth;
      canvas.height = originHeight;
      // 清除画布
      context?.clearRect(0, 0, originWidth, originHeight);
      // 图片绘制在画布上
      context?.drawImage(img, 0, 0);
      // 获取图片像素信息
      const imageData = context?.getImageData(0, 0, originWidth, originHeight).data;
      // 检测有没有透明数据
      if (imageData) {
        isAlpha = false;
        for (let index = 3; index < imageData.length; index += 4) {
          if (imageData[index] != 255) {
            isAlpha = true;
            break;
          }
        }
        resolve({
          width: img.width,
          height: img.height,
          isAlpha,
        });
      } else {
        reject(null);
      }
    };
    img.src = absoluteUrl(url);
  });
}

export const getSearchParams = (): any => {
  return new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as any),
  });
};

export const getTopState = (state: ICaseState): ICaseState => {
  if (state.editor.prevState) return getTopState(state.editor.prevState);
  return state;
};

export function PVVideoIsSelected(getState: () => EditorState) {
  const { project } = getState();
  const {
    settings: { typeOfPlay, category },
  } = project;
  if (typeOfPlay === 4) {
    const scene = getScene(project);
    const {
      editor: { selected },
      props,
    } = scene;
    const { nodeIds } = getSelectedIds(selected);
    if (nodeIds.map(id => props[id]).some(props => ['PVVideo', 'PVAlphaVideo'].includes(props.type))) {
      return true;
    }
  }
  if (typeOfPlay === 3 && category === 3) {
    const scene = getScene(project);
    const {
      editor: { selected },
      props,
    } = scene;
    const { nodeIds } = getSelectedIds(selected);
    if (nodeIds.map(id => props[id]).some(props => ['VRVideo'].includes(props.type))) {
      return true;
    }
  }
  return false;
}
