/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useUpdateEffect } from '@byted/hooks';
import { useMovable, usePrevDeps } from '@editor/hooks';
import { useMoment } from '@editor/aStore';
import { SCALE } from '@editor/utils';
import TimeCursor from './TimeCursor';
import { css } from 'emotion';
import { theme } from 'antd';

const axisLabel = (pos: number, scale: number) => {
  if (pos === 0) {
    return '0';
  }
  if (scale % 100 === 0) {
    return ((pos * scale) / 1000).toFixed(0);
  }
  if (scale % 10 === 0) {
    return ((pos * scale) / 1000).toFixed(1);
  }
  return ((pos * scale) / 1000).toFixed(2);
};
const CURSOR = {
  OFFSET: 4,
} as const;
const cursorMinMax = (moment: number, scale: number, count: number) => {
  const offset = Math.min(Math.floor((moment * SCALE.LENGTH) / scale), count * SCALE.LENGTH);
  return [-offset, count * SCALE.LENGTH - offset, offset + SCALE.OFF_HEAD * SCALE.LENGTH - CURSOR.OFFSET] as const;
};

export interface TimelineProps extends TimeRulerProps {
  length: number;
}

export default function Timeline({ count, scale, length }: TimelineProps) {
  const { token } = theme.useToken();
  const { moment: future, onChange } = useMoment(count * scale);
  const cursorRef = useRef<SVGSVGElement>(null);
  const [consumed, setConsumed] = useState(0);
  const moment = future - consumed;
  const [min, max, offset] = useMemo(() => {
    return cursorMinMax(moment, scale, count);
  }, [moment, scale, count]);
  const { accumulative, activated, activate } = useMovable(min, max);
  useUpdateEffect(() => {
    const consumed = Math.floor(accumulative / SCALE.LENGTH) * scale;
    onChange(moment + consumed);
    setConsumed(consumed);
  }, [Math.floor(accumulative / SCALE.LENGTH)]);
  useEffect(() => {
    if (!activated && accumulative) {
      onChange(moment + SCALE.px2ms(accumulative, scale));
      setConsumed(0);
    }
  }, [activated]);
  useEffect(() => {
    if (cursorRef.current && !activated) {
      cursorRef.current.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
  }, [moment]);
  const shorter = usePrevDeps(([prev], [next]) => prev > next, [count]);
  return (
    <div
      className={css({
        position: 'sticky',
        zIndex: 1,
        top: '0',
        display: 'flex',
        alignItems: 'flex-end',
        userSelect: 'none',
        borderTop: '1px solid #d9d9d9',
        borderBottom: '1px solid #d9d9d9',
        cursor: 'pointer',
        background: token.colorBgLayout,
      })}
      style={{
        width: `${(count + SCALE.OFF_HEAD + SCALE.OFF_TAIL + 1) * SCALE.LENGTH}px`,
        transition: `width ${shorter ? 200 : 0}ms`,
      }}
      onMouseDown={event => {
        const { currentTarget, clientX } = event;
        const rect = currentTarget.getBoundingClientRect();
        onChange(SCALE.px2ms(clientX - rect.left - SCALE.OFF_HEAD * SCALE.LENGTH, scale));
        activate(event);
      }}
    >
      <TimeRuler count={count} scale={scale} />
      <TimeCursor ref={cursorRef} offset={offset + accumulative} length={length * 32} />
    </div>
  );
}
interface TimeRulerProps {
  count: number;
  scale: number;
}
const TimeRuler = memo(({ count, scale }: TimeRulerProps) => (
  <React.Fragment>
    {Array.from({ length: count + SCALE.OFF_HEAD + SCALE.OFF_TAIL + 1 }).map((_, index) => {
      const pos = index - SCALE.OFF_HEAD;
      return (
        <div
          key={pos}
          className={css({
            flex: '1 1 0',
            position: 'relative',
            borderLeft: '1px solid #d9d9d9',
          })}
          style={{ height: `${pos % 10 ? (pos % 5 ? 5 : 8) : 32}px` }}
        >
          {pos % 10 === 0 && (
            <div
              className={css({
                position: 'absolute',
                top: '6px',
                left: '5px',
                fontSize: '10px',
              })}
            >
              {axisLabel(pos, scale)}s
            </div>
          )}
        </div>
      );
    })}
  </React.Fragment>
));
