import React from 'react';

interface ISvgProps {
  active: boolean;
  backgroundOpacity?: number;
}

export default function SwiperRightArrow(props: ISvgProps) {
  const { active, backgroundOpacity } = props;

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: active ? '#161823' : `rgba(243,245,250,${backgroundOpacity ? backgroundOpacity : '1'})`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" width={25} height={24}>
        <g clipPath="url(#clip0)">
          <path d="M23.0674 0H-0.932617V24H23.0674V0Z" fill="white" fillOpacity="0.01" />
          <path
            d="M17.0674 12.0039H5.06738"
            stroke={active ? '#ffffff' : '#333333'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.0674 6L17.0674 12L11.0674 18"
            stroke={active ? '#ffffff' : '#333333'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0">
            <rect width="24.0167" height="24" fill="white" transform="translate(0.00878906)" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
