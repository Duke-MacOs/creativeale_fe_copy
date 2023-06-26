import { SparkFn } from '.';
import { extraSpark, headerGroup, layerGroup, layoutGroup, othersGroup, transformGroup } from './groups';

export const FrameAnime: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [extraSpark, headerGroup, transformGroup, layoutGroup, layerGroup, othersGroup].map(fn => fn(props, envs)),
  };
};
