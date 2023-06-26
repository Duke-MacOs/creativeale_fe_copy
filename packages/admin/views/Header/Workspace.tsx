import { Avatar, Dropdown, Menu, Tag, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { collectEvent } from '../../collectEvent';
import { IUserInfo } from '@shared/types';
import React, { useState } from 'react';
import { css } from 'emotion';
import { DownOutlined } from '@ant-design/icons';
import { useUserInfo } from '@shared/userInfo';
import { TeamType } from '@main/pages/Teams/TeamList/TeamTable';

export default () => {
  const { userInfo, updateUserInfo } = useUserInfo();
  const items = useGetItems();
  if (!userInfo || !items) return <div>工作台</div>;

  const { teamId, teams } = userInfo;
  const { personal, getItems, reactNode } = items;
  const team = teams.find(({ id }) => id === teamId)!;
  const teamList = teams.filter(({ id, type, fake }) => !fake && id !== teamId && type !== 0);
  const teamItems = getItems(teamList);

  const arrow =
    teams.length > 1 ? (
      <>
        {' '}
        <DownOutlined />
      </>
    ) : null;

  return (
    <div>
      <Dropdown
        placement="bottom"
        menu={{
          items:
            teamList.length > 0
              ? [
                  ...teamItems,
                  ...personal(
                    [],
                    [
                      teams.length > 2 && {
                        type: 'divider',
                      },
                      {
                        label: (
                          <div
                            className={css({ textAlign: 'center' })}
                            onClick={() => {
                              collectEvent('account_module', { event_name: 'click_back_to_workspace' });
                              updateUserInfo(teams.find(({ type }) => type === 0)!.id);
                            }}
                          >
                            返回工作台
                          </div>
                        ),
                        key: 'logout_team',
                      },
                    ].filter(Boolean) as Exclude<MenuProps['items'], undefined>
                  ),
                ]
              : [
                  ...personal(
                    [],
                    [
                      {
                        label: (
                          <div
                            className={css({ textAlign: 'center' })}
                            onClick={() => {
                              collectEvent('account_module', { event_name: 'click_back_to_workspace' });
                              updateUserInfo(teams.find(({ type }) => type === 0)!.id);
                            }}
                          >
                            返回工作台
                          </div>
                        ),
                        key: 'logout_team',
                      },
                    ]
                  ),
                ],
        }}
      >
        {personal(
          <div>工作台{arrow}</div>,
          <div>
            <Avatar size="small" src={team.logo} /> {team.name}
            {arrow}
          </div>
        )}
      </Dropdown>
      {reactNode}
    </div>
  );
};

export function useGetItems() {
  const { userInfo, updateUserInfo } = useUserInfo();
  const [reactNode, setReactNode] = useState<React.ReactNode>(null);
  if (!userInfo) return null;

  const { teamId, teams } = userInfo;
  const currentTeam = teams.find(({ id }) => id === teamId)!;
  const personal = <A, B>(a: A, b: B) => (currentTeam.type === 0 ? a : b);

  const getItems = (teams: IUserInfo['teams'], overflow = 2): Exclude<MenuProps['items'], undefined> => {
    if (teams.length > overflow + 1) {
      return [
        ...getItems(teams.slice(0, overflow)),
        {
          label: (
            <div
              className={css({
                textAlign: 'center',
              })}
              onClick={() => {
                collectEvent('account_module', { event_name: 'click_view_more' });
                setReactNode(
                  <Modal
                    open
                    footer={null}
                    onCancel={() => {
                      setReactNode(null);
                    }}
                  >
                    <Menu style={{ border: 'none', boxShadow: 'none' }} items={getItems(teams, teams.length)} />
                  </Modal>
                );
              }}
            >
              查看更多团队
            </div>
          ),
          key: 'more',
        },
      ];
    }

    return teams.map(({ id, name, logo, type }) => {
      return {
        label: (
          <TeamItem
            logo={logo}
            type={type}
            name={name}
            onClick={() => {
              collectEvent('account_module', { event_name: 'switch_team' });
              updateUserInfo(id);
              setReactNode(null);
            }}
          />
        ),
        key: id,
      };
    });
  };

  return {
    currentTeam,
    personal,
    getItems,
    reactNode,
    setReactNode,
  };
}

export const TeamItem = ({ logo, type, name, onClick }: any) => {
  return (
    <div className={css({ display: 'flex', alignItems: 'center' })} onClick={onClick}>
      <Avatar src={logo} size="small" className={css({ flexShrink: 0 })} />
      <Tag
        color="geekblue"
        className={css({
          margin: '0 8px',
        })}
      >
        {TeamType[type]}
      </Tag>
      <span
        className={css({
          fontSize: 14,
          maxWidth: 160,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        })}
      >
        {name}
      </span>
    </div>
  );
};
