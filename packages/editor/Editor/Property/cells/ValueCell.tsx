import type { SparkProps, IValueSpark, IContext, UseValue, IBaseSpark, Index } from './types';
import { notImplemented, flatEqual, reduceValue } from './utils';
import { memo, FC, createContext, useContext } from 'react';
import { ErrorFallback } from './views';

export const CellContext = createContext<IContext>({
  useValue: notImplemented,
  visiting: {
    onVisit: notImplemented,
  },
  openKeys: {},
});

export const ValueCell = ({ index, multi, render, content }: SparkProps<IValueSpark>) => {
  const model = useContext(CellContext).useValue(index, flatEqual);
  const { value, onChange } = multi ? model : reduceValue(model);
  return render(content(value, onChange));
};

export const withValue = <P extends Partial<UseValue>>(Component: FC<P>) => {
  return memo(({ index, ...props }: Omit<P, 'value' | 'onChange'> & IBaseSpark<any, Index>) => {
    const { value, onChange } = reduceValue(useContext(CellContext).useValue(index, flatEqual));
    return (
      <ErrorFallback value={value} onChange={onChange}>
        <Component value={value} onChange={onChange} {...(props as any)} />
      </ErrorFallback>
    );
  });
};
