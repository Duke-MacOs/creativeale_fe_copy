import { IScriptDesc, once_SPARK } from '../common';
import { nodeId_SPARK } from '../Event';

export const Gesture: IScriptDesc = {
  name: '滑动',
  content: ({ blueprint }) => ({
    spark: 'grid',
    content: [
      { ...nodeId_SPARK, hidden: !blueprint },
      {
        spark: 'select',
        index: 'gestureType',
        label: '滑动方向',
        tooltip: '滑动方向',
        defaultValue: 1,
        options: [
          { label: '左滑', value: 0 },
          { label: '右滑', value: 1 },
          { label: '上滑', value: 2 },
          { label: '下滑', value: 3 },
        ],
        required: true,
      },
      {
        spark: 'number',
        index: 'distance',
        label: '滑动长度',
        step: 1,
        precision: 0,
        defaultValue: 100,
        tooltip: '滑动的长度',
        min: 0,
      },
      {
        spark: 'slider',
        index: 'minRate',
        width: 96,
        label: '滑动生效长度',
        min: 0,
        max: 1,
        step: 0.01,
        ratio: 100,
        precision: 0,
        defaultValue: 1,
        unit: '%',
        tooltip: '滑动成功触发比率',
      },
      once_SPARK,
    ],
  }),
};
