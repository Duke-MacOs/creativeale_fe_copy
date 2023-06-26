import { collectEventTableAction } from '@main/collectEvent';
import { Checkbox, Form, message, Modal, Row, Col } from 'antd';
import { FeaturesMap } from '@shared/userInfo';
import { useState } from 'react';

interface IFeatureModalParams {
  features: string;
  onCancel: () => void;
  onFinish: (features: string) => Promise<void>;
}

const collect = collectEventTableAction('编辑团队实验功能');

export default ({ features, onCancel, onFinish }: IFeatureModalParams) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  return (
    <Modal
      title="编辑团队实验功能"
      open
      centered
      okButtonProps={{ loading, disabled: loading }}
      onCancel={() => {
        collect('cancel');
        onCancel();
      }}
      onOk={async () => {
        try {
          setLoading(true);
          const { features } = await form.validateFields();
          await onFinish(features.includes('<all>') ? '<all>' : features.join(''));
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
    >
      <Form
        form={form}
        preserve={false}
        name="editFeatures"
        initialValues={{ features: Object.keys(FeaturesMap).filter(key => features.includes(key)) }}
      >
        <Form.Item name="features">
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {Object.keys(FeaturesMap).map(key => (
                <Col span={6}>
                  <Checkbox key={key} value={key}>
                    {FeaturesMap[key as keyof typeof FeaturesMap]}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};
