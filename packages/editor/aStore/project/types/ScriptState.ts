import { IScriptData } from '@byted/riko';
export interface IScriptState {
  id: number;
  type: IScriptData['type'];
  enabled?: boolean;
  name: string;
  script: string;
  editor?: {
    openKeys?: string[];
    enabled?: boolean;
    visitIndices?: Array<string | number>;
  };
  time: number;
  duration?: number;
  loopInterval?: number;
  playBySelf?: boolean;
  loop?: boolean;
  loopTimes?: number;
  // 内部实时产生，用于实现循环动画第二个滑块调节循环间隔
  intervalId?: number;
}

export interface ICustomScriptState {
  id: number;
  orderId: number;
  parentId?: number | string;
  name: string;
  type: 'CustomScript';
  ideCode: string;
  jsCode: string;
  language: 'typescript' | 'javascript';
  /**
   * 1 - 蓝图固有脚本
   */
  status?: number;
}

export interface IMaterialState {
  id: number;
  name: string;
  orderId: number;
  type: 'Material';
  _originUrl: string;
  originOrderId?: number;
  isCustom?: boolean;
  material: {
    type: string;
    props: Record<string, unknown>;
  };
  _tempData?: any; // 临时这么写来支持功能，之后重构时删除
}

export interface ICubemap {
  id: number;
  orderId: number;
  name: string;
  cover: string;
  // 下面为 riko 返回
  type: 'Cubemap';
  props: {
    anisoLevel: number;
    filterMode: number;
    format: number;
    height: number;
    mipmaps: boolean;
    cover?: string;
    textureUrls: string[];
    width: number;
    wrapModeU: number;
    wrapModeV: number;
    spaceId?: number;
  };
}

export interface ITexture2D {
  id: number;
  orderId: number;
  name: string;
  type: 'Texture2D';
  props: Record<string, unknown> & { url: string };
}

export interface ISpace {
  id: number;
  name: string;
  panoramaIds: number[];
}

export interface IPanorama {
  id: number;
  name: string;
  type: 'Panorama';
  position: number[];
  rotation: number[];
  groundPosition: number[];
  pathways: number[];
  bestCameraView: {
    theta: number;
    phi: number;
  };
  cubemapUrl: string | number;
  nodesComponentUrl: number;
  fixedCameraView?: number[];
  fixedCameraViewOnce?: boolean;
}

export interface IPanoramaData {
  id: number;
  orderId?: number;
  name?: string;
  type: 'PanoramaData';
  modelUrl: string;
  totalSize: [number, number, number];
  spaces: ISpace[];
  panoramas: IPanorama[];
  // 区域标记图片
  landMarkUrl: string;
  // 户型图配置
  plan: {
    viewerUrl: string;
    planUrl: string;
  };
}
