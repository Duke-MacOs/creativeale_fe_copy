import type { ResourceBoxProps } from '.';
import { hoverClass, appearing } from './SoundBox';
import { SettingConfig } from '@icon-park/react';
import baseTypeLabel from './baseTypeLabel';
import Icon from '@ant-design/icons';
import { Typography } from 'antd';
import { Cover } from './Cover';
import { css, cx } from 'emotion';

export const CoverBox = ({
  type,
  name,
  cover,
  baseType = type,
  hoverable = true,
  playable = !hoverable,
  domRef,
  onAction,
}: ResourceBoxProps) => {
  return (
    <div ref={domRef} className={cx(css({ display: 'flex' }), domRef && appearing, hoverable && hoverClass)}>
      <Cover type={type} url={cover} playable={playable} onAction={onAction} />
      <div className={css({ flex: 'flex', padding: 8, overflow: 'hidden' })}>
        <div>
          {baseTypeLabel(type, baseType)}：{name}
        </div>
        <div>
          <Typography.Text type="secondary">请点击</Typography.Text>{' '}
          <Typography.Link onClick={() => onAction?.('visit')}>
            <Icon component={SettingConfig as any} /> 更多设置
          </Typography.Link>{' '}
          <Typography.Text type="secondary">进行编辑</Typography.Text>
        </div>
      </div>
    </div>
  );
};
