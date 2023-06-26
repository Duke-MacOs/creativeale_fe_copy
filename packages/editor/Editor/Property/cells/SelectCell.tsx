import type { SparkProps, ISelectSpark } from './types';
import { withLabel } from './LabelCell';
import { withValue } from './ValueCell';
import { Select } from 'antd';
import { css } from 'emotion';
import { isEqual } from 'lodash';

export const SelectProp = ({
  defaultValue,
  value = defaultValue,
  options = [],
  style = {},
  required,
  onChange,
  input,
  ...props
}: SparkProps<ISelectSpark> & { style?: React.CSSProperties }) => {
  const index = options.findIndex(item => item.value === value || isEqual(item.value, value));

  if (input) {
    const { paddingLeft, ...rest } = style!;
    return (
      <Select
        {...props}
        showSearch
        style={rest}
        className={css({
          '.ant-select-selection-search': {
            paddingLeft: `${paddingLeft}px !important`,
            left: '0 !important',
          },
          '.ant-select-selector': {
            paddingLeft: `${paddingLeft}px !important`,
          },
        })}
        value={value}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onChange={value => {
          onChange?.(value);
        }}
        onSearch={value => {
          onChange?.(value);
        }}
      >
        {Boolean(value) && !options.find(({ value: v }) => value === v) && (
          <Select.Option value={value}>{value}</Select.Option>
        )}
        {options.map(({ label, value }, index) => (
          <Select.Option key={index} value={value}>
            {label}
          </Select.Option>
        ))}
      </Select>
    );
  }

  const { paddingLeft, ...rest } = style;
  return (
    <div
      key={options.length}
      className={css({
        ...rest,
        '.ant-select-selector': {
          paddingLeft: `${paddingLeft}px !important`,
        },
      })}
    >
      <Select
        placeholder="请选择"
        {...props}
        style={rest}
        status={required && index < 0 ? 'error' : undefined}
        value={index > -1 ? index : undefined}
        onChange={index => {
          onChange?.(options[Number(index)].value!);
        }}
      >
        {options.map(({ label, value }, index) => (
          <Select.Option key={index} value={index}>
            {label ?? value}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export const SelectBase = withLabel(SelectProp);

export const SelectCell = withValue(SelectBase);
