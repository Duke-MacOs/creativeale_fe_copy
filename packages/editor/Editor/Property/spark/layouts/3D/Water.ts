import { SparkFn } from '../';
import { headerGroup } from '../groups';
import { materialsGroup } from './Materials';

export const Water: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup]
      .map(fn => fn(props, envs))
      .concat([
        {
          spark: 'group',
          label: '属性设置',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'block',
                content: {
                  spark: 'label',
                  label: '尺寸',
                  content: {
                    spark: 'enter',
                    index: 'size',
                    content: {
                      spark: 'flex',
                      content: [
                        {
                          spark: 'number',
                          label: '宽',
                          width: 24,
                          index: 0,
                          min: 1,
                          defaultValue: 1,
                          step: 0.1,
                          precision: 2,
                        },
                        {
                          spark: 'number',
                          label: '长',
                          width: 24,
                          index: 1,
                          min: 1,
                          defaultValue: 1,
                          step: 0.1,
                          precision: 2,
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ])
      .concat(materialsGroup(props, envs)),
  };
};
