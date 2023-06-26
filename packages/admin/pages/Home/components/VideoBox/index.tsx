import { LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useInViewOnce } from '../../common/hooks/useInViewOnce';
import VideoControl from './components/VideoControl';
import { VIDEO_STATUS } from './constants';
import './style.less';

interface IVideoBoxProps {
  autoPlay: boolean;
  src?: string;
  videoStyle?: React.CSSProperties;
  needPause?: boolean;
  pauseOtherVideo?: () => void;
}

const VIDEO_CENTER_ICON = {
  PLAY: 'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/cc7dea6c92014385a55bbc717423a61d.png~tplv-hhc0kcolqq-image.image',
  REPLAY:
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/e79d2adc05ee4ca796ea252077a37207.png~tplv-hhc0kcolqq-image.image',
};

export default function VideoBox(props: IVideoBoxProps) {
  const { src, autoPlay, videoStyle, needPause, pauseOtherVideo } = props;

  if (!src) {
    return null;
  }

  const { ref, inView } = useInViewOnce();
  const [videoStatus, setVideoStatus] = useState(VIDEO_STATUS.PAUSE);
  const [videoMute, setVideoMute] = useState(true);
  const [showControl, setShowControl] = useState(false);
  const [showMask, setShowMask] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showReplayIcon, setShowReplayIcon] = useState(false);
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(true);

  const handleVideoStatusChange = () => {
    if (loading) return;
    if (videoStatus === VIDEO_STATUS.PLAY) {
      setVideoStatus(VIDEO_STATUS.PAUSE);
    } else if (videoStatus === VIDEO_STATUS.PAUSE) {
      setVideoStatus(VIDEO_STATUS.PLAY);
    } else if (videoStatus === VIDEO_STATUS.END) {
      setVideoStatus(VIDEO_STATUS.PLAY);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      if (inView && videoElement.current) {
        videoElement.current.currentTime = 0;
        setVideoStatus(VIDEO_STATUS.PLAY);
      }
    } else {
      setShowMask(true);
      setShowPlayIcon(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => {
    if (videoStatus === VIDEO_STATUS.PLAY) {
      // 如果已经播到最后了，那么从头开始播
      if (
        videoElement.current?.currentTime &&
        videoElement.current?.duration &&
        videoElement.current?.currentTime === videoElement.current?.duration
      ) {
        videoElement.current.currentTime = 0;
      }
      videoElement.current?.play().catch(e => e);
      setShowMask(false);
      setShowPlayIcon(false);
      setShowReplayIcon(false);
      if (pauseOtherVideo) {
        pauseOtherVideo();
      }
    } else if (videoStatus === VIDEO_STATUS.PAUSE) {
      videoElement.current?.pause();
      setShowMask(false);
      setShowPlayIcon(true);
      setShowReplayIcon(false);
    } else if (videoStatus === VIDEO_STATUS.END) {
      videoElement.current?.pause();
      setShowMask(true);
      setShowPlayIcon(false);
      setShowReplayIcon(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoStatus]);

  useEffect(() => {
    const videoEndHandler = () => {
      setVideoStatus(VIDEO_STATUS.END);
    };
    const videoDom = videoElement.current;
    videoDom?.addEventListener('ended', videoEndHandler);
    return () => {
      videoDom?.removeEventListener('ended', videoEndHandler);
    };
  }, []);

  useEffect(() => {
    if (needPause) {
      setVideoStatus(VIDEO_STATUS.PAUSE);
    }
  }, [needPause]);

  return (
    <div
      ref={ref}
      className="video-box"
      onMouseEnter={() => {
        setShowControl(true);
      }}
      onMouseLeave={() => {
        setShowControl(false);
      }}
    >
      <div className="video-box-video-wrapper" onClick={handleVideoStatusChange}>
        <video
          className="video-box-video-element"
          muted={videoMute}
          src={src}
          ref={videoElement}
          style={videoStyle}
          onLoadedData={() => setLoading(false)}
        />
        {loading ? (
          <LoadingOutlined className="video-box-center-icon" />
        ) : (
          <>
            {showPlayIcon && <img className="video-box-center-icon" src={VIDEO_CENTER_ICON.PLAY} />}
            {showReplayIcon && <img className="video-box-center-icon" src={VIDEO_CENTER_ICON.REPLAY} />}
            {showMask && <div className="video-box-video-mask" />}
            <VideoControl
              show={showControl}
              videoElement={videoElement.current}
              videoStatus={videoStatus}
              mute={videoMute}
              handleVideoStatusChange={handleVideoStatusChange}
              handleVideoMuteChange={() => {
                setVideoMute(!videoMute);
              }}
              setVideoStatus={setVideoStatus}
              canDragProgress={autoPlay}
            />
          </>
        )}
      </div>
    </div>
  );
}
