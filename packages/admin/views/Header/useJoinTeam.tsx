import { http } from '@shared/api';
import { message, Modal } from 'antd';
import { useEffect } from 'react';

export const INVITE_MEMBER_KEY = 'imk';
export default (updateUserInfo: (teamId: string) => void) => {
  useEffect(() => {
    const key = new URLSearchParams(location.search).get(INVITE_MEMBER_KEY);
    const cancel = () => {
      const url = new URL(window.location as any);
      url.searchParams.delete(INVITE_MEMBER_KEY);
      history.replaceState({}, '', url);
    };
    if (key) {
      Modal.confirm({
        title: '是否加入新团队？',
        okText: '确定',
        onCancel: cancel,
        onOk: async () => {
          try {
            const {
              data: { data },
            } = await http.get('team/accept', { params: { key } });
            updateUserInfo(data);
            message.success('已加入团队');
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
