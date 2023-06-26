import { SparkFn } from '.';
import { Spark } from '../../cells';
import { extraSpark, headerGroup } from './groups';

export const Sound: SparkFn = (props, envs) => {
  if (envs.typeOfPlay === 4) {
    return {
      spark: 'grid',
      content: [headerGroup(props, envs)],
    };
  }
  const spark: Spark = {
    spark: 'grid',
    content: [extraSpark, headerGroup].map(fn => fn(props, envs)),
  };
  return spark;
};

export const PVSound: SparkFn = (props, envs) => {
  props = { ...props, type: 'Sound' };
  return {
    spark: 'grid',
    content: [headerGroup(props, envs)],
  };
};
export const VRSound: SparkFn = (props, envs) => {
  props = { ...props, type: 'Sound' };
  return {
    spark: 'grid',
    content: [headerGroup(props, envs)],
  };
};
