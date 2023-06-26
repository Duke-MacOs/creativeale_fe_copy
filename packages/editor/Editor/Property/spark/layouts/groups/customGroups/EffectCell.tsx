import { Button, theme } from 'antd';
import { useEffectIcon } from '@editor/common/EffectChanger';
import render, { getIndexer, TreeModal } from '@editor/Editor/Property/cells';
import { EditOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Effect } from '../..';
import { css } from 'emotion';

export interface EffectCellProps {
  value?: Record<string, any>;
  label?: string;
  tooltip?: string;
  onChange: (value: Record<string, any>, options?: any) => void;
}

export const EffectCell = ({ value, onChange }: EffectCellProps) => {
  const { token } = theme.useToken();
  const [visible, setVisible] = useState(false);
  const icon = useEffectIcon(value?.__script);
  return (
    <>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          paddingRight: 8,
          columnGap: 8,
          border: `1px solid ${token.colorBorder}`,
          background: token.colorBgContainer,
        })}
      >
        <img
          className={css({
            width: 46,
            height: 46,
            objectFit: 'none',
            background: token.colorBgLayout,
            borderRight: `1px solid ${token.colorBorder}`,
            borderRadius: '4px 0 0 4px',
          })}
          src={(icon as any).default}
        />
        <div className={css({ flex: 'auto' })}>{value?.name ?? '请选择'}</div>
        <Button type="text" icon={<EditOutlined />} onClick={() => setVisible(!visible)} />
      </div>
      {visible && (
        <TreeModal
          title={
            <div className={css({ display: 'flex', alignItems: 'center', columnGap: 4 })}>
              <img
                className={css({
                  width: '1em',
                  height: '1em',
                })}
                src={(icon as any).default}
              />
              {value?.name ?? '动画效果'}
            </div>
          }
          children={render({
            spark: 'context',
            content: Effect(value ?? ({} as any), { rootType: 'useEffect', isRoot: false, propsMode: 'Project' }),
            provide() {
              return {
                useValue(index) {
                  const { indexValue, indexEntries } = getIndexer(index);
                  return {
                    value: [indexValue(value)],
                    onChange([value_], options) {
                      if (!options?.replace) {
                        onChange({ ...value, ...Object.fromEntries(indexEntries(value_)) }, options);
                      } else {
                        onChange({ ...value_, time: value?.time });
                      }
                    },
                  };
                },
              };
            },
          })}
          onCancel={() => setVisible(false)}
        />
      )}
    </>
  );
};
