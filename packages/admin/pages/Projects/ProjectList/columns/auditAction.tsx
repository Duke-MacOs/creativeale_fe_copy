import { http } from '@shared/api';
import { Popconfirm, Space, Typography } from 'antd';
import { ProjectStatus } from '../api';
import type { GetProjectColumn } from '.';
import { matcher } from '../matcher';
import { collectEventTableAction } from '@main/collectEvent';

const { Editing } = ProjectStatus;

export const auditAction: (
  title: string,
  _: Record<'Approving' | 'Approved' | 'Rejected' | 'Removed', ProjectStatus>
) => GetProjectColumn =
  (title, { Approving, Approved, Rejected, Removed }) =>
  ({ match, onRemoveProject, onGotoProject }) => ({
    title,
    width: '10%',
    // ellipsis: true,
    key: 'auditAction',
    render(_, { id, status, teamId, editor }) {
      const getButton = (action: string, status: ProjectStatus) => {
        return <Typography.Link onClick={() => handleClick(action, status)}>{action}</Typography.Link>;
      };

      const getActions = () => {
        switch (status) {
          case Approving:
            if (matcher(({ MenuSuper }) => MenuSuper)(match)) {
              return (
                <>
                  {getButton('通过', Approved)}
                  {getButton('拒绝', Rejected)}
                </>
              );
            }
            return getButton('撤回', Editing);
          case Approved:
            return (
              <Popconfirm
                onConfirm={() => handleClick('下架', Removed)}
                title="确定下架吗？"
                onCancel={() => {
                  collectEventTableAction(`下架${title}`)('cancel');
                }}
              >
                <Typography.Link>下架</Typography.Link>
              </Popconfirm>
            );
          case Rejected:
          case Removed:
            if (matcher(({ MenuSuper }) => MenuSuper)(match)) {
              return <>{getButton('重新审核', Approving)}</>;
            }
            return getButton('重新送审', Approving);
        }
      };

      return <Space>{getActions()}</Space>;

      async function handleClick(action: string, status: ProjectStatus) {
        const collect = collectEventTableAction(`${action}${title}`);
        onRemoveProject(`正在${action}${title}`, async () => {
          try {
            await http.post('project/transition', {
              userId: editor,
              teamId,
              status,
              id,
            });
            collect('okay');
            onGotoProject(`${action}${title}成功`, (routes, project) => {
              if (status === Editing) {
                return project.pathOf({ tab: 'draft', id: String(id), page: 1 });
              }
              return routes
                .find(({ path }) => path.some(path => location.pathname.includes(path)))!
                .pathOf({ tab: String(status), id: String(id), page: 1 });
            });
          } catch (error) {
            collect('error');
            throw error;
          }
          return id;
        });
      }
    },
  });
