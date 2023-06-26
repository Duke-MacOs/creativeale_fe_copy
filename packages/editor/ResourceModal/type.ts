import { ICategory, IMaterial } from '@shared/types/library';
import { IStoreMaterial } from '@shared/types/store';
import { rest } from 'lodash';

export enum SidebarType {
  Store = 100,
  Team = 101,
  AI = 102,
}

export enum Dimension {
  D2,
  D3,
}

export enum MessageType {
  Info,
  Error,
}

export enum ResourceTypeInModal {
  Component2D = 4,
  Image = 5,
  Video = 6,
  Audio = 8,
  Effect = 99,
  Particle2D = 13,
  Lottie = 12,
  DragonBones = 23,
  ImageSequence = 18,
  Spine = 24,
  Live2d = 30,
  Text = 29,
  Shape = 7,
  Component3D = 32,
  Model = 27,
  Particle = 14,
  Cubemap = 31,
}

export enum ResourceTypeApi {}

export interface IRequestState {
  loading: ResourceTypeInModal | undefined;
  searchKey: string;
}

export interface IModalState {
  keyword: string;
  categoryId: string;
  sidebarType: SidebarType;
  dimension: Dimension; // 当前维度 2D or 3D
  resourceType: ResourceTypeInModal; // 当前选择的资源类型
  previewId: number; // 预览的资源 id
  // 选中的资源
  selectedItems: {
    id: number;
    previewUrl: string;
  }[];
  page: number;
  total: number;
}

export type IData = IStoreMaterial | (IMaterial & { id: string });

export interface IMessage {
  msg: string;
  type: MessageType;
}

export interface IState {
  data: IData[];
  detail: IData | undefined;
  categories: {
    store: ICategory[];
    team: ICategory[];
  };
  selectedList: IData[];
  modalState: IModalState;
}

export enum ImportStatus {
  rest,
  handing,
  finish,
}
export interface IImportState {
  status: ImportStatus;
  percent: number;
  desc: string;
  error: string[];
  finish: number;
  total: number;
}

export interface IAIData {
  file: File;
  url: string;
}
