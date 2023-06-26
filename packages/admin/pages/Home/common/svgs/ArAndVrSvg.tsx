import React from 'react';

interface ISvgProps {
  width: number;
  height: number;
  fill?: string;
  style?: React.CSSProperties;
}

export default function ArAndVrSvg(props: ISvgProps) {
  const { fill, style, width, height } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M15.0769 0H0V15.0941H15.0769V0Z" fill="white" fillOpacity="0.01" />
      <path
        d="M8.92042 8.92046C10.0019 7.83901 9.32001 5.40376 7.39742 3.48118C5.47484 1.5586 3.03959 0.876727 1.95814 1.95818C0.87669 3.03963 1.55856 5.47488 3.48114 7.39746C5.40372 9.32004 7.83897 10.0019 8.92042 8.92046Z"
        stroke={fill}
        strokeWidth="1.23077"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.92043 6.17378C10.0019 7.25523 9.32001 9.69048 7.39743 11.6131C5.47485 13.5356 3.03959 14.2175 1.95814 13.1361C0.87669 12.0546 1.55856 9.61936 3.48114 7.69678C5.40372 5.77419 7.83897 5.09232 8.92043 6.17378Z"
        stroke={fill}
        strokeWidth="1.23077"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.15648 8.92046C5.07502 7.83901 5.75689 5.40376 7.67948 3.48118C9.60206 1.5586 12.0373 0.876726 13.1188 1.95818C14.2002 3.03963 13.5183 5.47488 11.5958 7.39746C9.67318 9.32005 7.23793 10.0019 6.15648 8.92046Z"
        stroke={fill}
        strokeWidth="1.23077"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.15648 6.17378C5.07503 7.25523 5.7569 9.69048 7.67948 11.6131C9.60206 13.5356 12.0373 14.2175 13.1188 13.1361C14.2002 12.0546 13.5183 9.61936 11.5958 7.69678C9.67318 5.77419 7.23793 5.09233 6.15648 6.17378Z"
        stroke={fill}
        strokeWidth="1.23077"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
