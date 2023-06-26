import React, { memo, useLayoutEffect, useState } from 'react';
import { useSetReflines } from '../hooks/useReflines';
import { useUpdateEffect } from '@byted/hooks';
import { useMovable } from '@editor/hooks';

const JumpingLine = memo(({ start, end, selected, onChange }: any) => {
  const { accumulative: acc, activate, activated } = useMovable(-end, Number.MAX_SAFE_INTEGER);
  const [offset, setOffset] = useState(0);
  const setReflines = useSetReflines();
  useLayoutEffect(() => {
    if (activated) {
      setOffset(setReflines([end], acc));
    }
  }, [end, acc, activated, setReflines]);
  useUpdateEffect(() => {
    if (!activated && accumulative) {
      onChange(end + accumulative);
    }
    setReflines([], 0);
    setOffset(0);
  }, [activated]);
  const accumulative = acc + offset;
  const width = Math.abs(end - start + accumulative);
  const color = selected ? 'red' : '#0dce8a';
  const border = `solid 1px ${color}`;
  return (
    <div
      style={{
        height: 1,
        position: 'absolute',
        top: 10,
        left: 10,
        width: `${width}px`,
        zIndex: -1,
        backgroundColor: color,
        transformOrigin: '0 50%',
        transform: `rotateY(${end + accumulative < start ? '180deg' : '0deg'})`,
        pointerEvents: selected ? 'inherit' : 'none',
      }}
      onMouseDown={event => {
        event.stopPropagation();
      }}
    >
      <div
        style={{
          position: 'absolute',
          height: 32,
          width: 5,
          right: end + accumulative < start ? -2 : -3,
          top: -16,
          padding: '0 2px',
          cursor: selected && !activated ? 'ew-resize' : undefined,
        }}
        onMouseDown={event => {
          if (selected) {
            activate(event);
          }
        }}
      >
        <div
          style={{
            height: 32,
            width: 1,
            background: color,
          }}
        />
        <div
          style={{
            width: 9,
            height: 9,
            position: 'absolute',
            top: 12,
            right: 4,
            borderTop: border,
            borderRight: border,
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    </div>
  );
});

export default JumpingLine;
