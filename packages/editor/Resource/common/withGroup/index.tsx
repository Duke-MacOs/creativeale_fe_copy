import React, { memo } from 'react';
import { Empty } from 'antd';
import Icon from '@ant-design/icons';
import { Right } from '@icon-park/react';
import { Category, GroupList, Provider } from '../../../aStore';
import emptyHolder from './emptyHolder.svg';
export interface WithGroupProps<T> {
  groups: GroupList<T>;
  provider: Provider;
  searching?: boolean;
  category: Category;
  onExpand: (tagId: WithGroupProps<T>['groups'][number]) => void;
  setGroupData: any;
  groupData: any;
}
export interface WithGroupComponentProps<T> {
  groupData: GroupList<T>[number];
  provider: Provider;
  category: Category;
  setGroupData: any;
  keyword?: string;
}
export default function withGroup<T = any>(Component: React.ComponentType<WithGroupComponentProps<T>>) {
  return memo(({ groups, provider, category, searching, onExpand, setGroupData }: WithGroupProps<T>) => {
    const filteredGroups = groups.filter(({ list }) => list.length);
    if (!filteredGroups.length && groups.length) {
      switch (provider) {
        case 'public':
          if (searching) {
            return <Empty description="没有符合要求的素材" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
          }
          return (
            <div style={{ textAlign: 'center', color: '#999' }}>
              <img src={emptyHolder} style={{ maxWidth: '100%' }} />
              <div>公共素材库正在筹备中...</div>
            </div>
          );
        case 'project':
          return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无项目素材，请本地上传" />;
        case 'private':
          return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无我的素材，请本地上传" />;
        case 'shared':
          return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无团队素材，请本地上传" />;
      }
    } else {
      return (
        <GroupContainer groups={filteredGroups} onClick={onExpand}>
          {group => {
            return (
              <Component
                key={group.name}
                groupData={group}
                setGroupData={setGroupData}
                provider={provider}
                category={category}
              />
            );
          }}
        </GroupContainer>
      );
    }
  });
}
export function GroupContainer<T>({
  groups,
  onClick,
  children,
}: {
  groups: WithGroupProps<T>['groups'];
  onClick?: WithGroupProps<T>['onExpand'];
  children: (list: WithGroupProps<T>['groups'][number]) => React.ReactNode;
}) {
  return (
    <React.Fragment>
      {groups.map((group, index) => (
        <div key={index} style={{ padding: '16px 12px 0' }}>
          {group.expandable && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
              <div>{group.name}</div>
              {group.total > group.list.length && (
                <div
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => onClick?.(group)}
                >
                  更多 <span style={{ color: '#555' }}>({group.total - group.list.length}+)</span>
                  <Icon component={Right as any} />
                </div>
              )}
            </div>
          )}

          {children(group)}
        </div>
      ))}
    </React.Fragment>
  );
}
