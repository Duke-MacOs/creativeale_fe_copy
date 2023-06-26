import { Layout, Menu, Badge, theme } from 'antd';
import { useUserInfo } from '@shared/userInfo';
import logoImage from './logoImage.svg';
import Workspace from './Workspace';
import { css } from 'emotion';
import { useLocation, useHistory } from 'react-router';
import { useVisible } from '@editor/hooks';
import { amIHere } from '@shared/utils';
import { collectEvent, EventTypes } from '@editor/utils';
import { UserInfo } from './UserInfo';
import { ROUTES } from '@main/routes';
import LatestNotice from '@shared/components/LatestNotice';

export default () => {
  const changelog = useChangelog();
  const selected = useSelected();
  const history = useHistory();
  const { userInfo } = useUserInfo();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <div style={{ height: 64 }}>
      <Layout.Header
        style={{
          position: 'fixed',
          zIndex: 12,
          width: '100%',
          backgroundColor: colorBgContainer,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          lineHeight: 'initial',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          columnGap: 16,
        }}
      >
        <img src={logoImage} />
        <div
          style={{
            borderLeft: '1px solid var(--color-primary)',
            height: '25%',
          }}
        />
        <div style={{ marginRight: 'auto', color: 'var(--color-primary)' }}>互动创意</div>
        <Menu
          mode="horizontal"
          selectedKeys={[selected]}
          className={css({
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            border: 'none',
            '.ant-menu-item::after, .ant-menu-submenu:after': {
              display: 'none',
            },
          })}
          onClick={({ key }) => {
            switch (key) {
              case '/pub/template': {
                if (
                  !(userInfo && ROUTES.map(route => route(userInfo)).find(route => route.path[0] === location.pathname))
                ) {
                  history.push('/pub/template');
                }
                break;
              }
              case '/':
              case '/help': {
                history.push(key);
                break;
              }
            }
          }}
          items={[
            {
              label: <Workspace />,
              key: '/pub/template',
            },
            {
              label: '帮助',
              key: '/help',
            },
            {
              label: '更多',
              key: 'more',
              children: [
                {
                  key: '/wenjuan',
                  label: '问卷反馈',
                  onClick() {
                    window.open('https://wenjuan.feishu.cn/m/cfm?t=szitQAE50gGi-xc86');
                  },
                },
                changelog,
              ],
            },
          ]}
        />
        <UserInfo />
      </Layout.Header>
      <LatestNotice />
    </div>
  );
};

const useChangelog = () => {
  const [changelog, setChangelog] = useVisible('changelog', {
    nextValue: PACKAGE_VERSION,
    byStep: false,
  });
  return {
    key: '/log',
    label: <Badge dot={changelog}>更新日志</Badge>,
    onClick() {
      setChangelog(false);
      if (amIHere({ online: true })) {
        window.open('https://bytedance.feishu.cn/docs/doccn8nDt4jSAE83zoibe09TYwc');
      } else {
        window.open('https://bytedance.feishu.cn/wiki/wikcn8s1H2JBm9PdWDFA0So1D8d');
      }
      collectEvent(EventTypes.OperationButton, {
        type: '更新日志',
      });
    },
  };
};

const useSelected = () => {
  const { pathname } = useLocation();
  if (pathname === '/') {
    return '/';
  }
  if (pathname.startsWith('/help')) {
    return '/help';
  }
  return '/pub/template';
};
