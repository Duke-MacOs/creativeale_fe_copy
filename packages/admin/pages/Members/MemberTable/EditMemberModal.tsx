import { collectEventTableAction } from '@main/collectEvent';
import { Modal, Form, message, Select } from 'antd';
import { useState } from 'react';

const { Option } = Select;

interface EditMemberProps {
  onCancel: () => void;
  onFinish(data: Pick<EditMemberProps, 'roles'>): Promise<void> | void;
  roles: number;
}

const collect = collectEventTableAction('修改成员角色');

export default ({ onCancel, onFinish, roles }: EditMemberProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  return (
    <Modal
      destroyOnClose
      centered
      open
      okButtonProps={{ loading, disabled: loading }}
      title="修改成员角色"
      onOk={async () => {
        try {
          setLoading(true);
          await onFinish(await form.validateFields());
          message.success('修改成功');
          collect('okay');
          onCancel();
        } catch (error) {
          collect('error');
          message.error(error.message);
        } finally {
          setLoading(false);
        }
      }}
      onCancel={() => {
        collect('cancel');
        onCancel();
      }}
    >
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} form={form} name="addMember">
        <Form.Item
          label="用户角色"
          name="roles"
          initialValue={roles}
          rules={[{ required: true, message: '请选择成员角色' }]}
        >
          <Select placeholder="请选择成员角色">
            {[
              { role: 1, roleName: '普通成员' },
              { role: 3, roleName: '管理员' },
            ].map(item => (
              <Option key={item.role} value={item.role}>
                {item.roleName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
