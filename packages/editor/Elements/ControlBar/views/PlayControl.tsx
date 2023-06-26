import React, { memo } from 'react';
import Icon, { UndoOutlined, RedoOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Slider, Badge, Tooltip, Select, Button, Divider } from 'antd';
import { Down, Up } from '@icon-park/react';
import dayjs from 'dayjs';
import {
  useGrouping,
  usePlaying,
  useOnRedo,
  useOnUndo,
  useEditor,
  useMoment,
  SplitGroupIcon,
  JoinGroupIcon,
  pauseIcon,
  playIcon,
  useEditorHotkeys,
  useSettings,
} from '@editor/aStore';
import { onMacOS } from '@editor/utils';
import { CNP } from '..';

export interface PlayControlProps {
  collapsed: boolean;
  toggleCollapsed(): void;
}
const Moment = memo(() => {
  const { moment } = useMoment();
  // TODO: another format impl.
  return <div className={`${CNP}-moment`}>{dayjs(moment).format('mm:ss.SSS').slice(0, -1)}</div>;
});
export const UndoButton = () => {
  const { canUndo, onUndo } = useOnUndo();
  return (
    <Tooltip title="撤回(⌘+z)">
      <Button type="text" icon={<UndoOutlined />} disabled={!canUndo} onClick={onUndo} />
    </Tooltip>
  );
};
export const RedoButton = () => {
  const { redoSteps, onRedo } = useOnRedo();
  return (
    <Badge size="small" count={redoSteps} offset={[-6, 6]}>
      <Tooltip title="重做(⇧+⌘+z)">
        <Button type="text" icon={<RedoOutlined />} disabled={redoSteps === 0} onClick={onRedo} />
      </Tooltip>
    </Badge>
  );
};
export default function PlayControl({ collapsed, toggleCollapsed }: PlayControlProps) {
  const { canJoinGroup, canSplitGroup, onJoinGroup, onSplitGroup } = useGrouping();
  const { playRate, onChange: onChangePlayRate } = useEditor(0, 'playRate');
  const { playing, disabled, onStopAndReset, onPlayOrStop } = usePlaying();
  const { scale, onChange: onChangeScale } = useEditor('scale');
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  const minusScale = () => {
    if (scale > 100) {
      onChangeScale(Math.ceil(scale / 100 - 1) * 100, true);
    } else if (scale > 10) {
      onChangeScale(Math.ceil(scale / 10 - 1) * 10, true);
    }
  };
  const plusScale = () => {
    if (scale < 100) {
      onChangeScale(Math.floor(scale / 10 + 1) * 10, true);
    } else if (scale < 500) {
      onChangeScale(Math.floor(scale / 100 + 1) * 100, true);
    }
  };
  useEditorHotkeys('-', plusScale, undefined, [plusScale]);
  useEditorHotkeys('=', minusScale, undefined, [minusScale]);
  useEditorHotkeys(`${onMacOS('command', 'control')}+g`, event => {
    event.preventDefault();
    if (!onSplitGroup()) {
      onJoinGroup();
    }
  });
  useEditorHotkeys('escape', onStopAndReset);
  useEditorHotkeys('space', event => {
    event.preventDefault();
    onPlayOrStop(true);
  });
  return (
    <div className={`${CNP}-play`}>
      <div className={`${CNP}-icons`}>
        {typeOfPlay !== 4 && !isVRVideo && (
          <>
            <Tooltip title={canSplitGroup ? '组合' : '组合(⌘+g)'}>
              <Button
                type="text"
                icon={<Icon component={JoinGroupIcon} />}
                disabled={!canJoinGroup}
                onClick={onJoinGroup}
              />
            </Tooltip>
            <Tooltip title="打散(⌘+g)">
              <Button
                type="text"
                icon={<Icon component={SplitGroupIcon} />}
                disabled={!canSplitGroup}
                onClick={onSplitGroup}
              />
            </Tooltip>
          </>
        )}
        <Divider type="vertical" />
        <UndoButton />
        <RedoButton />
        <Divider type="vertical" />
        <Tooltip title={`空格键${['播放', '停止'][playing % 2]}, esc${['将指针置零', '停止并重置'][playing % 2]}`}>
          <Button type="text" disabled={disabled} icon={[playIcon, pauseIcon][playing % 2]} onClick={onPlayOrStop} />
        </Tooltip>
      </div>
      <div style={{ flex: '0 0 auto', padding: '8px' }}>
        <Select
          bordered={false}
          size="small"
          value={playRate}
          onChange={value => onChangePlayRate(value, true)}
          suffixIcon={<Icon component={Down as any} />}
        >
          {[0.1, 0.2, 0.5, 1, 1.5].map(value => (
            <Select.Option key={value} value={value} title={`播放速度x${value}`}>
              {value.toFixed(1)}倍速
            </Select.Option>
          ))}
        </Select>
      </div>
      <Moment />
      <div
        style={{
          flex: '0 1 212px',
          display: 'flex',
          lineHeight: '42px',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <Tooltip title="缩小时间线(-)">
          <Button type="text" icon={<MinusOutlined />} disabled={scale >= 500} onClick={plusScale} />
        </Tooltip>
        <Slider
          style={{ flex: 'auto' }}
          onChange={(value: number) => onChangeScale(-value * 10, true)}
          value={-Math.floor(scale / 10)}
          min={-50}
          max={-1}
          // tooltip={{
          //   formatter: value => -(value ?? 0) * 10,
          // }}
        />
        <Tooltip title="放大时间线(+)">
          <Button type="text" icon={<PlusOutlined />} disabled={scale <= 10} onClick={minusScale} />
        </Tooltip>
      </div>
      {collapsed ? (
        <Button type="text" onClick={toggleCollapsed}>
          展开面板
          <Icon component={Up as any} />
        </Button>
      ) : (
        <Button type="text" onClick={toggleCollapsed}>
          收起面板
          <Icon component={Down as any} />
        </Button>
      )}
    </div>
  );
}
