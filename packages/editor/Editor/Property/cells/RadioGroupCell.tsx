import type { SparkProps, IRadioGroupSpark } from './types';
import { withLabel } from './LabelCell';
import { withValue } from './ValueCell';
import { Radio } from 'antd';
import { css } from 'emotion';

export const RadioGroupProp = ({
  defaultValue,
  value = defaultValue,
  onChange,
  options = [],
  style = {},
  size = 'small',
}: SparkProps<IRadioGroupSpark> & { style?: React.CSSProperties }) => {
  const { paddingLeft, ...rest } = style!;

  return (
    <div
      className={css({
        ...rest,
        paddingLeft: `${paddingLeft}px !important`,
        width: '100%',
      })}
    >
      <Radio.Group
        className={css({ display: 'flex' })}
        value={value}
        onChange={({ target: { value } }) => {
          onChange?.(value);
        }}
        size={size}
      >
        {options.map(({ label, value }, index) => (
          <Radio.Button
            key={index}
            value={value}
            className={css({
              flex: 1,
              textAlign: 'center',
            })}
          >
            {label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
};

export const RadioGroupBase = withLabel(RadioGroupProp);

export const RadioGroupCell = withValue(RadioGroupBase);
