import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function DataSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M1.40408 7.33331C1.88931 3.94102 4.80672 1.33331 8.33319 1.33331C12.1992 1.33331 15.3332 4.46732 15.3332 8.33331C15.3332 12.1993 12.1992 15.3333 8.33319 15.3333C6.04316 15.3333 4.00996 14.2336 2.73286 12.5336L3.75111 11.7699C4.79601 13.1609 6.45953 14.0606 8.33319 14.0606C11.4963 14.0606 14.0605 11.4964 14.0605 8.33331C14.0605 5.17023 11.4963 2.60604 8.33319 2.60604C5.51123 2.60604 3.16595 4.64698 2.69292 7.33331H3.37335C3.44113 7.33331 3.50708 7.3553 3.56131 7.39596C3.69971 7.49977 3.72776 7.69611 3.62396 7.83452L2.25046 9.66584C2.23265 9.68959 2.21156 9.71069 2.18781 9.72849C2.04941 9.8323 1.85306 9.80425 1.74926 9.66584L0.375761 7.83452C0.335094 7.78029 0.31311 7.71434 0.31311 7.64657C0.31311 7.47356 0.453358 7.33331 0.626362 7.33331H1.40408Z"
        fill="#161823"
      />
      <path
        d="M6.72917 8.99992H9.9375M6 10.6666L6.72917 8.99992L6 10.6666ZM10.6667 10.6666L9.9375 8.99992L10.6667 10.6666ZM6.72917 8.99992L8.33333 5.33325L9.9375 8.99992H6.72917Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}