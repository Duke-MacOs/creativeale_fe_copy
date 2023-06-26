import { omit } from 'lodash';
import moment from 'moment';

export const translateDateToDay = (obj: Record<string, any>) => {
  return {
    ...omit(obj, 'date'),
    day_start: obj.date?.[0] ? moment(obj.date?.[0]).format('YYYY-MM-DD') : undefined,
    day_end: obj.date?.[1] ? moment(obj.date?.[1]).format('YYYY-MM-DD') : undefined,
  };
};
