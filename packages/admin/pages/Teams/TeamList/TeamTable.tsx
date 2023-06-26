import { ITeam } from '@main/pages/Members/httpApi';
import { useParamsQuery } from '@main/hooks/useParamsQuery';
import { usePageParams } from '@main/routes/withPath';
import { withLoading } from '@main/table';
import { usePagination } from '@main/table/project';
import { Button, Table } from 'antd';
import { TabsContainer } from '@main/pages/views';
import { http } from '@shared/api';
import { ITeamParams } from '.';
import { useState } from 'react';
import { PaginationList } from '@shared/api/projectApi/types';
import TeamModal from './views/TeamModal';
import { useUserInfo } from '@shared/userInfo';
import { getTeamColumns, Mutation } from './columns';
import { matcher } from '../../Projects/ProjectList/matcher';

export enum TeamType {
  // 0 个人，1 管理，2 服务商，3 广告主，4 代理商
  '个人版' = 0,
  '管理员' = 1,
  '服务商' = 2,
  '广告主' = 3,
  '代理商' = 4,
}

const getFetchTeams =
  (path: string) =>
  async (params: ITeamParams): Promise<PaginationList<ITeam>> => {
    const {
      data: {
        data: { list, ...pagination },
      },
    } = await http.get(path, { params });
    return { list, pagination };
  };

export default withLoading(function ({ loading }) {
  const { userInfo, setUserInfo, updateUserInfo } = useUserInfo();
  const [reactNode, setReactNode] = useState<React.ReactNode>(null);
  const { params, onParamsChange } = usePageParams<ITeamParams>();

  const fetchTeams = getFetchTeams(
    matcher(({ MenuAdmin }) => MenuAdmin)(params.match) ? 'team/listMyTeam' : 'team/list'
  );
  const { list, total, refetch } = useParamsQuery([fetchTeams, params], fetchTeams, params);

  const mutation = { ...params, userInfo, setUserInfo, setReactNode, refetch, onParamsChange } as Mutation;

  return (
    <TabsContainer
      {...(matcher(({ MenuAdmin }) => MenuAdmin)(params.match)
        ? {}
        : {
            value: params.type,
            options: [{ name: '全部', value: '' }, ...TEAM_TABS],
            onChange: tab => {
              onParamsChange({ type: tab, page: 1 });
            },
          })}
      extra={
        <Button
          type="primary"
          onClick={() => {
            setReactNode(
              <TeamModal
                title="新建团队"
                onCancel={() => setReactNode(null)}
                onFinish={async data => {
                  const {
                    data: {
                      data: { id },
                    },
                  } = await http.post('team/create', data);
                  updateUserInfo(id);
                }}
              />
            );
          }}
        >
          新建团队
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={getTeamColumns(
          ({
            logoColumn,
            nameColumn,
            typeColumn,
            ownerColumn,
            featuresColumn,
            createAtColumn,
            rolesColumn,
            teamActionColumn,
          }) => {
            return [
              logoColumn(mutation),
              nameColumn(mutation),
              typeColumn(mutation),
              ownerColumn(mutation),
              matcher(({ MenuAdmin }) => MenuAdmin)(params.match) && rolesColumn(mutation),
              featuresColumn(mutation),
              teamActionColumn(mutation),
              createAtColumn(mutation),
            ];
          }
        )}
        dataSource={list}
        pagination={usePagination(total)}
        loading={loading}
      />
      {reactNode}
    </TabsContainer>
  );
});

export const TEAM_TABS = [
  {
    name: '个人版',
    value: '0',
  },
  {
    name: '管理员',
    value: '1',
  },
  {
    name: '服务商',
    value: '2',
  },
  {
    name: '广告主',
    value: '3',
  },
  {
    name: '代理商',
    value: '4',
  },
];
