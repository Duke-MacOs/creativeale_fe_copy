import { DashboardRoutes } from '@main/pages/Dashboard/routes';
import { ResourceRoutes } from '@main/pages/Resources/routes';
import { useUserInfo, userHasFeature } from '@shared/userInfo';
import { MemberRoutes } from '@main/pages/Members/routes';
import { ProjectRoutes } from '../pages/Projects/routes';
import { TeamRoutes } from '@main/pages/Teams/routes';
import type { IUserInfo } from '@shared/types';
import create from 'zustand';
import { PlayableRoutes } from '@main/pages/Playables/routes';

export const ROUTES = [
  ...ProjectRoutes,
  ...ResourceRoutes,
  ...PlayableRoutes,
  ...TeamRoutes,
  ...MemberRoutes,
  ...DashboardRoutes,
];

export const useRoutes = create<{ routes: ReturnType<(typeof ROUTES)[number]>[] }>(set => {
  let prevUserInfo: Partial<IUserInfo> = {};
  const setRoutes = (userInfo: IUserInfo) => {
    if ((['teamId', 'teams', 'teamRoles'] as const).some(key => userInfo[key] !== prevUserInfo[key])) {
      prevUserInfo = userInfo;
    } else {
      return;
    }
    console.log('userInfo:', userInfo);
    const { type, advId, fake } = userInfo.teams.find(({ id }) => id === userInfo.teamId)!;
    set({
      routes: ROUTES.map(route => route(userInfo)).filter(({ path: [path] }) => {
        if (process.env.NODE_ENV === 'development') {
          return true;
        }
        if (fake && path.startsWith('/my')) {
          return false;
        }
        if (path.startsWith('/admin/member')) {
          return type !== 0;
        }
        if (path.startsWith('/admin/team')) {
          return type === 0;
        }
        if (path.startsWith('/super/')) {
          return userInfo.teams.some(({ type }) => type === 1);
        }
        if (path === '/admin/dashboard') {
          return /* advId && Number(advId) > 0 &&  */ userHasFeature(userInfo, '<dashboard>');
        }
        // 我的案例、案例管理、参考案例
        if (path.endsWith('/example')) {
          return userHasFeature(userInfo, '<publish_example>');
        }
        return true;
      }),
    });
  };
  useUserInfo.subscribe(() => {
    const { userInfo } = useUserInfo.getState();
    if (userInfo) {
      setRoutes(userInfo);
    }
  });
  return { routes: [] };
});
