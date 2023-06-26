import Icon, { UploadOutlined } from '@ant-design/icons';
import { usePanoramaEdit, useUploadVRAsset } from '@editor/Template/Panorama/hooks';
import { getPanoramaDataList } from '@editor/utils';
import { Button, message, Tooltip, Upload } from 'antd';
import { useState } from 'react';
import { useStore } from 'react-redux';
import { SparkFn } from '..';
import { headerGroup } from '../groups';
import { Correct, Attention } from '@icon-park/react';
import { Spark } from '@editor/Editor/Property/cells';
import { isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';
import { useEditor } from '@editor/aStore';

export const enterAnimationTypeOptions = [
  {
    label: '无',
    value: 0,
  },
  {
    label: '淡入步入',
    value: 1,
  },
  {
    label: '镜头拉近',
    value: 2,
  },
];

export const PanoramaSpaceSpark: Spark = {
  spark: 'group',
  label: 'VR 效果设置',
  content: {
    spark: 'grid',
    content: [
      {
        spark: 'label',
        label: '配置文件',
        content: {
          spark: 'value',
          index: ['dataUrl', 'startPanoramaId'],
          content([url], onChange) {
            return {
              spark: 'element',
              content: () => {
                const { getState } = useStore();
                const [uploading, setUploading] = useState(false);
                const { initialPanoramaState, replaceDataInPanoramaEdit } = usePanoramaEdit();
                const { uploadXingfuliAsset } = useUploadVRAsset();
                const { onChange: onChangeLoading } = useEditor(0, 'loading');
                return (
                  <>
                    {url && (
                      <>
                        <Icon
                          style={{
                            marginLeft: '10px',
                            color: 'green',
                          }}
                          component={Correct as any}
                        />
                        <span style={{ margin: '0 10px' }}>已配置</span>
                      </>
                    )}
                    <Upload
                      disabled={uploading}
                      showUploadList={false}
                      accept=".json,.zip"
                      beforeUpload={async file => {
                        try {
                          setUploading(true);
                          onChangeLoading(true);
                          const panoramaEdit = getState().project.editor.panoramaEdit;
                          const url = await uploadXingfuliAsset(file);
                          if (isVRCaseAndInEdit(getState().project)) {
                            onChange([, -1]);
                            await replaceDataInPanoramaEdit(url, panoramaEdit.panoramaSpaceId);
                          } else {
                            const [orderId] = await initialPanoramaState(url);
                            orderId && onChange([orderId, -1]);
                          }
                        } catch (error) {
                          message.error(error.message);
                        } finally {
                          setUploading(false);
                          onChangeLoading(false);

                          return false;
                        }
                      }}
                    >
                      <Button icon={<UploadOutlined />} loading={uploading} type={url ? 'dashed' : 'primary'}>
                        {url ? '替换数据' : '导入数据'}
                        {url && (
                          <Tooltip title={'原有数据将被覆盖'}>
                            <Icon component={Attention as any} style={{ color: '#f5a623' }} />
                          </Tooltip>
                        )}
                      </Button>
                    </Upload>
                  </>
                );
              },
            };
          },
        },
      },
      {
        spark: 'label',
        label: '初始全景',
        content: {
          spark: 'value',
          index: 'dataUrl',
          content(dataUrl) {
            const { getState } = useStore();
            const panoramas = getPanoramaDataList(getState().project).find(i => i.orderId === dataUrl)?.panoramas ?? [];
            return {
              spark: 'select',
              options: panoramas.map(p => ({
                label: p.name,
                value: p.id,
              })),
              index: 'startPanoramaId',
            };
          },
        },
      },
      {
        spark: 'label',
        label: '进场动画',
        content: {
          spark: 'select',
          index: 'enterAnimationType',
          options: enterAnimationTypeOptions,
          defaultValue: 0,
        },
      },
      {
        spark: 'label',
        label: '开启陀螺仪',
        content: {
          spark: 'boolean',
          index: 'gyroscopeEnabled',
          defaultValue: false,
        },
      },
    ],
  },
};

export const PanoramaSpace: SparkFn = (props, envs) => {
  const content = [headerGroup];
  return {
    spark: 'grid',
    content: content.map(fn => fn(props, envs)).concat([PanoramaSpaceSpark]),
  };
};
