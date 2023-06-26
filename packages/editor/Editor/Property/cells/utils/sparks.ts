import { Spark, SparkValue, ILabelSpark, IContextSpark } from '../types';
import { neverThrow, NULL_SPARK } from './dummy';
import { getIndexer } from './indices';
import { omit } from 'lodash';
import { updateValue } from './values';

export const filterSpark = <T extends Spark>(spark: T): T | typeof NULL_SPARK => {
  if (spark.hidden) {
    return NULL_SPARK;
  }
  switch (spark.spark) {
    case 'flex':
    case 'grid':
      const content = spark.content.map(filterSpark).filter(content => content !== NULL_SPARK);
      if (content.length) {
        return { ...spark, content };
      }
      return NULL_SPARK;
    case 'block':
    case 'group':
    case 'label':
    case 'context':
    case 'check':
    case 'visit':
    case 'enter':
      const result = { ...spark, content: filterSpark(spark.content) };
      return result.content === NULL_SPARK ? NULL_SPARK : result;
    case 'select':
    case 'slider':
    case 'string':
    case 'value':
    case 'boolean':
    case 'element':
    case 'color':
    case 'number':
      return spark;
    default:
      return neverThrow(spark);
  }
};

export const labelBooleanSpark = ({
  value,
  type,
  size,
  onChange,
  ...spark
}: Omit<Extract<SparkValue, { spark: 'boolean' }>, 'spark'> & Omit<ILabelSpark, 'content'>): Spark => {
  return {
    spark: 'context',
    provide: () => ({
      useValue: () => ({
        value: [value as any],
        onChange([value], options) {
          onChange(value, options);
        },
      }),
    }),
    content: {
      ...spark,
      content: { spark: 'boolean', index: 'value', type, size },
    },
  };
};

export const withContext = (
  value: any,
  onChange: (value: any, options?: any) => void,
  content: Spark
): IContextSpark => {
  return {
    spark: 'context',
    content,
    provide: () => ({
      useValue(index) {
        const { indexValue, indexEntries } = getIndexer(index);
        return {
          value: [indexValue(value)],
          onChange([value_], options) {
            if (!options?.replace) {
              onChange(updateValue(value, indexEntries(value_)), options);
            } else {
              onChange(value_, omit(options, 'replace'));
            }
          },
        };
      },
    }),
  };
};
