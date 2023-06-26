import React, { useRef, useState } from 'react';

interface IMultipleVideoProps {
  firstShowVideoUrl: string;
  loopVideoUrl: string;
}

export default function MultipleVideo(props: IMultipleVideoProps) {
  const { firstShowVideoUrl, loopVideoUrl } = props;
  const [firstShow, setFirstShow] = useState(true);
  const loopVideoElement = useRef<HTMLVideoElement | null>(null);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <video
        muted
        autoPlay
        key={`${firstShowVideoUrl}-first`}
        style={{ opacity: firstShow ? 1 : 0, position: 'absolute' }}
        onEnded={() => {
          setFirstShow(false);
          loopVideoElement.current?.play();
        }}
      >
        <source src={firstShowVideoUrl} type="video/mp4" />
      </video>
      <video
        muted
        loop
        ref={loopVideoElement}
        key={`${loopVideoUrl}-loop`}
        style={{ opacity: firstShow ? 0 : 1, position: 'absolute' }}
      >
        <source src={loopVideoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
