import { useRef, MutableRefObject, useState, useMemo, useEffect, RefObject } from 'react';
import { ISliderSpark, SparkProps } from '../types';
import { InputNumberProps } from 'antd';

export const useCurrent = <T>(current: T): MutableRefObject<T> => {
  const ref = useRef(current);
  ref.current = current;
  return ref;
};

export const useRatioNumber = (
  {
    ratio = 1,
    unit = '',
    precision,
    disabled,
    readOnly,
    style,
    placeholder,
    ...props
  }: SparkProps<ISliderSpark> & { style?: React.CSSProperties },
  onBeforeChange = false
) => {
  const [committed, setCommitted] = useState(true);
  const [focus, setFocus] = useState(false);
  const newProps: InputNumberProps & {
    ref?: RefObject<HTMLInputElement>;
    key?: string;
    onBeforeChange?: (value: number) => void;
  } = {
    style,
    precision,
    controls: false,
    disabled,
    readOnly,
    placeholder: placeholder ?? String(props.defaultValue ?? 0),
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChange_ = useMemo(() => props.onChange, [focus]);
  let onChange = focus ? onChange_ : props.onChange;
  const into = (value?: any): any => {
    if (Array.isArray(value)) {
      return value.map(into) as any;
    }
    if (value !== undefined) {
      value = ratio > 0 ? value! * ratio : value / -ratio;
      if (precision === 0) {
        // fix 1.11 * 100 === 111.00000000000001
        value = Math.round(value as number);
      }
    }
    return value;
  };
  const from = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(from);
    }
    return ratio === 1 ? value : ratio > 0 ? value / ratio : value * -ratio;
  };
  const commit = useCurrent(() => {
    if (!committed && props.value !== undefined) {
      onChange?.(props.defaultValue ?? 0);
    }
  });
  newProps.onChange = value => {
    if (Array.isArray(value)) {
      onChange?.(from(value));
    } else if (typeof value === 'number') {
      onChange?.(from(value));
      setCommitted(true);
    } else {
      setCommitted(false);
    }
  };
  if (onBeforeChange) {
    newProps.onBeforeChange = value => onChange?.(from(value), { before: true });
  }
  newProps.key = `${Number(focus)}:${props.defaultValue}`;
  newProps.onFocus = () => setFocus(true);

  newProps.onPressEnter = e => {
    const input = (e.target as any).value;
    if (input && /[^\d]/.test(input)) {
      const value = eval(input);
      newProps.onChange?.(value);
    }
  };

  newProps.onBlur = () => {
    /**
     * 修复一个某些情况下才能稳定复现的问题
     * 复现路径：选中一个3D立方体，输入修改位置X, 保持focus状态选中另一个3D立方体，后一个立方体的位置X会覆盖前一个的
     * 问题分析：InputNumber内部出于某些原因在onBlur会触发onChange: oldOnChange(newValue)
     * 临时方案：在onBlur时把oldOnChange更新为newOnChange, 确保newOnChange(newValue)
     * 长期方案：关注InputNumber的更新
     */
    onChange = props.onChange;
    setFocus(false);
    commit.current();
  };
  newProps.autoFocus = focus;

  const ref = useRef<HTMLInputElement>(null);
  newProps.ref = ref;
  useEffect(() => {
    if (focus && ref.current) {
      ref.current.select();
    }
  }, [focus]);
  useEffect(() => () => commit.current(), [commit]);
  const keys = ['min', 'max', 'step', 'value', 'defaultValue'] as const;
  for (const key of keys) {
    newProps[key] = into(props[key]);
  }
  if (unit !== '') {
    if (!focus) {
      newProps.formatter = value => {
        if (precision !== undefined) {
          return `${Number(value).toFixed(precision)}${unit}`;
        }
        return `${value}${unit}`;
      };
    }
  }
  return newProps;
};
