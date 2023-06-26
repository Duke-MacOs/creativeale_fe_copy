import { ITeam } from '@main/pages/Members/httpApi';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { logoColumn } from './logo';
import { nameColumn } from './name';
import { typeColumn } from './type';
import { rolesColumn } from './roles';
import { ownerColumn } from './owner';
import { createAtColumn } from './createdAt';
import { featuresColumn } from './features';
import { teamActionColumn } from './teamAction';
import { IParamsContext } from '@main/routes/withPath';
import { useParamsQuery } from '@main/hooks/useParamsQuery';
import { PaginationList } from '@shared/api/projectApi/types';
import { ITeamParams } from '..';
import { IUserInfo } from '@shared/types';
export type GetTeamColumn = (_: Mutation) => ColumnType<ITeam>;

export type Mutation = {
  userInfo: IUserInfo;
  setUserInfo: (_: (userInfo: IUserInfo) => Partial<IUserInfo>) => void;
  setReactNode: (node: React.ReactNode) => void;
} & ITeamParams &
  Pick<IParamsContext<ITeamParams>, 'onParamsChange'> &
  Pick<ReturnType<typeof useParamsQuery<ITeamParams, PaginationList<ITeam>>>, 'refetch'>;

const columns = {
  logoColumn,
  nameColumn,
  typeColumn,
  rolesColumn,
  ownerColumn,
  createAtColumn,
  featuresColumn,
  teamActionColumn,
};

export const getTeamColumns = (
  setter: (_: typeof columns) => Array<false | '' | 0 | null | undefined | ColumnType<ITeam>>
): ColumnsType<ITeam> => {
  return setter(columns).filter(Boolean) as ColumnsType<ITeam>;
};
