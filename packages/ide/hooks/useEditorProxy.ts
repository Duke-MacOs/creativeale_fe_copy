import { useMemo, useCallback } from 'react';
import { Modal } from 'antd';

let messageId = new Date().getTime();

export function getMessageId() {
  return ++messageId;
}
function openByEditor() {
  const regex = new RegExp(/^(\/app|\/play)\/(project|template|product|show|simple)?/);
  return opener && opener.origin === window.location.origin && regex.test(opener.location.pathname);
}

export default function useEditorProxy() {
  const projectId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Number(params.get('project')) || 0;
  }, []);

  const handleWarn = useCallback(() => {
    Modal.warning({
      title: '请通过对应万能互动项目进入本页面',
      content: '点击“前往”按钮将为您自动跳转',
      okText: '前往',
      onOk: () => {
        window.open(window.location.origin);
      },
    });
  }, []);

  return useMemo(() => {
    return {
      openByEditor,
      postMessage: (type: string, params: Record<string, unknown>) => {
        if (!openByEditor()) {
          handleWarn();
          return Promise.reject(new Error('当前未打开万能互动编辑器页面'));
        }

        const opener = window.opener;
        const id = getMessageId();
        opener?.postMessage({ type, params, id, projectId }, window.location.origin);
        return new Promise((resolve, reject) => {
          const messageHandle = (evt: MessageEvent) => {
            const { id: respondId, result, error } = evt.data;
            if (id === respondId) {
              if (error) {
                const parsedError = JSON.parse(error.message);
                if (parsedError.code === -2) {
                  handleWarn();
                }
                reject(parsedError);
              } else {
                resolve(result);
              }
              window.removeEventListener('message', messageHandle);
            }
          };
          window.addEventListener('message', messageHandle);
        });
      },
    };
  }, [projectId, handleWarn]);
}
