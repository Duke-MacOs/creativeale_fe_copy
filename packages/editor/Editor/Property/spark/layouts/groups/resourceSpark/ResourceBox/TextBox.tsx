import type { ResourceBoxProps } from '.';
import render, { callValue } from '@editor/Editor/Property/cells';
import { SettingConfig } from '@icon-park/react';
import baseTypeLabel from './baseTypeLabel';
import { hoverClass, appearing } from './SoundBox';
import Icon from '@ant-design/icons';
import { css, cx } from 'emotion';
import { Cover } from './Cover';
import { Button } from 'antd';

export const TextBox = ({
  type,
  name,
  text,
  required,
  baseType = type,
  visitable = false,
  hoverable = true,
  playable = !hoverable,
  domRef,
  onChange,
  onAction,
}: ResourceBoxProps) => {
  return (
    <div
      ref={domRef}
      className={cx(
        css({ display: 'flex' }),
        domRef && appearing,
        hoverable && hoverClass,
        required && !text && css({ background: '#fff2f0' })
      )}
    >
      <Cover size={62} type={type} playable={playable} onAction={onAction} />
      <div className={css({ padding: '0 8px 8px', flex: 'auto' })}>
        {visitable && (
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '8px 0',
              overflow: 'hidden',
            })}
          >
            <div>
              {baseTypeLabel(type, baseType)}：{name}
            </div>
            <Button
              type="link"
              className={css({ padding: 0 })}
              icon={<Icon component={SettingConfig as any} />}
              onClick={() => onAction?.('visit')}
            >
              设置
            </Button>
          </div>
        )}

        {render({
          spark: 'element',
          content: render =>
            render({
              spark: 'string',
              type: 'area',
              value: text,
              onChange(textOrFn) {
                onChange({ text: callValue(textOrFn, text ?? '') });
              },
            }),
        })}
      </div>
    </div>
  );
};
