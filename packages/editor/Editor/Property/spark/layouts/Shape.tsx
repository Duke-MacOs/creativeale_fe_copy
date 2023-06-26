import { SparkFn } from '.';
import { Spark } from '../../cells';
import {
  extraSpark,
  headerGroup,
  layerGroup,
  layoutGroup,
  othersGroup,
  shapeFilledGroup,
  shapeStrokeGroup,
  transformGroup,
} from './groups';

export const Shape: SparkFn = (props, envs) => {
  const spark = {
    spark: 'grid',
    content: [
      extraSpark,
      headerGroup,
      shapeFilledGroup,
      shapeStrokeGroup,
      transformGroup,
      layoutGroup,
      layerGroup,
      othersGroup,
    ].map(fn => fn(props, envs)),
  } as Spark;
  return spark;
};
