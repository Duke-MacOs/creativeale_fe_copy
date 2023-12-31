export default {
  spark: 'enter',
  index: 'tilingOffset',
  content: {
    spark: 'grid',
    content: [
      {
        spark: 'number',
        index: 0,
        cols: 3,
        label: '缩放X',
        step: 0.03,
        precision: 2,
        default: 1,
      },
      {
        spark: 'number',
        index: 1,
        cols: 3,
        label: '缩放Y',
        step: 0.03,
        precision: 2,
        default: 1,
      },
      {
        spark: 'number',
        index: 2,
        cols: 3,
        label: '偏移X',
        step: 0.03,
        precision: 2,
        default: 0,
      },
      {
        spark: 'number',
        index: 3,
        cols: 3,
        label: '偏移Y',
        step: 0.03,
        precision: 2,
        default: 0,
      },
    ],
  },
};
