import { Modal, Form, Input, Select, message } from 'antd';
import { UploadAvatar } from '@main/pages/Resources/AdminResource/Modal/UploadCover';
import { useState } from 'react';
import { collectEventTableAction } from '@main/collectEvent';

export interface TeamModalProps {
  title: any;
  initValues?: any;
  onCancel: () => void;
  onFinish: (data: any) => Promise<void>;
}

export default ({ title, initValues, onCancel, onFinish }: TeamModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const collect = collectEventTableAction(title);
  return (
    <Modal
      open
      title={title}
      onCancel={() => {
        collect('cancel');
        onCancel();
      }}
      onOk={async () => {
        try {
          setLoading(true);
          await onFinish(await form.validateFields());
          message.success(`${title}成功`);
          collect('okay');
          onCancel();
        } catch (error) {
          collect('error');
          message.error(error.message);
        } finally {
          setLoading(false);
        }
      }}
      okButtonProps={{ loading, disabled: loading }}
    >
      <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} initialValues={initValues}>
        <Form.Item label="团队图标" name="logo" rules={[{ required: true, message: '请上传团队图标' }]}>
          <UploadAvatar />
        </Form.Item>
        <Form.Item
          label="主体名称"
          name="subject"
          rules={[{ required: true, message: '请输入主体名称，如公司名称等' }]}
        >
          <Input maxLength={50} placeholder="请输入主体名称，如公司名称等，不超过50字" />
        </Form.Item>
        {(initValues?.type ?? 2) >= 2 && (
          <Form.Item label="团队类型" name="type" rules={[{ required: true, message: '请选择团队类型' }]}>
            <Select
              placeholder="请选择团队类型"
              options={[
                { label: '服务商', value: 2 },
                { label: '广告主', value: 3 },
                { label: '代理商', value: 4 },
              ]}
            />
          </Form.Item>
        )}
        <Form.Item label="团队名称" name="name" rules={[{ required: true, message: '请输入团队名称' }]}>
          <Input maxLength={20} placeholder="请输入团队名称，不超过20字" />
        </Form.Item>
        <Form.Item name="description" label="团队介绍">
          <Input.TextArea maxLength={250} placeholder="请输入团队介绍，不超过250字" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
