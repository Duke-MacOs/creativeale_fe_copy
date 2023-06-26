import { SparkFn } from '../..';
import { IBlockSpark } from '../../../../cells';
import { typeLabel } from './typeLabel';

export const fillTypeSpark: SparkFn = ({ type }, { typeOfPlay }): IBlockSpark => {
  return {
    spark: 'block',
    status: 'required',
    hidden: typeOfPlay === 4,
    content: {
      spark: 'select',
      index: 'fillType',
      label: `${typeLabel(type)}填充`,
      tooltip: `${typeLabel(type)}如何适应到宽高确定的内容框`,
      defaultValue: 0,
      options: [
        {
          label: '拉伸填充',
          value: 0,
        },
        {
          label: '缩放显示',
          value: 1,
        },
        {
          label: '缩放填充',
          value: 3,
        },
        {
          label: '平铺填充',
          value: 2,
        },
      ],
    },
  };
};
