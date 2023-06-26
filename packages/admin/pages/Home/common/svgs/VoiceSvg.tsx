import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function VoiceSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M8.00004 14.6666C11.6819 14.6666 14.6667 11.6819 14.6667 7.99998C14.6667 4.31808 11.6819 1.33331 8.00004 1.33331C4.31814 1.33331 1.33337 4.31808 1.33337 7.99998C1.33337 11.6819 4.31814 14.6666 8.00004 14.6666Z"
        fill="white"
        stroke={fill}
        strokeWidth="1.33333"
      />
      <path d="M10 6V10" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" />
      <path d="M12 7.33331V8.66665" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" />
      <path d="M6 6V10" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" />
      <path d="M4 7.33331V8.66665" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" />
      <path d="M8 4.66669V11.3334" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" />
    </svg>
  );
}
