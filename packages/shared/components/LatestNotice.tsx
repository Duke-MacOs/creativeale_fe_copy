import { useEffect, useState } from 'react';
import { fetchNotice } from '@shared/api/notice';
import { createClient } from 'graphql-ws';
import { Alert } from 'antd';
import { useUserInfo } from '@shared/userInfo';

export default () => {
  const [notice, setNotice] = useState<any>();
  const { logined } = useUserInfo();

  // 获取公告列表
  useEffect(() => {
    if (logined) {
      (async () => {
        const data = await fetchNotice({ page: 1, pageSize: 1 });
        const notice = data?.list?.[0];
        const oldId = localStorage.getItem('noticeId') ?? '0';
        const noUpdate = notice?.id === oldId || notice?.status === 1;
        if (!noUpdate) {
          setNotice(notice);
        }
      })();
    }
  }, [logined]);

  useEffect(() => {
    const client = createClient({
      url: `wss://${location.host}/api/graphql`,
    });

    // 监听公告更新
    const noticeUpdate = () => {
      const subscribeQuery = `
        subscription {
          noticeItemUpdated{
            id
            content
            status
          }
        }
      `;
      return client.subscribe(
        {
          query: subscribeQuery,
        },
        {
          next: (res: any) => {
            const data = res.data.noticeItemUpdated;
            if (data.status === 0) {
              setNotice(data);
            } else {
              if (data.id === notice?.id) {
                setNotice(null);
              }
            }
          },
          error: (err: any) => {
            console.log('subscribe error: ', err);
          },
          complete: () => {
            console.log('subscribe complete: ');
          },
        }
      );
    };

    // 监听新增公告
    const noticeAdd = () => {
      const subscribeQuery = `
        subscription {
          noticeItemAdded {
            id
            content
            status
          }
        }
      `;

      return client.subscribe(
        {
          query: subscribeQuery,
        },
        {
          next: (res: any) => {
            const data = res.data.noticeItemAdded;
            setNotice(data);
          },
          error: (err: any) => {
            console.log('subscribe error: ', err);
          },
          complete: () => {
            console.log('subscribe complete: ');
          },
        }
      );
    };

    const unsub1 = noticeUpdate();
    const unsub2 = noticeAdd();
    return () => {
      unsub1();
      unsub2();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return notice?.content ? (
    <Alert
      banner
      type="info"
      message={notice?.content}
      closable
      afterClose={() => {
        localStorage.setItem('noticeId', notice.id);
      }}
    >
      hello
    </Alert>
  ) : null;
};
