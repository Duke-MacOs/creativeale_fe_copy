import { Spark } from '@editor/Editor/Property/cells';
import { Radio, Tooltip } from 'antd';
import { css } from 'emotion';

export const operatorSpark = (value: string, onChange: (key: string, options?: any) => void, key: string): Spark => {
  const options = getOptions(key, value);
  switch (key) {
    case 'key':
      return {
        spark: 'element',
        content: render =>
          render({
            spark: 'select',
            options: options.map(({ value, label, tooltip }) => ({
              value,
              label: tooltip ? `${label}(${tooltip})` : label.replace(/^的/g, ''),
            })),
            value: value ?? options[0].value,
            label: '计算方式',
            onChange(value, options) {
              onChange(value as any, options);
            },
          }),
      };
    default:
      return {
        spark: 'element',
        content: () => (
          <Radio.Group
            value={value ?? options[0].value}
            onChange={({ target: { value } }) => onChange(value)}
            className={css({ width: '100%', display: 'flex', '>*': { flex: 'auto', textAlign: 'center' } })}
            buttonStyle="solid"
          >
            {options.map(({ label, value, tooltip }) => (
              <Tooltip key={value} title={tooltip}>
                <Radio.Button value={value}>{label}</Radio.Button>
              </Tooltip>
            ))}
          </Radio.Group>
        ),
      };
  }
};

export const operatorSummary = (value: any, key: string) => {
  const options = getOptions(key, value);
  return options.find(option => option.value === value) ?? options[0];
};

const getOptions = (key: string, value?: any): Array<{ label: string; value: string; tooltip?: string }> => {
  switch (key) {
    case 'mode':
      if (isArrayOperator(value)) {
        return [
          { label: '插入', value: 'array.insert', tooltip: '插入' },
          { label: '更新', value: 'array.update', tooltip: '更新' },
          { label: '删除', value: 'array.delete', tooltip: '删除' },
          { label: '清空', value: 'array.clear', tooltip: '清空' },
        ];
      } else if (isObjectOperator(value)) {
        return [
          { label: '更新', value: 'object.update', tooltip: '更新' },
          { label: '删除', value: 'object.delete', tooltip: '删除' },
          { label: '清空', value: 'object.clear', tooltip: '清空' },
        ];
      } else {
        return [
          { label: '=', value: '=', tooltip: '等于' },
          { label: '+=', value: '+', tooltip: '加等于' },
          { label: '-=', value: '-', tooltip: '减等于' },
          { label: '×=', value: 'x', tooltip: '乘等于' },
          { label: '÷=', value: '÷', tooltip: '除等于' },
        ];
      }

    case 'key':
      return [
        { label: '+', value: 'math.plus', tooltip: '加' },
        { label: '-', value: 'math.subtract', tooltip: '减' },
        { label: '×', value: 'math.multiply', tooltip: '乘' },
        { label: '÷', value: 'math.divide', tooltip: '除' },
        { label: '%', value: 'math.remain', tooltip: '取余数' },
        { label: '的四舍五入', value: 'math.round' },
        { label: '的向下取整', value: 'math.floor' },
        { label: '的向上取整', value: 'math.ceil' },
        { label: '的随机数', value: 'math.random' },
        { label: '当前时间', value: 'math.now' },
        { label: '的较大值', value: 'math.max' },
        { label: '的较小值', value: 'math.min' },
        { label: '的正弦', value: 'math.sin' },
        { label: '的余弦', value: 'math.cos' },
        { label: '的长度', value: 'array.length' },
        { label: '数组取值', value: 'array.get' },
        { label: '对象取值', value: 'object.get' },
      ];
    case 'compare':
      return [
        { label: '==', value: '=', tooltip: '等于' },
        { label: '≠', value: '!=', tooltip: '不等于' },
        { label: '<', value: '<', tooltip: '小于' },
        { label: '≤', value: '<=', tooltip: '小于等于' },
        { label: '>', value: '>', tooltip: '大于' },
        { label: '≥', value: '>=', tooltip: '大于等于' },
      ];
    default:
      return [];
  }
};

export function isArrayOperator(operator: string) {
  return ['array.insert', 'array.update', 'array.delete', 'array.clear'].includes(operator);
}

export function isObjectOperator(operator: string) {
  return ['object.update', 'object.delete', 'object.clear'].includes(operator);
}
