import { IUserInfo } from '@/types';
import { http } from './axios';

export async function getUserInfo(): Promise<IUserInfo> {
  const {
    data: { data },
  } = await http.get('user/info');
  // 不同测试环境下字段定义不同,返回时需要做兼容处理
  return {
    ...data,
    name: data.name || data.userName,
    avatar: data.avatarUrl || data.avatar,
    userId: data.staffId || data.userId,
  };
}
