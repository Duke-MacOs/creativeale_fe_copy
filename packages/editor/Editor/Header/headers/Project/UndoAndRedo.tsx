import React from 'react';
import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { useOnRedo, useOnUndo } from '@editor/aStore';
import HeaderButton from './HeaderButton';
export default function UndoAndRedo({ disabled }: { disabled: boolean }) {
  const { canUndo, onUndo } = useOnUndo();
  const { redoSteps, onRedo } = useOnRedo();
  return (
    <React.Fragment>
      <HeaderButton icon={<UndoOutlined />} disabled={disabled || !canUndo} onClick={onUndo}>
        撤回
      </HeaderButton>
      <HeaderButton disabled={disabled || redoSteps === 0} icon={<RedoOutlined />} onClick={onRedo}>
        重做
      </HeaderButton>
    </React.Fragment>
  );
}
