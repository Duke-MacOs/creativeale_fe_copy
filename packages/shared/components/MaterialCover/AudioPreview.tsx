import React, { useRef, useEffect, useState } from 'react';
import style from './style';
import playButton from './playButton.svg';
import defaultAudioImage from '@shared/assets/images/default_audio.svg';
import { Acoustic } from '@icon-park/react';

interface Props {
  boxRef?: React.RefObject<HTMLDivElement>;
  path: string;
  onLoad?: (instance?: HTMLAudioElement) => void;
}

export default ({ path, boxRef, onLoad }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canPlayRef = useRef(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  useEffect(() => {
    function startPlay() {
      if (canPlayRef.current) {
        audioRef.current?.play();
        setButtonVisible(false);
      }
    }
    function stopPlay() {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setButtonVisible(true);
      }
    }
    if (boxRef) {
      boxRef.current?.addEventListener('mouseenter', startPlay);
      boxRef.current?.addEventListener('mouseleave', stopPlay);
    }
    return () => {
      if (boxRef) {
        boxRef.current?.removeEventListener('mouseenter', startPlay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        boxRef.current?.removeEventListener('mouseleave', stopPlay);
      }
    };
  }, [boxRef, path]);
  return (
    <div className={style.audioWrapper}>
      {buttonVisible ? (
        <img className={style.audioButton} src={defaultAudioImage} />
      ) : (
        <Acoustic theme="outline" size="34" fill="#f5a623" />
      )}
      <audio
        ref={audioRef}
        preload="metadata"
        className={style.img}
        src={path}
        onCanPlay={() => {
          canPlayRef.current = true;
        }}
        onLoadedMetadata={() => {
          audioRef.current && onLoad?.(audioRef.current);
        }}
      />
    </div>
  );
};
