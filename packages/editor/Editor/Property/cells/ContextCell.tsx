import type { SparkProps, IContextSpark } from './types';
import { CellContext } from './ValueCell';
import { useContext } from 'react';

export const ContextCell = ({ provide, content, render }: SparkProps<IContextSpark>) => {
  const context = useContext(CellContext);
  return (
    <CellContext.Provider
      value={{
        ...context,
        ...provide(context),
      }}
    >
      {render(content)}
    </CellContext.Provider>
  );
};
