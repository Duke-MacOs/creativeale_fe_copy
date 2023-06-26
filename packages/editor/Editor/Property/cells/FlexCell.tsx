import type { SparkProps, IFlexSpark, Spark } from './types';
import { CheckCell } from './CheckCell';
import { css } from 'emotion';

export const FlexCell = ({ content, columnGap = 12, alignItems = 'center', render }: SparkProps<IFlexSpark>) => {
  const getColumn = (
    spark: Spark,
    key: number,
    basis: number | string | 'auto' = 0,
    grow = basis === 'auto' ? 0 : 1
  ) => {
    return (
      <div
        key={key}
        style={{
          flex: `${grow} ${grow} ${typeof basis === 'number' ? `${basis}px` : basis}`,
          // TODO: 这裁剪了BlockCell的遮罩，可能需要用grid来模拟flex并避免使用overflow hidden.
          overflow: 'hidden',
        }}
      >
        {render(spark)}
      </div>
    );
  };
  return (
    <div
      className={css({
        display: 'flex',
        columnGap,
        alignItems,
      })}
    >
      {content
        .filter(({ hidden }) => !hidden)
        .map((cell, index) => {
          if (cell.spark !== 'check') {
            return getColumn(cell, index, cell.basis, cell.grow);
          }
          return (
            <CheckCell
              {...cell}
              key={`${index}.${cell.space ?? `${String(cell.index)}.${Object.keys(cell.check)}`}`}
              render={({ hidden = cell.hidden, basis = cell.basis, grow = cell.grow, ...rest }) =>
                content =>
                  !hidden ? getColumn({ ...content, ...rest }, index, basis, grow) : null}
            />
          );
        })}
    </div>
  );
};
