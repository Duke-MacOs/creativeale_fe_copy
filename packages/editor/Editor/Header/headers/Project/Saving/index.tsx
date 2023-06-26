import React from 'react';
import Icon from '@ant-design/icons';
import { message } from 'antd';
import { SaveOne } from '@icon-park/react';
import HeaderButton from '../HeaderButton';
import { collectEvent, EventTypes, getScene } from '@editor/utils';
import { useStore } from 'react-redux';
import { addSceneHistory } from '@editor/Editor/History/hooks';
import { checkPlayableAreaAll } from '@editor/aStore';

export default function Saving({
  disabled,
  onSaving,
}: {
  disabled: boolean;
  onSaving: (action?: string) => Promise<void>;
}) {
  const { getState } = useStore<EditorState>();
  return (
    <HeaderButton
      icon={<Icon component={SaveOne as any} />}
      disabled={disabled}
      onClick={async () => {
        collectEvent(EventTypes.OperationButton, {
          type: '保存',
        });
        const { project } = getState();
        const {
          id,
          editor: { selectedSceneId },
        } = project;
        const scene = getScene(project);
        addSceneHistory(id, selectedSceneId, scene);
        try {
          await onSaving('保存');
          const warning = checkPlayableAreaAll(getState().project);
          if (warning) {
            message.warning(`${warning}，请及时检查是否影响互动效果`);
          }
          message.success('保存成功');
        } catch (error) {
          message.error(error.message || '保存失败');
        }
      }}
    >
      保存
    </HeaderButton>
  );
}
