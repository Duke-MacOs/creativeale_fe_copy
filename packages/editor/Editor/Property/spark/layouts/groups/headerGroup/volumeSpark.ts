import { SparkFn } from '../..';
import { IBlockSpark } from '../../../../cells';

export const volumeSpark: SparkFn = (_, { typeOfPlay }): IBlockSpark => {
  return {
    spark: 'block',
    hidden: typeOfPlay === 4,
    status: 'required',
    content: {
      spark: 'slider',
      index: 'volume',
      label: '音量',
      defaultValue: 1,
      precision: 0,
      ratio: 100,
      unit: '%',
      step: 0.01,
      min: 0,
      max: 2,
    },
  };
};
