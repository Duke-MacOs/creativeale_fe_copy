import { amIHere } from '@shared/utils';
import snakeCase from 'lodash/snakeCase';

export enum EventTypes {
  /**
   * Redux dispatched actions.
   */
  DataAction,
  /**
   * TODO: @LiYang
   * “事件触发方式”的使用次数
   */
  UserSelectEventTrigger,
  /**
   * TODO: @LiYang
   * ”事件类型“的使用次数
   */
  UserAddEventScript,
  /**
   * 资源类型选择（图片、视频、声音、组件、动效、文字、图形）
   */
  SelectResource, // ResourceCategory
  /**
   * 素材来源（公共资源、个人资源、团队资源）
   */
  OriginResource, // ResourceOrigin
  /**
   * 动效来源（lottie、2d粒子、序列帧、龙骨、Spine）
   */
  OriginEffect, // EffectCategory
  /**
   * 组件来源（互动组件、平面组件、脚本组件）
   */
  OriginComponent, // ComponentCategory
  /**
   * 头部操作按钮
   */
  OperationButton, // HeaderButton
  /**
   * 场景库
   */
  SceneLibrary,
  /**
   * 制作建议
   */
  CraftSuggestion,
  /**
   * 智能客服
   */
  SmartRobot,
  /**
   * 风险提示
   */
  RiskAlert,
  /**
   * 上传资源成功率
   */
  UploadResource,
  /**
   * 压缩作品的大小和压缩时长
   */
  CompressProduct,
  /**
   * 作品类型：普通项目、轻互动、直出互动
   */
  ProductType,
  /**
   * 作品状态
   * 0：新建作品，创建作品但未推送
   * 1：已同步作品，成功导出至ad的作品
   * 2：已导出作品
   */
  ProductStatus,
  /**
   * 点击同步按钮加载时长
   */
  SyncLoadingTime,
  /**
   * 公共物料使用数
   */
  UseResource,
  /**
   * 教程中心
   */
  Tutorial,
  /**
   * 资源上传时的视频压缩时长
   */
  VideoCompressDuration,

  /**
   * 埋点可视化面板
   */
  EventTracking,
  /**
   * 使用压缩优化次数
   */
  CompressResource,
  /**代码模式
   */
  CodeMode,
  /**
   * 全局日志/变量查看次数埋点
   */
  GlobalLog,
  /**
   * 全局变量创建类型埋点
   */
  CreateGlobalVar,
  /**
   * 查看oncall服务台次数埋点
   */
  LookOncallService,
  AnimationType,
}

export interface IEventParams {
  [EventTypes.DataAction]: {
    type: string;
    cost: number;
    redo: boolean;
  };
  [EventTypes.UserSelectEventTrigger]: {
    /**
     * 用户点击了图标还是替换按钮
     */
    entry?: 'icon' | 'button';
    /**
     * 用户选择的事件触发方式，如单击
     */
    name: string;
    /**
     * 被替换的事件触发方式，如自动
     */
    prev?: string;
  };
  [EventTypes.UserAddEventScript]: {
    /**
     * 用户新增的事件类型，如切换场景
     */
    name: string;
  };
  [EventTypes.SelectResource]: {
    type: string;
  };
  [EventTypes.OriginResource]: {
    type: string;
  };
  [EventTypes.OriginEffect]: {
    type: string;
  };
  [EventTypes.OriginComponent]: {
    type: string;
  };
  [EventTypes.OperationButton]: {
    type: string;
  };
  [EventTypes.SceneLibrary]: {
    type: string;
    value?: string;
  };
  [EventTypes.CraftSuggestion]: null;
  [EventTypes.RiskAlert]: {
    from: '编辑中曝光' | '同步中曝光';
  };
  [EventTypes.SmartRobot]: null;
  [EventTypes.UploadResource]: {
    type: '用户上传量' | '上传成功量';
  };
  [EventTypes.CompressProduct]: {
    size: number; // MB
    duration: number; // 秒
  };
  [EventTypes.ProductType]: {
    type: '普通项目' | '轻互动' | '直出互动' | '互动视频' | 'VR看房' | 'VR项目' | 'VR视频' | '3D看车';
  };
  [EventTypes.ProductStatus]: {
    type: 0 | 1 | 2;
  };
  // 埋点被删了，待重新补上
  [EventTypes.SyncLoadingTime]: {
    duration: number;
  };
  [EventTypes.UseResource]: {
    type: number;
    material_id?: number;
  };
  [EventTypes.Tutorial]: {
    type: string;
  };
  [EventTypes.VideoCompressDuration]: {
    duration: string; // 压缩时长或者‘超时’
  };
  [EventTypes.EventTracking]: null;
  [EventTypes.CompressResource]: {
    type: '图片' | '视频' | '音频';
  };
  [EventTypes.CodeMode]: null;
  [EventTypes.GlobalLog]: {
    type: '日志' | '全局变量';
  };
  [EventTypes.CreateGlobalVar]: {
    type: 'number' | 'string' | 'object' | 'array' | 'boolean';
  };
  [EventTypes.LookOncallService]: null;
  [EventTypes.AnimationType]: {
    name: string;
  };
}

/**
 * To collect event to DataRangers: https://datarangers.com.cn/help/doc?lid=1097&did=10943.
 * @param event Please import the `EventTypes` enum to specify this parameter.
 * @param params Note that `params` will be MUTATED to replace all `null` with `'be_null'`.
 */
export function collectEvent<K extends EventTypes>(event: K, params: IEventParams[K]) {
  for (const key in params) {
    if ((params as any)[key] === null) {
      (params as any)[key] = 'be_null' as any;
    }
  }
  if (params) {
    window.collectEvent(snakeCase(EventTypes[event]), {
      ...params,
      platform: amIHere({ release: true }) ? 'magicplay' : 'clab',
    });
  } else {
    window.collectEvent(snakeCase(EventTypes[event]), {
      platform: amIHere({ release: true }) ? 'magicplay' : 'clab',
    });
  }
}
