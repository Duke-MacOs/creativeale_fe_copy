import { PaginationList } from '@shared/api/projectApi/types';
import { IMyProjectParams, IProjectFromServer, ProjectStatus } from './types';
import { MatchStatus } from '../matcher';
import { http } from '@shared/api';

const { MenuMy, MenuAdmin, MenuSuper } = MatchStatus;

export const listProjectByParams = async ({
  tab,
  match,
  ...params
}: IMyProjectParams): Promise<PaginationList<IProjectFromServer> & { isVersion: boolean }> => {
  return listProject({ ...params, ...getParamsFromTab(tab, match) });
};

export const listProject = async (
  params: Partial<Omit<IMyProjectParams, 'tab' | 'match'> & { status: string | ProjectStatus; borrowed: number }>
): Promise<PaginationList<IProjectFromServer> & { isVersion: boolean }> => {
  const {
    data: {
      data: { list, isVersion, ...pagination },
    },
  } = await http.get('project/list', { params });
  return { list, pagination, isVersion };
};

const getParamsFromTab = (tab: string, match: number) => {
  switch (tab) {
    case 'draft':
      return { status: ProjectStatus.Editing };
    case 'deleted':
      for (const [deleted, flag] of [MenuMy, MenuAdmin, MenuSuper].entries()) {
        if (match & flag) {
          return { deleted: deleted + 1 };
        }
      }
      return {};
    case 'archive':
      return { status: ProjectStatus.Archive };
    case 'product':
      return { status: ProjectStatus.Product };
    case 'borrowed':
      return { borrowed: 1 };
    default:
      const status = Number(tab);
      if (status in ProjectStatus) {
        return { status: tab };
      }
      return {};
  }
};
