import { Dropdown, Menu, message, Modal, Popconfirm, Space, Typography } from 'antd';
import { collectEventTableAction } from '@main/collectEvent';
import { TeamItem } from '@main/views/Header/Workspace';
import { copyText, getEditorUrl } from '@shared/utils';
import { editableStatus } from './nameAndId';
import { MemberModal } from './MemberModal';
import { ProjectStatus } from '../api';
import { matcher } from '../matcher';
import { http } from '@shared/api';
import type { GetProjectColumn } from '.';
import { ACCEPT_PROJECT_KEY } from '@main/views/Header/useAcceptProject';
import { userHasFeature } from '@shared/userInfo';

export const projectAction: GetProjectColumn = ({
  match,
  userInfo,
  onCreateProject,
  onRemoveProject,
  renderReactNode,
  onGotoProject,
}) => ({
  title: '操作',
  width: '15%',
  ellipsis: true,
  // align: 'center',
  key: 'projectAction',
  render(_, { id, deleted, status, editor, owner, teamId }) {
    const [item1, item2, ...items] = [
      !deleted &&
        (editableStatus({ status, teamId }, userInfo) && editor === userInfo.userId ? (
          <Typography.Link
            href={getEditorUrl({ id, mode: 'project' })}
            onClick={() => {
              collectEventTableAction('编辑项目', true)('okay');
            }}
          >
            编辑
          </Typography.Link>
        ) : (
          <Typography.Link
            href={getEditorUrl({ id, mode: 'project', readOnly: true })}
            onClick={() => {
              collectEventTableAction('查看项目', true)('okay');
            }}
          >
            查看
          </Typography.Link>
        )),
      !deleted && (
        <Typography.Link
          onClick={() => {
            onCreateProject('正在创建副本', async () => {
              const collect = collectEventTableAction('创建副本');
              try {
                const {
                  data: { data },
                } = await http.post('project/saveAs', { teamId, userId: editor, id });
                if (!data) {
                  throw new Error('复制项目失败，请稍后再试');
                }
                collect('okay');
                onGotoProject('创建副本成功', routes =>
                  routes
                    .find(({ path }) => path.includes('/my/project'))!
                    .pathOf({ tab: 'draft', id: String(data.id), page: 1 })
                );
                return data;
              } catch (error) {
                collect('error');
                throw error;
              }
            });
          }}
        >
          副本
        </Typography.Link>
      ),
      !deleted &&
        editableStatus({ status, teamId }, userInfo) &&
        matcher(({ MenuMy }) => MenuMy)(match) &&
        (matcher(({ TeamUser }) => TeamUser)(match)
          ? userInfo.teams.length > 1 && (
              <Typography.Link
                onClick={() => {
                  const collect = collectEventTableAction('转移项目');
                  renderReactNode(
                    <Modal
                      open
                      footer={null}
                      onCancel={() => {
                        collect('cancel');
                        renderReactNode(null);
                      }}
                    >
                      <Menu style={{ border: 'none', boxShadow: 'none' }}>
                        {userInfo.teams
                          .filter(({ type, fake }) => !fake && type != 0)
                          .map(({ id: newTeamId, name, logo, type }) => (
                            <Menu.Item
                              key={newTeamId}
                              id={String(newTeamId)}
                              onClick={() => {
                                renderReactNode(null);
                                onRemoveProject(`正在转移到${name}`, async () => {
                                  try {
                                    await http.post('project/transition', {
                                      id,
                                      userId: editor,
                                      teamId,
                                      newTeamId,
                                    });
                                    collect('okay');
                                    message.success(`转移到${name}成功`);
                                    return id;
                                  } catch (error) {
                                    collect('error');
                                    throw error;
                                  }
                                });
                              }}
                            >
                              <TeamItem logo={logo} type={type} name={name} />
                            </Menu.Item>
                          ))}
                      </Menu>
                    </Modal>
                  );
                }}
              >
                转移
              </Typography.Link>
            )
          : [
              editor === userInfo.userId && (
                <Typography.Link
                  onClick={() => {
                    const collect = collectEventTableAction('邀请协作');
                    renderReactNode(
                      <MemberModal
                        current={editor}
                        onCancel={() => {
                          renderReactNode(null);
                          collect('cancel');
                        }}
                        onFinish={newEditor => {
                          renderReactNode(null);
                          onRemoveProject('正在流转到协作者', async () => {
                            try {
                              await http.post('project/transition', {
                                id,
                                userId: editor,
                                teamId,
                                editor: newEditor,
                                status: ProjectStatus.Editing,
                              });
                              collect('okay');
                              onGotoProject('流转到协作者成功', (routes, project) => {
                                if (owner !== userInfo.userId) {
                                  return routes
                                    .find(({ path }) => path.includes('/admin/project'))!
                                    .pathOf({ tab: 'draft', id: String(id), page: 1 });
                                } else {
                                  return project.pathOf({ tab: 'borrowed', id: String(id), page: 1 });
                                }
                              });
                              return id;
                            } catch (error) {
                              collect('error');
                              throw error;
                            }
                          });
                        }}
                      />
                    );
                  }}
                >
                  协作
                </Typography.Link>
              ),
              (owner !== userInfo.userId || owner !== editor) && (
                <Typography.Link
                  onClick={() => {
                    onRemoveProject('正在取消协作', async () => {
                      const collect = collectEventTableAction('取消协作');
                      try {
                        await http.post('project/transition', {
                          id,
                          userId: editor,
                          teamId,
                          editor: owner,
                          status: ProjectStatus.Editing,
                        });
                        collect('okay');

                        onGotoProject('取消协作成功', (routes, project) => {
                          if (owner !== userInfo.userId) {
                            return routes
                              .find(({ path }) => path.includes('/admin/project'))!
                              .pathOf({ tab: 'draft', id: String(id), page: 1 });
                          } else {
                            return project.pathOf({ tab: 'draft', id: String(id), page: 1 });
                          }
                        });
                        return id;
                      } catch (error) {
                        collect('error');
                        throw error;
                      }
                    });
                  }}
                >
                  取消协作
                </Typography.Link>
              ),
            ]),
      userHasFeature(userInfo) &&
        !deleted &&
        editableStatus({ status, teamId }, userInfo) &&
        matcher(({ MenuMy }) => MenuMy)(match) && (
          <Typography.Link
            onClick={async () => {
              const collect = collectEventTableAction('赠送项目');
              try {
                const {
                  data: { data },
                } = await http.post('project/donateProject', { id, maxAge: 7 * 24 * 60 * 60 });
                copyText(
                  `接收他人赠送的项目，链接7天内有效：${location.origin}/pub/template?${ACCEPT_PROJECT_KEY}=${data}`
                );
                message.success('赠送链接已复制，请发送给对方进行接收');
                collect('okay');
              } catch (error) {
                collect('error');
                throw error;
              }
            }}
          >
            赠送
          </Typography.Link>
        ),
      !deleted && (
        <Typography.Link
          onClick={() => {
            onCreateProject('正在复制项目', async () => {
              const collect = collectEventTableAction('复制项目');
              try {
                const {
                  data: { data },
                } = await http.post('project/saveAs', { teamId, userId: editor, id, updateParentId: 1 });
                if (!data) {
                  throw new Error('复制项目失败，请稍后再试');
                }
                collect('okay');
                onGotoProject('复制项目成功', routes =>
                  routes
                    .find(({ path }) => path.includes('/my/project'))!
                    .pathOf({ tab: 'draft', id: String(data.id), page: 1 })
                );
                return data;
              } catch (error) {
                collect('error');
                throw error;
              }
            });
          }}
        >
          复制
        </Typography.Link>
      ),
      deleted && (
        <Typography.Link
          onClick={() => {
            onRemoveProject('正在还原项目', async () => {
              const collect = collectEventTableAction('还原项目');
              try {
                await http.post('project/transition', {
                  teamId,
                  userId: editor,
                  id,
                  deleted: 0,
                  status: ProjectStatus.Editing,
                });
                collect('okay');

                onGotoProject('还原成功', (_, project) => project.pathOf({ tab: 'draft', id: String(id), page: 1 }));
                return id;
              } catch (error) {
                collect('error');
                throw error;
              }
            });
          }}
        >
          还原
        </Typography.Link>
      ),
      editableStatus({ status, teamId }, userInfo) &&
        ((editor === owner && owner === userInfo.userId) ||
          matcher(({ RoleManager, RoleSuperManager }) => RoleManager + RoleSuperManager)(match)) && (
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => {
              onRemoveProject('正在删除项目', async () => {
                const collect = collectEventTableAction('删除项目');
                try {
                  const value = Math.max(
                    deleted + 1,
                    matcher(({ MenuMy }) => MenuMy)(match)
                      ? 1
                      : matcher(({ MenuAdmin }) => MenuAdmin)(match)
                      ? 2
                      : matcher(({ MenuSuper }) => MenuSuper)(match)
                      ? 3
                      : deleted + 1
                  );
                  await http.post('project/transition', {
                    teamId,
                    userId: editor,
                    deleted: value,
                    id,
                  });
                  collect('okay');

                  const isSuperAdmin = userInfo.teams.some(({ type }) => type === 1);
                  if (value > 3 || (!isSuperAdmin && value > 2)) {
                    message.success('已彻底删除项目');
                  } else {
                    onGotoProject('删除项目成功', routes => {
                      const route = routes.find(({ path: [path] }) => {
                        switch (value) {
                          case 1:
                            return path === '/my/project';
                          case 2:
                            return path === '/admin/project';
                          case 3:
                            return path === '/super/project';
                        }
                      })!;
                      return route.pathOf({ tab: 'deleted', id: String(id), page: 1 });
                    });
                  }
                  return id;
                } catch (error) {
                  collect('error');
                  throw error;
                }
              });
            }}
          >
            <Typography.Link>删除</Typography.Link>
          </Popconfirm>
        ),
    ]
      .flat()
      .filter(Boolean);
    return (
      <Space>
        {item1}
        {item2}
        {items.length === 0 ? null : items.length === 1 ? (
          items[0]
        ) : (
          <Dropdown
            trigger={['hover']}
            menu={{ items: items.map((label, key) => ({ key, label })) }}
            onOpenChange={open => {
              if (open) {
                collectEventTableAction('更多操作')('okay');
              }
            }}
          >
            <Typography.Link>更多</Typography.Link>
          </Dropdown>
        )}
      </Space>
    );
  },
});
