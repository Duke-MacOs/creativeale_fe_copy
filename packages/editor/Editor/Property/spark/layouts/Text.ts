import { SparkFn } from '.';
import { Spark } from '../../cells';
import {
  extraSpark,
  headerGroup,
  layerGroup,
  layoutGroup,
  othersGroup,
  strokeGroup,
  textureGroup,
  transformGroup,
} from './groups';

export const Text: SparkFn = (props, envs) => {
  const spark: Spark = {
    spark: 'grid',
    content: [
      extraSpark,
      headerGroup,
      textureGroup,
      strokeGroup,
      transformGroup,
      layoutGroup,
      layerGroup,
      othersGroup,
    ].map(fn => fn(props, envs)),
  };
  return spark;
};

export const PVText: SparkFn = (props, envs) => {
  props = { ...props, type: 'Text' };
  return {
    spark: 'grid',
    content: [
      extraSpark(props, envs),
      headerGroup(props, envs),
      textureGroup(props, envs),
      transformGroup(props, envs),
      othersGroup(props, envs),
    ],
  };
};
export const VRText: SparkFn = (props, envs) => {
  props = { ...props, type: 'Text' };
  return {
    spark: 'grid',
    content: [
      extraSpark(props, envs),
      headerGroup(props, envs),
      textureGroup(props, envs),
      transformGroup(props, envs),
      othersGroup(props, envs),
    ],
  };
};
