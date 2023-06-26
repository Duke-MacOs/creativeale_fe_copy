import { ISettings, GameCategory } from '@byted/riko';
import { IState } from '@editor/Editor/Blueprint/types';
import { ISceneState } from './SceneState';
import { ICustomScriptState, IMaterialState, ICubemap, IPanoramaData, ITexture2D } from './ScriptState';

export interface IPanoramaEdit {
  panoramaDataOrderId: number;
  panoramaId: number;
  spaceId: number;
  panoramaSpaceId: number;
  mainSceneId: number;
  type: 'panorama' | 'space' | undefined;
}
interface IEditor {
  dataVersion?: number;
  prevState?: ICaseState;
  selectedSceneId: number;
  /**
   * 该模板是否必需把所有素材都替换了才能同步或导出
   */
  protectedTemplate?: boolean;
  canvasScale: number;
  soundVolume: number;
  playRate: number;
  // 正在编辑皮肤
  skinning?: boolean;
  loading: boolean;
  playing: number;
  /**
   * Project cover: `?orderId=${orderId}`;
   */
  cover?: string;
  count: number;
  contextMenu?: {
    x: number;
    y: number;
  };
  editorTaskStack: any[];
  settingsOn: boolean;
  readOnly: boolean;
  /**
   * 场景编辑模式：
   * - 项目模式(`'Project'`): 用于制作 case, 功能最强大，使用门槛也最高
   * - 模板模式(`'Template'`): 用于制作模板，在项目模式上加入模板配置功能
   * - 作品模式(`'Product'`): 用于制作 case, 基于模板进行制作
   */
  propsMode: 'Project' | 'Template' | 'Product';
  sceneMode: 'Project' | 'Template' | 'Product';
  /** 当前打开的面板弹窗名 */
  openPanel?: string;
  panoramaEdit: IPanoramaEdit;
  /**
   * 是否开启蓝图
   */
  enableBlueprint?: boolean;
  /**
   * 记录蓝图当前状态
   */
  blueprintState?: Omit<NonNullable<IState>, 'script'> | null;
}

export interface IGlobalSettings extends Omit<ISettings, 'typeOfPlay'> {
  enable?: boolean;
  enabled?: boolean;
  enableProps?: Array<{ key: keyof IGlobalSettings; default: unknown }>;
  store?: Record<string | symbol, unknown>; //全局变量
  storeConfig?: Record<string, Record<string, unknown>>; //全局变量配置
  storeTypes?: Record<string, string>; // 全局变量类型
  blueprint?: any;
  multiTouchEnabled: boolean;
  enabled3d?: boolean;
  /**
   * 0: 普通项目；1: 直玩；2: 休闲互动；3: 直出互动; 4: 交互视频; 5: VR 看房;
   */
  typeOfPlay?: 0 | 1 | 2 | 3 | 4 | 5;
  /**
   * 0: 2D 1: 3D；2: VR 看房；3: VR 视频; 4: 3D 看车;
   **/
  category?: GameCategory | number;
  compressOptions?: {
    zipName: string;
    imageQuality: number;
    videoQuality: number;
    audioQuality: number;
  };
  componentInfo?: Record<string, any>;
  layerCollisions?: Record<string, number[]>;
  layerCollisionName?: { key: string; name: string }[];
  /**
   * 存放构建后的JS代码
   */
  jsCode?: string;
  /**
   * 直出互动配置，包括结束蒙层配置
   */
  hyruleJson?: {
    mask?: {
      title?: string;
      subtitle?: string;
      reward_info?: {
        reward_type: 0 | 1 | 2;
        before?: Record<string, any>;
        after?: Record<string, any>;
      };
    };
  };
  /*
   * 互动视频的兜底视频url
   */
  fallbackVideo?: string;
}
export interface ICaseState {
  id: number;
  type: 'Project' | 'Component' | 'Model' | 'Particle3D' | 'PanoramaData' | 'History';
  name: string;
  teamId: string;
  description?: string;
  editor: IEditor;
  extra?: Record<string, any>;
  visitIndices?: Array<string | number>;
  scenes: ISceneState[];
  customScripts: ICustomScriptState[];
  materials: IMaterialState[];
  cubemaps: ICubemap[];
  texture2Ds: ITexture2D[];
  panoramaDataList?: IPanoramaData[];
  settings: IGlobalSettings;
}
