import { lazy } from 'react';
import withPath from '../../routes/withPath';
import { IUserInfo } from '@shared/types';

export const DashboardRoutes = [
  (_: IUserInfo) => {
    return withPath<Record<string, never>>(
      lazy(() => import('./TeamBoard')),
      '投放数据',
      '/admin/dashboard',
      {}
    );
  },
  (_: IUserInfo) => {
    return withPath<Record<string, never>>(
      lazy(() => import('./AdminDataBoard')),
      '投放数据',
      '/super/dashboard',
      {}
    );
  },
  (_: IUserInfo) => {
    return withPath<Record<string, never>>(
      lazy(() => import('./AdminBoard')),
      '数据看板',
      '/super/monitor',
      {}
    );
  },
];
