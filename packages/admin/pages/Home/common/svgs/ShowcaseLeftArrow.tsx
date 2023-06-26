import React from 'react';

interface ISvgProps {
  active: boolean;
  backgroundOpacity?: number;
}

export default function SwiperLeftArrow(props: ISvgProps) {
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
          <path
            d="M-0.0332031 24L23.9668 24L23.9668 0L-0.0332052 2.09815e-06L-0.0332031 24Z"
            fill="white"
            fillOpacity="0.01"
          />
          <path
            d="M5.9668 11.9961L17.9668 11.9961"
            stroke={active ? '#ffffff' : '#333333'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.9668 18L5.9668 12L11.9668 6"
            stroke={active ? '#ffffff' : '#333333'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0">
            <rect width="24.0167" height="24" fill="white" transform="translate(24.0254 24) rotate(180)" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
