import { collectEventTableAction } from '@main/collectEvent';
import { message, Popconfirm, Space, Typography } from 'antd';
import { GetTeamColumn } from '.';
import { http } from '@shared/api';
import TeamModal from '../views/TeamModal';
import { matcher } from '@main/pages/Projects/ProjectList/matcher';
import FeaturesModal from '../views/FeaturesModal';

export const teamActionColumn: GetTeamColumn = ({ match, userInfo, setUserInfo, setReactNode, refetch }) => ({
  title: '操作',
  key: 'action',
  width: '15%',
  render: (_, record) => {
    const collect = collectEventTableAction('退出团队');
    const { id, type, owner, roles } = record;
    return (
      <Space>
        {matcher(({ MenuAdmin }) => MenuAdmin)(match) ? (
          <>
            <Popconfirm
              title="确定要离开团队吗?"
              onConfirm={async () => {
                try {
                  await http.post('team/quitMember', { teamId: id, userId: userInfo.userId });
                  message.success('退出团队成功');
                  collect('okay');
                  location.reload();
                } catch (error) {
                  message.error(error.message);
                  collect('error');
                }
              }}
              okText="确定"
              cancelText="取消"
              onCancel={() => {
                collect('cancel');
              }}
            >
              <Typography.Link disabled={type === 0 || owner === userInfo.userId}>退出</Typography.Link>
            </Popconfirm>
            <Typography.Link
              disabled={type === 0 || !(roles & 0b10)}
              onClick={() => {
                setReactNode(
                  <TeamModal
                    onCancel={() => setReactNode(null)}
                    title="修改团队信息"
                    initValues={record}
                    onFinish={async data => {
                      await http.post('team/update', { teamId: record.id, ...data });
                      refetch();
                    }}
                  />
                );
              }}
            >
              修改
            </Typography.Link>
          </>
        ) : (
          <>
            <Typography.Link
              onClick={() => {
                setUserInfo(({ teams, teamId }) => {
                  if (teamId === record.id) {
                    return {};
                  }
                  if (teams.some(({ id }) => id === record.id)) {
                    return { teamId: record.id };
                  }
                  return { teamId: record.id, teams: [{ ...record, fake: true }, ...teams] };
                });
              }}
            >
              进入
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                setReactNode(
                  <FeaturesModal
                    onCancel={() => setReactNode(null)}
                    features={record.features}
                    onFinish={async features => {
                      await http.post('team/update', { teamId: record.id, features });
                      setUserInfo(({ teams }) => ({
                        teams: teams.map(team => (team.id === record.id ? { ...team, features } : team)),
                      }));
                      refetch();
                    }}
                  />
                );
              }}
            >
              开白
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                setReactNode(
                  <TeamModal
                    onCancel={() => setReactNode(null)}
                    title="修改团队信息"
                    initValues={record}
                    onFinish={async data => {
                      await http.post('team/update', { teamId: record.id, ...data });
                      setUserInfo(({ teams }) => ({
                        teams: teams.map(team => (team.id === record.id ? { ...team, ...data } : team)),
                      }));
                      refetch();
                    }}
                  />
                );
              }}
            >
              修改
            </Typography.Link>
          </>
        )}
      </Space>
    );
  },
});
