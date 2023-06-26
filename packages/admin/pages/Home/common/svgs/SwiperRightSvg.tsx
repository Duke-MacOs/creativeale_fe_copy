import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  active: boolean;
  style?: React.CSSProperties;
}

export default function SwiperRightSvg(props: ISvgProps) {
  const { active, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle opacity={active ? '1' : '0.05'} r="20" transform="matrix(-1 0 0 1 20 20)" fill="#161823" />
      <path
        opacity={active ? '1' : '0.5'}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.468 20.5L17 15H19.4316L25 20.5L19.4316 26H17L22.468 20.5Z"
        fill={active ? '#FAFBFE' : '#161823'}
      />
    </svg>
  );
}
