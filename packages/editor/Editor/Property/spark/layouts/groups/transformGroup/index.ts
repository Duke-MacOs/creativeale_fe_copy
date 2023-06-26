import { widthHeightSpark } from './widthHeightSpark';
import { IGroupSpark } from '../../../../cells';
import type { SparkFn } from '../..';

export const transformGroup: SparkFn = ({ type }, { isRoot }): IGroupSpark => {
  return {
    spark: 'group',
    label: '变换',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'block',
          hidden: isRoot && type === 'Animation',
          content: {
            spark: 'flex',
            content: [
              {
                spark: 'number',
                width: 32,
                label: 'X',
                index: 'x',
              },
              {
                spark: 'number',
                width: 32,
                label: 'Y',
                index: 'y',
              },
            ],
          },
        },
        widthHeightSpark(type === 'DragonBones' || type === 'Particle' || type === 'Spine'),
        {
          spark: 'block',
          hidden: (isRoot && type === 'Animation') || type === 'Particle' || type === 'Live2d',
          content: {
            spark: 'number',
            label: '旋转角度',
            step: 1,
            precision: 0,
            index: 'rotation',
            unit: '°',
          },
        },
      ],
    },
  };
};
