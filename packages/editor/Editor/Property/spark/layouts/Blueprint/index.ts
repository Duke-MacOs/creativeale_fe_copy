import { SparkFn } from '..';
import { nameSpark } from '../groups/headerGroup/nameSpark';

export const Blueprint: SparkFn = (props, envs) => {
  return {
    spark: 'group',
    label: '蓝图信息',
    content: {
      spark: 'grid',
      content: [nameSpark(props, envs)],
    },
  };
};
