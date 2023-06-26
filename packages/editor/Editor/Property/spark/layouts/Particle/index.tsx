import type { SparkFn } from '../';
import { extraSpark, headerGroup, othersGroup, transformGroup } from '../groups';
import { IGroupSpark } from '../../../cells/types';
import { customSettings } from './customSettings';
import { playScriptSpark } from './playScriptSpark';

const emissionRateGroup: SparkFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '发射器参数',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'block',
          content: {
            index: 'emissionRate',
            spark: 'slider',
            label: '发射速率',
            defaultValue: 1,
            tooltip: '发射器发射速率',
            inputNumber: false,
            unit: '个/s',
            precision: 0,
            min: 1,
            max: 800,
            step: 1,
          },
        },
      ],
    },
  };
};

const particleGroup: SparkFn = (props, envs): IGroupSpark => {
  return {
    spark: 'group',
    label: '粒子参数',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'block',
          content: {
            spark: 'label',
            label: '拖尾效果',
            tooltip: '是否开启拖尾效果',
            content: {
              index: 'trailing',
              spark: 'boolean',
              defaultValue: false,
            },
          },
        },
        {
          spark: 'block',
          content: {
            index: ['minStartSize', 'maxStartSize'],
            spark: 'slider',
            inputNumber: false,
            label: '初始尺寸范围',
            defaultValue: 0,
            tooltip: 'minStartSize - maxStartSize',
            min: 0,
            max: 2000,
            step: 1,
          },
        },
        {
          spark: 'block',
          content: {
            index: ['minEndSize', 'maxEndSize'],
            spark: 'slider',
            inputNumber: false,
            label: '结束尺寸范围',
            defaultValue: 0,
            tooltip: 'minEndSize - maxEndSize',
            min: 0,
            max: 2000,
            step: 1,
          },
        },
        {
          spark: 'block',
          content: {
            index: 'particleDuration',
            spark: 'slider',
            inputNumber: false,
            label: '粒子持续时长',
            defaultValue: 100,
            tooltip: 'particleDuration',
            min: 0,
            max: 10000,
            precision: 2,
            ratio: -1000,
            unit: 's',
            step: 10,
          },
        },
        {
          spark: 'block',
          content: {
            index: 'particleDurationVar',
            spark: 'slider',
            inputNumber: false,
            label: '粒子持续时间浮动范围',
            defaultValue: 100,
            tooltip: 'particleDurationVar',
            ratio: -1000,
            precision: 2,
            unit: 's',
            min: 0,
            max: 10000,
            step: 10,
          },
        },
        {
          spark: 'block',
          content: {
            index: 'maxPartices',
            spark: 'slider',
            width: 80,
            inputNumber: false,
            label: '最大粒子数',
            defaultValue: 0,
            tooltip: 'maxPartices',
            precision: 0,
            unit: '个',
            min: 0,
            max: 1000,
            step: 1,
          },
        },
        {
          spark: 'block',
          content: {
            spark: 'label',
            label: '粒子坐标偏移范围',
            tooltip: 'positionVariance',
            width: 120,
            content: {
              spark: 'enter',
              index: 'positionVariance',
              content: {
                spark: 'flex',
                content: [
                  {
                    spark: 'number',
                    label: 'X',
                    width: 32,
                    index: 0,
                    defaultValue: 0,
                    step: 0.1,
                    precision: 1,
                    min: -1200,
                    max: 1200,
                  },
                  {
                    spark: 'number',
                    label: 'Y',
                    width: 32,
                    index: 1,
                    defaultValue: 0,
                    step: 0.1,
                    precision: 1,
                    min: -1200,
                    max: 1200,
                  },
                ],
              },
            },
          },
        },
        customSettings(props, envs),
        playScriptSpark(),
      ],
    },
  };
};

export const Particle: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [extraSpark, headerGroup, transformGroup, othersGroup, emissionRateGroup, particleGroup].map(fn =>
      fn(props, envs)
    ),
  };
};
