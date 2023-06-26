import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function TextSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" style={style}>
      <path d="M16 0H0V16H16V0Z" fill="white" fillOpacity="0.01" />
      <path
        d="M10.6667 2.00006H14.0001V5.33339"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.39579 9.00004H9.60413M5.66663 10.6667L6.39579 9.00004L5.66663 10.6667ZM10.3333 10.6667L9.60413 9.00004L10.3333 10.6667ZM6.39579 9.00004L7.99996 5.33337L9.60413 9.00004H6.39579Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33333 2.00006H2V5.33339"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 14H14.0001V10.6667"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33333 14H2V10.6667"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
