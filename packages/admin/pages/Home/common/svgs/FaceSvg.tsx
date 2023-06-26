import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function FaceSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M16 0H0V16H16V0Z" fill="white" fillOpacity="0.01" />
      <path
        d="M11.3334 1.33337H14.6667V4.66671M14.6667 11.3334V14.6667H11.3334M4.66671 14.6667H1.33337V11.3334M1.33337 4.66671V1.33337H4.66671"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99992 13.3334C10.5773 13.3334 12.6666 10.9456 12.6666 8.00008C12.6666 5.05455 10.5773 2.66675 7.99992 2.66675C5.42259 2.66675 3.33325 5.05455 3.33325 8.00008C3.33325 10.9456 5.42259 13.3334 7.99992 13.3334Z"
        stroke={fill}
        strokeWidth="1.33333"
      />
      <path d="M2 8.00277L14 8" stroke={fill} strokeWidth="1.33333" strokeLinecap="round" />
      <path
        d="M6.68982 10.702C7.11245 11.0144 7.54915 11.1706 7.99992 11.1706C8.45069 11.1706 8.89939 11.0144 9.34599 10.702"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
      />
    </svg>
  );
}
