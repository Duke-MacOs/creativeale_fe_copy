import { ITag } from './tags';
import { IPagination, IPaginationReq } from '@/types/apis';
import { IOrder } from '@/types';
export interface IMaterialType {
  name: string;
  cid: number; // 类目 ID
}

export interface IContentType {
  id: number;
  name: string;
}
export interface IUserCategory {
  id: string;
  name: string;
}
export interface ICategory {
  id: string;
  name: string;
}
// 素材数据结构
export interface IMaterial {
  // 素材基本字段
  id: number | string;
  name: string;
  description: string;
  type: IMaterialType;
  tags: ITag[];
  cover: string;
  video: string; //互动组件预览视频
  userId: string | number;
  previewUrl: string; // 资源地址(new)
  url: string; //预览地址
  downloadUrl: string; // 资源包地址
  playerId?: number; // 编辑器素材关联的播放器 id
  file: File | Blob; //上传原文件
  onPlatform: boolean;
  onCloud: boolean;
  status: number;
  resourceId: string; //资源id
  projectId: number; //个人资源所属projectId
  createdAt: string; //资源创建时间
  updatedAt: string; //资源更新时间
  categories: IUserCategory[];
  extra: Record<string, any>;
  isAuthControl: boolean; //版权控制
  previewVideo: string;
}

export interface IUserMaterial extends IMaterial {
  resourceId: string; //资源id
  projectId: number; //个人资源所属projectId
  createdAt: string; //资源创建时间
  updatedAt: string; //资源更新时间
  categories: IUserCategory[];
  extra: Record<string, any>;
}

// 创建素材通用参数
export type IPostMaterialParams = Pick<IMaterial, 'name' | 'file' | 'onPlatform'> &
  Partial<Pick<IMaterial, 'description' | 'cover'>> & {
    platformTags?: string; // 替换原本的tagIds
    isAuthControl?: boolean;
    extra?: string;
    distinct?: boolean; //资源是否去重
  } & { type: number };

// 素材筛选维度接口
export interface IMaterialFilters {
  keyword?: string; // 搜索关键词，支持素材名称和开发人员名称
  types?: string; // 多个分类 ID 通过「,」隔开
  categoryId?: string;
  tagIds?: string | []; // 多个标签 ID 通过「,」隔开
  sort?: string; // 素材排序维度
  isTeam?: boolean;
  order?: IOrder;
  onPlatform?: boolean;
  statuses?: string; // status已弃用
  allType?: boolean;
}

/* api */
export interface IFetchMaterialList<T = IMaterialFilters & IPaginationReq> {
  (params: T): Promise<{
    materialList: IMaterial[];
    pagination: IPagination;
    tagList: ITag[];
  }>;
}
export interface IFetchUserMaterialList<T = IMaterialFilters & IPaginationReq> {
  (params: T): Promise<{
    materialList: IUserMaterial[];
    pagination: IPagination;
    tagList: ITag[];
  }>;
}
