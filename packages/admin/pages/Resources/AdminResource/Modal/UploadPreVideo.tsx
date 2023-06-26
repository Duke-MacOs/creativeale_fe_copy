import React from 'react';
import { Upload, Button, message } from 'antd';
import Icon from '@ant-design/icons';
import { Plus, Switch } from '@icon-park/react';
import style from './style';
import { UploadProps } from 'antd/lib/upload';
import { aadvidHeader } from '@shared/api';
export default ({ value, onChange }: any) => {
  const props: Pick<UploadProps, 'onChange' | 'accept' | 'action' | 'showUploadList' | 'headers' | 'beforeUpload'> = {
    accept: 'video/*',
    action: '/api/upload/file',
    headers: aadvidHeader,
    showUploadList: false,
    beforeUpload: file => {
      if ((file as any).size > 10 * 1024 * 1024) {
        message.error(`预览视频不能超过10M`);
        return false;
      }
    },
    onChange({ file }) {
      if (file.status === 'done') {
        onChange(file.response.data?.previewUrl);
      } else if (file.status === 'error') {
        message.error(`${file.name}上传失败`);
      }
    },
  };
  return (
    <div style={{ display: 'flex' }}>
      <Upload.Dragger {...props} className={style.upload}>
        {value ? (
          <video src={value} style={{ width: '100%', maxHeight: '142px' }} />
        ) : (
          <div className={style.empty}>
            <p className="ant-upload-hint">
              <Icon component={Plus as any} style={{ fontSize: '1.38em' }} />
              <br />
              上传视频
            </p>
          </div>
        )}
      </Upload.Dragger>
      {Boolean(value) && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Upload {...props}>
            <Button type="link" icon={<Icon component={Switch as any} />}>
              更换
            </Button>
          </Upload>
        </div>
      )}
    </div>
  );
};
