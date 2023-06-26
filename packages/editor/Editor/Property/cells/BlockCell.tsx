import { SparkProps, IBlockSpark } from './types';
import { CellContext } from './ValueCell';
import { collectIndices } from './utils';
import { useContext } from 'react';
import { Radio } from 'antd';
import { css } from 'emotion';

export const BlockCell = ({ content, render, status, indices }: SparkProps<IBlockSpark>) => {
  const {
    openKeys: { checking, enabled, openKeys, setOpenKeys },
  } = useContext(CellContext);
  if (status === 'static' || !checking) {
    return render(content);
  }
  const getProps = () => {
    if (status === 'required' || status === 'closed') {
      return {
        disabled: true,
        enabled,
        checked: status === 'required',
      };
    }
    if (!indices) {
      indices = collectIndices(content, ['required', 'recommended', 'optional'], true);
    }
    return {
      enabled,
      checked: openKeys ? indices.every(index => openKeys.includes(index)) : status === 'recommended',
      setChecked: (checked: boolean) => {
        setOpenKeys?.(checked, indices!);
      },
    };
  };
  return (
    <BlockBase {...getProps()}>
      {render({
        spark: 'context',
        content,
        provide() {
          return { openKeys: { checking: false } };
        },
      })}
    </BlockBase>
  );
};

export interface BlockBaseProps {
  disabled?: boolean;
  enabled?: boolean;
  checked?: boolean;
  children: React.ReactNode;
  topBottom?: number;
  leftRight?: number;
  setChecked?(checked: boolean): void;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const BlockBase = ({
  disabled,
  enabled,
  checked,
  children,
  topBottom = -4,
  leftRight = -2,
  setChecked,
  onClick,
}: BlockBaseProps) => {
  return (
    <div className={css({ position: 'relative', flex: 'auto' })}>
      {children}
      <div
        onClick={onClick}
        className={css({
          top: topBottom,
          right: leftRight,
          bottom: topBottom,
          left: leftRight,
          zIndex: 1,
          borderRadius: 2,
          position: 'absolute',
          background: !enabled || (disabled && !checked) ? 'rgba(51, 51, 51, 0.2)' : 'rgba(57, 85, 246, 0.2)',
          justifyContent: 'flex-end',
          alignItems: 'center',
          display: 'flex',
          '.ant-radio-wrapper': {
            marginRight: 6,
          },
        })}
      >
        <Radio
          disabled={disabled || !enabled}
          checked={checked}
          onClick={event => {
            setChecked?.(!checked);
            event.stopPropagation();
          }}
        />
      </div>
    </div>
  );
};
