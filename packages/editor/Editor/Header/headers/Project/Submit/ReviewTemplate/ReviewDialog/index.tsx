import React from 'react';
import { message } from 'antd';
import { pushTemplateVersion, pushTemplateSkinVersion } from '@shared/api/templateAdmin';

import StepTwo from './StepTwo';
import { getUseStepOne } from '../../SyncProduct/SyncDialog';
import StepDialog from '../../SyncProduct/SyncDialog/StepDialog';
import { useEventBus } from '@byted/hooks';

export interface SyncDialogProps {
  skinning?: boolean;
  onSaving(): Promise<void>;
  getState(): EditorState;
  onCancel(): void;
}

const getUseStepTwo = (getState: any) => (form: any) => {
  return {
    title: '录入版本信息',
    okDisabled: false,
    cancelDisabled: false,
    spinning: false,
    element: <StepTwo form={form} getState={getState} />,
    async mapValues(values: any) {
      return values;
    },
  };
};

export default function ReviewDialog({ skinning, onCancel, getState, onSaving }: SyncDialogProps) {
  const { id } = getState().project;
  useEventBus('abortCompressing', onCancel);

  return (
    <StepDialog
      action="送审"
      title="模板送审"
      onCancel={onCancel}
      onConfirm={async values => {
        await onSaving();
        const data = {
          id,
          type: Number(new URLSearchParams(location.search).get('type')),
          pid: Number(location.pathname.split('/').pop()),
          ...values,
        };
        if (skinning) {
          await pushTemplateSkinVersion(data);
        } else {
          await pushTemplateVersion(data);
        }
        message.success('送审成功');
        onCancel();
      }}
      useStepHooks={[
        getUseStepOne({
          onSaving,
          title: '压缩设置',
          headerTitle: '压缩设置',
        }),
        getUseStepTwo(getState),
      ]}
    />
  );
}
