import { PanoramaEditSparkFn } from '../..';

export const Space: PanoramaEditSparkFn = ({ space, panoramaData }) => {
  return {
    spark: 'group',
    label: '属性设置',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'enter',
          index: 'spaces',
          content: {
            spark: 'enter',
            index: panoramaData.spaces.findIndex(i => i.id === space.id),
            content: {
              spark: 'grid',
              content: [
                {
                  spark: 'block',
                  content: {
                    spark: 'string',
                    label: '名称',
                    index: 'name',
                    tooltip: '区域名称',
                  },
                },
              ],
            },
          },
        },
      ],
    },
  };
};
