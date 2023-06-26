import { IPageParams } from '@main/routes/withPath';

export interface IProjectFromServer {
  /**
   * 0: 2D项目
   * 1: 3D项目
   */
  category: 0 | 1 | 2 | 3 | 4;
  industry: number;
  cover: string; //项目封面
  /**
   * 0: 0-1项目模式
   * 1: 作品模式
   * 2: 简易模式 - 已废弃
   */
  description: string;
  editMode: 0 | 1 | 2;
  editor: string; //合作者id
  id: number; //项目id
  name: string; //项目名称
  owner: string; //创建者id
  parentId: number;
  deleted: number;
  teamId: string;
  teamName: string;
  editorName: string;
  templateId: number;
  status: ProjectStatus;
  /**
   * 项目类型：`0` 作品项目；`1` 模板项目；`2` 作品版本；`3` 模板版本
   */
  /**
   * 0为普通项目，1为直玩项目，直玩项目已废弃 2为轻互动 3为直出互动 4为互动视频
   */
  typeOfPlay: number;
  updatedAt: string; //更新时间
  createdAt: string; //创建时间
  userName: string;
  children?: IProjectFromServer[];
  newest?: boolean;
}

export enum ProjectStatus {
  Editing = 10, // 草稿(编辑中)

  // 模板状态 template status
  Approving = 20, // 审核中
  Approved = 30, // 已通过/已上架
  Rejected = 40, // 已审核
  Removed = 50, // 已下架

  // 项目状态 project status
  Archive = 110, // 归档(已归档)
  Product = 120, // 作品(已完成)

  // 案例状态 example status
  ExampleApproving = 220, // 审核中
  ExampleApproved = 230, // 已通过/已上架
  ExampleRejected = 240, // 已审核
  ExampleRemoved = 250, // 已下架
}

export interface IMyProjectParams extends IPageParams {
  id: string;
  tab: string;
  match: number;
  userId: string;
  teamId: string;
  keyword: string;
  endDate: string;
  category: string;
  parentId: string;
  industry: string;
  typeOfPlay: string;
  templateId: string;
  startDate: string;
}
