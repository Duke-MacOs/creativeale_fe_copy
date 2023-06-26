import React, { CSSProperties, FC, useCallback, useRef } from 'react';
import { IMaterial } from '@/types/library';
import style from './style';
import { Categories } from '@shared/config';
import LottiePreview from './LottieCover';
import VideoPreview from './VideoCover';
import AudioPreview from './AudioPreview';
import defaultImage from '@shared/assets/images/default_image.png';
import defaultParticleImage from '@shared/assets/images/default_particle.svg';
import defaultPsdImage from '@shared/assets/images/default_psd.svg';
import { IPlayers } from '@/types';
import { IStoreMaterial } from '@shared/types/store';
import { css } from 'emotion';

interface IMaterialCover {
  data: IMaterial | IStoreMaterial;
  CoverBoxRef?: React.RefObject<HTMLDivElement>;
  players?: IPlayers;
  ref?: any;
  customStyle?: CSSProperties;
  onLoad?: (instance?: HTMLImageElement | HTMLVideoElement | HTMLAudioElement) => void;
  [key: string]: any;
}

const MaterialCover: FC<IMaterialCover> = ({ data, CoverBoxRef, customStyle = {}, onLoad, ...others }) => {
  const instanceRef = useRef<HTMLImageElement>(null);
  const genCover = useCallback(() => {
    const { type, name, previewUrl, cover } = data;
    switch (type.cid) {
      case Categories.image:
        return (
          <img
            ref={instanceRef}
            onLoad={() => {
              instanceRef.current && onLoad?.(instanceRef.current);
            }}
            style={customStyle}
            className={style.img}
            src={previewUrl || cover}
            alt={name}
          />
        );
      case Categories.video:
        return (
          <VideoPreview boxRef={CoverBoxRef} path={previewUrl} customStyle={customStyle} onLoad={onLoad} {...others} />
        );
      case Categories.audio:
        return <AudioPreview boxRef={CoverBoxRef} path={previewUrl} onLoad={onLoad} />;
      case Categories.photoshop:
        return <img className={style.audio} src={defaultPsdImage} alt={name} />;
      case Categories.particles2D:
      case Categories.particles3D:
      case Categories.lottie:
        return (
          <img
            className={cover ? style.img : style.audio}
            style={{ width: '100%', height: '100%' }}
            ref={instanceRef}
            onLoad={() => {
              instanceRef.current && onLoad?.(instanceRef.current);
            }}
            src={cover || defaultParticleImage}
            alt={name}
          />
        );
      case Categories.lottie:
        return <LottiePreview name={name} boxRef={CoverBoxRef} path={previewUrl} />;
      case Categories.editor:
      default:
        return (
          <img
            ref={instanceRef}
            onLoad={() => {
              instanceRef.current && onLoad?.(instanceRef.current);
            }}
            className={style.img}
            src={cover || defaultImage}
            style={customStyle}
            alt={name}
          />
        );
    }
  }, [CoverBoxRef, data]);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {genCover()}
    </div>
  );
};

export default MaterialCover;
