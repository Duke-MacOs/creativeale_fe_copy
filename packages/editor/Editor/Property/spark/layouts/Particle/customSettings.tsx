import { amIHere } from '@shared/utils';
import { useEditor } from '@editor/aStore';
import { CellContext, Spark } from '@editor/Editor/Property/cells';
import { Button } from 'antd';
import { useContext } from 'react';
import { SparkFn } from '..';
import { colorSpark } from '../../common/colorSpark';
import { POSITION_TYPE } from '../../constants';
import { playScriptSpark } from './playScriptSpark';

/**
 * 2D粒子高级参数
 * @link https://bytedance.feishu.cn/docx/doxcnelDwIkQLRVFxprssZxrqrb
 * @param
 * @returns
 */
export const customSettings: SparkFn = ({ id }): Spark => {
  return {
    spark: 'enter',
    index: 'customSettings',
    hidden: amIHere({ release: true }),
    content: {
      spark: 'value',
      index: [],
      visit: true,
      content() {
        const {
          visiting: { onVisit, prev = [], next = [] },
        } = useContext(CellContext);
        const { emitterType } = useEditor(id, 'emitterType');
        if ('customSettings' === next[0]) {
          return {
            spark: 'visit',
            index: 'customSettings',
            label: '返回',
            content: {
              spark: 'group',
              label: '高级参数',
              content: {
                spark: 'grid',
                content: [
                  {
                    spark: 'slider',
                    index: ['minVelocity', 'maxVelocity'],
                    label: '初始速度范围',
                    tooltip: 'minVelocity - maxVelocity',
                    min: 0,
                    max: 600,
                  },
                  {
                    spark: 'slider',
                    label: '初始角度',
                    tooltip: 'angle',
                    index: 'angle',
                    precision: 1,
                    unit: '°',
                    min: -180,
                    max: 180,
                  },
                  {
                    spark: 'slider',
                    label: '初始角度变化范围',
                    tooltip: 'angleVar',
                    index: 'angleVar',
                    precision: 1,
                    unit: '°',
                    min: 0,
                    max: 180,
                  },
                  colorSpark({
                    spark: 'color',
                    index: 'minStartColor',
                    tooltip: 'minStartColor',
                    label: '最小开始颜色',
                    defaultValue: [255, 255, 255],
                  }),
                  colorSpark({
                    spark: 'color',
                    index: 'maxStartColor',
                    tooltip: 'maxStartColor',
                    label: '最大开始颜色',
                    defaultValue: [255, 255, 255],
                  }),
                  colorSpark({
                    spark: 'color',
                    index: 'minEndColor',
                    tooltip: 'minEndColor',
                    label: '最小结束颜色',
                    defaultValue: [255, 255, 255],
                  }),
                  colorSpark({
                    spark: 'color',
                    index: 'maxEndColor',
                    tooltip: 'maxEndColor',
                    label: '最大结束颜色',
                    defaultValue: [255, 255, 255],
                  }),
                  {
                    spark: 'select',
                    label: '位置类型',
                    index: 'positionType',
                    tooltip: 'positionType',
                    options: POSITION_TYPE,
                  },
                  {
                    spark: 'select',
                    label: '原图的混合模式',
                    index: 'blendFuncSource',
                    tooltip: 'blendFuncSource',
                    options: [
                      {
                        label: 'DestinationColor',
                        value: 774,
                      },
                      {
                        label: 'OneMinusDestinationColor',
                        value: 775,
                      },
                      {
                        label: 'SourceAlphaSaturate',
                        value: 776,
                      },
                      {
                        label: 'SourceAlpha',
                        value: 770,
                      },
                    ],
                  },
                  {
                    spark: 'select',
                    label: '目标的混合模式',
                    index: 'blendFuncDestination',
                    tooltip: 'blendFuncDestination',
                    options: [
                      {
                        label: 'Zero',
                        value: 0,
                      },
                      {
                        label: 'One',
                        value: 1,
                      },
                      {
                        label: 'SourceColor',
                        value: 768,
                      },
                      {
                        label: 'OneMinusSourceColor',
                        value: 769,
                      },
                      {
                        label: 'SourceAlpha',
                        value: 770,
                      },
                      {
                        label: 'OneMinusSourceAlpha',
                        value: 771,
                      },
                      {
                        label: 'DestinationAlpha',
                        value: 772,
                      },
                      {
                        label: 'OneMinusDestinationAlpha',
                        value: 773,
                      },
                    ],
                  },
                  ...(emitterType === 0
                    ? ([
                        {
                          spark: 'label',
                          label: '重力',
                          content: {
                            spark: 'enter',
                            index: 'gravity',
                            tooltip: 'gravity',
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
                        {
                          spark: 'slider',
                          index: ['minRadialAccel', 'maxRadialAccel'],
                          label: '径向加速度',
                          tooltip: '粒子径向加速度，即平行于重力方向的加速度，只有在重力模式下可用',
                          min: -800,
                          max: 600,
                        },
                        {
                          spark: 'slider',
                          index: ['minTangentialAccel', 'maxTangentialAccel'],
                          label: '切向加速度',
                          tooltip: '每个粒子的最小切向加速度，即垂直于重力方向的加速度，只有在重力模式下可用',
                          min: -800,
                          max: 800,
                        },
                      ] as Spark[])
                    : ([
                        {
                          spark: 'slider',
                          index: ['minStartRadius', 'maxStartRadius'],
                          label: '开始半径范围',
                          tooltip: 'minStartRadius - maxStartRadius',
                        },
                        {
                          spark: 'slider',
                          index: ['minEndRadius', 'maxEndRadius'],
                          label: '结束半径范围',
                          tooltip: 'minEndRadius - maxEndRadius',
                        },
                        {
                          spark: 'slider',
                          label: '每秒绕起点旋转角度',
                          tooltip: 'rotatePerSecond',
                          index: 'rotatePerSecond',
                          precision: 1,
                          unit: '°',
                          min: -180,
                          max: 180,
                        },
                        {
                          spark: 'slider',
                          label: '每秒绕起点旋转角度的变化范围',
                          tooltip: 'rotatePerSecondVarian',
                          index: 'rotatePerSecondVarian',
                          precision: 1,
                          unit: '°',
                          min: -180,
                          max: 180,
                        },
                      ] as Spark[])),
                  playScriptSpark(),
                ],
              },
            },
          };
        }
        return {
          spark: 'element',
          content() {
            return (
              <Button
                type="primary"
                block
                onClick={() => onVisit(prev.map(({ index }) => index).concat('customSettings'))}
              >
                高级设置
              </Button>
            );
          },
        };
      },
    },
  };
};
