import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { blueprintGroupExtra } from '@editor/Editor/Blueprint/layout/Main/Property/getPropsGroup';
import render, { ArrayCell, CellContext, Spark } from '@editor/Editor/Property/cells';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { useContext } from 'react';
import { formulaSpark } from '../../../../../common/formulaSpark';
import { COLLIDE_GROUP_TYPE, RIGID_TYPE } from '../../../../../constants';
import { IEventDesc, nodeId_SPARK, time_SPARK } from '../../common';
import { delay } from '../../common/highlight';
import { getCollideGroup } from './useCollideGroup';
import { useJointsGroup } from './useJointsGroup';

export const RigidBody: IEventDesc = {
  name: '启用物理',
  category: '高级',
  link: 'https://magicplay.oceanengine.com/tutorials/senior/one',
  content: {
    spark: 'grid',
    content: [
      {
        spark: 'value',
        index: '',
        content() {
          const { blueprint } = useContext(CellContext);
          return Object.assign(
            {
              spark: 'group',
              content: {
                spark: 'grid',
                content: [
                  { ...nodeId_SPARK, hidden: !blueprint },
                  checkSpark(formulaSpark(time_SPARK), {
                    hidden: useEnableBlueprint,
                  }),
                  {
                    index: 'rigidBodyType',
                    spark: 'select',
                    label: '刚体类型',
                    defaultValue: 'dynamic',
                    options: RIGID_TYPE,
                    tooltip: '刚体类型',
                    required: true,
                  },
                  {
                    spark: 'check',
                    index: 'rigidBodyType',
                    check: {
                      hidden: value => value !== 'dynamic',
                    },
                    content: {
                      spark: 'flex',
                      content: [
                        formulaSpark({
                          index: 'linearDamping',
                          spark: 'number',
                          label: '线性阻尼',
                          defaultValue: 0,
                          step: 0.1,
                          tooltip: '线性速度阻尼系数',
                          min: 0,
                          max: 1,
                          required: true,
                        }),
                        formulaSpark({
                          index: 'angularDamping',
                          spark: 'number',
                          label: '旋转阻尼',
                          defaultValue: 0,
                          step: 0.1,
                          tooltip: '旋转速度阻尼系数',
                          min: 0,
                          max: 1,
                          required: true,
                        }),
                      ],
                    },
                  },
                  {
                    spark: 'check',
                    index: 'rigidBodyType',
                    check: {
                      hidden: value => value === 'static',
                    },
                    content: {
                      spark: 'flex',
                      content: [
                        {
                          spark: 'check',
                          index: 'rigidBodyType',
                          check: {
                            hidden: value => value !== 'dynamic',
                          },
                          content: formulaSpark({
                            index: 'gravityScale',
                            spark: 'number',
                            label: '重力系数',
                            defaultValue: 1,
                            tooltip: '重力缩放系数',
                            required: true,
                          }),
                        },
                        {
                          spark: 'check',
                          index: 'rigidBodyType',
                          check: {
                            hidden: rigidBodyType => rigidBodyType === 'static',
                          },
                          content: formulaSpark({
                            index: 'angularVelocity',
                            spark: 'number',
                            label: '角速度',
                            defaultValue: 0,
                            tooltip: '角速度',
                            required: true,
                          }),
                        },
                      ],
                    },
                  },
                  {
                    spark: 'check',
                    index: 'rigidBodyType',
                    check: {
                      hidden: value => value === 'static',
                    },
                    content: {
                      spark: 'flex',
                      content: [
                        formulaSpark({
                          index: 'linearVelocityX',
                          spark: 'number',
                          label: '水平速度',
                          defaultValue: 0,
                          tooltip: '水平速度',
                          required: true,
                        }),
                        formulaSpark({
                          index: 'linearVelocityY',
                          spark: 'number',
                          label: '垂直速度',
                          defaultValue: 0,
                          tooltip: '垂直速度',
                          required: true,
                        }),
                      ],
                    },
                  },
                  {
                    spark: 'check',
                    index: 'rigidBodyType',
                    check: {
                      hidden: value => value !== 'velocity',
                    },
                    content: {
                      spark: 'grid',
                      content: [
                        formulaSpark({
                          index: 'linearVelocityX',
                          spark: 'number',
                          label: '水平速度',
                          defaultValue: 0,
                          tooltip: '水平速度',
                          required: true,
                        }),
                        formulaSpark({
                          index: 'linearVelocityY',
                          spark: 'number',
                          label: '垂直速度',
                          defaultValue: 0,
                          tooltip: '垂直速度',
                          required: true,
                        }),
                      ],
                    },
                  },
                  {
                    spark: 'check',
                    index: 'rigidBodyType',
                    check: {
                      hidden: value => value !== 'torque',
                    },
                    content: {
                      index: 'torque',
                      spark: 'number',
                      label: '扭矩',
                      defaultValue: 0,
                      tooltip: '扭矩',
                      required: true,
                    },
                  },
                  {
                    index: 'collideGroup',
                    spark: 'select',
                    label: '碰撞组',
                    tooltip: '设置所属碰撞组， 不同的碰撞组不发生碰撞，默认碰撞组与其他碰撞组都可以发生碰撞。',
                    defaultValue: 0,
                    options: COLLIDE_GROUP_TYPE,
                    required: true,
                  },
                  {
                    index: 'rigidBodyCategory',
                    spark: 'string',
                    label: '刚体类别',
                    tooltip: '刚体类别，方便在碰撞触发方式那里进行筛选',
                    defaultValue: '',
                  },
                  {
                    spark: 'check',
                    index: 'rigidBodyType',
                    check: {
                      hidden: value => value === 'static',
                    },
                    content: {
                      spark: 'flex',
                      content: [
                        {
                          spark: 'label',
                          label: '旋转',
                          tooltip: '是否允许旋转',
                          content: {
                            index: 'allowRotation',
                            spark: 'boolean',
                            defaultValue: true,
                            required: true,
                          },
                        },
                        {
                          spark: 'label',
                          label: '休眠',
                          tooltip: '是否允许休眠',
                          content: {
                            index: 'allowSleep',
                            spark: 'boolean',
                            defaultValue: true,
                            required: true,
                          },
                        },
                        {
                          spark: 'label',
                          label: '防止高速穿透',
                          tooltip: '是否高速移动的物体，设置为true，可以防止高速穿透',
                          content: {
                            index: 'bullet',
                            spark: 'boolean',
                            defaultValue: false,
                            required: true,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            } as Spark,
            blueprint &&
              ({
                label: '启用物理',
                extra: blueprintGroupExtra,
              } as Spark)
          );
        },
      },
      {
        spark: 'value',
        index: 'colliders',
        content(colliders = [], onChange) {
          return {
            spark: 'group',
            label: '碰撞体',
            content: {
              spark: 'element',
              content() {
                return (
                  <ArrayCell
                    label="碰撞体"
                    array={colliders}
                    onChange={onChange}
                    defaultItem={{
                      type: 'box',
                      density: 10,
                      friction: 0.2,
                      restitution: 0,
                      isSensor: false,
                      x: 0,
                      y: 0,
                      width: 0,
                      height: 0,
                    }}
                    render={(value, onChange) => {
                      return render(getCollideGroup(value, onChange));
                    }}
                  />
                );
              },
            },
          };
        },
      },
      {
        spark: 'value',
        index: 'joints',
        content(joints = [], onChange) {
          return {
            spark: 'group',
            label: '物理关节',
            content: {
              spark: 'element',
              content() {
                return (
                  <ArrayCell
                    label="节点"
                    array={joints}
                    onChange={onChange}
                    defaultItem={{
                      type: 'distance',
                      otherAnchorX: 0,
                      otherAnchorY: 0,
                      selfAnchorX: 0,
                      selfAnchorY: 0,
                      frequency: 1,
                      damping: 0,
                      length: 0,
                      collideConnected: false,
                    }}
                    render={(item, onChange) => {
                      const group = useJointsGroup(item, (partial: any) => {
                        onChange({ ...item, ...partial });
                      });
                      return render(group);
                    }}
                  />
                );
              },
            },
          };
        },
      },
    ],
  },
  extraProps: () => ({
    rigidBodyType: 'dynamic',
    colliders: [
      {
        density: 10,
        friction: 0.2,
        height: 0,
        isSensor: false,
        restitution: 0,
        type: 'box',
        width: 0,
        x: 0,
        y: 0,
        autoSize: true,
      },
    ],
  }),
  checkRef({ joints = [] }, nodeIds) {
    return (joints as any).some(({ otherNodeId }: { otherNodeId: number }) => nodeIds.includes(otherNodeId));
  },
  Summary: ({ props: { time } }) => {
    return <>{delay(time)} 启用元素物理属性</>;
  },
};
