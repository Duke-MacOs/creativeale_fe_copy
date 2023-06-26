import { useUserInfo } from '@shared/userInfo';
import { ConfigProvider, Layout, message, Spin, theme } from 'antd';
import { css } from 'emotion';
import { Suspense, useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Tutorials from './Tutorials';
import { useRoutes } from '../routes';
import MainHeader from '../views/Header';
import NotFound from '../views/NotFound';
import MainSider from '../views/Sider';
// import Home from './Home';

export default function App() {
  const { token } = theme.useToken();
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            colorBgBody: token.colorBgContainer,
          },
        },
      }}
    >
      <Layout
        style={{ minHeight: '100%' }}
        className={css({
          color: token.colorTextBase,
        })}
      >
        <MainHeader />
        <Switch>
          {/* <Route path="/" exact component={Home} /> */}
          <Route path="/help" component={Tutorials} />
          <Admin />
        </Switch>
      </Layout>
    </ConfigProvider>
  );
}

function Admin() {
  const { loading, updateUserInfo } = useUserInfo();
  const { routes } = useRoutes();

  useEffect(() => {
    updateUserInfo().catch(error => {
      message.error(error.message || '无法获取个人信息，请稍后再试');
    });
  }, []);

  if (loading) {
    return <Spin spinning={true} tip="正在初始化工作区" style={{ width: '100vw', marginTop: '50vh' }} />;
  }

  return (
    <Layout>
      <Switch>
        {/* 不展示侧边栏的情况 */}
        <Route component={MainSider} />
      </Switch>
      <Suspense fallback={null}>
        <Switch>
          {routes.map(Component => {
            return <Route key={Component.path[0]} path={Component.path} exact component={Component} />;
          })}
          {routes.length ? <Redirect from="/" to={routes[0].path[0]} /> : <Route component={NotFound} />}
        </Switch>
      </Suspense>
    </Layout>
  );
}
