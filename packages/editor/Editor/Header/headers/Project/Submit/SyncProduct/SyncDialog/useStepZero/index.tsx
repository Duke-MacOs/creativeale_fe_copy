import React, { useState } from 'react';
import { Button, Form, FormInstance, Input, message } from 'antd';
import { checkStateDownloadText } from '@editor/aStore';
import { StepHookReturn } from '../StepDialog';
import { cleanProject } from '@editor/utils';
import { Info } from '@icon-park/react';
import { useStore } from 'react-redux';
import TargetView from './TargetView';
import Icon from '@ant-design/icons';
import { http } from '@shared/api';

export default (form: FormInstance<any>): StepHookReturn => {
  const { getState } = useStore<EditorState, EditorAction>();
  const [convertType, setConvertType] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  return {
    title: '选择转化类型',
    okDisabled: loading || convertType === undefined,
    cancelDisabled: loading,
    spinning: false,
    element: (
      <Form
        form={form}
        layout="vertical"
        initialValues={{ convertType: undefined, activeUrl: '' }}
        style={{
          minHeight: 360,
        }}
      >
        <Form.Item
          label="选择转化类型"
          name="convertType"
          rules={[
            { required: true, message: '请选择该素材的转化类型！' },
            {
              async validator(_, convertType) {
                if (convertType === 1) {
                  await checkStateDownloadText(cleanProject(getState().project), '下载');
                }
              },
            },
          ]}
        >
          <TargetView
            onChange={convertType => {
              setConvertType(convertType);
            }}
          />
        </Form.Item>
        {convertType === 1 ? (
          <Form.Item label="App链接">
            <Icon component={(props: any) => <Info {...props} theme="filled" fill="#3955F6" />} />{' '}
            App链接请到广告投放平台上进行填写
          </Form.Item>
        ) : convertType === 2 ? (
          <>
            <Form.Item label="店铺Web链接">
              <Form.Item noStyle name="activeUrl" rules={[{ required: true, message: '请填写该素材的店铺Web链接！' }]}>
                <Input
                  style={{ width: '60%' }}
                  placeholder="请输入店铺Web链接"
                  onChange={() => {
                    form.setFieldsValue({ schemeUrl: '' });
                  }}
                />
              </Form.Item>
              <Button
                style={{ width: '18%', marginLeft: 16 }}
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  const values = form.getFieldsValue();
                  http
                    .post('project/urlTransScheme', { url: values.activeUrl })
                    .then(({ data }) => data.data.scheme)
                    .then(schemeUrl => {
                      form.setFieldsValue({ ...values, schemeUrl });
                    })
                    .catch(error => {
                      message.error(error.message);
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
              >
                生成店铺App链接
              </Button>
            </Form.Item>
            <Form.Item
              label="店铺App链接"
              name="schemeUrl"
              rules={[{ required: true, message: '请点击“生成店铺App链接”自动生成店铺App链接' }]}
            >
              <Input disabled style={{ width: '60%' }} placeholder="你可点击“生成店铺App链接”后自动生成" />
            </Form.Item>
          </>
        ) : null}
      </Form>
    ),
    async mapValues({ convertType, activeUrl, schemeUrl }: any) {
      if (convertType === 1) {
        return { convertType };
      }
      return {
        convertType,
        activeUrl,
        schemeUrl,
      };
    },
  };
};
