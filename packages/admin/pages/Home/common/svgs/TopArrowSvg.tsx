import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function TopArrowSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M1.5 8L9.94 1.67C9.97556 1.64333 10.0244 1.64333 10.06 1.67L18.5 8"
        stroke={fill}
        strokeWidth="2.85"
        strokeLinecap="round"
      />
    </svg>
  );
}
