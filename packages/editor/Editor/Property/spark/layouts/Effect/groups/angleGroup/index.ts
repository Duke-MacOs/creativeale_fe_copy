import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';

const DefaultConfig = {
  startAngle: { defaultValue: 0, hidden: false },
  rotateRange: {
    defaultValue: 360,
    hidden: false,
  },
  rotation: {
    defaultValue: 0,
    hidden: true,
  },
};

export const angleGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);

  return {
    spark: 'group',
    label: '角度',
    content: {
      spark: 'flex',
      content: [
        {
          spark: 'number',
          index: 'startAngle',
          label: '初始角度',
          hidden: config.startAngle.hidden,
          defaultValue: config.startAngle.defaultValue,
          tooltip: '初始角度',
          precision: 0,
          step: 1,
          unit: '°',
        },
        {
          spark: 'number',
          index: 'rotateRange',
          label: '旋转角度',
          hidden: config.rotateRange.hidden,
          defaultValue: config.rotateRange.defaultValue,
          tooltip: '旋转角度',
          precision: 0,
          step: 1,
          unit: '°',
        },
        {
          spark: 'number',
          index: 'rotation',
          label: '目标角度',
          hidden: config.rotation.hidden,
          defaultValue: config.rotation.defaultValue,
          tooltip: '旋转角度',
          precision: 0,
          step: 1,
          unit: '°',
        },
      ],
    },
  };
};

export const offsetAngleGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '旋转',
    content: {
      spark: 'label',
      label: '旋转角度',
      tooltip: '旋转角度',
      content: {
        spark: 'enter',
        index: 'offsetAngle',
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
              step: 1,
              unit: '°',
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
              step: 1,
              unit: '°',
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
              step: 1,
              unit: '°',
            },
          ],
        },
      },
    },
  };
};

export const destAngleGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '旋转到',
    content: {
      spark: 'label',
      label: '目标旋转值',
      tooltip: '目标旋转值',
      width: 80,
      content: {
        spark: 'enter',
        index: 'destAngle',
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
              step: 1,
              unit: '°',
              precision: 0,
            },
            {
              spark: 'number',
              index: 1,
              cols: 2,
              width: 16,
              label: 'Y',
              tooltip: 'Y',
              defaultValue: 0,
              step: 1,
              unit: '°',
              precision: 0,
            },
            {
              spark: 'number',
              index: 2,
              cols: 2,
              width: 16,
              label: 'Z',
              tooltip: 'Z',
              defaultValue: 0,
              step: 1,
              unit: '°',
              precision: 0,
            },
          ],
        },
      },
    },
  };
};
