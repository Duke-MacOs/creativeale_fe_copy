import React, { useState } from 'react';
import { Modal, Input, Select, message } from 'antd';
const { Option } = Select;

interface Props {
  onConfirm(name: string, language: string): Promise<any>;
  onCancel(): void;
}

export function CreateTabModal({ onConfirm, onCancel }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [loading, setLoading] = useState(false);
  return (
    <Modal
      title="新建脚本"
      open={true}
      width={500}
      okText="创建"
      cancelText="取消"
      confirmLoading={loading}
      onOk={() => {
        setLoading(true);
        onConfirm(inputValue, language).catch(err => {
          setLoading(false);
          message.error(err.message);
        });
      }}
      onCancel={onCancel}
    >
      <Input.Group compact>
        <Input
          placeholder="请输入脚本名称"
          maxLength={20}
          style={{ width: '80%' }}
          onPressEnter={() => {
            setLoading(true);
            onConfirm(inputValue, language).catch(err => {
              setLoading(false);
              message.error(err.message);
            });
          }}
          onChange={e => {
            const val = e.currentTarget.value;
            setInputValue(val);
          }}
        />
        <Select defaultValue="typescript" style={{ width: '20%' }} onChange={language => setLanguage(language)}>
          <Option value="typescript">.ts</Option>
          <Option value="javascript">.js</Option>
        </Select>
      </Input.Group>
    </Modal>
  );
}
