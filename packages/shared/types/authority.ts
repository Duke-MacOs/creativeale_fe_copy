import { IOrder } from '@/types';

// 权限点
// TODO: 增加权限影响范围（路由、按钮。。。）
export interface IAuthority {
  id: number;
  name: string;
  description: string;
  url: string; // 权限相关 api 路由
}

// 角色
export interface IRole {
  id: string;
  userId: string;
  identity: string;
  name: string;
  description: string;
  createTime: string;
  updateTime: string;
  permissions: IAuthority[];
}

export interface IRoleFilters {
  name?: string;
  identification?: string;
  sortType?: string; // 排序维度
  order?: IOrder;
}

// 用户
export interface IUser {
  id: number;
  userId: string;
  name: string;
  email: string;
  roles: IRole[];
  status: number;
  departmentId: string;
  departmentName: string;
  key: string;
  advs: [];
  createdAt: string;
  avatarUrl?: string;
}

export type IAuthorityUser = Pick<IUser, 'id' | 'userId' | 'name' | 'email' | 'roles' | 'key' | 'advs' | 'createdAt'>;
