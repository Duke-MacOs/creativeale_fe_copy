import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function MusicSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M16 0H0V16H16V0Z" fill="white" fillOpacity="0.01" />
      <path
        d="M9.42865 12.3333H13.2382M14.0001 14L13.2382 12.3333L14.0001 14ZM8.66675 14L9.42865 12.3333L8.66675 14ZM9.42865 12.3333L11.3334 8L13.2382 12.3333H9.42865Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33325 1.99994L5.66659 2.99994"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 3.66663H9.33333" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M3.33325 5.33325C3.33325 5.33325 3.92975 7.42022 5.42099 8.57962C6.91219 9.73905 9.33325 10.6666 9.33325 10.6666"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.66663C8 3.66663 7.4035 6.40576 5.91227 7.92749C4.42107 9.44923 2 10.6666 2 10.6666"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
