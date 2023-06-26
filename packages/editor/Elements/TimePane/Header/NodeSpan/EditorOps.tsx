import React, { memo, useCallback } from 'react';
import { Button, message } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { classnest } from '@editor/utils';
import { HeaderNode } from '..';
import { css } from 'emotion';

const className = css({
  background: 'inherit',
  position: 'absolute',
  cursor: 'pointer',
  paddingRight: 8,
  opacity: 0,
  height: 32,
  right: 0,
  top: 0,
  '&-hoverable:hover, &-dirty': {
    opacity: 1,
  },
});
export interface EditorOpsProps {
  node: HeaderNode;
  resizing: boolean;
  onChangeEditor(id: number, partial: Record<string, unknown>): void;
}
const EditorOps = ({ node, resizing, onChangeEditor }: EditorOpsProps) => {
  const toggleHidden = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (['VRVideo'].includes(node.type)) {
        message.warning('不允许执行该操作');
        return;
      }
      onChangeEditor(node.id, { isHidden: !node.isHidden });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node]
  );
  const toggleLocked = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (['PVVideo', 'PVAlphaVideo', 'VRVideo'].includes(node.type)) {
        message.warning('不允许执行该操作');
        return;
      }
      onChangeEditor(node.id, { isLocked: !node.isLocked });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node]
  );
  return (
    <div
      draggable
      className={classnest({ [className]: { hoverable: !resizing, dirty: node.isHidden || node.isLocked } })}
      onDragStart={event => {
        event.stopPropagation();
        event.preventDefault();
      }}
    >
      {node.isHidden ? (
        <Button type="text" title="可见" icon={<EyeInvisibleOutlined />} onClick={toggleHidden} />
      ) : (
        <Button type="text" title="临时隐藏" icon={<EyeOutlined />} onClick={toggleHidden} />
      )}
      {node.isLocked ? (
        <Button type="text" title="解锁" icon={<LockOutlined />} onClick={toggleLocked} />
      ) : (
        <Button type="text" title="锁定" icon={<UnlockOutlined />} onClick={toggleLocked} />
      )}
    </div>
  );
};
export default memo(EditorOps);
