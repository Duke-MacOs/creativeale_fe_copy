import type { Spark } from './types';
import { ContextCell } from './ContextCell';
import { BooleanCell } from './BooleanCell';
import { ElementCell } from './ElementCell';
import { NumberCell } from './NumberCell';
import { SelectCell } from './SelectCell';
import { RadioGroupCell } from './RadioGroupCell';
import { DateRangeCell } from './DateRangeCell';
import { StringCell } from './StringCell';
import { SliderCell } from './SliderCell';
import { EnterCell } from './EnterCell';
import { ColorCell } from './ColorCell';
import { BlockCell } from './BlockCell';
import { ValueCell } from './ValueCell';
import { GroupCell } from './GroupCell';
import { LabelCell } from './LabelCell';
import { VisitCell } from './VisitCell';
import { CheckCell } from './CheckCell';
import { GridCell } from './GridCell';
import { FlexCell } from './FlexCell';
import { neverThrow } from './utils';

export * from './ContextCell';
export * from './BooleanCell';
export * from './ElementCell';
export * from './NumberCell';
export * from './StringCell';
export * from './SelectCell';
export * from './RadioGroupCell';
export * from './DateRangeCell';
export * from './SliderCell';
export * from './ColorCell';
export * from './EnterCell';
export * from './GroupCell';
export * from './BlockCell';
export * from './ValueCell';
export * from './LabelCell';
export * from './VisitCell';
export * from './CheckCell';
export * from './GridCell';
export * from './FlexCell';
export * from './views';
export * from './utils';
export * from './types';

const render = (cell: Spark) => {
  if (cell.hidden) return null;
  switch (cell.spark) {
    case 'check':
      return (
        <CheckCell
          {...cell}
          key={cell.space ?? `${String(cell.index)}.${Object.keys(cell.check)}`}
          render={props => content => render({ ...content, ...props })}
        />
      );
    case 'value':
      return <ValueCell {...cell} key={cell.space ?? String(cell.index)} render={render} />;
    case 'element':
      return <ElementCell key={cell.space} {...cell} />;
    case 'context':
      return <ContextCell {...cell} render={render} />;
    case 'block':
      return <BlockCell {...cell} render={render} />;
    case 'label':
      return <LabelCell {...cell} render={render} />;
    case 'enter':
      return <EnterCell {...cell} render={render} />;
    case 'visit':
      return <VisitCell {...cell} render={render} />;
    case 'group':
      return <GroupCell {...cell} render={render} />;
    case 'grid':
      return <GridCell {...cell} render={render} />;
    case 'flex':
      return <FlexCell {...cell} render={render} />;
    case 'boolean':
      return <BooleanCell {...cell} />;
    case 'number':
      return <NumberCell {...cell} />;
    case 'slider':
      return <SliderCell {...cell} />;
    case 'string':
      return <StringCell {...cell} />;
    case 'select':
      return <SelectCell {...cell} />;
    case 'radioGroup':
      return <RadioGroupCell {...cell} />;
    case 'dateRange':
      return <DateRangeCell {...cell} />;
    case 'color':
      return <ColorCell {...cell} />;
    default:
      return neverThrow(cell);
  }
};

export default render;
