import { useEffect, useRef, useState } from 'react';
import { VIDEO_STATUS } from '../../constants';
import './style.less';

interface IVideoControlProps {
  show: boolean;
  videoElement: HTMLVideoElement | null;
  videoStatus: VIDEO_STATUS;
  mute: boolean;
  handleVideoMuteChange: () => void;
  handleVideoStatusChange: () => void;
  setVideoStatus: (videoStatus: VIDEO_STATUS) => void;
  canDragProgress?: boolean;
}

let progressTimer: any = null; // 进度 timer

const VIDEO_STATUS_ICON_MAP = {
  [VIDEO_STATUS.PLAY]:
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/9ea026de0a09419aa0338ff7b32845d6.png~tplv-hhc0kcolqq-image.image',
  [VIDEO_STATUS.PAUSE]:
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/cc7dea6c92014385a55bbc717423a61d.png~tplv-hhc0kcolqq-image.image',
  [VIDEO_STATUS.END]:
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/e79d2adc05ee4ca796ea252077a37207.png~tplv-hhc0kcolqq-image.image',
};

export default function VideoControl(props: IVideoControlProps) {
  const {
    show,
    videoElement,
    videoStatus,
    mute,
    handleVideoMuteChange,
    handleVideoStatusChange,
    setVideoStatus,
    canDragProgress,
  } = props;

  const progressWrapper = useRef<HTMLDivElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [dragProgress, setDragProgress] = useState(false);

  if (!videoElement) {
    return null;
  }

  const formatTime = (time: number) => {
    const interval = Math.floor(time);
    const minute = Math.floor(interval / 60)
      .toString()
      .padStart(2, '0');
    const second = (interval % 60).toString().padStart(2, '0');
    return `${minute}:${second}`;
  };

  const getProgressDragCurrentTime = (clientX: number, duration: number, element: HTMLDivElement) => {
    const progressCurrentLength = clientX - element.getBoundingClientRect().left - document.documentElement.scrollLeft;
    const percent = progressCurrentLength / element.offsetWidth;
    return percent * duration;
  };

  const handleVideoTimeChange = () => {
    setCurrentTime(videoElement.currentTime);
  };

  useEffect(() => {
    if (videoStatus === VIDEO_STATUS.PLAY) {
      progressTimer = setInterval(handleVideoTimeChange, 33);
    }
    return () => {
      clearInterval(progressTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoStatus]);

  return (
    <div className="video-box-control" style={{ visibility: show ? 'visible' : 'hidden' }}>
      <div
        className="video-box-control-progress-wrapper"
        ref={progressWrapper}
        onMouseDown={e => {
          clearInterval(progressTimer);
          if (videoStatus === VIDEO_STATUS.PLAY) {
            setVideoStatus(VIDEO_STATUS.PAUSE);
          }
          videoElement.pause();
          setDragProgress(true);
          if (progressWrapper.current) {
            const dragCurrentTime = getProgressDragCurrentTime(
              e.clientX,
              videoElement.duration,
              progressWrapper.current
            );
            if (dragCurrentTime < videoElement.duration) {
              setCurrentTime(dragCurrentTime);
              videoElement.currentTime = dragCurrentTime;
            }
          }
        }}
        onMouseMove={e => {
          if (dragProgress && progressWrapper.current && canDragProgress) {
            const dragCurrentTime = getProgressDragCurrentTime(
              e.clientX,
              videoElement.duration,
              progressWrapper.current
            );
            if (dragCurrentTime < videoElement.duration) {
              setCurrentTime(dragCurrentTime);
              videoElement.currentTime = dragCurrentTime;
            }
          }
        }}
        onMouseUp={() => {
          setDragProgress(false);
          handleVideoStatusChange();
          progressTimer = setInterval(handleVideoTimeChange, 33);
        }}
        onMouseLeave={() => {
          setDragProgress(false);
        }}
      >
        <div className="video-box-control-progress-background" />
        <div
          className="video-box-control-progress"
          style={{
            width: `${(currentTime / videoElement.duration) * 100}%`,
          }}
        />
        <div
          className="video-box-control-progress"
          style={{
            width: `${(currentTime / videoElement.duration) * 100}%`,
          }}
        />
        <div
          className="video-box-control-progress-anchor"
          style={{
            left: `calc(${(currentTime / videoElement.duration) * 100}% - 4px)`,
          }}
        />
      </div>
      <div className="video-box-control-detail flex-row-space-between">
        <div className="flex-row-left">
          <div className="video-box-control-play-pause-button" onClick={handleVideoStatusChange}>
            <img width={16} height={16} src={VIDEO_STATUS_ICON_MAP[videoStatus]} />
          </div>
          <div className="video-box-control-time">{`${formatTime(currentTime)} / ${formatTime(
            videoElement.duration
          )}`}</div>
        </div>
        <div className="video-box-control-mute-unmute-button" onClick={handleVideoMuteChange}>
          {mute ? (
            <img
              width={16}
              height={16}
              src="https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/ad11e86cb3154575a3ebe0f1fc557989.png~tplv-hhc0kcolqq-image.image"
            />
          ) : (
            <img
              width={16}
              height={16}
              src="https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/8a4ad31659d34d55a272640f85067546.png~tplv-hhc0kcolqq-image.image"
            />
          )}
        </div>
      </div>
    </div>
  );
}
