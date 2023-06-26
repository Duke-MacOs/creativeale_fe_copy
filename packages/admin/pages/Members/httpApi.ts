import { IAdminUserParams } from '@main/pages/Members';
import { http } from '../../../shared/api/axios';
import { PaginationList } from '../../../shared/api/projectApi/types';
import { IUser } from '@shared/types/authority';
export interface ITeam {
  id: string;
  name: string;
  deleted: number;
  description: string;
  features: string;
  logo: string;
  owner: string;
  subject: string;
  type: 0 | 1 | 2 | 3 | 4;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
  advId: string;
  roles: number;
}

export interface ITeamUser {
  userId: string;
  teamId: string;
  roles: number;
  updatedAt: string;
  createdAt: string;
  userInfo: IUser;
  deleted: number;
}
class AdminUserService {
  // 获取团队成员列表
  async fetchTeamMember(params: IAdminUserParams): Promise<PaginationList<ITeamUser>> {
    const { data } = await http.get(`team/listMember`, { params });
    const {
      data: { list, ...pagination },
    } = data;
    return { list, pagination };
  }

  // 新增团队成员
  async addTeamMember({ userId, roles }: { userId: string; roles: number }): Promise<any> {
    const { data } = await http.post('team/addMember', { userId, roles });
    return data.data;
  }

  async joinTeam(key: string) {
    const { data } = await http.get('team/accept', { params: { key } });
    return data.data;
  }
}

export const adminUserService = new AdminUserService();
