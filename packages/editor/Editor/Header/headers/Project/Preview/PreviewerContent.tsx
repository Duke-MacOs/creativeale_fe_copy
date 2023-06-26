import React, { useEffect, useRef, forwardRef, useMemo, useState } from 'react';
import endCardUrl from './end_card.png';
import { css } from 'emotion';
import iframeSE from './se';
import iframe12 from './12';

const getEndCard = (onAction: (action: 'download' | 'replay') => void) => (
  <img
    src={endCardUrl}
    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', left: 0, top: 0 }}
    onClick={({ currentTarget: { offsetWidth, offsetHeight }, nativeEvent: { offsetX, offsetY } }) => {
      // 1500 * 3248 为图片分辨率
      const [W, H] = [1084, 2104];
      if (H / W > offsetHeight / offsetWidth) {
        // 如果图片上下超出内容框
        const y = offsetWidth * (H / W - offsetHeight / offsetWidth);
        offsetHeight += y;
        offsetY += y / 2;
      } else {
        // 如果图片左右超出内容框
        const x = offsetHeight * (W / H - offsetWidth / offsetHeight);
        offsetWidth += x;
        offsetX += x / 2;
      }
      const x = (offsetX / offsetWidth) * W;
      const y = (offsetY / offsetHeight) * H;
      // (47, 1456) 为按钮左上角
      // (1040, 1584) 为按钮右下角
      if (47 <= x && 1456 <= y && x <= 1040 && y <= 1584) {
        onAction('download');
      }
      // (42, 1635) 为按钮左上角
      // (1035, 1763) 为按钮右下角
      if (42 <= x && 1635 <= y && x <= 1035 && y <= 1763) {
        onAction('replay');
      }
    }}
  />
);

export interface PreviewerContentProps {
  httpUrl: string;
  width: number;
  height: number;
  mask12?: boolean;
  onAndroid?: boolean;
  onEventTracked?: (event: any) => void;
  onReplay: () => void;
}

export const PreviewerContent = forwardRef(
  (
    { httpUrl, width, height, mask12, onAndroid = false, onEventTracked, onReplay }: PreviewerContentProps,
    ref: any
  ) => {
    const [endCard, setEndCard] = useState<React.ReactNode>(null);
    const [loading, setLoading] = useState(true);
    const modalRef = useRef<HTMLIFrameElement>(null);
    const eventDurationRef = useRef(Date.now());
    const [notice, setNotice] = useState(0);
    useEffect(() => {
      if (notice > 0) {
        const id = setTimeout(() => setNotice(0), 600);
        return () => {
          clearTimeout(id);
        };
      }
    }, [notice]);

    useEffect(() => {
      const listener = async ({ data }: MessageEvent) => {
        console.log('data:', data);
        if (data.type === 'track') {
          const { current } = eventDurationRef;
          const duration = (eventDurationRef.current = Date.now()) - current;
          if (data.data.params.current_section === 'section0') {
            data.data.params.current_section = 'loading';
          }
          if (data.data.params.section === 'section0') {
            data.data.params.section = 'loading';
          }
          if (data.data.eventName === 'playableEnd') {
            setEndCard(
              getEndCard(action => {
                switch (action) {
                  case 'download':
                    return setNotice(id => id + 1);
                  case 'replay':
                    return onReplay();
                }
              })
            );
          } else if (data.data.eventName === 'enterSection') {
            if (data.data.params.section_type === 'section_start') {
              setLoading(false);
            }
          } else if (data.data.eventName === 'clickArea') {
            if (data.data.params.convert_area === 1) {
              setNotice(id => id + 1);
            }
          }
          onEventTracked && onEventTracked({ ...data.data, duration });
        }
      };
      window.addEventListener('message', listener);
      return () => {
        window.removeEventListener('message', listener);
      };
    }, []);

    const url = useMemo(() => {
      const url = new URL(httpUrl);
      const xTtEnv = new URL(location.href).searchParams.get('x-tt-env');
      const projectUrl = url.searchParams.get('projectUrl');
      if (xTtEnv && projectUrl) {
        url.searchParams.set('projectUrl', `${projectUrl}?x-tt-env=${xTtEnv}`);
      }
      return url.href;
    }, [httpUrl]);

    const getIframe = () => {
      const iframe = (
        <iframe
          ref={ref}
          title="Preview"
          allow="autoplay"
          style={{ border: 'none', display: 'block', flex: 'auto' }}
          src={url}
        />
      );
      if (mask12 === undefined) {
        return (
          <>
            {iframe}
            {endCard}
          </>
        );
      }
      return mask12
        ? iframe12(iframe, loading, endCard, onAndroid, () => setNotice(id => id + 1))
        : iframeSE(iframe, loading, endCard, onAndroid, () => setNotice(id => id + 1));
    };

    return (
      <div
        ref={modalRef}
        className="global-user-drag-none"
        style={{
          flexDirection: 'column',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          height,
          width,
        }}
      >
        {getIframe()}
        {notice > 0 && (
          <div
            className={css({
              width: 96,
              borderRadius: 4,
              height: 32,
              backgroundColor: '#333',
              padding: 0,
              textAlign: 'center',
              fontSize: 12,
              color: 'white',
              lineHeight: '32px',
              position: 'absolute',
              bottom: '32%',
              left: '50%',
              transform: 'translateX(-50%)',
            })}
          >
            模拟下载成功
          </div>
        )}
      </div>
    );
  }
);
