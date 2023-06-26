import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { COLLIDER_3D_TYPE } from '../../../constants';
import { SparkFn } from '../..';

const createCollider = (type?: string) => {
  switch (type) {
    case 'sphere':
      return {
        localOffset: [0, 0, 0],
        radius: 0.5,
        type: 'sphere',
      };
    case 'staticPlane':
      return {
        localOffset: [0, 0, 0],
        type: 'staticPlane',
        normal: [0, 1, 0],
      };
    case 'capsule':
      return {
        length: 1.25,
        localOffset: [0, 0, 0],
        orientation: 1,
        radius: 0.5,
        type: 'capsule',
      };
    case 'cylinder':
      return {
        length: 1,
        localOffset: [0, 0, 0],
        orientation: 1,
        radius: 0.5,
        type: 'cylinder',
      };
    case 'mesh':
      return {
        localOffset: [0, 0, 0],
        type: 'mesh',
      };
    case 'cone':
      return {
        type: 'cone',
        radius: 0.5,
        length: 1,
        orientation: 1,
      };
    default:
      return {
        type: 'box3d',
        localOffset: [0, 0, 0],
        size3d: [1, 1, 1],
      };
  }
};

const partial = {
  staticPlane: () => ({
    spark: 'grid',
    content: [],
  }),
  box3d: (idx: number) => ({
    spark: 'label',
    label: '尺寸大小',
    content: {
      spark: 'enter',
      index: 'colliders',
      content: {
        spark: 'enter',
        index: idx,
        content: {
          spark: 'enter',
          index: 'size3d',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'number',
                index: '0',
                label: 'X',
                cols: 2,
                width: 16,
                defaultValue: 0,
                step: 0.03,
                precision: 2,
              },
              {
                spark: 'number',
                index: '1',
                label: 'Y',
                cols: 2,
                width: 16,
                defaultValue: 0,
                step: 0.03,
                precision: 2,
              },
              {
                spark: 'number',
                index: '2',
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
    },
  }),
  sphere: (idx: number) => ({
    spark: 'enter',
    index: 'colliders',
    content: {
      spark: 'enter',
      index: idx,
      content: {
        spark: 'number',
        index: 'radius',
        label: '半径',
        min: 0,
        defaultValue: 0,
        step: 0.03,
        precision: 2,
      },
    },
  }),
  capsule: (idx: number) => ({
    spark: 'enter',
    index: 'colliders',
    content: {
      spark: 'enter',
      index: idx,
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'number',
            index: 'radius',
            label: '半径',
            min: 0,
            defaultValue: 0,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'number',
            index: 'length',
            label: '长度',
            min: 0,
            defaultValue: 0,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'select',
            index: 'orientation',
            options: [
              {
                label: 'x轴',
                value: 0,
              },
              {
                label: 'y轴',
                value: 1,
              },
              {
                label: 'z轴',
                value: 2,
              },
            ],
          },
        ],
      },
    },
  }),
  cylinder: (idx: number) => ({
    spark: 'enter',
    index: 'colliders',
    content: {
      spark: 'enter',
      index: idx,
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'number',
            index: 'radius',
            label: '半径',
            min: 0,
            defaultValue: 0,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'number',
            index: 'length',
            label: '高度',
            min: 0,
            defaultValue: 0,
            step: 0.03,
            precision: 2,
          },
          {
            spark: 'select',
            index: 'orientation',
            options: [
              {
                label: 'x轴',
                value: 0,
              },
              {
                label: 'y轴',
                value: 1,
              },
              {
                label: 'z轴',
                value: 2,
              },
            ],
          },
        ],
      },
    },
  }),
  mesh: () => ({
    spark: 'grid',
    content: [],
  }),
  cone: (idx: number) => ({
    spark: 'enter',
    index: 'colliders',
    content: {
      spark: 'enter',
      index: idx,
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'number',
            index: 'radius',
            label: '半径',
            min: 0,
            step: 0.03,
            precision: 2,
            defaultValue: 0,
          },
          {
            spark: 'number',
            index: 'length',
            label: '高度',
            min: 0,
            step: 0.03,
            precision: 2,
            defaultValue: 0,
          },
          {
            spark: 'select',
            index: 'orientation',
            options: [
              {
                label: 'x轴',
                value: 0,
              },
              {
                label: 'y轴',
                value: 1,
              },
              {
                label: 'z轴',
                value: 2,
              },
            ],
          },
        ],
      },
    },
  }),
};

export const colliderGroup: SparkFn = props => {
  return {
    spark: 'group',
    label: '碰撞体',
    hidden: props.multiple,
    content: {
      spark: 'block',
      content: {
        spark: 'enter',
        index: 'physics',
        content: {
          spark: 'grid',
          content: [
            {
              spark: 'value',
              index: 'colliders',
              content(colliders = [], onChange) {
                return {
                  spark: 'grid',
                  content: colliders.map((item: any, idx: number) => {
                    const onChangeType = (type: string) => {
                      const newColliders = colliders.slice();
                      newColliders[idx] = createCollider(type);
                      onChange(newColliders);
                    };
                    const onDelete = () => {
                      const newColliders = colliders.slice();
                      newColliders.splice(idx, 1);
                      onChange(newColliders);
                    };
                    return {
                      spark: 'grid',
                      content: [
                        {
                          spark: 'element',
                          content: () => {
                            return (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>碰撞体{idx + 1}</span>
                                <DeleteOutlined onClick={onDelete} />
                              </div>
                            );
                          },
                        },
                        {
                          spark: 'element',
                          content: (render: any) => {
                            return render({
                              spark: 'select',
                              label: '类型',
                              options: COLLIDER_3D_TYPE,
                              value: item.type,
                              onChange: onChangeType,
                            });
                          },
                        },
                        {
                          spark: 'label',
                          label: '偏移量',
                          content: {
                            spark: 'enter',
                            index: 'colliders',
                            content: {
                              spark: 'enter',
                              index: idx,
                              content: {
                                spark: 'enter',
                                index: 'localOffset',
                                content: {
                                  spark: 'grid',
                                  content: [
                                    {
                                      spark: 'number',
                                      index: '0',
                                      label: 'X',
                                      cols: 2,
                                      width: 16,
                                      defaultValue: 0,
                                      step: 0.03,
                                      precision: 2,
                                    },
                                    {
                                      spark: 'number',
                                      index: '1',
                                      label: 'Y',
                                      cols: 2,
                                      width: 16,
                                      defaultValue: 0,
                                      step: 0.03,
                                      precision: 2,
                                    },
                                    {
                                      spark: 'number',
                                      index: '2',
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
                          },
                        },
                        partial[item.type as keyof typeof partial]?.(idx),
                      ],
                    };
                  }),
                };
              },
            },
            {
              spark: 'value',
              index: 'colliders',
              content(colliders = [], onChange) {
                return {
                  spark: 'element',
                  content: () => {
                    const addCollider = () => {
                      const newColliders = colliders.slice();
                      newColliders.push(createCollider());
                      onChange(newColliders);
                    };
                    return (
                      <Button block onClick={addCollider} icon={<PlusCircleOutlined />}>
                        新增
                      </Button>
                    );
                  },
                };
              },
            },
          ],
        },
      },
    },
  };
};
