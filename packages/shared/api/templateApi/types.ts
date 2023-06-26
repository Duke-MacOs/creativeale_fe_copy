import { IUserInfo } from '@/types';
import { Status } from '@main/table/constants';

export type UserInfo = {
  userId?: IUserInfo['userId'];
};

export interface ITag {
  id: string;
  name: string;
  description: string;
  origin: number;
  parentName?: string;
}

export interface ITemplateFromServer {
  id: number; //模板id
  name: string; //模板名称
  cover: string; //模板封面
  createdAt: string; //创建时间
  updatedAt: string; //更新时间
  status: Status; //发布状态
  useCount: number;
  previewCount: number;
  userName: string;
  projectId: number; //关联项目ID
  typeOfPlay: number; //类型
  category: number;
  isAuthControl: number;
  tagList: ITag[]; //标签
  tags: string;
  description: string;
}
