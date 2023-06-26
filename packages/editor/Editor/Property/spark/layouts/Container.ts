import { SparkFn } from '.';
import { containGroup, extraSpark, headerGroup, layerGroup, layoutGroup, othersGroup, transformGroup } from './groups';

export const Container: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [extraSpark, headerGroup, transformGroup, layoutGroup, layerGroup, containGroup, othersGroup].map(fn =>
      fn(props, envs)
    ),
  };
};
