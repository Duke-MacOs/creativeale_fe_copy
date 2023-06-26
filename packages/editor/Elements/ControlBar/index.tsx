import React from 'react';

import PlayControl, { PlayControlProps } from './views/PlayControl';
import EditControl from './views/EditControl';
import './style.scss';

export const CNP = 'editor-timeline-control-bar';
export interface ControlBarProps extends PlayControlProps {
  onReheight(event: React.MouseEvent): void;
}
export default function ControlBar({ collapsed, onReheight, toggleCollapsed }: ControlBarProps) {
  return (
    <div className={`${CNP}-main`}>
      <EditControl />
      <PlayControl collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      <div
        onMouseDown={onReheight}
        style={{
          position: 'absolute',
          width: '100%',
          height: '6px',
          left: 0,
          top: -3,
          zIndex: 2,
          cursor: 'ns-resize',
        }}
      />
    </div>
  );
}
