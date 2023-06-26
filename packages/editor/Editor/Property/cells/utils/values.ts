import type { IContext, Spark } from '../types';
import { isFunction, uniqBy } from 'lodash';
import { neverThrow } from './dummy';

export const sparkDefault = (spark: Extract<Spark, { index: any; defaultValue?: any }>) => {
  switch (spark.spark) {
    case 'select':
      return spark.options?.[0]?.value;
    case 'color':
      return 'white';
    case 'slider':
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'string':
      return '';
    case 'check':
    case 'value':
    case 'enter':
    case 'visit':
      return undefined;
    default:
      return neverThrow(spark);
  }
};

export const sparkValue = (group: Spark): any[] | Record<string, any> => {
  const getEntries = (cell: Spark, results: [string | number, any][] = []): [string | number, any][] => {
    switch (cell.spark) {
      case 'grid':
      case 'flex':
        return (cell.content as Spark[]).reduce((results, content) => getEntries(content, results), results);
      case 'context':
      case 'check':
      case 'group':
      case 'block':
      case 'label':
      case 'visit':
        const extra = cell.spark === 'group' && cell.extra;
        return getEntries(cell.content, extra ? getEntries(extra, results) : results);
      case 'element':
        return results;
      default:
        if (typeof cell.index === 'string' && !cell.required) {
          return results;
        }
        if (cell.spark === 'enter') {
          return [...results, [cell.index, sparkValue(cell.content)]];
        }
        if (Array.isArray(cell.index)) {
          return (cell.index as Array<string | number>).reduce((results, index, i) => {
            if (typeof index === 'string' && !cell.required) {
              return results;
            }
            return [...results, [index, cell.defaultValue?.[i]]];
          }, results);
        }
        return [...results, [cell.index as string | number, cell.defaultValue ?? sparkDefault(cell)]];
    }
  };
  const getValue = (entries: [string | number, any][]) => {
    if (entries.length && entries.every(([index]) => typeof index === 'number')) {
      return uniqBy(entries, 0)
        .sort(([index1], [index2]) => (index1 as number) - (index2 as number))
        .map(entry => entry[1]);
    }
    return Object.fromEntries(entries);
  };
  return getValue(getEntries(group));
};

export const updateValue = <T extends { [key: string | number]: any }, K extends keyof T>(
  value: T,
  entries: [K, T[K]][]
) => {
  const newValue = (Array.isArray(value) ? value.slice() : { ...value }) as typeof value;
  for (const [index, val] of entries) {
    newValue[index] = val;
  }
  return newValue;
};

export const callValue = <T>(valueOrFn: T | ((v: T) => T), value: T) => {
  return isFunction(valueOrFn) ? valueOrFn(value) : valueOrFn;
};

export const reduceValue = ({
  value,
  onChange,
}: ReturnType<IContext['useValue']>): ReturnType<IContext['useValue']> => {
  return {
    value: sameValue(value),
    onChange(valueOrFn, options) {
      onChange(
        value.map(value => callValue(valueOrFn, value)),
        options
      );
    },
  };
};

export const sameValue = <T>(values: T[]): T | undefined => {
  const [value] = values;
  if (values.length < 2) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((_, i) => sameValue(values.map(value => (value as any)?.[i]))) as any;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).map(key => [key, sameValue(values.map(value => (value as any)?.[key]))])
    ) as any;
  }
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== value) {
      return undefined;
    }
  }
  return value;
};
