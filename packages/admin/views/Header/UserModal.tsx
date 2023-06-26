import { Modal, Form, Input, message } from 'antd';
import { UploadAvatar } from '@main/pages/Resources/AdminResource/Modal/UploadCover';
import { useState } from 'react';

export interface TeamModalProps {
  initValues?: any;
  onCancel: () => void;
  onFinish: (data: any) => Promise<void>;
}

export default ({ initValues, onCancel, onFinish }: TeamModalProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  return (
    <Modal
      open
      okText="修改"
      title="个人信息"
      onCancel={onCancel}
      okButtonProps={{ loading, disabled: loading }}
      onOk={async () => {
        try {
          setLoading(true);
          await onFinish(await form.validateFields());
          message.success('修改成功');
          onCancel();
        } catch (error) {
          message.error(error.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} initialValues={initValues}>
        <Form.Item label="个人名称" name="name" rules={[{ required: true, message: '请输入用户名称' }]}>
          <Input minLength={1} maxLength={20} placeholder="请输入用户名称，不超过20字" />
        </Form.Item>
        <Form.Item label="个人头像" name="avatar" rules={[{ required: true, message: '请上传个人头像' }]}>
          <UploadAvatar />
        </Form.Item>
      </Form>
    </Modal>
  );
};
