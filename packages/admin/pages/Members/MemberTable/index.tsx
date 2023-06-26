import { adminUserService, ITeamUser } from '@main/pages/Members/httpApi';
import { useParamsQuery } from '@main/hooks/useParamsQuery';
import { usePageParams } from '@main/routes/withPath';
import { withLoading } from '@main/table';
import { QUERY_KEY } from '@main/table/constants';
import { usePagination } from '@main/table/project';
import { Avatar, Button, message, Space, Table, Typography } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import React, { useState } from 'react';
import InviteMemberModal from './InviteMemberModal';
import EditMemberModal from './EditMemberModal';
import { TabsContainer } from '@main/pages/views';
import { IAdminUserParams } from '..';
import style from './style';
import { http } from '@shared/api';
import { collectEventTableAction } from '@main/collectEvent';
import { useUserInfo } from '@shared/userInfo';

export enum RolesMap {
  '普通成员' = 1,
  '管理员' = 3,
}
export default withLoading(function ({ loading }) {
  const [reactNode, setReactNode] = useState<React.ReactNode>(null);
  const { params, onParamsChange } = usePageParams<IAdminUserParams>();
  const { userInfo, updateUserInfo } = useUserInfo();
  const { list, total, refetch } = useParamsQuery(
    [QUERY_KEY.ADMIN_USER, params],
    adminUserService.fetchTeamMember,
    params
  );

  //项目列表项
  const userColumns: (ColumnProps<ITeamUser> | false)[] = [
    ...USER_COLUMNS,
    {
      title: '成员ID',
      dataIndex: 'userId',
      key: 'userId',
      width: '15%',
      ellipsis: true,
      render: (id: number) => <div style={{ padding: '6px', background: 'none', userSelect: 'text' }}>{id}</div>,
    },
    (userInfo.teamRoles & 0b10) > 0 && {
      title: '操作',
      dataIndex: 'actions',
      key: 'operator',
      width: '15%',
      render: (_, { teamId, userId, roles, deleted }: ITeamUser) => {
        return (
          <Space>
            {deleted ? (
              <Typography.Link
                onClick={async () => {
                  const collect = collectEventTableAction('还原成员');
                  try {
                    await http.post('team/updateMember', { teamId, userId, deleted: 0 });
                    message.success('还原成员成功');
                    collect('okay');
                    refetch();
                  } catch (error) {
                    message.error(error.message);
                    collect('error');
                  }
                }}
              >
                还原成员
              </Typography.Link>
            ) : (
              <Typography.Link
                onClick={async () => {
                  setReactNode(
                    <EditMemberModal
                      roles={roles}
                      onCancel={() => {
                        setReactNode(null);
                      }}
                      onFinish={async ({ roles }) => {
                        await http.post('team/updateMember', { teamId, userId, roles });
                        refetch();
                      }}
                    />
                  );
                }}
              >
                修改角色
              </Typography.Link>
            )}

            <Typography.Link
              disabled={userId === userInfo.userId}
              onClick={async () => {
                const collect = collectEventTableAction('删除成员');
                try {
                  await http.post('team/updateMember', { teamId, userId, deleted: deleted + 1 });
                  message.success('删除成功');
                  collect('okay');
                  if (String(userId) === userInfo.userId) {
                    updateUserInfo(userInfo.teams.find(({ type }) => type === 0)!.id);
                  } else {
                    refetch();
                  }
                } catch (error) {
                  message.error(error.message);
                  collect('error');
                }
              }}
            >
              删除成员
            </Typography.Link>
          </Space>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      ellipsis: true,
      render: (createdAt: string) => (
        <div style={{ padding: '6px', background: 'none', userSelect: 'text' }}>{createdAt}</div>
      ),
    },
  ];
  return (
    <TabsContainer
      value={params.deleted}
      onChange={deleted => onParamsChange({ deleted })}
      options={[
        { name: '现有的', value: '0' },
        { name: '已删除', value: '1' },
      ]}
      extra={
        (userInfo.teamRoles & 0b10) > 0 && (
          <Button
            type="primary"
            onClick={() => {
              setReactNode(
                <InviteMemberModal
                  onCancel={() => {
                    setReactNode(null);
                  }}
                />
              );
            }}
          >
            新增成员
          </Button>
        )
      }
    >
      <Table
        rowKey="userId"
        columns={userColumns.filter(Boolean) as any}
        dataSource={list}
        className={style.table}
        pagination={usePagination(total)}
        loading={loading}
      />
      {reactNode}
    </TabsContainer>
  );
});

export const MemberTable = withLoading<{ value: string; excludedValue: string; onChange: (userId: string) => void }>(
  ({ value, loading, excludedValue, onChange }) => {
    const { params } = usePageParams<IAdminUserParams>();
    const { list, total } = useParamsQuery(
      [QUERY_KEY.ADMIN_USER, params],
      adminUserService.fetchTeamMember,
      params as any
    );

    return (
      <Table
        size="small"
        rowKey="userId"
        dataSource={list.filter(user => user.userId !== excludedValue)}
        showHeader={false}
        columns={USER_COLUMNS}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: [value],
          onChange([value]) {
            onChange(value as string);
          },
        }}
        onRow={({ userId }) => ({ onClick: () => onChange(userId) })}
        pagination={usePagination(total - 1)}
        loading={loading}
      />
    );
  }
);

//项目列表项
const USER_COLUMNS: ColumnProps<ITeamUser>[] = [
  {
    title: '头像',
    dataIndex: 'userInfo',
    key: 'avatarUrl',
    ellipsis: true,
    render: (_, { userInfo }) => <Avatar size="large" src={userInfo?.avatarUrl} />,
  },
  {
    title: '姓名',
    dataIndex: 'userInfo',
    key: 'name',
    ellipsis: true,
    render: (_, { userInfo }) => {
      return (
        <div style={{ padding: '6px', background: 'none', userSelect: 'text', cursor: 'pointer' }}>
          {userInfo?.name}
        </div>
      );
    },
  },
  {
    title: '角色',
    dataIndex: 'roles',
    key: 'roles',
    ellipsis: true,
    render: (roles: number) => (
      <div style={{ display: 'flex', flexDirection: 'column', padding: '6px', background: 'none', userSelect: 'text' }}>
        {RolesMap[roles]}
      </div>
    ),
  },
];
