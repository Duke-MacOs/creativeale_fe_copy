import { lazy } from 'react';
import { ITeamResourceParams } from './TeamResource';
import withPath from '../../routes/withPath';
import { IUserInfo } from '@shared/types';

export const ResourceRoutes = [
  ({ teamId }: IUserInfo) => {
    return withPath<ITeamResourceParams>(
      lazy(() => import('./TeamResource')),
      '资源管理',
      '/admin/resource',
      {
        page: 1,
        pageSize: 20,
        keyword: '',
        teamId,
        types: '',
        categoryId: '1',
      }
    );
  },
  (_: IUserInfo) => {
    return withPath(
      lazy(() => import('./AdminResource')),
      '资源管理',
      '/super/resource',
      {}
    );
  },
];
