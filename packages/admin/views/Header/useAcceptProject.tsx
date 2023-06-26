import { http } from '@shared/api';
import { message, Modal } from 'antd';
import { useEffect } from 'react';
import { useHistory } from 'react-router';

export const ACCEPT_PROJECT_KEY = 'apk';
export default () => {
  const history = useHistory();
  useEffect(() => {
    const key = new URLSearchParams(location.search).get(ACCEPT_PROJECT_KEY);
    const cancel = () => {
      const url = new URL(window.location as any);
      url.searchParams.delete(ACCEPT_PROJECT_KEY);
      window.history.replaceState({}, '', url);
    };
    if (key) {
      Modal.confirm({
        title: '是否接收项目？',
        okText: '确定',
        onCancel: cancel,
        onOk: async () => {
          try {
            await http.get('project/acceptProject', { params: { key } });
            message.success('项目接收成功');
            history.push('/my/project');
          } catch (error) {
            message.error(error.message);
          } finally {
            cancel();
          }
        },
      });
    }
  }, []);
};
