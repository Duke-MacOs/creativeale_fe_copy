import { lazy } from 'react';
import { IAdminUserParams } from '.';
import withPath from '../../routes/withPath';
import { IUserInfo } from '@shared/types';

export const MemberRoutes = [
  ({ teamId }: IUserInfo) => {
    return withPath<IAdminUserParams>(
      lazy(() => import('.')),
      '成员管理',
      '/admin/member',
      {
        page: 1,
        pageSize: 20,
        keyword: '',
        deleted: '0',
        userId: '',
        roles: '',
        teamId,
      }
    );
  },
];
