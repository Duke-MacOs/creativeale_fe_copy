import { SparkFn } from '.';
import {
  extraSpark,
  headerGroup,
  layerGroup,
  layoutGroup,
  othersGroup,
  transformGroup,
  compPropsGroups,
} from './groups';

export const Animation: SparkFn = (props, envs) => {
  if (envs.isRoot) {
    return {
      spark: 'grid',
      content: [extraSpark, headerGroup, transformGroup].map(fn => fn(props, envs)),
    };
  }

  return {
    spark: 'grid',
    content: [extraSpark, headerGroup, compPropsGroups, transformGroup, layoutGroup, layerGroup, othersGroup].map(fn =>
      fn(props, envs)
    ),
  };
};
