import { SparkFn } from '../';
import { colorSpark } from '../../common/colorSpark';
import { headerGroup } from '../groups';
import { LAYER_TYPE } from '../groups/headerGroup/layerTypeSpark3D';

const CLEAR_FLAG_TYPE = [
  {
    label: '纯色',
    value: 0,
  },
  {
    label: '天空盒',
    value: 1,
  },
  {
    label: '深度信息',
    value: 2,
  },
];

const PROJECTION_TYPE = [
  {
    label: '透视投影',
    value: 0,
  },
  {
    label: '正交投影',
    value: 1,
  },
];

export const Camera: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup]
      .map(fn => fn(props, envs))
      .concat([
        {
          spark: 'group',
          label: '相机',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'block',
                content: {
                  spark: 'select',
                  index: 'clearFlag',
                  label: '清除模式',
                  tooltip: '相机渲染前清除画板的方式',
                  defaultValue: 2,
                  options: CLEAR_FLAG_TYPE,
                },
              },
              colorSpark({
                spark: 'color',
                index: 'clearColor',
                label: '背景颜色',
                defaultValue: [0, 0, 0],
              }),
              {
                spark: 'block',
                hidden: true,
                content: {
                  spark: 'select',
                  index: 'cullingMask',
                  label: '筛选图层',
                  tooltip: '相机筛选用于渲染的图层',
                  defaultValue: 'Default',
                  options: LAYER_TYPE,
                },
              },
              {
                spark: 'block',
                content: {
                  spark: 'select',
                  index: 'projection',
                  label: '投影类型',
                  tooltip: '相机投影类型',
                  defaultValue: 0,
                  options: PROJECTION_TYPE,
                },
              },
              {
                spark: 'check',
                index: 'projection',
                check: {
                  hidden: value => value !== 0,
                },
                content: {
                  spark: 'block',
                  content: {
                    spark: 'number',
                    index: 'fieldOfView',
                    label: '垂直角度',
                    defaultValue: 60,
                    tooltip: '相机视角垂直角度',
                    min: 0,
                    max: 180,
                    step: 0.01,
                    precision: 2,
                    unit: '°',
                  },
                },
              },
              {
                spark: 'check',
                index: 'projection',
                check: {
                  hidden: value => value !== 1,
                },
                content: {
                  spark: 'block',
                  content: {
                    spark: 'number',
                    index: 'orthographicVerticalSize',
                    label: '垂直尺寸',
                    defaultValue: 5,
                    tooltip: '相机正交投影垂直尺寸',
                    min: 0,
                    step: 0.03,
                    precision: 2,
                  },
                },
              },
              {
                spark: 'grid',
                content: [
                  {
                    spark: 'block',
                    cols: 3,
                    content: {
                      spark: 'number',
                      index: 'nearClip',
                      label: '近切面',
                      defaultValue: 0.3,
                      step: 0.03,
                      min: 0.1,
                      precision: 2,
                      tooltip: '相对相机的距离，距离内不会渲染',
                    },
                  },
                  {
                    spark: 'block',
                    cols: 3,
                    content: {
                      spark: 'number',
                      index: 'farClip',
                      label: '远切面',
                      defaultValue: 1000,
                      step: 0.03,
                      min: 0.1,
                      precision: 2,
                      tooltip: '相对相机的距离，距离内不会渲染',
                    },
                  },
                ],
              },
              {
                spark: 'block',
                content: {
                  spark: 'label',
                  label: '视口',
                  tooltip: '相机在屏幕上渲染的矩形区域',
                  content: {
                    spark: 'enter',
                    index: 'normalizedViewport',
                    content: {
                      spark: 'grid',
                      content: [
                        {
                          spark: 'number',
                          width: 24,
                          index: 0,
                          label: 'X',
                          cols: 3,
                          defaultValue: 0,
                          step: 0.03,
                          precision: 2,
                        },
                        {
                          spark: 'number',
                          width: 24,
                          index: 1,
                          label: 'Y',
                          cols: 3,
                          defaultValue: 0,
                          step: 0.03,
                          precision: 2,
                        },
                        {
                          spark: 'number',
                          width: 24,
                          index: 2,
                          label: 'W',
                          cols: 3,
                          defaultValue: 0,
                          step: 0.03,
                          precision: 2,
                        },
                        {
                          spark: 'number',
                          width: 24,
                          index: 3,
                          label: 'H',
                          cols: 3,
                          defaultValue: 0,
                          step: 0.03,
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
      ]),
  };
};
