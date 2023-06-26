import React from 'react';
import { Form, Input } from 'antd';
import { isNil } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import CoverChanger from '../CoverChanger';

export interface PublishProjectProps {
  getState(): EditorState;
  form: any;
}
export default function StepTwo({ form, getState }: PublishProjectProps) {
  const {
    name,
    description = '',
    editor: { cover = '' },
  } = getState().project;
  const initialValues = { name, cover, description };

  // fix antd input maxLength bug
  const [desc, setDesc] = useState({
    validateStatus: 'success',
    errorMsg: '',
  });
  const descRef = useRef(null);
  const compositionRef = useRef(false);
  useEffect(() => {
    const $textArea = (descRef.current as any)?.resizableTextArea;
    const comStart = () => {
      compositionRef.current = true;
    };
    const comEnd = () => {
      compositionRef.current = false;
    };
    if (!isNil($textArea) && $textArea.textArea) {
      $textArea.textArea.addEventListener('compositionstart', comStart);
      $textArea.textArea.addEventListener('compositionend', comEnd);
    }
    return () => {
      if (!isNil($textArea) && $textArea.textArea) {
        $textArea.textArea.removeEventListener('compositionstart', comStart);
        $textArea.textArea.removeEventListener('compositionend', comEnd);
      }
    };
  }, []);

  return (
    <Form form={form} wrapperCol={{ span: 12 }} labelCol={{ span: 2 }} initialValues={initialValues}>
      <Form.Item
        label="版本名称"
        name="name"
        rules={[
          { required: true, whitespace: true, message: '请输入版本名称！' },
          { max: 20, message: '版本名称不得超过20个字！' },
        ]}
      >
        {/* <Input type="string" placeholder="请输入版本名称" /> */}
        <Input.TextArea placeholder="请输入版本名称" rows={1} showCount maxLength={20} autoSize />
      </Form.Item>
      <Form.Item
        name="cover"
        label="版本封面"
        rules={[
          {
            required: true,
            message: '请上传版本封面！',
          },
        ]}
      >
        <CoverChanger />
      </Form.Item>
      <Form.Item
        label="版本描述"
        name="description"
        validateStatus={desc.validateStatus as any}
        help={desc.errorMsg}
        rules={[
          { whitespace: true, message: '版本描述不能为空格！' },
          { max: 128, message: '版本描述不得超过128个字！' },
        ]}
      >
        <Input.TextArea
          ref={descRef}
          showCount
          rows={4}
          maxLength={120}
          placeholder="请输入版本描述"
          onChange={e => {
            const val = e.currentTarget.value;
            setTimeout(() => {
              if (!isNil(val) && !compositionRef.current) {
                if (val.length > 128) {
                  setDesc({
                    validateStatus: 'error',
                    errorMsg: '版本描述不得超过128个字！',
                  });
                } else {
                  setDesc({
                    validateStatus: 'success',
                    errorMsg: '',
                  });
                }
              }
            });
          }}
        />
      </Form.Item>
    </Form>
  );
}
