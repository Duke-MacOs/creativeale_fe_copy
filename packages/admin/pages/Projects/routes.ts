import withPath from '../../routes/withPath';
import { MatchStatus, matchFor } from './ProjectList/matcher';
import { IMyProjectParams, ProjectStatus } from './ProjectList/api';
import { IUserInfo } from '@shared/types';
import { lazy } from 'react';

const { MenuMy, MenuAdmin, MenuSuper, MenuPub, TypeProject, TypeTemplate, TypeExample } = MatchStatus;

const projectParams: IMyProjectParams = {
  id: '',
  tab: '',
  page: 1,
  pageSize: 20,
  keyword: '',
  startDate: '',
  category: '',
  endDate: '',
  industry: '',
  parentId: '',
  templateId: '',
  typeOfPlay: '',
  match: 0,
  teamId: '',
  userId: '',
};

const getTeamOrUserId = ({ teamId, userId, teams }: IUserInfo) => {
  if (teams.find(({ id }) => id === teamId)?.type === 0) {
    return { userId };
  }
  return { teamId };
};

export const ProjectRoutes = [
  (_: IUserInfo) => {
    return withPath(
      lazy(() => import('./TemplateShop')),
      '使用模板',
      '/pub/template',
      {
        ...projectParams,
        tab: String(ProjectStatus.Approved),
        pageSize: 18,
        typeOfPlay: '0',
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '我的项目',
      '/my/project',
      {
        ...projectParams,
        match: MenuMy + TypeProject + matchFor(userInfo),
        teamId: userInfo.teamId,
        userId: userInfo.userId,
        tab: 'draft',
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '项目管理',
      '/admin/project',
      {
        ...projectParams,
        match: MenuAdmin + TypeProject + matchFor(userInfo),
        ...getTeamOrUserId(userInfo),
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '项目管理',
      '/super/project',
      {
        ...projectParams,
        match: MenuSuper + TypeProject + matchFor(userInfo),
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '我的模板',
      '/my/template',
      {
        ...projectParams,
        tab: String(ProjectStatus.Approving),
        match: MenuMy + TypeTemplate + matchFor(userInfo),
        teamId: userInfo.teamId,
        userId: userInfo.userId,
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '模板管理',
      '/admin/template',
      {
        ...projectParams,
        tab: String(ProjectStatus.Approving),
        match: MenuAdmin + TypeTemplate + matchFor(userInfo),
        ...getTeamOrUserId(userInfo),
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '模板管理',
      '/super/template',
      {
        ...projectParams,
        tab: String(ProjectStatus.Approving),
        match: MenuSuper + TypeTemplate + matchFor(userInfo),
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '我的案例',
      '/my/example',
      {
        ...projectParams,
        tab: String(ProjectStatus.ExampleApproving),
        match: MenuMy + TypeExample + matchFor(userInfo),
        teamId: userInfo.teamId,
        userId: userInfo.userId,
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '案例管理',
      '/admin/example',
      {
        ...projectParams,
        tab: String(ProjectStatus.ExampleApproving),
        match: MenuAdmin + TypeExample + matchFor(userInfo),
        ...getTeamOrUserId(userInfo),
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '案例管理',
      '/super/example',
      {
        ...projectParams,
        tab: String(ProjectStatus.ExampleApproving),
        match: MenuSuper + TypeExample + matchFor(userInfo),
      }
    );
  },
  (userInfo: IUserInfo) => {
    return withPath(
      lazy(() => import('./ProjectList')),
      '参考案例',
      '/pub/example',
      {
        ...projectParams,
        tab: String(ProjectStatus.ExampleApproved),
        match: MenuPub + TypeExample + matchFor(userInfo),
      }
    );
  },
];
