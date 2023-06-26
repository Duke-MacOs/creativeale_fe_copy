import React, { FC, useEffect, useRef } from 'react';
import Lottie from 'lottie-web';
import { css } from 'emotion';

interface LottieCoverProps {
  name: string;
  boxRef?: React.RefObject<HTMLDivElement>;
  path: string;
}

const style = {
  container: css({
    maxWidth: '100%',
    maxHeight: '100%',
  }),
};

const LottieCover: FC<LottieCoverProps> = ({ name, boxRef, path }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ani = Lottie.loadAnimation({
      name,
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path,
    });

    function onDataReady() {
      ani.goToAndStop(ani.totalFrames / 2, true);
    }
    ani.addEventListener('data_ready', onDataReady);

    function startPlay() {
      ani.goToAndPlay(0, true);
    }
    function stopPlay() {
      ani.goToAndStop(ani.totalFrames / 2, true);
    }
    function onDataFail(err: any) {
      console.error('Lottie Animation failed:', { errMsg: err.message });
    }
    ani.addEventListener('data_failed', onDataFail);

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
      ani.removeEventListener('data_ready', onDataReady);
      ani.removeEventListener('data_failed', onDataFail);

      ani.destroy();
    };
  }, [name, boxRef, path]);
  return <div ref={containerRef} className={style.container} />;
};

export default LottieCover;
