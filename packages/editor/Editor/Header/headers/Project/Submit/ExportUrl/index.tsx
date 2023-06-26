import Icon, { ExclamationCircleFilled } from '@ant-design/icons';
import { checkPlayableAreaAll } from '@editor/aStore';
import { collectEvent, EventTypes } from '@editor/utils';
import { Send } from '@icon-park/react';
import { message, Modal } from 'antd';
import React from 'react';
import { useState } from 'react';
import { useStore } from 'react-redux';
import { SubmitProps } from '..';
import HeaderButton from '../../HeaderButton';
import { ExportHistoryWrapper } from '../ExportHistory';
import ExportDialog from './ExportDialog';

export default function ExportProject({ disabled, onSaving }: SubmitProps) {
  const [visible, setVisible] = useState(false);
  const { getState } = useStore<EditorState, EditorAction>();

  return (
    <React.Fragment>
      <ExportHistoryWrapper>
        <HeaderButton
          icon={<Icon component={Send as any} />}
          disabled={disabled}
          onClick={async () => {
            collectEvent(EventTypes.OperationButton, {
              type: '生成URL',
            });
            try {
              await onSaving('生成URL');
              const warning = checkPlayableAreaAll(getState().project);
              if (!warning) {
                return setVisible(true);
              }
              Modal.confirm({
                autoFocusButton: null,
                title: '警示',
                icon: <ExclamationCircleFilled />,
                content: `${warning}，可能会影响互动效果，建议确认后再生成URL`,
                cancelText: '去检查',
                okText: '直接生成URL',
                onCancel: console.log,
                onOk: () => setVisible(true),
              });
            } catch (e) {
              console.error(e);
              message.error(e.message);
            }
          }}
        >
          生成URL
        </HeaderButton>
      </ExportHistoryWrapper>
      {visible && <ExportDialog onSaving={onSaving} onCancel={() => setVisible(false)} />}
    </React.Fragment>
  );
}
