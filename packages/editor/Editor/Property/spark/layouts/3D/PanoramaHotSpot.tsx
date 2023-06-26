import { getPanoramaDataList } from '@editor/utils';
import { useSelector, useStore } from 'react-redux';
import { SparkFn } from '..';
import { extraSpark, headerGroup } from '../groups';
import { enterVector } from '../groups/headerGroup/vectorSpark3D';
import { ResourceBox } from '../groups/resourceSpark/ResourceBox';

export const panoramaHotSpotVectorContent: SparkFn = () => {
  return {
    spark: 'grid',
    content: [
      {
        spark: 'block',
        content: {
          spark: 'label',
          label: '位置',
          tooltip: '节点的本地位置坐标',
          content: enterVector('position'),
        },
      },
      {
        spark: 'value',
        index: 'billboardMode',
        content(value: boolean) {
          return {
            spark: 'block',
            content: {
              spark: 'label',
              label: '旋转',
              tooltip: '节点的本地旋转角度',
              content: enterVector('rotation', ['X', 'Y', 'Z'], value),
            },
          };
        },
      },
      {
        spark: 'block',
        content: {
          spark: 'label',
          label: '缩放',
          tooltip: '节点的本地缩放比例',
          content: enterVector('scale'),
        },
      },
    ],
  };
};

export const PanoramaHotSpot: SparkFn = (props, envs) => {
  const content = [extraSpark, headerGroup];
  return {
    spark: 'grid',
    content: content
      .map(fn => fn(props, envs))
      .concat([
        {
          spark: 'group',
          label: '属性设置',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'block',
                content: {
                  spark: 'label',
                  label: '广告牌模式',
                  content: {
                    spark: 'boolean',
                    index: 'billboardMode',
                    defaultValue: true,
                  },
                },
              },
              {
                spark: 'block',
                content: {
                  spark: 'value',
                  index: 'textureUrl',
                  content(url, onChange) {
                    return {
                      spark: 'element',
                      content() {
                        return (
                          <ResourceBox
                            type="Sprite"
                            url={url}
                            onChange={({ url: src }) => {
                              onChange(src);
                            }}
                          />
                        );
                      },
                    };
                  },
                },
              },
              {
                spark: 'block',
                content: {
                  spark: 'grid',
                  content: [
                    {
                      spark: 'label',
                      label: '热点功能',
                      content: {
                        spark: 'select',
                        index: 'actionType',
                        options: [
                          {
                            label: '无',
                            value: 0,
                          },
                          {
                            label: '跳转',
                            value: 1,
                          },
                          {
                            label: '发送事件',
                            value: 2,
                          },
                        ],
                        defaultValue: 1,
                      },
                    },
                    {
                      spark: 'check',
                      index: 'actionType',
                      check: {
                        hidden: type => type !== 1,
                      },
                      content: {
                        spark: 'label',
                        label: '跳转节点',
                        content: {
                          spark: 'value',
                          index: 'targetPanoramaId',
                          content() {
                            const { getState } = useStore();
                            const panoramaDataOrderId = useSelector(
                              ({
                                project: {
                                  editor: {
                                    panoramaEdit: { panoramaDataOrderId },
                                  },
                                },
                              }: EditorState) => panoramaDataOrderId
                            );
                            const panoramas =
                              getPanoramaDataList(getState().project).find(i => i.orderId === panoramaDataOrderId)
                                ?.panoramas ?? [];
                            return {
                              spark: 'select',
                              options: panoramas.map(p => ({
                                label: p.name,
                                value: p.id,
                              })),
                              index: 'targetPanoramaId',
                            };
                          },
                        },
                      },
                    },
                    {
                      spark: 'check',
                      index: 'actionType',
                      check: {
                        hidden: type => type !== 2,
                      },
                      content: {
                        spark: 'string',
                        index: 'eventName',
                        label: '事件名称',
                        defaultValue: '',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]),
  };
};
