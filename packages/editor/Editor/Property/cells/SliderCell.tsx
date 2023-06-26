import type { ISliderSpark, SparkProps } from './types';
import { Slider, InputNumber } from 'antd';
import { withLabel } from './LabelCell';
import { withValue } from './ValueCell';
import { useRatioNumber } from './utils';
import { css } from 'emotion';

export const SliderProp = (props: SparkProps<ISliderSpark> & { style?: React.CSSProperties }) => {
  const { key, style, autoFocus, formatter, onFocus, onBlur, onChange, onBeforeChange, ...newProps } = useRatioNumber(
    props,
    true
  );
  if (Array.isArray(props.value)) {
    if ((newProps.value as any).some((value: any) => value === undefined)) {
      newProps.value = undefined;
    }
    return (
      <div style={style}>
        <Slider
          {...(newProps as any)}
          range
          key={key!.slice(2)}
          onChange={onBeforeChange}
          onAfterChange={onChange}
          tooltip={{ formatter }}
        />
      </div>
    );
  }
  newProps.value ??= newProps.defaultValue;
  return (
    <div style={style} className={css({ display: 'flex', columnGap: 8 })}>
      <Slider
        style={{ flex: 'auto' }}
        {...(newProps as any)}
        key={key!.slice(2)}
        onChange={onBeforeChange}
        onAfterChange={value => {
          onChange?.(Array.isArray(value) ? value[0] : value);
        }}
        tooltip={{ formatter }}
      />
      {props.inputNumber !== false && (
        <InputNumber
          style={{ flex: '0 0 70px', padding: '0 5px' }}
          {...newProps}
          key={key}
          autoFocus={autoFocus}
          formatter={formatter}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export const SliderBase = withLabel(SliderProp);

export const SliderCell = withValue(SliderBase);
