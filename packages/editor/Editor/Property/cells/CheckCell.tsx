import type { ICheckSpark, Index, Spark } from './types';
import { flatEqual, sameValue } from './utils';
import { CellContext } from './ValueCell';
import { useContext } from 'react';

export const CheckCell = <I extends Index = Index, C extends Record<string, any> = Record<string, never>>({
  index,
  check,
  content,
  render,
}: ICheckSpark<I, C> & { render: (check: Partial<C>) => (content: Spark) => JSX.Element | null }) => {
  const { value } = useContext(CellContext).useValue(index, flatEqual);
  const entries = Object.entries(check).map(([key, fn]) => [key, fn(sameValue(value))]);
  return render(Object.fromEntries(entries))(content);
};
