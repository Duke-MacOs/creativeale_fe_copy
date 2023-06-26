// 拖尾节点
import { SparkFn } from '../';
import { headerGroup } from '../groups';
import { materialsGroup } from './Materials';
import { colliderGroup } from './MeshSprite3D/colliderGroup';
import { physicsGroup } from './MeshSprite3D/physicsGroup';

export const Trail3D: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup, materialsGroup, physicsGroup]
      .concat((props, envs) => {
        return {
          spark: 'check',
          index: 'physics',
          check: {
            hidden: physics => ['none', undefined].includes(physics?.type),
          },
          content: colliderGroup(props, envs),
        };
      })
      .map(fn => fn(props, envs))
      .concat([
        {
          spark: 'group',
          label: '属性设置',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'number',
                label: '时长',
                index: 'time',
                min: 0,
                step: 0.03,
                precision: 2,
                unit: 's',
                defaultValue: 5,
              },
              {
                spark: 'number',
                label: '最小顶点距离',
                index: 'minVertexDistance',
                min: 0,
                step: 0.03,
                precision: 2,
                defaultValue: 0.1,
              },
              {
                spark: 'select',
                label: '对齐方式',
                index: 'alignment',
                options: [
                  {
                    label: '视图',
                    value: 0,
                  },
                  {
                    label: 'Z 轴',
                    value: 1,
                  },
                ],
                defaultValue: 0,
              },
              {
                spark: 'select',
                label: '纹理模式',
                index: 'textureMode',
                options: [
                  {
                    label: '拉伸',
                    value: 0,
                  },
                  {
                    label: '平铺',
                    value: 1,
                  },
                ],
                defaultValue: 0,
              },
            ],
          },
        },
      ]),
  };
};
