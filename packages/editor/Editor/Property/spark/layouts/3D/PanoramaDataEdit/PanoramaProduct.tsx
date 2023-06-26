/**
 * 作品模式
 */
import { PanoramaEditSparkFn } from '../..';
import { Button, message, Select, Tooltip } from 'antd';
import { getEditorCameraProps, setEditorCameraProps } from '@byted/riko';

export const PanoramaProduct: PanoramaEditSparkFn = ({ panorama, panoramaData }) => {
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
                        tooltip: '固定视角效果仅触发一次',
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
    ],
  };
};
