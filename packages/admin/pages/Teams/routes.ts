import { lazy } from 'react';
import withPath from '../../routes/withPath';
import { IUserInfo } from '@shared/types';
import { MatchStatus } from '../Projects/ProjectList/matcher';
import { ITeamParams } from './TeamList';

const defaultParams = {
  page: 1,
  pageSize: 20,
  keyword: '',
  feature: '',
  userId: '',
  teamId: '',
  type: '',
};

export const TeamRoutes = [
  (_: IUserInfo) => {
    return withPath<ITeamParams>(
      lazy(() => import('./TeamList')),
      '团队管理',
      '/admin/team',
      {
        ...defaultParams,
        match: MatchStatus.MenuAdmin,
      }
    );
  },
  (_: IUserInfo) => {
    return withPath<ITeamParams>(
      lazy(() => import('./TeamList')),
      '团队管理',
      '/super/team',
      {
        ...defaultParams,
        match: MatchStatus.MenuSuper,
      }
    );
  },
];
