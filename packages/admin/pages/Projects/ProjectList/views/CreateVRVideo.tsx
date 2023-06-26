import { postProject } from '@shared/api/project';
import { gotoEditor } from '@shared/utils';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';
import { Form, Input, message, Modal } from 'antd';
import { useState } from 'react';

const { Item } = Form;

export default ({ visible, onCancel }: { visible: boolean; onCancel: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<{
    name: string;
  }>();

  return (
    <Modal
      centered
      width={600}
      destroyOnClose
      open={visible}
      confirmLoading={loading}
      title="录入项目信息"
      onOk={form.submit}
      onCancel={onCancel}
    >
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 17 }}
        form={form}
        preserve={false}
        onFinish={async (params: any) => {
          setLoading(true);
          try {
            collectEvent(EventTypes.ProductType, { type: 'VR视频' });

            const { id } = await postProject({
              ...params,
              enabled3d: true,
              typeOfPlay: 3,
              category: 3,
              templateId: 0, // 新项目
              pid: 0, // 后端需要
              versionId: 0, // 空白模板
            });
            message.success('项目创建成功');
            gotoEditor({ id: id!, mode: 'project' });
          } catch (err) {
            message.error(err.message ? err.message : '项目创建失败');
          } finally {
            setLoading(false);
          }
        }}
      >
        <Item
          label={`项目名称`}
          name="name"
          rules={[
            { required: true, whitespace: true, message: '请输入项目名称' },
            { max: 20, message: '项目名称不可超过20个字' },
          ]}
        >
          <Input type="string" placeholder={`请输入项目名称`} />
        </Item>
      </Form>
    </Modal>
  );
};
