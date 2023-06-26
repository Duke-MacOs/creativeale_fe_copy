import type { IValueSpark, ISelectSpark, IElementSpark } from '../../../../cells';
import { Radio, Tooltip } from 'antd';
import { css } from 'emotion';

const className = css({ width: '100%', display: 'flex', '>*': { flex: 'auto', textAlign: 'center' } });

export const selectSpark = (index: string, defaultValue: any, options: ISelectSpark['options']): IValueSpark => {
  return {
    spark: 'value',
    index,
    content(value = defaultValue, onChange) {
      return {
        spark: 'element',
        content() {
          return (
            <Radio.Group
              className={className}
              value={value}
              onChange={({ target: { value } }) => {
                onChange(value);
              }}
            >
              {options?.map(({ value, label, tooltip }, index) => (
                <Radio.Button key={index} value={value}>
                  <Tooltip title={tooltip}>{label}</Tooltip>
                </Radio.Button>
              ))}
            </Radio.Group>
          );
        },
      };
    },
  };
};

export const optionsSpark = (
  onChange: (index: number, value: boolean) => void,
  options: ISelectSpark['options']
): IElementSpark => {
  return {
    spark: 'element',
    content() {
      return (
        <Radio.Group className={className} value="true">
          {options?.map(({ value, label, tooltip }, index) => (
            <Radio.Button
              key={index}
              value={value ? 'true' : 'false'}
              onClick={() => {
                onChange(index, !value);
              }}
            >
              <Tooltip title={tooltip}>{label}</Tooltip>
            </Radio.Button>
          ))}
        </Radio.Group>
      );
    },
  };
};
