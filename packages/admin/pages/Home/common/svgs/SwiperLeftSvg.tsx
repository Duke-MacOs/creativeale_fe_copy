import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  active: boolean;
  style?: React.CSSProperties;
}

export default function SwiperLeftSvg(props: ISvgProps) {
  const { active, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle opacity={active ? '1' : '0.05'} r="20" transform="matrix(-1 0 0 1 20 20)" fill="#161823" />
      <path
        opacity={active ? '1' : '0.5'}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.532 20.5L23 15H20.5684L15 20.5L20.5684 26H23L17.532 20.5Z"
        fill={active ? '#FAFBFE' : '#161823'}
      />
    </svg>
  );
}
