import { downloadBlob } from '@editor/utils';
import { http } from '@shared/api';
import { Button, Checkbox, Form, message, Modal, Select, Tooltip } from 'antd';
import { memo, useState } from 'react';
import { style } from '../CanvasScale';
import { keywordMap, keywordMap2 } from './constants';

const CheckboxGroup = Checkbox.Group;

export default memo(Text2Image);

function Text2Image() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  return (
    <div>
      <Tooltip title="AI图片生成" placement="bottom">
        <Button
          type="default"
          style={style}
          onClick={async () => {
            setVisible(true);
          }}
        >
          AI
        </Button>
      </Tooltip>
      {visible && (
        <Modal
          open={true}
          title="AI图像生成"
          okText={loading ? '图片生成中...' : '生成图片'}
          okButtonProps={{
            disabled: loading,
            loading: loading,
          }}
          cancelButtonProps={{
            disabled: loading,
          }}
          onCancel={() => {
            setVisible(false);
          }}
          onOk={() => {
            form.validateFields().then(async values => {
              try {
                setLoading(true);
                const { keywords1 = [], keywords2 = [], keywords3 = [] } = values;
                const {
                  data: { data },
                } = await http.post('faas/text2image', {
                  text: [[...keywords1, ...keywords2, ...keywords3].join(',')],
                });
                if (data?.images?.[0]?.data) {
                  const buffer = new Uint8Array(data.images[0].data).buffer;
                  downloadBlob(new Blob([buffer], { type: 'image/png' }), `ai-${Date.now()}.png`);
                } else {
                  throw new Error('图像生成失败，请重新尝试');
                }
              } catch (error) {
                message.error(error.message);
              } finally {
                setLoading(false);
              }
            });
          }}
        >
          <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item name="keywords1" label="风格">
              <CheckboxGroup options={Object.entries(keywordMap2).map(([value, label]) => ({ label, value }))} />
            </Form.Item>
            <Form.Item name="keywords2" label="预设关键词">
              <Select
                mode="multiple"
                placeholder="预设关键词"
                allowClear
                options={Object.entries(keywordMap).map(([value, label]) => ({ label, value }))}
              />
            </Form.Item>
            <Form.Item name="keywords3" label="自定义关键词">
              <Select mode="tags" placeholder="自定义关键词（英文）" allowClear />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}
