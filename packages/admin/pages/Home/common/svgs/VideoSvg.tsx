import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function VideoSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M16 0H0V16H16V0Z" fill="transparent" fillOpacity="0.99" />
      <path
        d="M2.00004 2.66669H14C14.3682 2.66669 14.6667 2.96516 14.6667 3.33335V12.6667C14.6667 13.0349 14.3682 13.3334 14 13.3334H2.00004C1.63185 13.3334 1.33337 13.0349 1.33337 12.6667V3.33335C1.33337 2.96516 1.63185 2.66669 2.00004 2.66669Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinejoin="round"
      />
      <path d="M12 2.66669V13.3334" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 2.66669V13.3334" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M7 6.33331L9.66667 7.99998L7 9.66665V6.33331Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinejoin="round"
      />
    </svg>
  );
}
