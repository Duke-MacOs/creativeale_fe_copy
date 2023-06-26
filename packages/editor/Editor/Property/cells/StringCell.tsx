import type { IStringSpark, SparkProps } from './types';
import { useEffect, useRef, useState } from 'react';
import { withLabel } from './LabelCell';
import { withValue } from './ValueCell';
import { Input, InputRef } from 'antd';
import { css } from 'emotion';

const status = (value?: string, accept?: string, required?: boolean, min = 0) => {
  if (required && typeof value !== 'string') {
    return 'error';
  }
  if (typeof value === 'string' && value.length < min) {
    return 'error';
  }
  try {
    if (accept && !new RegExp(accept, 'i').test(value ?? '')) {
      return 'error';
    }
  } catch (e) {
    console.error(e);
  }
};

export const StringProp = ({
  onChange,
  style,
  type,
  min,
  max,
  value,
  defaultValue,
  required,
  accept,
  allowClear = false,
  ...props
}: SparkProps<IStringSpark> & { style?: React.CSSProperties }) => {
  const ref = useRef<InputRef>(null);
  const [current, setCurrent] = useState(value ?? '');
  const [search, setSearch] = useState(value ?? '');
  const focusRef = useRef(false);

  useEffect(() => {
    setCurrent(value ?? '');
    setSearch(value ?? '');
  }, [value]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (focusRef.current) {
        setCurrent(search);
        onChange?.(search);
      } else {
        setCurrent(value => {
          setSearch(value);
          return value;
        });
      }
    });
    return () => {
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (type === 'area') {
    const className = css({
      width: '100%',
      '.ant-input': {
        ...style,
        minHeight: 16 + 32 * 2,
      },
      '::after': {
        position: 'absolute',
        bottom: 0,
        right: 12,
      },
    });
    return (
      <Input.TextArea
        {...props}
        allowClear={allowClear}
        showCount
        ref={ref}
        status={status(value, accept, required, min)}
        key={defaultValue ?? ''}
        value={current}
        maxLength={max}
        className={className}
        defaultValue={defaultValue}
        onChange={({ target: { value } }) => {
          setCurrent(value);
          onChange?.(value);
        }}
      />
    );
  }
  return (
    <Input
      {...props}
      allowClear={allowClear}
      ref={ref}
      style={style}
      status={status(value, accept, required, min)}
      key={defaultValue ?? ''}
      value={current}
      maxLength={max}
      defaultValue={defaultValue}
      onChange={({ target: { value } }) => {
        setCurrent(value);
        onChange?.(value);
      }}
      onFocus={() => {
        ref.current?.select();
      }}
    />
  );
};

export const StringBase = withLabel(StringProp);

export const StringCell = withValue(StringBase);
