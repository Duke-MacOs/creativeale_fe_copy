// 3D 粒子
import { SparkFn } from '..';
import { colorSpark } from '../../common/colorSpark';
import { headerGroup } from '../groups';
import { colliderGroup } from './MeshSprite3D/colliderGroup';
import { physicsGroup } from './MeshSprite3D/physicsGroup';
import { materialsGroup } from './Materials';

export const ShurikenParticle3D: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup]
      .concat(
        () => ({
          spark: 'group',
          label: '粒子',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'number',
                index: 'duration',
                label: '时长',
                defaultValue: 5,
                min: 0,
                step: 0.03,
                precision: 2,
                unit: 's',
                tooltip: '控制生成粒子的时长。如果开启了循环，则表明一个周期的时长。',
              },
              {
                spark: 'label',
                label: '循环',
                tooltip: '是否循环',
                content: {
                  spark: 'boolean',
                  index: 'looping',
                  defaultValue: true,
                },
              },
              {
                spark: 'label',
                label: '自动播放',
                tooltip: '是否自动播放',
                content: {
                  spark: 'boolean',
                  index: 'playOnAwake',
                  defaultValue: true,
                },
              },
              {
                spark: 'select',
                index: 'startDelayType',
                defaultValue: 0,
                options: [
                  {
                    label: '常量',
                    value: 0,
                  },
                  {
                    label: '两个常量随机',
                    value: 1,
                  },
                ],
                label: '初始延迟类型',
                tooltip: '初始延迟类型',
              },
              {
                spark: 'check',
                index: 'startDelayType',
                check: {
                  hidden: startDelayType => startDelayType !== 0,
                },
                content: {
                  spark: 'number',
                  index: 'startDelay',
                  label: '初始延迟时间',
                  defaultValue: 0,
                  min: 0,
                  precision: 2,
                  step: 0.03,
                  tooltip: '粒子生成的延迟时间，单位为 s',
                },
              },
              {
                spark: 'check',
                index: 'startDelayType',
                check: {
                  hidden: startDelayType => startDelayType !== 1,
                },
                content: {
                  spark: 'number',
                  index: 'startDelayMin',
                  label: '初始最小延迟',
                  defaultValue: 0,
                  min: 0,
                  precision: 2,
                  step: 0.03,
                  tooltip: '粒子生成的延迟时间，单位为 s',
                },
              },
              {
                spark: 'check',
                index: 'startDelayType',
                check: {
                  hidden: startDelayType => startDelayType !== 1,
                },
                content: {
                  spark: 'number',
                  index: 'startDelayMax',
                  label: '初始最小延迟',
                  defaultValue: 0,
                  min: 0,
                  precision: 2,
                  step: 0.03,
                  tooltip: '粒子生成的延迟时间，单位为 s',
                },
              },
              {
                spark: 'select',
                index: 'startLifetimeType',
                defaultValue: 0,
                options: [
                  {
                    label: '常量',
                    value: 0,
                  },
                  {
                    label: '两个常量随机',
                    value: 2,
                  },
                ],
                label: '初始存活类型',
                tooltip: '初始存活类型',
              },
              {
                spark: 'check',
                index: 'startLifetimeType',
                check: {
                  hidden: startLifetimeType => startLifetimeType !== 0,
                },
                content: {
                  spark: 'number',
                  index: 'startLifetimeConstant',
                  label: '初始存活时间',
                  defaultValue: 5,
                  min: 0.0001,
                  precision: 2,
                  step: 0.03,
                  tooltip: '粒子生成的延迟时间，单位为 s',
                },
              },
              {
                spark: 'check',
                index: 'startLifetimeType',
                check: {
                  hidden: startLifetimeType => startLifetimeType !== 2,
                },
                content: {
                  spark: 'number',
                  index: 'startLifetimeConstantMin',
                  label: '初始存活最小时间',
                  defaultValue: 5,
                  min: 0.0001,
                  precision: 2,
                  step: 0.03,
                  tooltip: '粒子生成的延迟时间，单位为 s',
                },
              },
              {
                spark: 'check',
                index: 'startLifetimeType',
                check: {
                  hidden: startLifetimeType => startLifetimeType !== 2,
                },
                content: {
                  spark: 'number',
                  index: 'startLifetimeConstantMax',
                  label: '初始存活最小时间',
                  defaultValue: 5,
                  min: 0.0001,
                  precision: 2,
                  step: 0.03,
                  tooltip: '粒子生成的延迟时间，单位为 s',
                },
              },
              {
                spark: 'select',
                index: 'startSpeedType',
                defaultValue: 0,
                options: [
                  {
                    label: '常量',
                    value: 0,
                  },
                  {
                    label: '两个常量随机',
                    value: 2,
                  },
                ],
                label: '初始速度类型',
                tooltip: '初始速度类型',
              },
              {
                spark: 'check',
                index: 'startSpeedType',
                check: {
                  hidden: startLifetimeType => startLifetimeType !== 0,
                },
                content: {
                  spark: 'number',
                  index: 'startSpeedConstant',
                  label: '初始速度',
                  defaultValue: 5,
                  min: -100000,
                  max: 100000,
                  precision: 2,
                  step: 0.03,
                  tooltip: '初始速度',
                },
              },
              {
                spark: 'check',
                index: 'startSpeedType',
                check: {
                  hidden: startLifetimeType => startLifetimeType !== 2,
                },
                content: {
                  spark: 'number',
                  index: 'startSpeedConstantMin',
                  label: '初始最小速度',
                  defaultValue: 5,
                  min: -100000,
                  max: 100000,
                  precision: 2,
                  step: 0.03,
                  tooltip: '初始最小速度',
                },
              },
              {
                spark: 'check',
                index: 'startSpeedType',
                check: {
                  hidden: startLifetimeType => startLifetimeType !== 2,
                },
                content: {
                  spark: 'number',
                  index: 'startSpeedConstantMax',
                  label: '初始最大速度',
                  defaultValue: 5,
                  min: -100000,
                  max: 100000,
                  precision: 2,
                  step: 0.03,
                  tooltip: '初始最大速度',
                },
              },
              {
                spark: 'select',
                index: 'startSizeType',
                defaultValue: 0,
                options: [
                  {
                    label: '常量',
                    value: 0,
                  },
                  {
                    label: '两个常量随机',
                    value: 2,
                  },
                ],
                label: '初始尺寸类型',
                tooltip: '初始尺寸类型',
              },
              {
                spark: 'check',
                index: 'startSizeType',
                check: {
                  hidden: startSizeType => startSizeType !== 0,
                },
                content: {
                  spark: 'number',
                  index: 'startSizeConstant',
                  label: '初始尺寸',
                  defaultValue: 1,
                  tooltip: '初始尺寸',
                  min: 0,
                  max: 10000,
                  precision: 2,
                  step: 0.03,
                },
              },
              {
                spark: 'check',
                index: 'startSizeType',
                check: {
                  hidden: startSizeType => startSizeType !== 2,
                },
                content: {
                  spark: 'number',
                  index: 'startSizeConstantMin',
                  label: '初始最小尺寸',
                  defaultValue: 1,
                  tooltip: '初始最小尺寸',
                  min: 0,
                  max: 10000,
                  precision: 2,
                  step: 0.03,
                },
              },
              {
                spark: 'check',
                index: 'startSizeType',
                check: {
                  hidden: startSizeType => startSizeType !== 2,
                },
                content: {
                  spark: 'number',
                  index: 'startSizeConstantMax',
                  label: '初始最大尺寸',
                  defaultValue: 1,
                  tooltip: '初始最大尺寸',
                  min: 0,
                  max: 10000,
                  precision: 2,
                  step: 0.03,
                },
              },
              {
                spark: 'select',
                index: 'startRotationType',
                defaultValue: 0,
                options: [
                  {
                    label: '常量',
                    value: 0,
                  },
                  {
                    label: '两个常量随机',
                    value: 2,
                  },
                ],
                label: '初始旋转类型',
                tooltip: '初始旋转类型',
              },
              {
                spark: 'check',
                index: 'startRotationType',
                check: {
                  hidden: startRotationType => startRotationType !== 0,
                },
                content: {
                  spark: 'number',
                  index: 'startRotationConstant',
                  label: '初始旋转角度',
                  defaultValue: 0,
                  min: -100000,
                  max: 100000,
                  tooltip: '初始旋转角度',
                  precision: 2,
                  step: 0.03,
                },
              },
              {
                spark: 'check',
                index: 'startRotationType',
                check: {
                  hidden: startRotationType => startRotationType !== 2,
                },
                content: {
                  spark: 'number',
                  index: 'startRotationConstantMin',
                  label: '初始旋转最小角度',
                  defaultValue: 0,
                  min: -100000,
                  max: 100000,
                  tooltip: '初始旋转最小角度',
                  precision: 2,
                  step: 0.03,
                },
              },
              {
                spark: 'check',
                index: 'startRotationType',
                check: {
                  hidden: startRotationType => startRotationType !== 2,
                },
                content: {
                  spark: 'number',
                  index: 'startRotationConstantMax',
                  label: '初始旋转最大角度',
                  defaultValue: 0,
                  min: -100000,
                  max: 100000,
                  tooltip: '初始旋转最大角度',
                  precision: 2,
                  step: 0.03,
                },
              },
              {
                spark: 'number',
                index: 'randomizeRotationDirection',
                label: '随机旋转方向',
                defaultValue: 0,
                min: 0,
                max: 1,
                tooltip: '随机旋转方向',
                precision: 2,
                step: 0.03,
              },
              {
                spark: 'select',
                index: 'startColorType',
                defaultValue: 0,
                options: [
                  {
                    label: '常量',
                    value: 0,
                  },
                  {
                    label: '两个常量随机',
                    value: 2,
                  },
                ],
                label: '初始颜色类型',
                tooltip: '初始颜色类型',
              },
              {
                spark: 'check',
                index: 'startColorType',
                check: {
                  hidden: startColorType => startColorType !== 0,
                },
                content: colorSpark({
                  spark: 'color',
                  index: 'startColorConstant',
                  label: '初始颜色',
                  defaultValue: [0, 0, 0],
                }),
              },
              {
                spark: 'check',
                index: 'startColorType',
                check: {
                  hidden: startColorType => startColorType !== 2,
                },
                content: colorSpark({
                  spark: 'color',
                  index: 'startColorConstantMin',
                  label: '初始颜色1',
                  defaultValue: [0, 0, 0],
                }),
              },
              {
                spark: 'check',
                index: 'startColorType',
                check: {
                  hidden: startColorType => startColorType !== 0,
                },
                content: colorSpark({
                  spark: 'color',
                  index: 'startColorConstantMax',
                  label: '初始颜色2',
                  defaultValue: [0, 0, 0],
                }),
              },
              {
                spark: 'number',
                index: 'gravityModifier',
                label: '重力缩放',
                defaultValue: 0,
                min: -100000,
                max: 100000,
                tooltip: '重力缩放',
                precision: 2,
                step: 0.03,
              },
              {
                spark: 'select',
                index: 'simulationSpace',
                label: '模拟空间',
                defaultValue: 1,
                tooltip: '模拟空间',
                options: [
                  {
                    label: '本地',
                    value: 1,
                  },
                  {
                    label: '全局',
                    value: 0,
                  },
                ],
              },
              {
                spark: 'number',
                index: 'simulationSpeed',
                label: '模拟速度',
                defaultValue: 1,
                tooltip: '模拟速度',
                min: 0,
                max: 100,
                precision: 2,
                step: 0.03,
              },
              {
                spark: 'select',
                index: 'scaleMode',
                label: '缩放模式',
                defaultValue: 1,
                tooltip: '缩放模式',
                options: [
                  {
                    label: '层级',
                    value: 0,
                  },
                  {
                    label: '本地',
                    value: 1,
                  },
                  {
                    label: '形状',
                    value: 2,
                  },
                ],
              },
            ],
          },
        }),
        physicsGroup,
        (props, envs) => {
          return {
            spark: 'check',
            index: 'physics',
            check: {
              hidden: physics => ['none', undefined].includes(physics?.type),
            },
            content: colliderGroup(props, envs),
          };
        },
        materialsGroup
      )
      .map(fn => fn(props, envs)),
  };
};
