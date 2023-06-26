import React, { FC, useEffect, useRef } from 'react';
import { css } from 'emotion';
import Player from 'xgplayer';
import 'xgplayer/dist/xgplayer.min.css';

const style = {
  video: css({
    outline: 'none',
    '& .xgplayer-progress-btn': {
      background: 'rgba(57, 85, 246,.304093) !important',
      boxShadow: 'none !important',
      border: 'none !important',
    },
    '& .xgplayer-drag': {
      background: '#5676EA !important',
    },
  }),
};

interface VideoPreviewProps {
  url: string;
}

const VideoPreview: FC<VideoPreviewProps> = ({ url }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (wrapperRef.current) {
      const player = new Player({
        id: 'xgVideo',
        url,
        width: '375px',
        height: '667px',
        cssFullscreen: false,
        playbackRate: false,
        commonStyle: {
          playedColor: '#5676EA',
          sliderBtnStyle: { borderColor: 'none' },
        },
      });
      return () => {
        player.destroy(true);
      };
    }
  }, [url]);

  return (
    <div ref={wrapperRef} className={style.video}>
      <div id="xgVideo" />
    </div>
  );
};

export default VideoPreview;
