import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function ImageSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.33329 2.66666H13.6666C14.0348 2.66666 14.3333 2.96513 14.3333 3.33332V12.6667C14.3333 13.0348 14.0348 13.3333 13.6666 13.3333H2.33329C1.9651 13.3333 1.66663 13.0348 1.66663 12.6667V3.33332C1.66663 2.96513 1.9651 2.66666 2.33329 2.66666Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.83337 6C5.10952 6 5.33337 5.77614 5.33337 5.5C5.33337 5.22386 5.10952 5 4.83337 5C4.55723 5 4.33337 5.22386 4.33337 5.5C4.33337 5.77614 4.55723 6 4.83337 6Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.99996 8L6.66663 9.33333L8.66663 7L14.3333 11.3333V12.6667C14.3333 13.0349 14.0348 13.3333 13.6666 13.3333H2.33329C1.9651 13.3333 1.66663 13.0349 1.66663 12.6667V11.3333L4.99996 8Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinejoin="round"
      />
    </svg>
  );
}
