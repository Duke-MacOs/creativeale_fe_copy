import { SparkFn } from '.';
import { Spark } from '../../cells';
import {
  extraSpark,
  headerGroup,
  layerGroup,
  layoutGroup,
  othersGroup,
  stepsGroup,
  transformGroup,
  videoJumpSceneGroup,
  videoSoundUrlGroup,
} from './groups';

export const Sprite: SparkFn = (props, envs) => {
  if (envs.typeOfPlay === 4) {
    return {
      spark: 'grid',
      content: [headerGroup(props, envs), transformGroup(props, envs), othersGroup(props, envs)],
    };
  }
  const spark: Spark = {
    spark: 'grid',
    content: [extraSpark, headerGroup, transformGroup, layoutGroup, layerGroup, othersGroup].map(fn => fn(props, envs)),
  };
  return spark;
};

export const PVFrameAnime: SparkFn = (props, envs) => {
  props = { ...props, type: 'FrameAnime' };
  return {
    spark: 'grid',
    content: [headerGroup(props, envs), transformGroup(props, envs), othersGroup(props, envs)],
  };
};
export const PVSprite: SparkFn = (props, envs) => {
  props = { ...props, type: 'Sprite' };
  return {
    spark: 'grid',
    content: [headerGroup(props, envs), transformGroup(props, envs), othersGroup(props, envs)],
  };
};
export const VRSprite: SparkFn = (props, envs) => {
  props = { ...props, type: 'Sprite' };
  return {
    spark: 'grid',
    content: [headerGroup(props, envs), transformGroup(props, envs), othersGroup(props, envs)],
  };
};

export const PVVideo: SparkFn = (props, envs) => {
  props = { ...props, type: 'Video' };
  return {
    spark: 'grid',
    content: [headerGroup(props, envs), videoJumpSceneGroup(props, envs), videoSoundUrlGroup(props, envs)],
  };
};
export const VRVideo: SparkFn = (props, envs) => {
  props = { ...props, type: 'Video' };
  return {
    spark: 'grid',
    content: [headerGroup(props, envs), videoJumpSceneGroup(props, envs)],
  };
};

export const PVAlphaVideo: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup(props, envs), stepsGroup(props, envs)],
  };
};

export const AlphaVideo: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup(props, envs), stepsGroup(props, envs)],
  };
};
