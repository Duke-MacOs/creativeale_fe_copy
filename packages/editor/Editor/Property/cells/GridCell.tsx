import type { SparkProps, IGridSpark, Spark } from './types';
import { CheckCell } from './CheckCell';

export const GridCell = ({ columns = 6, columnGap = 12, rowGap = 16, content, render }: SparkProps<IGridSpark>) => {
  const getColumn = (cell: Spark, key: number, cols = 6, rows = 1) => (
    <div
      key={key}
      style={{
        gridColumn: `span ${cols}`,
        gridRow: `span ${rows}`,
      }}
    >
      {render(cell)}
    </div>
  );
  return (
    <div
      style={{
        display: 'grid',
        gridTemplate: `auto / repeat(${columns}, 1fr)`,
        columnGap,
        rowGap,
      }}
    >
      {content
        .filter(({ hidden }) => !hidden)
        .map((cell, index) => {
          if (cell.spark !== 'check') {
            return getColumn(cell, index, cell.cols, cell.rows);
          }
          return (
            <CheckCell
              {...cell}
              key={`${index}.${cell.space ?? `${String(cell.index)}.${Object.keys(cell.check)}`}`}
              render={({ hidden, cols, rows, ...rest }) =>
                content =>
                  !hidden ? getColumn({ ...content, ...rest }, index, cols, rows) : null}
            />
          );
        })}
    </div>
  );
};
