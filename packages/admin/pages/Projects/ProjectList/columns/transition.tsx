import { collectEventTableAction } from '@main/collectEvent';
import { userHasFeature } from '@shared/userInfo';
import { ProjectModal } from './ProjectModal';
import { ProjectStatus } from '../api';
import { Space, Typography } from 'antd';
import { http } from '@shared/api';
import type { GetProjectColumn } from '.';

const { Editing, Archive, Product, Approving, ExampleApproving } = ProjectStatus;

export const transition: GetProjectColumn = ({
  userInfo,
  onRemoveProject,
  renderReactNode,
  onUpdateProject,
  onQueryProject,
  onGotoProject,
}) => ({
  title: '流转为',
  width: '25%',
  ellipsis: true,
  key: 'transition',
  render(_, { id, name, status: _status, description, cover, teamId, editor, industry }) {
    return (
      <Space>
        {(
          [
            { always: false, status: Editing, text: '草稿', tab: 'draft' },
            { always: false, status: Archive, text: '归档', tab: 'archive' },
            { always: false, status: Product, text: '作品', tab: 'product' },
            { always: true, status: Approving, text: '模板', tab: '/my/template' },
            userHasFeature(userInfo, '<publish_example>') && {
              always: true,
              status: ExampleApproving,
              text: '案例',
              tab: '/my/example',
            },
          ].filter(Boolean) as {
            always: boolean;
            status: ProjectStatus;
            text: string;
            tab: string;
          }[]
        ).map(
          ({ always, status, text, tab }) =>
            (always || status !== _status) && (
              <Typography.Link
                key={status}
                onClick={async () => {
                  const collect = collectEventTableAction(`流转到${text}`);
                  const transition = () =>
                    onRemoveProject(`正在流转到${text}`, async () => {
                      await http.post('project/transition', { teamId, userId: editor, id, status });
                      onGotoProject(`成功流转到${text}`, routes => {
                        if (!tab.startsWith('/my')) {
                          onQueryProject({ id: String(id), tab, page: 1 });
                        } else {
                          return routes
                            .find(({ path }) => path.includes(tab))!
                            .pathOf({ id: String(id), tab: String(status), page: 1 });
                        }
                      });
                      return id;
                    });
                  const updateInfo = (label: string, title: string) => {
                    return new Promise<boolean>((resolve, reject) => {
                      renderReactNode(
                        <ProjectModal
                          label={label}
                          title={title}
                          data={{ name, description, cover, industry }}
                          required={{ cover: true, name: true }}
                          onCancel={() => {
                            renderReactNode(null);
                            collect('cancel');
                            resolve(false);
                          }}
                          onFinish={async partial => {
                            try {
                              renderReactNode(null);
                              if (Object.keys(partial).length) {
                                await onUpdateProject(`正在${title}`, async () => {
                                  await http.post('project/update', { id, userId: editor, ...partial });
                                  return { id, ...partial };
                                });
                              }
                              resolve(true);
                            } catch (error) {
                              reject(error);
                            }
                          }}
                        />
                      );
                    });
                  };
                  try {
                    if (
                      status === Approving
                        ? await updateInfo('模板', '设置模板信息')
                        : status === ExampleApproving
                        ? await updateInfo('案例', '设置案例信息')
                        : true
                    ) {
                      await transition();
                      collect('okay');
                    }
                  } catch {
                    collect('error');
                  }
                }}
              >
                {text}
              </Typography.Link>
            )
        )}
      </Space>
    );
  },
});
