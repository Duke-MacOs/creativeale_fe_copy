import { IMyProjectParams, IProjectFromServer, listProjectByParams, ProjectStatus } from './api';
import { collectEventSearchAction, collectEventTableAction } from '@main/collectEvent';
import { getProjectColumns, MutateProject } from './columns';
import { useLoadingAction, withLoading } from '@main/table';
import { usePageParams } from '@main/routes/withPath';
import { usePagination } from '@main/table/project';
import { Table, message, Typography } from 'antd';
import { TabsContainer } from '@main/pages/views';
import { Previewer } from '@editor/Editor/Header';
import { matcher, MatchStatus } from './matcher';
import { groupBy, maxBy, pickBy } from 'lodash';
import { useHistory } from 'react-router-dom';
import CreateProject from './views';
import { useRoutes } from '@main/routes';
import { PROJECT_TABS } from './tabList';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { css } from 'emotion';
import { useUserInfo } from '@shared/userInfo';

const {
  MenuMy,
  MenuAdmin,
  MenuSuper,
  MenuPub,
  TypeProject,
  TypeTemplate,
  TypeExample,
  TeamUser,
  RoleManager,
  RoleSuperManager,
} = MatchStatus;

export const useProjectQuery = (sortKey: 'createdAt' | 'updatedAt' = 'updatedAt') => {
  const [projectList, setProjectList] = useState<IProjectFromServer[]>([]);
  const { params, onParamsChange } = usePageParams<IMyProjectParams>();
  const { startLoading, stopLoading } = useLoadingAction();
  const [total, setTotal] = useState(0);

  const { refetch: reloadProject } = useQuery({
    queryKey: [params],
    queryFn() {
      startLoading();
      const searchParams = pickBy(params, value => Boolean(value)) as any;
      return listProjectByParams(searchParams);
    },
    onSuccess({ list, pagination: { total } }) {
      const lastPage = Math.ceil(total / params.pageSize);
      if (lastPage > 0 && params.page > lastPage) {
        onParamsChange({ page: lastPage }, { resetPage: false });
      }
      setTotal(total);
      setProjectList(
        Object.values(groupBy(list, 'parentId'))
          .sort((l1, l2) => (maxBy(l1, 'updatedAt')!.updatedAt > maxBy(l2, 'updatedAt')!.updatedAt ? -1 : 1))
          .map(l => {
            const l1 = l.sort((p1, p2) => (p1[sortKey] > p2[sortKey] ? -1 : 1));
            if (l1.length > 1) {
              return { ...l1[0], children: l1.slice(1) };
            }
            return l1[0];
          })
      );
    },
    onError() {
      setProjectList([]);
    },
    onSettled: stopLoading,
  });

  return {
    setProjectList,
    reloadProject,
    projectList,
    params,
    total,
  };
};

export default withLoading(function MyProjectTable({ loading }) {
  const [previewState, setPreviewState] = useState<{ previewUrl: string; typeOfPlay?: number }>();
  const [reactNode, setReactNode] = useState<React.ReactNode>(null);
  const { params, onParamsChange } = usePageParams<IMyProjectParams>();
  const { projectList, total, setProjectList, reloadProject } = useProjectQuery('createdAt');
  const { startLoading, stopLoading } = useLoadingAction();
  const { userInfo } = useUserInfo();
  const { routes } = useRoutes();
  const history = useHistory();

  const mutateProject: MutateProject = {
    ...params,
    userInfo,
    async onPreviewProject(reason, preview) {
      try {
        startLoading(reason);
        setPreviewState(await preview());
      } catch (error) {
        message.error(error.message);
      } finally {
        stopLoading();
      }
    },
    async onCreateProject(reason, create) {
      try {
        startLoading(reason);
        const project = await create();
        if (params.tab === 'draft' || params.tab === '') {
          setProjectList(list => {
            const index = list.findIndex(({ parentId }) => parentId === project.parentId);
            if (index > -1) {
              const { children = [], ...parent } = list[index];
              return [
                ...list.slice(0, index),
                { ...project, newest: true, children: [{ ...parent, newest: false }, ...children] },
                ...list.slice(index + 1),
              ];
            }

            if (list.length < (params.pageSize || 20)) {
              return [{ ...project, newest: true }, ...list];
            }

            return [{ ...project, newest: true }, ...list.slice(0, list.length - 1)];
          });
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        stopLoading();
      }
    },
    async onRemoveProject(reason, remove) {
      try {
        startLoading(reason);
        const id = await remove();
        setProjectList(list => {
          const newList = list.reduce<IProjectFromServer[]>((list, project) => {
            const { children, ...parent } = project;
            if (parent.id === id) {
              if (children?.length) {
                if (children.length > 1) {
                  list.push({ ...children[0], children: children.slice(1) });
                } else {
                  list.push(children[0]);
                }
              } else {
                return list;
              }
            } else if (children?.some(project => project.id === id)) {
              const ch = children.filter(project => project.id !== id);
              if (ch.length) {
                list.push({ ...parent, children: ch });
              } else {
                list.push(parent);
              }
            } else {
              list.push(project);
            }
            return list;
          }, []);
          if (!newList.length) {
            reloadProject();
          }
          return newList;
        });
      } catch (error) {
        message.error(error.message);
      } finally {
        stopLoading();
      }
    },
    async onUpdateProject(reason, update) {
      try {
        startLoading(reason);
        const partial = await update();
        setProjectList(list =>
          list.reduce<IProjectFromServer[]>((list, project) => {
            if (project.id === partial.id) {
              list.push({ ...project, ...partial });
            } else if (project.children?.some(project => project.id === partial.id)) {
              list.push({ ...project, ...partial });
            } else {
              list.push(project);
            }
            return list;
          }, [])
        );
      } catch (error) {
        message.error(error.message);
      } finally {
        stopLoading();
      }
    },
    onGotoProject(msg: string, go) {
      message.success(
        <>
          {msg}{' '}
          <Typography.Link
            onClick={() => {
              collectEventTableAction('项目流转后去查看')('okay');
              const value = matcher(({ MenuMy }) => MenuMy)(params.match)
                ? 1
                : matcher(({ MenuAdmin }) => MenuAdmin)(params.match)
                ? 2
                : matcher(({ MenuSuper }) => MenuSuper)(params.match)
                ? 3
                : 4;
              const path = go(
                routes as any,
                routes.find(({ path }) =>
                  path.includes(['/my/project', '/admin/project', '/super/project'][value - 1])
                ) as any
              );
              if (path) {
                history.push(path);
              }
            }}
          >
            去查看
          </Typography.Link>
        </>
      );
    },
    onQueryProject(params) {
      collectEventSearchAction(params);
      onParamsChange(params);
    },
    renderReactNode: setReactNode,
  };

  return (
    <TabsContainer
      value={params.tab}
      options={PROJECT_TABS.filter(({ match }) => match(params.match))}
      extra={matcher(MenuMy, TypeProject)(params.match) && <CreateProject />}
      onChange={tab => {
        onParamsChange({ tab, page: 1 });
      }}
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={projectList}
        pagination={usePagination(total)}
        expandable={{
          indentSize: 0,
          onExpand: expanded => {
            if (expanded) {
              collectEventTableAction('展示项目版本')('okay');
            } else {
              collectEventTableAction('收起项目版本')('okay');
            }
          },
        }}
        className={css({
          '& .ant-table-row-expand-icon': {
            marginTop: '42px !important',
          },
          '& .ant-table-row-level-1': {
            opacity: 0.38,
          },
        })}
        columns={getProjectColumns(
          ({
            coverAndPreview,
            templateAction,
            industryColumn,
            projectAction,
            exampleAction,
            versionGroup,
            editorColumn,
            transition,
            userColumn,
            teamColumn,
            nameAndId,
            updatedAt,
          }) => {
            return [
              coverAndPreview(mutateProject),
              nameAndId(mutateProject),
              (params.tab !== 'deleted' ||
                matcher(MenuMy)(params.match) ||
                matcher(RoleManager, MenuAdmin)(params.match) ||
                matcher(RoleSuperManager, MenuSuper)(params.match)) &&
                projectAction(mutateProject),
              !['deleted', 'borrowed'].includes(params.tab) &&
                matcher(MenuMy, TypeProject)(params.match) &&
                transition(mutateProject),
              !matcher(MenuPub)(params.match) &&
                matcher(TypeTemplate, MenuMy + RoleManager + MenuSuper)(params.match) &&
                (params.tab !== String(ProjectStatus.Approved) ||
                  !matcher(MenuMy + TeamUser)(params.match) ||
                  matcher(MenuMy, TeamUser)(params.match)) &&
                templateAction(mutateProject),
              !matcher(MenuPub)(params.match) &&
                matcher(TypeExample, MenuMy + RoleManager + MenuSuper)(params.match) &&
                (params.tab !== String(ProjectStatus.ExampleApproved) ||
                  !matcher(MenuMy + TeamUser)(params.match) ||
                  matcher(MenuMy, TeamUser)(params.match)) &&
                exampleAction(mutateProject),
              versionGroup(mutateProject),
              (matcher(MenuSuper)(params.match) ||
                (matcher(MenuAdmin)(params.match) && !matcher(TeamUser)(params.match))) &&
                userColumn(mutateProject),
              params.tab === 'borrowed' && editorColumn(mutateProject),
              (matcher(MenuSuper)(params.match) || matcher(TeamUser, MenuAdmin)(params.match)) &&
                teamColumn(mutateProject),
              matcher(TypeTemplate + TypeExample)(params.match) && industryColumn(mutateProject),
              updatedAt(mutateProject),
            ];
          }
        )}
      />
      {previewState && (
        <Previewer
          httpUrl={previewState.previewUrl}
          typeOfPlay={previewState.typeOfPlay as any}
          originSize={[667, 375]}
          onClose={() => {
            setPreviewState(undefined);
          }}
        />
      )}
      {reactNode}
    </TabsContainer>
  );
});
