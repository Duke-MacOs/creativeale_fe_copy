import React, { useRef, useEffect, useState, CSSProperties, ReactNode } from 'react';
import style from './style';
import playButton from './playButton.svg';

interface Props {
  boxRef?: React.RefObject<HTMLDivElement>;
  path: string;
  customStyle?: CSSProperties;
  playIcon?: ReactNode;
  onLoad?: (instance?: HTMLVideoElement) => void;
}

export default ({ path, boxRef, customStyle, playIcon = undefined, onLoad }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canPlayRef = useRef(false);
  const [buttonVisible, setButtonVisible] = useState(true);

  useEffect(() => {
    function startPlay() {
      if (canPlayRef.current) {
        videoRef.current?.play();
        setButtonVisible(false);
      }
    }
    function stopPlay() {
      if (videoRef.current && canPlayRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setButtonVisible(true);
      }
    }
    if (boxRef) {
      boxRef.current?.addEventListener('mouseenter', startPlay);
      boxRef.current?.addEventListener('mouseleave', stopPlay);
    }
    return () => {
      if (boxRef) {
        stopPlay();
        boxRef.current?.removeEventListener('mouseenter', startPlay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        boxRef.current?.removeEventListener('mouseleave', stopPlay);
      }
    };
  }, [boxRef, path]);
  return (
    <div style={customStyle} className={style.videoWrapper}>
      {playIcon === undefined ? (
        <img
          className={style.videoButton}
          src={playButton}
          style={{ visibility: buttonVisible ? 'visible' : 'hidden' }}
        />
      ) : (
        playIcon
      )}
      <video
        ref={videoRef}
        preload="metadata"
        style={customStyle}
        className={style.img}
        src={path}
        onCanPlay={() => {
          canPlayRef.current = true;
        }}
        onLoadedMetadata={() => {
          videoRef.current && onLoad?.(videoRef.current);
        }}
      />
    </div>
  );
};
