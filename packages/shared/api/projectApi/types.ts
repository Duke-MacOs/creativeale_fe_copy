import { IPagination, IPaginationReq } from '@/types/apis';
import { IProjectFilters } from '@/types/project';
import { IProjectFromServer } from '@main/pages/Projects/ProjectList/api';

export type PaginationList<T> = { list: T[]; pagination: IPagination };
export type FetchProjectList = (
  params: (IProjectFilters & IPaginationReq) & Partial<{ pageType: 'public' | 'admin' | 'user' }>,
  isRandom?: boolean | undefined
) => Promise<PaginationList<IProjectFromServer> & { isVersion: boolean }>;

export interface IVersion extends Omit<IProjectFromServer, 'advInfo' | 'reportData' | 'versionCount'> {}

export type CancelableUrlQuery = (id: number, signal?: AbortSignal) => Promise<string>;

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
export interface IMd5 {
  id: string;
  userId?: string;
  userName?: string;
  createAt?: string;
  modifyAt?: string;
  beforeSize?: string /** 压缩前大小 */;
  afterSize?: string /** 压缩后大小 */;
  imageSize?: string /** 压缩后图片总大小 */;
  audioSize?: string /** 压缩后音频总大小 */;
  videoSize?: string /** 压缩后视频总大小 */;
  firstSceneSize?: string /** 压缩后主场景资源总大小，单位 bit*/;
  levels?: string /**质量级别 */;
  projectId?: string /**原项目id*/;
  zipMd5: string;
  lifecycle?: number;
  project_id?: string /**投放数据的project_id */;
  data_md5?: string /**投放数据的的data_md5 */;
  projectName?: string /**项目名称 */;
  projectUserId?: string /**项目制作者id*/;
  projectUserName?: string /**项目制作者名字 */;
  projectCover?: string /**项目封面 */;
  typeOfPlay?: number /**项目类型 */;
  message?: string;
  builderTeamId?: string /**打包素材的teamId */;
  receiverTeamId?: string /**接受移交的teamId */;
  receiverTeamName?: string;
  url?: string;
  taskName?: string;
  status?: number;
  syncStatus?: number;
}
export interface IFetchPlayableList {
  (params: { page: number; pageSize: number; projectId: string; projectUserId: string }): Promise<{
    list: any[];
    pagination: { total: number };
  }>;
}
