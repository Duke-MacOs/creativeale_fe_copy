import React from 'react';
import xBottom from './底部.png';
import xTop from './顶部.png';
import xUp from './上滑.png';
import xCv from './转化.png';

export default (
  iframe: React.ReactNode,
  loading: boolean,
  endCard: React.ReactNode,
  _onAndroid: boolean,
  onAction: (action: 'download') => void
) => (
  <>
    <div style={{ display: 'flex', flex: 'auto', flexDirection: 'column', position: 'relative' }}>
      {iframe}
      {endCard}
    </div>
    <div style={{ flex: 'none', position: 'absolute', left: 0, bottom: 0 }}>
      <img
        src={xBottom}
        style={{ width: '100%', objectFit: 'contain', background: '#EF8CFF44' }}
        onClick={event => event.stopPropagation()}
      />
      {!loading && !endCard && (
        <div style={{ position: 'absolute', transform: 'translateY(-100%)', top: 0, left: 0 }}>
          <img
            src={xUp}
            style={{
              width: '100%',
              objectFit: 'contain',
              background: '#EF8CFF44',
            }}
            onClick={event => event.stopPropagation()}
          />
          <img
            src={xCv}
            useMap="#image_map_se"
            style={{
              width: '96%',
              objectFit: 'contain',
              position: 'absolute',
              top: 0,
              left: '2%',
            }}
            onClick={event => {
              event.stopPropagation();
              const {
                currentTarget: { offsetWidth, offsetHeight },
                nativeEvent: { offsetX, offsetY },
              } = event;
              // 702 * 104 为图片分辨率
              const y = (offsetY / offsetHeight) * 104;
              const x = (offsetX / offsetWidth) * 702;
              // (498, 24) 为按钮左上角
              // (678, 80) 为按钮右下角
              if (498 <= x && 24 <= y && x <= 678 && y <= 80) {
                onAction('download');
              }
            }}
          />
        </div>
      )}
    </div>
    <img
      src={xTop}
      style={{
        width: '100%',
        objectFit: 'contain',
        position: 'absolute',
        background: '#EF8CFF44',
        top: 0,
        left: 0,
      }}
      onClick={event => event.stopPropagation()}
    />
  </>
);
