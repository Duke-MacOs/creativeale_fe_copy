import type { INumberSpark, SparkProps } from './types';
import { withLabel } from './LabelCell';
import { withValue } from './ValueCell';
import { useRatioNumber } from './utils';
import { InputNumber } from 'antd';

export const NumberProp = (props: SparkProps<INumberSpark> & { style?: React.CSSProperties }) => {
  return <InputNumber {...useRatioNumber(props as any)} />;
};

export const NumberBase = withLabel(NumberProp, props => (offset, options) => {
  const { defaultValue = 0, step = 1, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, onChange } = props;
  onChange?.(
    (value = defaultValue) => Math.min(Math.max(value + Math.floor(offset) * (step as number), min), max),
    options
  );
});

export const NumberCell = withValue(NumberBase);
