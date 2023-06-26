import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  startScale: { defaultValue: 1.2, hidden: false },
  scaleRange: {
    min: -1,
    max: 1,
    defaultValue: 0,
    hidden: false,
  },
  scaleRangeX: { defaultValue: 0.2, hidden: true },
  scaleRangeY: { defaultValue: 0.2, hidden: true },
  scaleX: { defaultValue: 1, hidden: true },
  scaleY: { defaultValue: 1, hidden: true },
};

export const scaleGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);
  return {
    spark: 'group',
    label: '缩放',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'number',
          index: 'startScale',
          label: '缩放倍数',
          hidden: config.startScale.hidden,
          defaultValue: config.startScale.defaultValue,
          tooltip: '初始缩放倍数',
          step: 0.01,
          precision: 0,
          ratio: 100,
          unit: '%',
        },
        {
          spark: 'slider',
          index: 'scaleRange',
          label: '缩放倍数',
          tooltip: '缩放倍数',
          hidden: config.scaleRange.hidden,
          defaultValue: config.scaleRange.defaultValue,
          min: config.scaleRange.min,
          max: config.scaleRange.max,
          step: 0.01,
          precision: 0,
          ratio: 100,
          unit: '%',
        },
        {
          spark: 'grid',
          content: [
            {
              spark: 'number',
              index: 'scaleRangeX',
              cols: 3,
              hidden: config.scaleRangeX.hidden,
              defaultValue: config.scaleRangeX.defaultValue,
              label: '水平缩放幅度',
              tooltip: '水平缩放幅度',
              step: 0.01,
              precision: 0,
              ratio: 100,
              unit: '%',
            },
            {
              spark: 'number',
              index: 'scaleRangeY',
              cols: 3,
              hidden: config.scaleRangeY.hidden,
              defaultValue: config.scaleRangeY.defaultValue,
              label: '垂直缩放幅度',
              tooltip: '垂直缩放幅度',
              step: 0.01,
              precision: 0,
              ratio: 100,
              unit: '%',
            },
          ],
        },
        {
          spark: 'grid',
          content: [
            {
              spark: 'number',
              index: 'scaleX',
              cols: 3,
              hidden: config.scaleX.hidden,
              defaultValue: config.scaleX.defaultValue,
              label: '水平缩放倍数',
              tooltip: '水平缩放倍数',
              step: 0.01,
              precision: 0,
              ratio: 100,
              unit: '%',
            },
            {
              spark: 'number',
              index: 'scaleY',
              cols: 3,
              hidden: config.scaleY.hidden,
              defaultValue: config.scaleY.defaultValue,
              label: '垂直缩放倍数',
              tooltip: '垂直缩放倍数',
              step: 0.01,
              precision: 0,
              ratio: 100,
              unit: '%',
            },
          ],
        },
      ],
    },
  };
};

export const offsetScaleGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '缩放',
    content: {
      spark: 'label',
      label: '缩放',
      tooltip: '缩放',
      content: {
        spark: 'enter',
        index: 'offsetScale',
        content: {
          spark: 'grid',
          content: [
            {
              spark: 'number',
              index: 0,
              cols: 2,
              width: 16,
              label: 'X',
              tooltip: 'X',
              defaultValue: 0,
              precision: 0,
              step: 0.01,
              ratio: 100,
              unit: '%',
            },
            {
              spark: 'number',
              index: 1,
              cols: 2,
              width: 16,
              label: 'Y',
              tooltip: 'Y',
              defaultValue: 0,
              precision: 0,
              step: 0.01,
              ratio: 100,
              unit: '%',
            },
            {
              spark: 'number',
              index: 2,
              cols: 2,
              width: 16,
              label: 'Z',
              tooltip: 'Z',
              defaultValue: 0,
              precision: 0,
              step: 0.01,
              ratio: 100,
              unit: '%',
            },
          ],
        },
      },
    },
  };
};

export const destScaleGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '缩放',
    content: {
      spark: 'label',
      label: '目标缩放值',
      tooltip: '目标缩放值',
      width: 80,
      content: {
        spark: 'enter',
        index: 'destScale',
        content: {
          spark: 'grid',
          content: [
            {
              spark: 'number',
              index: 0,
              cols: 2,
              width: 16,
              label: 'X',
              tooltip: 'X',
              defaultValue: 0,
              precision: 2,
            },
            {
              spark: 'number',
              index: 1,
              cols: 2,
              width: 16,
              label: 'Y',
              tooltip: 'Y',
              defaultValue: 0,
              precision: 2,
            },
            {
              spark: 'number',
              index: 2,
              cols: 2,
              width: 16,
              label: 'Z',
              tooltip: 'Z',
              defaultValue: 0,
              precision: 2,
            },
          ],
        },
      },
    },
  };
};
