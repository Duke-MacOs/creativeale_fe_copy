import { FirstParam } from '@/types';
import { IPagination, IPaginationReq } from '@/types/apis';
import { AxiosRequestConfig } from 'axios';

export interface IScene {
  id: number;
  orderId: number;
  name: string;
  cover?: string;
  projectId: number;
  sceneContent: string;
  sceneExtra: string;
}

export interface IProject {
  id: number; //项目id
  name: string; //项目名称
  description: string; //项目描述
  cover: string; //项目封面
  /**
   * 0: 2D项目
   * 1: 3D项目
   */
  category?: 0 | 1 | 2 | 3;
  /**
   * 项目类型：`0` 作品项目；`1` 模板项目；`2` 作品版本；`3` 模板版本
   */
  type: 0 | 1 | 2 | 3;
  /**
   * 0为普通项目，1为直玩项目，直玩项目已废弃
   */
  typeOfPlay?: number;
  /**
   * 0: 0-1项目模式
   * 1: 作品模式
   * 2: 简易模式 - 已废弃
   */
  editMode: 0 | 1 | 2;
  teamId: string;
  isAuthControl?: boolean;
  skinBy?: number;
  tagIds?: string[];
  editable?: 0 | 1 | 2 | 3;
  shared: 0 | 1; // 0 个人、1 合作
  editor: string | number; //合作者id
  updatedAt: string; //更新时间
  //published: number; // 0 未发布、1 已发布
  projectContent: string; //项目内容
  categoryId: number;
  parentId: number;
  status: number;
  version_id: number;
  templateId: number; //模板id
  playerId: number; //播放器
  projectExtra: string; //预留字段
  scenes: IScene[]; //场景列表
  owner: number | string; //创建者id
  ownerInfo: Record<string, unknown>;
  pid: number; // 第三方平台id
  project_id: number; // 第三方平台id
  isPublic: 0 | 1 | 2; //0 个人项目、1 公共项目
  copyFrom: number; // 复制来的项目有源项目ID
  appId: number; // 项目来源：3 rubeex、20 万能
  advId: string; // 广告主ID
  versionCount: number; // 版本个数
  reportData?: IReportData; //披露数据
  advInfo?: IAdvInfo;
  data?: string;
}
export interface IReportData {
  click_cnt?: number; //点击数
  conversion_cost?: number; //转化成本
  conversion_rate?: number; //转化率
  convert_cnt?: number; //转化数
  cost?: number; //消耗
  cpc?: number; //平均点击单价
  cpm?: number; //平均千次展示费用
  ctr?: number; //点击率
  custom_finish_play_playable_layer_rate?: number; //完成互动率
  custom_start_play_playable_layer_rate?: number; //开始互动率
  playable_ctr?: number; //互动点击率
  show_cnt?: number; //展示数
}
export interface IAdvInfo {
  company: string;
  company_id: string;
  customer_id: string;
  id: string;
  name: string;
}

export interface IProjectFilters {
  id?: string; //搜索ID
  keyword?: string; // 搜索关键字
  shared?: IProject['shared']; //分享状态
  startDate?: string; // 开始日期
  endDate?: string; //结束日期
}

//创建项目参数
export type IProjectEdit = Pick<IProject, 'name'> & Partial<Pick<IProject, 'cover' | 'description'>>;

//生成模板参数
export type IProjectToTemplate = Pick<IProject, 'name' | 'id' | 'cover'> & Partial<Pick<IProject, 'description'>>;

//基础信息设置参数
export type IProjectBaseInfo = Pick<IProject, 'name' | 'description' | 'updatedAt'> &
  Partial<Pick<IProject, 'cover'>> & { editIndex: number };

/* api */

export interface IFetchProjectList {
  (
    params: (IProjectFilters & IPaginationReq) & Partial<{ pageType: 'public' | 'admin' | 'user' }>,
    isRandom?: boolean | undefined
  ): Promise<{
    projectList: IProject[];
    pagination: IPagination;
    isVersion: boolean;
  }>;
}

export interface IPostProject {
  (
    data: Pick<IProject, 'name' | 'templateId' | 'pid' | 'typeOfPlay'> &
      Partial<Pick<IProject, 'cover' | 'description' | 'projectContent' | 'projectExtra'>> & { versionId: number }
  ): Promise<Pick<IProject, 'id'>>;
}

export interface IUpdateProject {
  (params: Partial<IProject>): Promise<Pick<IProject, 'id'>>;
}

export interface ICreateScene {
  (params: Pick<IScene, 'name' | 'projectId'> & Partial<Pick<IScene, 'sceneContent' | 'sceneExtra'>>): Promise<
    Pick<IScene, 'id' | 'orderId'>
  >;
}

export interface IUpdateScene {
  (params: FirstParam<ICreateScene> & Pick<IScene, 'id' | 'cover'>, config?: AxiosRequestConfig): Promise<
    Pick<IScene, 'id'>
  >;
}

// oneService 查询映射关系
export enum Platform {
  Android = 1,
  iOS = 2,
  iPad = 4,
  AndroidPad = 32,
}

// oneService 查询映射关系
export enum Gender {
  male = 1,
  woman = 2,
}

// oneService 素材类型
export enum ProjectType {
  直出互动,
  交互视频,
}
