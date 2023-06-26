import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { collectEventSidebar } from '@main/collectEvent';
import { useRoutes } from '@main/routes';
import { Layout, Menu } from 'antd';

const { Sider } = Layout;

export default ({ location: { pathname }, history: { replace } }: RouteComponentProps) => {
  const routes = useRoutes().routes.filter(({ path }) => !path[0].includes(':'));
  const route = routes.find(({ path }) => pathname.startsWith(path[0]));
  const [offsetTop, setOffsetTop] = useState<number>();

  useEffect(() => {
    if (route?.label) {
      document.title = route.label;
    }
  }, [route]);

  if (!routes.length) {
    return null;
  }

  return (
    <div style={{ flex: '0 0 165px' }}>
      <Sider
        theme="light"
        width={164}
        ref={ref => setOffsetTop(ref?.offsetTop)}
        style={{
          height: `calc(100vh - ${offsetTop}px)`,
          position: 'fixed',
          left: 0,
          zIndex: 11,
          overflow: 'auto',
        }}
      >
        <Menu
          style={{ paddingBottom: 30 }}
          selectedKeys={[route?.path[0]].filter(Boolean) as any}
          mode="inline"
          onClick={({ key }) => {
            if (!['/pub/', '/my/', '/admin/', 'super'].includes(key)) {
              const route = routes.find(({ path }) => key === path[0]);
              if (route?.pathOf) {
                collectEventSidebar(route.label, key);
                replace(route.pathOf());
              } else {
                replace(key);
              }
            }
          }}
          items={
            [
              { label: '精选', prefix: '/pub/' },
              { label: '我的', prefix: '/my/' },
              { label: '管理', prefix: '/admin/' },
              { label: '超管', prefix: '/super/' },
            ]
              .map(({ label, prefix }, index) => {
                const subRoutes = routes.filter(({ path }) => path[0].startsWith(prefix));
                if (subRoutes.length) {
                  return [
                    index !== 0 && { type: 'divider' },
                    { label, key: prefix, style: { cursor: 'default', color: '#969696' } },
                    ...subRoutes.map(({ label, path }) => ({ label, key: path[0], style: { paddingLeft: '36px' } })),
                  ].filter(Boolean);
                }
                return [];
              })
              .flat() as any[]
          }
        />
      </Sider>
    </div>
  );
};
