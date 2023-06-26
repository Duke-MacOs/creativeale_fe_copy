// 获取函数类型的第一个参数类型
export type FirstParam<T> = T extends (...arg: infer P) => any ? P[0] : never;

// 数据获取状态枚举类型
export type FetchStatus = 'pending' | 'success' | 'fail';
export type VisibleStatus = 'default' | 'fail' | 'empty';

// 获取返回值为 Promise 对象的函数的 Promise 的结果类型
export type PromiseReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : any;

export type IOrder = 'DESC' | 'ASC';

export interface IPlayer {
  id: number;
  name: string;
  url: string;
}

export interface IPlayers {
  [playerName: string]: IPlayer[];
}

export type UserPermission =
  | 'projectSwap'
  | 'customScript'
  | 'imbot'
  | 'publishComponent'
  | 'exportProject'
  | 'DragonBones'
  | 'publishScenes'
  | 'Spine'
  | 'Live2d'
  | 'importFromAe'
  | 'importFromFigma';

export interface IUserInfo {
  avatar: string; //avatar
  email: string;
  name: string; //userName
  userId: string; //userId
  permissions: UserPermission[];
  customerInfo?: {
    customerId?: string;
  };
  hasDirectPlayable?: boolean;
  teamId: string;
  roles: string[];
  teams: Array<ITeamInfo>;
  teamRoles: number;
}
export interface ITeamInfo {
  id: string;
  name: string;
  description: string;
  fake?: boolean;
  subject: string;
  logo: string;
  advId: string;
  type: 0 | 1 | 2 | 3 | 4;
  features: string;
}
