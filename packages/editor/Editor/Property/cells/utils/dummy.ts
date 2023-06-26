import { IElementSpark, Spark } from '../types';
import { zip } from 'lodash';

export const NULL_SPARK: IElementSpark = {
  spark: 'element',
  content: () => null,
};

export const notNullSpark = (spark1: Spark, spark2: Spark) => (spark1 !== NULL_SPARK ? spark1 : spark2);

export const flatEqual = <V extends any | any[]>(left: V[], right: V[]) => {
  return zip(left, right).every(([left, right]) =>
    Array.isArray(left)
      ? Array.isArray(right) && left.length === right.length && left.every((l, i) => l === right[i])
      : left === right
  );
};

export const neverThrow = (value: never) => {
  throw new Error(`Oops, not supposed to throw: ${value}`);
};

export const notImplemented = (...args: any[]) => {
  throw new Error(`NotImplemented: ${args}`);
};
