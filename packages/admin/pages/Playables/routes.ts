import { lazy } from 'react';
import { IPutParams } from '.';
import withPath from '../../routes/withPath';
import { IUserInfo } from '@shared/types';

export const PlayableRoutes = [
  (_: IUserInfo) => {
    return withPath<IPutParams>(
      lazy(() => import('.')),
      '我的素材',
      '/my/playable',
      {
        page: 1,
        pageSize: 20,
        projectId: '',
        projectUserId: '',
        userId: '',
        teamId: '',
        exportType: '',
        status: 'packing',
        pageType: 'my',
        startDate: '',
        endDate: '',
      }
    );
  },
  (_: IUserInfo) => {
    return withPath<IPutParams>(
      lazy(() => import('.')),
      '素材管理',
      '/admin/playable',
      {
        page: 1,
        pageSize: 20,
        projectId: '',
        projectUserId: '',
        userId: '',
        teamId: '',
        exportType: '',
        status: 'packing',
        pageType: 'admin',
        startDate: '',
        endDate: '',
      }
    );
  },
  (_: IUserInfo) => {
    return withPath<IPutParams>(
      lazy(() => import('.')),
      '素材管理',
      '/super/playable',
      {
        page: 1,
        pageSize: 20,
        projectId: '',
        projectUserId: '',
        userId: '',
        teamId: '',
        exportType: '',
        status: 'packing',
        pageType: 'super',
        startDate: '',
        endDate: '',
      }
    );
  },
];
