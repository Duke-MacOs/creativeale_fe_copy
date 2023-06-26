import 'animate.css';
import { ConfigProvider, message, theme } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import 'core-js/stable';
import 'dayjs/locale/zh-cn';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import './index.less';
import Pages from './pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      onError: (err: any) => {
        message.error(err.message ?? '请求出错，请稍后重试');
      },
    },
  },
});

window.VERSION = process.env.REACT_APP_BUILD_VERSION;
console.log(window.VERSION);

ReactDOM.render(
  <BrowserRouter>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#3955f6',
          colorInfo: '#3955f6',
        },
        algorithm: location.search.includes('dark') ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Pages />
      </QueryClientProvider>
    </ConfigProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
