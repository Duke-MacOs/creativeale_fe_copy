import { copyText } from '@shared/utils';
import { Dropdown, Modal, ModalFuncProps } from 'antd';
import { useState } from 'react';
import { HistoryOverlay } from './Overlay';
import { addHistory, ExportHistory, getHistory } from './storage';

export const ExportHistoryWrapper = ({ children }: { children: JSX.Element }) => {
  const [histories, setHistories] = useState(getHistory);

  return (
    <Dropdown
      onOpenChange={visible => {
        if (visible) {
          setHistories(getHistory);
        }
      }}
      overlay={histories.length > 0 ? <HistoryOverlay histories={histories} /> : <div />}
      children={children}
    />
  );
};

export const triggerExportSuccess = ({
  onOk,
  content,
  exportHistoryData,
}: {
  content: string;
  onOk?: ModalFuncProps['onOk'];
  exportHistoryData?: Omit<ExportHistory, 'content' | 'createTime'>;
}) =>
  Modal.success({
    content,
    title: '导出成功',
    style: { userSelect: 'text' },
    okText: '复制并关闭',
    onOk() {
      copyText(content, { tip: true });
      if (exportHistoryData) {
        addHistory({ content, ...exportHistoryData });
      }
      onOk?.();
    },
  });
