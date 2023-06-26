import { Spark } from '../../cells';

export const checkSpark = (spark: Spark, check?: Record<string, () => any>): Spark => {
  return check
    ? {
        spark: 'check',
        index: '',
        check,
        content: spark,
      }
    : spark;
};
