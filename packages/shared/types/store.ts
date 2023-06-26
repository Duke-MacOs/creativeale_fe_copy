import { IPagination } from './apis';
import { IMaterialType } from './library';

export interface IStoreCategory {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  delete: number;
  type: IMaterialType;
}

export interface IStoreMaterial {
  id: string;
  resourceId: string;
  name: string;
  description: string;
  type: IMaterialType;
  tags: string;
  cover: string;
  userId: string;
  teamId: string;
  previewUrl: string; // 预览地址
  url: string;
  markUrl: string;
  status: StoreMaterialStatus;
  createdAt: string; //资源创建时间
  updatedAt: string; //资源更新时间
  category: string;
  price: number;
  usedCount: number;
  viewDetailCount: number;
  deleted: number;
  rejectDesc: string;
  extra: Record<string, any>;
}

// 一级资源类型分类
export enum CategoryLevel1 {
  Component2D = 4,
  Image = 5,
  Video = 6,
  Audio = 8,
  Effect = 99,
  Particle2D = 13,
  Text = 29,
  Component3D = 32,
  Model = 27,
  Particle = 14,
  Cubemap = 31,
}

export enum CategoryLevel1Name {
  '2D组件' = 4,
  '图片' = 5,
  '视频' = 6,
  '音频' = 8,
  '特效' = 99,
  '文字' = 29,
  '3D组件' = 32,
  '模型' = 27,
  '3D粒子' = 14,
}

export enum StoreMaterialStatus {
  examine, // 审核中
  reject, // 审核不通过
  shelve, // 上架
  offShelve, // 下架
  deleted, // 删除
}

export enum StoreMaterialStatusName {
  '审核中', // 审核中
  '审核不通过', // 审核不通过
  '上架', // 上架
  '下架', // 下架
  '删除', // 删除
}
