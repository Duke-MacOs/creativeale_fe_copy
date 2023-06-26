import Icon from '@ant-design/icons';
import { usePersistCallback } from '@byted/hooks';
import {
  changeEditor,
  changeMoment,
  ISceneState,
  joinDuration,
  maxEndTime,
  pauseIcon,
  playIcon,
  useEditor,
  usePlaying,
} from '@editor/aStore';
import { useMovable } from '@editor/hooks';
import { classnest, getScene } from '@editor/utils';
import { Down, VolumeMute, VolumeNotice, VolumeSmall } from '@icon-park/react';
import { Button, Layout, Popover, Select, Slider, theme, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { css } from 'emotion';
import { useEffect, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch, useSelector, useStore } from 'react-redux';

const timeline = css({ flex: 'auto', background: '#eee', borderRadius: 4, margin: '0 16px', position: 'relative' });
const handler = css({
  position: 'absolute',
  right: -14,
  top: -4,
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: '4px solid #0dce8a',
  transition: '200ms',
  opacity: 0,
  [`&:hover, &-activated, .${timeline}:hover &`]: {
    opacity: 1,
  },
});

export const PlayButton = ({ totalTime }: { totalTime: number }) => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const { playing, disabled, onPlayOrStop } = usePlaying();
  const onClick = usePersistCallback((event: any) => {
    event.preventDefault();
    const {
      editor: { moment },
    } = getScene(getState().project);
    if (playing) {
      dispatch(changeMoment(Math.min(moment, totalTime)));
    } else {
      dispatch(changeMoment(0));
      onPlayOrStop();
    }
  });
  useHotkeys('space', onClick);
  return (
    <Tooltip title={['播放', '停止'][playing % 2]}>
      <Button type="text" disabled={disabled} icon={[playIcon, pauseIcon][playing % 2]} onClick={onClick} />
    </Tooltip>
  );
};

export default function TimeLine({
  scene: {
    editor: { moment, selected },
    nodes,
  },
}: {
  scene: ISceneState;
}) {
  const totalTime = useMemo(() => Math.max(maxEndTime(nodes, true, 0), 5000), [nodes]);
  const { playRate, onChange: onChangePlayRate } = useEditor(0, 'playRate');
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [start, end, selectedNodes] = useMemo(() => {
    return joinDuration(nodes, Object.keys(selected).map(Number));
  }, [nodes, selected]);
  const soundVolume = useSelector(
    ({
      project: {
        editor: { soundVolume },
      },
    }: EditorState) => soundVolume
  );
  const { accumulative, activated, activate } = useMovable();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const anchor = useMemo(() => moment, [activated]);
  useEffect(() => {
    if (accumulative && ref.current) {
      const moment = anchor + Math.floor(totalTime * (accumulative / ref.current.offsetWidth));
      dispatch(changeMoment(Math.max(Math.min(moment, totalTime), 0)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accumulative]);
  const { token } = theme.useToken();

  return (
    <Layout.Content
      style={{
        userSelect: 'none',
        position: 'absolute',
        width: '100%',
        bottom: 0,
        left: 0,
      }}
    >
      <div
        style={{
          background: token.colorBgContainer,
          boxShadow: '0px -2px 8px rgba(0,0,0,0.08)',
          borderRadius: 4,
          alignItems: 'center',
          padding: '12px 16px',
          display: 'flex',
          cursor: 'pointer',
          margin: 16,
          height: 42,
        }}
      >
        <PlayButton totalTime={totalTime} />
        <Popover
          trigger="click"
          content={
            <Slider
              vertical
              value={soundVolume}
              style={{ height: '100px' }}
              onChange={(value: number) => {
                dispatch(changeEditor(0, { soundVolume: value }, true));
              }}
              tooltip={{
                open: false,
              }}
            />
          }
        >
          <Button
            type="text"
            icon={
              <Icon
                component={[VolumeMute, VolumeSmall, VolumeNotice][soundVolume && Math.ceil(soundVolume / 50)] as any}
              />
            }
          />
        </Popover>
        <Select
          bordered={false}
          size="small"
          value={playRate}
          onChange={value => onChangePlayRate(value, true)}
          suffixIcon={<Icon component={Down as any} />}
          style={{ background: '#f5f5f5', borderRadius: 4 }}
        >
          {[0.1, 0.2, 0.5, 1, 1.5].map(value => (
            <Select.Option key={value} value={value} title={`播放速度x${value}`}>
              {value.toFixed(1)}倍速
            </Select.Option>
          ))}
        </Select>
        <div
          ref={ref}
          className={timeline}
          onMouseDown={event => {
            const { currentTarget, clientX } = event;
            const rect = currentTarget.getBoundingClientRect();
            dispatch(changeMoment(Math.floor(totalTime * ((clientX - rect.left) / currentTarget.offsetWidth))));
            activate(event);
          }}
        >
          {end > start && (
            <div
              style={{
                position: 'absolute',
                background: '#8E9CED',
                borderRadius: 4,
                height: 20,
                lineHeight: '20px',
                textAlign: 'center',
                overflow: 'hidden',
                fontSize: '12px',
                color: 'white',
                top: 0,
                left: `${(start / totalTime) * 100}%`,
                width: `${((end - start) / totalTime) * 100}%`,
              }}
            >
              {selectedNodes.map(({ name }) => name).join('，')}
            </div>
          )}
          <div
            style={{
              width: `${Math.min(moment / totalTime, 1) * 100}%`,
              borderRadius: 4,
              background: '#0dce8ac0',
              position: 'relative',
              height: 20,
            }}
          >
            <div className={classnest({ [handler]: { activated } })} />
          </div>
        </div>
        {dayjs(moment).format('mm:ss.SSS').slice(0, -1)}
      </div>
    </Layout.Content>
  );
}
