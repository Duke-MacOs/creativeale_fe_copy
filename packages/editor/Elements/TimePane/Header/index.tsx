import React, { memo } from 'react';
import { TypeIconProps } from './NodeSpan/NodeIcon';
import NodeSpan, { NodeSpanProps } from './NodeSpan';
import './style.scss';
import { css, cx } from 'emotion';
import { theme } from 'antd';

export * from './utils';
export const CNP = 'editor-timeline-scene-header';

export type HeaderNode = {
  id: number;
  type: TypeIconProps['type'];
  name: React.ReactNode;
  enabled?: boolean;
  visible?: boolean;
  isCollapsed?: boolean | undefined;
  children: number;
  isHidden?: boolean | undefined;
  isLocked?: boolean | undefined;
  depth: number;
  maskDepths: number[];
  asMask?: boolean;
};

export interface HeaderProps extends Omit<NodeSpanProps, 'node'> {
  nodes: Array<NodeSpanProps['node']>;
  onReWidth(event: React.MouseEvent): void;
}

const Header = ({ nodes, resizing, onReWidth }: HeaderProps) => {
  const { token } = theme.useToken();
  return (
    <div
      className={cx(
        `${CNP}-main`,
        css({
          background: token.colorBgContainer,
        })
      )}
    >
      {nodes.map(node => (
        <NodeSpan key={node.id} node={node} resizing={resizing} />
      ))}
      <div
        style={{
          position: 'absolute',
          width: 17,
          height: '100%',
          top: 0,
          right: -8,
        }}
        onMouseDown={event => {
          event.stopPropagation();
        }}
      >
        <div style={{ width: 5, margin: '0 auto', height: '100%', cursor: 'ew-resize' }} onMouseDown={onReWidth} />
      </div>
    </div>
  );
};

export default memo(Header);
