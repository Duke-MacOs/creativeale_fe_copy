import { PHYSICS_3D_TYPE } from '../../../constants';
import { SparkFn } from '../..';
import { Button } from 'antd';
import { useSelector } from 'react-redux';
import { layerModalController } from '@editor/Elements/LayerCollisions';

export const physicsGroup: SparkFn = () => {
  return {
    spark: 'group',
    label: '物理',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'check',
          index: 'physics',
          check: {
            hidden: physics => ['none', undefined].includes(physics?.type),
          },
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'value',
                index: 'layer',
                cols: 5,
                content() {
                  const layerCollisionName = useSelector(
                    ({
                      project: {
                        settings: { layerCollisionName = [] },
                      },
                    }: EditorState) => layerCollisionName
                  );
                  return {
                    spark: 'select',
                    index: 'layer',
                    label: '碰撞组',
                    defaultValue: 0,
                    options: layerCollisionName.map(({ name, key }) => ({
                      label: name,
                      value: Number(key),
                    })),
                  };
                },
              },
              {
                spark: 'element',
                cols: 1,
                content() {
                  return <Button onClick={layerModalController.showModal}>设置</Button>;
                },
              },
            ],
          },
        },
        {
          spark: 'enter',
          index: 'physics',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'select',
                index: 'type',
                label: '物理类型',
                tooltip: '物理类型',
                width: 96,
                options: PHYSICS_3D_TYPE,
                defaultValue: 'none',
              },
              {
                spark: 'check',
                index: 'type',
                check: {
                  hidden: type => ['none', undefined].includes(type),
                },
                content: {
                  spark: 'grid',
                  content: [
                    {
                      spark: 'label',
                      label: '传感器',
                      tooltip: '是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应',
                      content: {
                        spark: 'boolean',
                        index: 'isTrigger',
                        defaultValue: false,
                      },
                    },
                    {
                      spark: 'check',
                      index: 'type',
                      check: {
                        hidden: type => type !== 'dynamic',
                      },
                      content: {
                        spark: 'grid',
                        content: [
                          {
                            spark: 'number',
                            index: 'mass',
                            label: '质量',
                            tooltip: '物体质量',
                            min: 1,
                            defaultValue: 1,
                            step: 0.03,
                            precision: 2,
                          },
                          {
                            spark: 'number',
                            index: 'linearDamping',
                            label: '线性阻尼',
                            tooltip: '线性速度阻尼系数',
                            min: 0,
                            max: 10,
                            defaultValue: 0,
                            step: 0.03,
                            precision: 2,
                          },
                          {
                            spark: 'number',
                            index: 'angularDamping',
                            label: '旋转阻尼',
                            tooltip: '旋转速度阻尼系数',
                            min: 0,
                            max: 1,
                            defaultValue: 0,
                            step: 0.03,
                            precision: 2,
                          },
                          {
                            spark: 'enter',
                            index: 'linearVelocity',
                            content: {
                              spark: 'label',
                              label: '线速度',
                              tooltip: '物体线速度',
                              content: {
                                spark: 'grid',
                                content: [
                                  {
                                    spark: 'number',
                                    index: 0,
                                    label: 'X',
                                    cols: 2,
                                    width: 16,
                                    defaultValue: 0,
                                    step: 0.03,
                                    precision: 2,
                                  },
                                  {
                                    spark: 'number',
                                    index: 1,
                                    label: 'Y',
                                    cols: 2,
                                    width: 16,
                                    defaultValue: 0,
                                    step: 0.03,
                                    precision: 2,
                                  },
                                  {
                                    spark: 'number',
                                    index: 2,
                                    label: 'Z',
                                    cols: 2,
                                    width: 16,
                                    defaultValue: 0,
                                    step: 0.03,
                                    precision: 2,
                                  },
                                ],
                              },
                            },
                          },
                          {
                            spark: 'enter',
                            index: 'angularVelocity',
                            content: {
                              spark: 'label',
                              label: '角速度',
                              tooltip: '物体角速度',
                              content: {
                                spark: 'grid',
                                content: [
                                  {
                                    spark: 'number',
                                    index: 0,
                                    label: 'X',
                                    cols: 2,
                                    width: 16,
                                    defaultValue: 0,
                                    step: 0.03,
                                    precision: 2,
                                  },
                                  {
                                    spark: 'number',
                                    index: 1,
                                    label: 'Y',
                                    cols: 2,
                                    width: 16,
                                    defaultValue: 0,
                                    step: 0.03,
                                    precision: 2,
                                  },
                                  {
                                    spark: 'number',
                                    index: 2,
                                    label: 'Z',
                                    cols: 2,
                                    width: 16,
                                    defaultValue: 0,
                                    step: 0.03,
                                    precision: 2,
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                    {
                      spark: 'slider',
                      index: 'restitution',
                      label: '弹性系数',
                      tooltip: '弹性系数',
                      defaultValue: 0,
                      precision: 0,
                      min: 0,
                      max: 1,
                      unit: '%',
                      ratio: 100,
                      inputNumber: true,
                    },
                    {
                      spark: 'slider',
                      index: 'friction',
                      label: '摩擦系数',
                      tooltip: '摩擦系数',
                      defaultValue: 0.2,
                      min: 0,
                      max: 1,
                      unit: '%',
                      ratio: 100,
                      precision: 0,
                      inputNumber: true,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
};
