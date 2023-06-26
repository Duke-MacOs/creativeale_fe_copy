import { isObject, isArray } from 'lodash';

export function isRecord<T>(value: unknown): value is Record<string | symbol, T> {
  return isObject(value) && !isArray(value);
}
