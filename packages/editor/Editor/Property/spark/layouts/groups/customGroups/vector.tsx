import render, { getIndexer, OnChange, updateValue } from '@editor/Editor/Property/cells';

interface IVectorProps<T = [number, number, number?, number?]> {
  value: T;
  onChange: (args: T, options: Parameters<OnChange<T>>[1]) => void;
  label?: React.ReactNode;
  tooltip?: React.ReactNode;
  labels?: React.ReactNode[];
  steps?: number[];
  inputOptions?: Record<string, any>;
}
export function Vector({
  value = [0, 0, 0, 0],
  onChange,
  label,
  tooltip,
  labels = ['x', 'y', 'z', 'w'],
  steps = [1, 1, 1, 1],
  inputOptions = {},
}: IVectorProps) {
  if (![2, 3, 4].includes(value.length)) {
    return null;
  }
  return render({
    spark: 'context',
    content: {
      spark: 'label',
      label,
      tooltip,
      content: {
        spark: 'grid',
        content: value.map((v, index) => ({
          spark: 'number',
          index,
          label: labels[index],
          cols: value.length === 3 ? 2 : 3,
          width: value.length === 3 ? 16 : 32,
          step: steps[index],
          ...inputOptions,
        })),
      },
    },
    provide: () => ({
      useValue(indices) {
        const { indexValue, indexEntries } = getIndexer(indices);
        return {
          value: [indexValue(value)],
          onChange([v], options) {
            onChange(updateValue(value, indexEntries(v) as any), options);
          },
        };
      },
    }),
  });
}
