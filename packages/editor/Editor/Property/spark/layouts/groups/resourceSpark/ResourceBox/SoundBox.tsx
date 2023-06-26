import type { ResourceBoxProps } from '.';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Slider, Typography } from 'antd';
import { PauseOne, Play } from '@icon-park/react';
import Icon from '@ant-design/icons';
import { absoluteUrl } from '@shared/utils';
import { css, cx, keyframes } from 'emotion';
import { Cover } from './Cover';
import Actions from './Actions';
import dayjs from 'dayjs';

export const hoverClass = css({
  transition: '200ms',
  borderRadius: 4,
  ':hover': {
    boxShadow: '0 0 0 2px rgb(57 85 246 / 20%)',
  },
});

export const appearing = css({
  animation: `${keyframes`
  from {
    background: transparent;
    box-shadow: none;
  }
  50% {
    background: rgb(238, 243, 254);
    box-shadow: 0 0 0 2px rgb(57 85 246 / 20%);
  }
  to {
    background: transparent;
    box-shadow: none;
  }
`} 1s`,
});

const PauseFilled = (props: any) => <PauseOne {...props} theme="filled" size="32" fill="#333" />;
const PlayFilled = (props: any) => <Play {...props} theme="filled" size="32" fill="#333" />;

export const SoundBox = ({
  url,
  name,
  type,
  extra,
  required,
  baseType = type,
  deletable = false,
  visitable = false,
  hoverable = true,
  playable = !hoverable,
  domRef,
  onAction,
  onChange,
  onReplaceAll,
}: ResourceBoxProps) => {
  const { ref, duration, current, playing, setCurrent, setPlaying, onTimeUpdate, onLoadedMetadata } = useDuration(!url);
  return (
    <div
      ref={domRef}
      className={cx(
        hoverable && hoverClass,
        domRef && appearing,
        css({
          border: '1px solid #f0f0f0',
          alignItems: 'center',
          display: 'flex',
          height: 64,
        }),
        required && !url && css({ border: '1px solid #f65656' })
      )}
    >
      <Cover
        size={62}
        type="Sound"
        playable={playable}
        onAction={onAction}
        extra={
          url && (
            <Button
              size="large"
              type="text"
              className={css({ position: 'absolute', opacity: 0.62, background: 'none' })}
              icon={<Icon component={playing ? PauseFilled : PlayFilled} />}
              onClick={() => setPlaying(playing => !playing)}
            />
          )
        }
      />
      <div
        className={css({
          flex: 'auto',
          padding: '6px 8px',
          borderLeft: '1px solid #f0f0f0',
          justifyContent: 'space-between',
          flexDirection: 'column',
          display: 'flex',
        })}
      >
        <div className={css({ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' })}>
          <div>{name || (url ? '(未命名)' : '请上传资源')}</div>
          <Actions
            plain
            url={url}
            name={name}
            type={type}
            extra={extra}
            baseType={baseType}
            deletable={deletable}
            visitable={visitable}
            hoverable={hoverable}
            onAction={onAction}
            onChange={onChange}
            onReplaceAll={onReplaceAll}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Slider
            value={Math.floor((current / (duration || 1)) * 1000)}
            max={1000}
            step={1}
            min={0}
            style={{ flex: 'auto', margin: '0 8px', width: 'auto' }}
            onChange={value => {
              setCurrent((value * duration) / 1000);
            }}
            tooltip={{
              formatter: () =>
                dayjs(current * 1000)
                  .format('mm:ss.SSS')
                  .slice(0, -1),
            }}
          />
          <Typography.Text type="secondary">
            {dayjs(duration * 1000)
              .format('mm:ss.SSS')
              .slice(0, -1)}
          </Typography.Text>
        </div>
        {url && (
          <audio
            src={absoluteUrl(url)}
            ref={ref}
            preload="metadata"
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
          />
        )}
      </div>
    </div>
  );
};

const useDuration = (noValue: boolean) => {
  type TimeEvent = React.SyntheticEvent<HTMLAudioElement, Event>;
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const ref = useRef<HTMLAudioElement>(null);
  const onTimeUpdate = (event: TimeEvent) => {
    const currentTime = event.currentTarget.currentTime;
    if (currentTime < duration) {
      setCurrent(currentTime);
    } else {
      setCurrent(duration);
      setPlaying(false);
    }
  };
  const onLoadedMetadata = (event: TimeEvent) => {
    setDuration(event.currentTarget.duration);
  };
  useEffect(() => {
    if (noValue) {
      setPlaying(false);
      setDuration(0);
      setCurrent(0);
    }
  }, [noValue]);
  useEffect(() => {
    if (ref.current) {
      playing ? ref.current.play() : ref.current.pause();
    }
  }, [playing]);
  useEffect(() => {
    if (ref.current && !playing) {
      ref.current.currentTime = current;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);
  return {
    ref,
    current,
    playing,
    duration,
    setPlaying,
    onTimeUpdate,
    onLoadedMetadata,
    setCurrent: useCallback((value: number) => {
      setCurrent(value);
      setPlaying(false);
    }, []),
  };
};
