import React, { useState } from 'react';
import Icon from '@ant-design/icons';
import { Upload, Button, message } from 'antd';
import { Plus, ScreenshotTwo, Switch } from '@icon-park/react';
import { UploadProps } from 'antd/lib/upload';
import { useOnCapture } from '@editor/Preview';
import { aadvidHeader, uploadDataUri } from '@shared/api';
import { css } from 'emotion';
export default ({ value, onChange }: any) => {
  const [loading, setLoading] = useState(false);
  const onCapture = useOnCapture();
  const props: Pick<UploadProps, 'onChange' | 'accept' | 'action' | 'showUploadList' | 'headers'> = {
    accept: 'image/*',
    action: '/api/upload/file',
    showUploadList: false,
    headers: aadvidHeader,
    onChange({ file }) {
      if (file.status === 'done') {
        onChange(file.response.data.previewUrl);
      } else if (file.status === 'error') {
        message.error(`${file.name}上传失败`);
      }
    },
  };
  return (
    <div style={{ display: 'flex' }}>
      <Upload.Dragger
        {...props}
        style={
          value
            ? {
                background: `url(${value || ''})`,
              }
            : undefined
        }
        className={css({
          '&.ant-upload.ant-upload-drag': {
            width: 100,
            height: 144,
            backgroundSize: 'contain !important',
            backgroundRepeat: 'no-repeat !important',
            backgroundPosition: 'center !important',
            '&>*': {
              padding: 0,
            },
          },
        })}
      >
        {!value && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="ant-upload-hint">
              <Icon component={Plus as any} style={{ fontSize: '1.38em' }} />
              <br />
              上传封面
            </p>
          </div>
        )}
      </Upload.Dragger>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Boolean(value) && (
          <Upload {...props}>
            <Button type="link" icon={<Icon component={Switch as any} />}>
              替换
            </Button>
          </Upload>
        )}
        <Button
          type="link"
          loading={loading}
          icon={<Icon component={ScreenshotTwo as any} />}
          onClick={async () => {
            setLoading(true);
            try {
              if (
                !onCapture()?.then(async base64 => {
                  const { previewUrl } = await uploadDataUri(base64, 'viewpoint');
                  onChange(previewUrl);
                  return true;
                })
              ) {
                throw new Error();
              }
            } catch {
              message.error('同步画板当前视图失败');
            } finally {
              setLoading(false);
            }
          }}
        >
          同步画板当前视图
        </Button>
      </div>
    </div>
  );
};
