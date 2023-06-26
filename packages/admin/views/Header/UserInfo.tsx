import { Avatar, Dropdown, Typography } from 'antd';
import { beconEvent } from '../../collectEvent';
import { useUserInfo } from '@shared/userInfo';
import { http } from '@shared/api';
import useJoinTeam from './useJoinTeam';
import UserModal from './UserModal';
import { useState } from 'react';
import { collectEvent } from '@editor/utils';
import useAcceptProject from './useAcceptProject';

export function UserInfo() {
  const { userInfo, updateUserInfo, setUserInfo } = useUserInfo();
  useJoinTeam(updateUserInfo);
  useAcceptProject();

  const [visible, setVisible] = useState(false);

  if (!userInfo) return null;

  return (
    <>
      <Dropdown
        placement="bottom"
        menu={{
          items: [
            {
              label: (
                <div
                  style={{ textAlign: 'center' }}
                  onClick={() => {
                    collectEvent('account_module', { event_name: 'click_personal_info' });
                    setVisible(true);
                  }}
                >
                  个人信息
                </div>
              ),
              key: 'userinfo',
            },
            {
              type: 'divider',
            },
            {
              label: (
                <div
                  style={{ textAlign: 'center' }}
                  onClick={() => {
                    beconEvent('account_module', { event_name: 'click_quit' });
                    window.location.href = '/api/oauth2/logout';
                  }}
                >
                  退出登录
                </div>
              ),
              key: 'logout',
            },
          ],
        }}
      >
        <div style={{ display: 'flex', columnGap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Avatar size="large" src={userInfo.avatar} />
          <div style={{ textAlign: 'center', fontSize: 12 }}>
            <span
              style={{
                display: 'block',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: 6,
              }}
            >
              {userInfo.name}
            </span>
            <Typography.Text
              type="secondary"
              children={`ID: ${userInfo.userId}`}
              style={{
                display: 'block',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            />
          </div>
        </div>
      </Dropdown>
      {visible && (
        <UserModal
          initValues={{
            name: userInfo.name,
            avatar: userInfo.avatar,
            description: userInfo.teams.find(({ type }) => type === 0)!.description,
          }}
          onCancel={() => {
            setVisible(false);
          }}
          onFinish={async data => {
            await http.post('/team/user/update', data);
            setUserInfo(() => data);
          }}
        />
      )}
    </>
  );
}
