import { createResource } from '@shared/api';
import { InboxOutlined } from '@ant-design/icons';
import { ResourceType } from '@editor/Resource/upload';
import { Modal, Upload } from 'antd';
import { css } from 'emotion';

export default (projectId: number) => {
  return new Promise<string>(resolve => {
    const modal = Modal.info({
      title: '请上传一个视频作为主场景',
      centered: true,
      maskClosable: false,
      icon: null,
      width: 1334,
      className: css({
        maxWidth: 'unset',
        '& .ant-modal-confirm-btns': {
          display: 'none',
        },
        '& .ant-upload.ant-upload-drag': {
          height: '600px',
        },
      }),
      bodyStyle: { padding: '10px 20px' },
      content: (
        <Upload.Dragger
          name="file"
          accept=".mp4"
          multiple={false}
          showUploadList={false}
          beforeUpload={async file => {
            modal.destroy();
            const { url } = await createResource({
              file: file,
              type: ResourceType['VRVideo'],
              projectId,
            });
            resolve(url);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽视频文件到此处上传</p>
        </Upload.Dragger>
      ),
    });
  });
};
