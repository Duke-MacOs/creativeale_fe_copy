import type { IColorSpark, SparkProps } from './types';
import { SketchPicker } from 'react-color';
import { withLabel } from './LabelCell';
import { withValue } from './ValueCell';
import { Dropdown, Input } from 'antd';
import { css } from 'emotion';

export const ColorProp = ({
  value,
  defaultValue,
  placeholder,
  disableAlpha,
  stretch,
  disabled,
  required,
  readOnly,
  style,
  onChange,
  ...props
}: SparkProps<IColorSpark> & { style?: React.CSSProperties }) => {
  const color = value ?? defaultValue ?? 'rgba(255, 255, 255, 1)';
  const prefix = (
    <Dropdown
      destroyPopupOnHide
      trigger={['click']}
      disabled={disabled || readOnly}
      overlay={
        <SketchPicker
          color={color}
          disableAlpha={disableAlpha}
          onChange={({ rgb: { r, g, b, a = 1 } }) => {
            onChange?.(`rgba(${r},${g},${b},${a})`);
          }}
        />
      }
    >
      <Input
        readOnly
        size="small"
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: stretch ? '100%' : '36px',
          height: '100%',
          background: color,
        }}
      />
    </Dropdown>
  );
  return (
    <Input
      {...props}
      readOnly
      status={required && !value ? 'error' : undefined}
      disabled={disabled}
      prefix={prefix}
      style={style}
      className={css({
        '.ant-input-prefix': {
          width: '100%',
        },
      })}
    />
  );
};

export const ColorBase = withLabel(ColorProp);

export const ColorCell = withValue(ColorBase);
