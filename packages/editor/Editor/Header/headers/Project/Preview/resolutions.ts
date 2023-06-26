import { amIHere } from '@shared/utils';

const resolutions = [
  {
    title: 'Android',
    resolution: [680, 314],
    android: true,
    x: true,
  },
  {
    title: 'iPhone SE',
    resolution: [667, 375],
    x: false,
  },
  {
    title: 'iPhone 12',
    resolution: [680, 314],
    x: true,
  },
  {
    title: 'iPad Mini',
    resolution: [720, 540],
  },
];

export const getResolutions = (typeOfPlay?: number, originSize?: [number, number]) => {
  if (typeOfPlay === 3 && amIHere({ release: true })) {
    return resolutions.slice(0, -1);
  }
  if (originSize) {
    return resolutions.concat({
      title: '原始尺寸',
      resolution: originSize,
    });
  }
  return resolutions;
};
