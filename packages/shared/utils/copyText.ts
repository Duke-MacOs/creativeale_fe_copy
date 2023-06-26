import { message } from 'antd';
import copyToClipboard from 'copy-to-clipboard';

export const copyText = (text: string | undefined, options?: { tip?: boolean; onCopySuccess?: () => void }) => {
  const onSuccess = () => {
    if (options?.tip) {
      message.success('复制成功');
    }
    options?.onCopySuccess?.();
  };

  if (text) {
    navigator.clipboard.writeText(text).then(onSuccess, () => {
      if (copyToClipboard(text)) {
        onSuccess();
      } else {
        message.error('复制失败，请稍后重试');
      }
    });
  } else {
    message.warning('您复制的是空内容，请检查！');
  }
};
