import type { SparkProps, IDateRangeSpark } from './types';
import { withLabel } from './LabelCell';
import { withValue } from './ValueCell';
import { DatePicker } from 'antd';
import { css } from 'emotion';
import moment from 'moment';

export const DateRangeProp = ({
  defaultValue,
  value = defaultValue,
  onChange,
  style = {},
}: SparkProps<IDateRangeSpark> & { style?: React.CSSProperties }) => {
  const { paddingLeft, ...rest } = style!;
  return (
    <div
      className={css({
        ...rest,
        paddingLeft: `${paddingLeft}px !important`,
        width: '100%',
      })}
    >
      <DatePicker.RangePicker
        className={css({
          width: '100%',
        })}
        value={value?.filter(Boolean).map(i => moment(i)) as any}
        onChange={(_, value) => {
          onChange?.(value);
        }}
      />
    </div>
  );
};

export const DateRangeBase = withLabel(DateRangeProp);

export const DateRangeCell = withValue(DateRangeBase);
