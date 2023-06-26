import React, { useState, useRef } from 'react';
import { Modal, Input, message, Form } from 'antd';
import { getModel } from '@webIde/Ide/monacoUtils';
import { createScriptTag } from '@webIde/api';

export const scriptTagServer: any = {
  showModal: () => {
    throw new Error('Empty Function');
  },
};

export const ScriptTagModal = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentDataRef = useRef<any>();
  const contentRef = useRef<string>();
  const successCallbackRef = useRef<any>(null);

  scriptTagServer.showModal = (data: any, cb?: () => void) => {
    if (!data) {
      message.error('脚本不存在');
      return;
    }
    contentRef.current = getModel(data.name)?.getValue() ?? '';
    currentDataRef.current = data;

    setVisible(true);
    successCallbackRef.current = cb ?? null;
  };

  const [form] = Form.useForm<{
    tagName: string;
    desc: string;
  }>();

  return (
    <Modal
      title={`${currentDataRef.current?.name} 标签`}
      open={visible}
      width={500}
      okText={'创建'}
      cancelText="取消"
      destroyOnClose
      confirmLoading={loading}
      onOk={() => {
        form.submit();
      }}
      onCancel={() => {
        setVisible(false);
      }}
    >
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 17 }}
        form={form}
        preserve={false}
        onFinish={async (params: any) => {
          if (currentDataRef.current) {
            setLoading(true);
            try {
              await createScriptTag({
                ...params,
                projectId: currentDataRef.current.projectId,
                sceneId: currentDataRef.current.id,
                jscode: contentRef.current,
              });
              successCallbackRef.current?.();
              message.success('标签创建成功');
              setVisible(false);
            } catch (err) {
              message.error(err.message ? err.message : '标签创建失败');
            } finally {
              setLoading(false);
            }
          }
        }}
      >
        <Form.Item
          label={`标签名称`}
          name="tagName"
          rules={[
            { required: true, whitespace: true, message: '请输入标签名称' },
            { max: 20, message: '标签名称不可超过20个字' },
          ]}
        >
          <Input type="string" placeholder={`请输入标签名称`} />
        </Form.Item>
        <Form.Item label={`标签描述`} name="desc" initialValue="">
          <Input.TextArea placeholder={`请输入标签描述`} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
