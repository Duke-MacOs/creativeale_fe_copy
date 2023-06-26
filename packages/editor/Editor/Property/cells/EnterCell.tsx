import type { IEnterSpark, SparkProps } from './types';
import { enterOpenKeys, flatEqual, sparkValue, updateValue, getIndexer } from './utils';
import { memo, useContext, useRef } from 'react';
import { CellContext } from './ValueCell';
import { omit } from 'lodash';

export const EnterCell = memo(({ index, content, render }: SparkProps<IEnterSpark>) => {
  const { openKeys, useValue } = useContext(CellContext);
  const valueRef = useRef<any[]>([]);
  return render({
    spark: 'context',
    content,
    provide: () => ({
      openKeys: enterOpenKeys(openKeys, index, content),
      useValue(indices, isEqual = flatEqual) {
        const { indexValue, indexEntries } = getIndexer(indices);
        const { value, onChange } = useValue(index, (v1, v2) => {
          return isEqual((valueRef.current = v1).map(indexValue), v2.map(indexValue));
        });
        return {
          value: value.map(indexValue),
          onChange(values, options) {
            if (!options?.replace) {
              onChange?.(
                values.map((values, index) =>
                  options?.ids?.length
                    ? Object.entries(values)
                    : updateValue(valueRef.current[index] ?? value[index] ?? sparkValue(content), indexEntries(values))
                ),
                options
              );
            } else {
              onChange?.(values, omit(options, 'replace'));
            }
          },
        };
      },
    }),
  });
});
