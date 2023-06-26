import Icon from '@ant-design/icons';
import { PanoramaEditSparkFn } from '../..';
import { enterVector } from '../../groups/headerGroup/vectorSpark3D';
import { BookmarkOne } from '@icon-park/react';
import { ResourceBox } from '../../groups/resourceSpark/ResourceBox';
import { getCubemapByOrderId } from '@editor/utils';
import { useStore } from 'react-redux';
import { Button, message, Select, Tooltip } from 'antd';
import { useUpdatePanoramaMode } from '@editor/Template/Panorama/hooks';
import { getEditorCameraProps, setEditorCameraProps } from '@byted/riko';

export const Panorama: PanoramaEditSparkFn = ({ panorama, panoramaData }) => {
  return {
    spark: 'grid',
    content: [
      {
        spark: 'group',
        label: '基础设置',
        content: {
          spark: 'grid',
          content: [
            {
              spark: 'enter',
              index: 'panoramas',
              content: {
                spark: 'enter',
                index: panoramaData.panoramas.findIndex(i => i.id === panorama.id),
                content: {
                  spark: 'grid',
                  content: [
                    {
                      spark: 'block',
                      content: {
                        spark: 'label',
                        label: 'id',
                        content: {
                          spark: 'value',
                          index: 'id',
                          content(id) {
                            return {
                              spark: 'element',
                              content() {
                                return (
                                  <>
                                    <span>{id}</span>
                                    <Icon
                                      style={{
                                        marginLeft: '10px',
                                      }}
                                      component={BookmarkOne as any}
                                      onClick={event => {
                                        event.stopPropagation();
                                        navigator.clipboard.writeText(id);
                                        message.success('复制成功');
                                      }}
                                    />
                                  </>
                                );
                              },
                            };
                          },
                        },
                      },
                    },
                    {
                      spark: 'block',
                      content: {
                        spark: 'string',
                        label: '名称',
                        index: 'name',
                        required: true,
                      },
                    },
                    {
                      spark: 'block',
                      content: {
                        spark: 'label',
                        label: '智能跳转',
                        tooltip: '根据用户点击，智能跳转到最近全景',
                        content: {
                          spark: 'value',
                          index: 'pathways',
                          content(pathways, onChange) {
                            const value = panoramaData.panoramas
                              .filter(p => pathways.includes(p.id))
                              .map(i => ({
                                label: i.name,
                                value: i.id,
                                options: {},
                              })) as any;
                            return {
                              spark: 'element',
                              content() {
                                return (
                                  <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="选择可跳转全景"
                                    value={value}
                                    onChange={(value: string[]) => {
                                      onChange(value);
                                    }}
                                  >
                                    {panoramaData.panoramas
                                      .filter(i => i.id !== panorama.id)
                                      .map(p => (
                                        <Select.Option key={p.id} value={p.id}>
                                          {p.name}
                                        </Select.Option>
                                      ))}
                                  </Select>
                                );
                              },
                            };
                          },
                        },
                      },
                    },
                    {
                      spark: 'block',
                      content: {
                        spark: 'value',
                        index: 'fixedCameraView',
                        content(value, onChange) {
                          return {
                            spark: 'label',
                            label: '固定视角',
                            tooltip: '跳转到该全景时展示的视角',
                            content: {
                              spark: 'element',
                              content() {
                                return (
                                  <>
                                    <Tooltip title="设置当前视图为固定视角">
                                      <Button
                                        type={value ? 'dashed' : 'primary'}
                                        style={{ marginLeft: '10px', marginRight: '10px' }}
                                        onClick={() => {
                                          onChange(getEditorCameraProps().rotation);
                                          message.success('设置成功');
                                        }}
                                      >
                                        {value ? '重设' : '设置'}
                                      </Button>
                                    </Tooltip>
                                    {value && (
                                      <Tooltip title="取消固定视角">
                                        <Button
                                          type="dashed"
                                          style={{ marginRight: '10px' }}
                                          onClick={() => {
                                            onChange(undefined);
                                          }}
                                        >
                                          取消
                                        </Button>
                                      </Tooltip>
                                    )}
                                    {value && (
                                      <Tooltip title="定位">
                                        <Button
                                          type="primary"
                                          style={{ marginRight: '10px' }}
                                          onClick={() => {
                                            setEditorCameraProps({
                                              rotation: value,
                                            });
                                          }}
                                        >
                                          定位
                                        </Button>
                                      </Tooltip>
                                    )}
                                  </>
                                );
                              },
                            },
                          };
                        },
                      },
                    },
                    {
                      spark: 'block',
                      content: {
                        spark: 'label',
                        label: '一次性固定视角',
                        content: {
                          spark: 'boolean',
                          index: 'fixedCameraViewOnce',
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        spark: 'group',
        label: '高级设置',
        defaultActive: false,
        content: {
          spark: 'enter',
          index: 'panoramas',
          content: {
            spark: 'enter',
            index: panoramaData.panoramas.findIndex(i => i.id === panorama.id),
            content: {
              spark: 'grid',
              content: [
                {
                  spark: 'block',
                  content: {
                    spark: 'label',
                    label: '位置',
                    tooltip: '视角位置',
                    content: enterVector('position'),
                  },
                },
                {
                  spark: 'block',
                  content: {
                    spark: 'label',
                    label: '旋转',
                    tooltip: '视角旋转角度',
                    content: enterVector('rotation'),
                  },
                },
                {
                  spark: 'block',
                  content: {
                    spark: 'label',
                    label: '地面坐标',
                    tooltip: '地面坐标',
                    content: enterVector('groundPosition'),
                  },
                },
                {
                  spark: 'block',
                  content: {
                    spark: 'value',
                    index: 'cubemapUrl',
                    content(cubemapUrl, onChange) {
                      return {
                        spark: 'element',
                        content() {
                          const { getState } = useStore();
                          const updatePanoramaMode = useUpdatePanoramaMode();
                          const cubemap = getCubemapByOrderId(getState().project, cubemapUrl);

                          return (
                            <ResourceBox
                              type="Cubemaps"
                              url={cubemapUrl}
                              cover={cubemap?.cover}
                              deletable={true}
                              onChange={asset => {
                                asset.orderId ? onChange(asset.orderId) : onChange(0);
                                updatePanoramaMode({
                                  cubemapUrl: asset?.orderId,
                                });
                              }}
                            />
                          );
                        },
                      };
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ],
  };
};
