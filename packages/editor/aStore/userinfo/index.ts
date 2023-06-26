import { IUserInfo } from '@/types';

const USER_INFO = Symbol('UserInfo');

export const updateUserInfo = (userinfo: IUserInfo) => ({ type: USER_INFO, userinfo });

export default (state: IUserInfo | null = null, action: ReturnType<typeof updateUserInfo>): IUserInfo | null => {
  if (action.type === USER_INFO) {
    return action.userinfo;
  }
  return state;
};
