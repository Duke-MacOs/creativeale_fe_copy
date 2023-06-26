import { MESH_TYPE } from '../../../constants';
import { SparkFn } from '../..';

export const modelGroup: SparkFn = props => {
  return {
    spark: 'group',
    label: '网格',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'select',
          index: 'meshType',
          label: '网格类型',
          hidden: props.type !== 'MeshSprite3D',
          tooltip: '节点的网格类型',
          options: MESH_TYPE,
          defaultValue: 'asset',
        },
        {
          spark: 'flex',
          content: [
            {
              spark: 'label',
              label: '网格阴影',
              tooltip: '设置网格阴影',
              content: {
                spark: 'boolean',
                index: 'castShadows',
                defaultValue: true,
              },
            },
            {
              spark: 'label',
              label: '接收阴影',
              tooltip: '接收其它阴影',
              content: {
                spark: 'boolean',
                index: 'receiveShadows',
                defaultValue: true,
              },
            },
          ],
        },
      ],
    },
  };
};
