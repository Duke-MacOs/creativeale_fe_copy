import { Form, Input } from 'antd';
import { css } from 'emotion';
import { isArray, isFinite } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { CubicEditorProps } from '.';

export default ({ value, onChange }: Pick<CubicEditorProps, 'onChange'> & { value: number[] }) => {
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState(toFixed(value).join(','));
  const inputArrRef = useRef(value);

  useEffect(() => {
    // 当通过 Input 进行修改后也会触发这里的 effect, 如果不加判断条件的话触发 setInputValue 会让输入指针回到末尾
    if (inputArrRef.current.some((item, index) => toFixed(item) !== toFixed(value[index]))) {
      setInputValue(toFixed(value).join(','));
      setError('');
    }
  }, [value]);

  return (
    <Form.Item
      label="当前值"
      validateStatus={error && 'error'}
      help={error}
      className={css({
        padding: '0 7px',
        '.ant-input': {
          height: 20,
          paddingLeft: 5,
          paddingRight: 5,
        },
        '.ant-form-item-label > label': {
          fontSize: '12px',
          height: 'auto',
        },
        '.ant-form-item-explain-error': {
          fontSize: '12px',
        },
      })}
    >
      <Input
        value={inputValue}
        onChange={({ currentTarget: { value } }) => {
          try {
            setInputValue(value);
            const newArr = value.trim().split(',').map(Number);
            inputArrRef.current = newArr;
            if (newArr.length !== 4 || newArr.some(item => !isFinite(item))) {
              throw new Error('数值不合法');
            } else if (newArr.some((item, index) => index % 2 === 0 && (item < 0 || item > 1))) {
              throw new Error('x值必须在 [0,1] 范围内');
            } else {
              setError('');
              onChange(newArr);
            }
          } catch (e) {
            setError(e.message);
          }
        }}
      />
    </Form.Item>
  );
};

const toFixed = <T extends number | number[]>(value: T) => {
  const fn = (val: number) => {
    const multiple = 10 ** 2;
    // 保留两位小数并去除后缀0
    return Math.round(val * multiple) / multiple;
  };
  return (isArray(value) ? value.map(fn) : fn(value)) as T;
};
