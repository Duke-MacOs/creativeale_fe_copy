import React, { memo } from 'react';
import className from './style';

export interface TimeCursorProps {
  length: number;
  offset: number;
}
const TimeCursor = React.forwardRef(({ offset, length }: TimeCursorProps, ref) => {
  return (
    <div
      className={className.container}
      style={{
        left: `${offset}px`,
      }}
    >
      <svg ref={ref as React.RefObject<SVGSVGElement>} height="13" width="9" className={className.handle}>
        <polyline
          points="0,9 4,13 5,13 9,9"
          style={{
            fill: '#0dce8a',
            stroke: '#0dce8a',
            strokeWidth: '1',
          }}
        />
        <polyline
          points="0,9 0,0 9,0 9,9"
          style={{
            fill: '#0dce8a',
            stroke: '#0dce8a',
            strokeWidth: '2',
          }}
        />
      </svg>
      <div
        style={{
          width: '1px',
          height: `${length}px`,
          backgroundColor: '#0dce8a',
          pointerEvents: 'none',
          position: 'absolute',
          opacity: 0.6,
          top: '13px',
        }}
      />
    </div>
  );
});
export default memo(TimeCursor);
