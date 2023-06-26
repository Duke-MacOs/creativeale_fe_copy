import type { ResourceBoxProps } from '.';
import baseTypeLabel from './baseTypeLabel';
import { hoverClass, appearing } from './SoundBox';
import Actions from './Actions';
import { Typography } from 'antd';
import { Cover } from './Cover';
import { css, cx } from 'emotion';

export const ImageBox = ({
  url,
  type,
  name,
  tips,
  cover,
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
}: ResourceBoxProps & { tips: string[] }) => {
  const urlOrCover =
    [
      'Sprite',
      'Video',
      'VRVideo',
      'NativeVideo',
      'PVAlphaVideo',
      'AlphaVideo',
      'NativeLoadingVideo',
      'Texture2D',
    ].includes(type) && typeof url === 'string'
      ? url
      : cover;
  return (
    <div
      ref={domRef}
      className={cx(
        css({
          alignItems: 'center',
          display: 'flex',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }),
        required && !url && css({ background: '#fff2f0' }),
        hoverable && hoverClass,
        domRef && appearing
      )}
    >
      <Cover type={type} playable={playable} url={urlOrCover} onAction={onAction} />
      <div className={css({ flex: 'auto', padding: '0 8px', overflow: 'hidden' })}>
        <div>
          {baseTypeLabel(type, baseType)}：{name || (url ? '(未命名)' : '请上传资源')}
        </div>
        {tips.map((tip, index) => (
          <Typography.Text key={index} style={{ fontSize: 12, display: 'block' }} type="secondary">
            {tip}
          </Typography.Text>
        ))}
        <Actions
          url={url}
          name={name}
          cover={cover}
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
    </div>
  );
};
