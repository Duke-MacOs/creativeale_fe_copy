import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function RightArrowSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 7.62106L7 3H8.52897L12.1498 7.62106L8.52897 12.2421H7L10 7.62106Z"
        fill={fill}
      />
    </svg>
  );
}
