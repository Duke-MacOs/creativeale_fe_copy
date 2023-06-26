import type { IElementSpark, SparkValue } from './types';
import { neverThrow, NULL_SPARK } from './utils';
import { BooleanBase } from './BooleanCell';
import { NumberBase } from './NumberCell';
import { SelectBase } from './SelectCell';
import { StringBase } from './StringCell';
import { SliderBase } from './SliderCell';
import { ColorBase } from './ColorCell';
import { ErrorFallback } from './views';
import { Empty } from 'antd';
import { FC } from 'react';
import { css } from 'emotion';

const EMPTY = <Empty className={css({ marginTop: 16 })} description="暂无内容" />;

export const withBoundary = <P,>(Component: FC<P>) => {
  return (props: any) => {
    return (
      <ErrorFallback>
        <Component {...props} />
      </ErrorFallback>
    );
  };
};

export const ElementCell = withBoundary((props: Omit<IElementSpark, 'spark'>) => {
  const element = props.content(render, props) as JSX.Element;
  return props.content === NULL_SPARK.content ? EMPTY : element;
});

const render = (cell: SparkValue) => {
  if (cell.hidden) return null;
  switch (cell.spark) {
    case 'boolean':
      return <BooleanBase {...cell} />;
    case 'number':
      return <NumberBase {...cell} />;
    case 'slider':
      return <SliderBase {...cell} />;
    case 'string':
      return <StringBase {...cell} />;
    case 'select':
      return <SelectBase {...cell} />;
    case 'color':
      return <ColorBase {...cell} />;
    default:
      return neverThrow(cell);
  }
};
