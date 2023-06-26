import { Upload, Button, message } from 'antd';
import Icon from '@ant-design/icons';
import { Plus, Switch } from '@icon-park/react';
import { UploadProps } from 'antd/lib/upload';
import { aadvidHeader } from '@shared/api';
import { css } from 'emotion';

function UploadImage({ value, onChange, label, size, width, height }: any) {
  const props: Pick<UploadProps, 'onChange' | 'accept' | 'action' | 'showUploadList' | 'headers' | 'beforeUpload'> = {
    accept: 'image/jpg,image/jpeg,image/png',
    action: '/api/upload/file',
    headers: aadvidHeader,
    showUploadList: false,
    beforeUpload: file => {
      if ((file as any).size > size * 1024 * 1024) {
        message.error(`${label}图片能超过${size}M`);
        return false;
      }
    },
    onChange({ file }) {
      if (file.status === 'done' && file.response.data) {
        onChange(file.response.data.previewUrl);
      } else if (file.status === 'error' || file.response?.message) {
        message.error(file.response?.message ?? `${file.name}上传失败`);
      }
    },
  };
  return (
    <div style={{ display: 'flex' }}>
      <Upload.Dragger
        {...props}
        className={css({
          '&.ant-upload.ant-upload-drag': {
            width,
            height,
            '&>*': {
              padding: 0,
            },
          },
        })}
      >
        {value ? (
          <img src={value} style={{ width: '100%', maxHeight: height }} />
        ) : (
          <div
            className={css({
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            })}
          >
            <p className="ant-upload-hint">
              <Icon component={Plus as any} style={{ fontSize: '1.38em' }} />
              <br />
              上传{label}
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
}

export default (props: any) => <UploadImage {...props} size={10} label="封面" width={100} height={178} />;

export const UploadAvatar = (props: any) => <UploadImage {...props} size={1} label="头像" width={100} height={100} />;
