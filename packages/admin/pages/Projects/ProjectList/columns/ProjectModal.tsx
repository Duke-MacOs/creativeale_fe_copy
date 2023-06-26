import UploadCover from '@main/pages/Resources/AdminResource/Modal/UploadCover';
import { Form, Input, message, Modal, Select } from 'antd';
import { IProjectFromServer } from '../api';

interface ProjectModalProps {
  data: Pick<IProjectFromServer, 'name' | 'description' | 'cover' | 'industry'>;
  title?: string;
  label?: string;
  required?: Partial<Record<keyof ProjectModalProps['data'], boolean>>;
  onFinish: (data: Partial<ProjectModalProps['data']>) => void;
  onCancel: () => void;
}

export const ProjectModal = ({
  data,
  title = '修改项目信息',
  label = '项目',
  required = {},
  onFinish,
  onCancel,
}: ProjectModalProps) => {
  const [form] = Form.useForm<typeof data>();
  const { industry = 0 } = data;
  return (
    <Modal open width={600} centered={true} title={title} onCancel={onCancel} onOk={form.submit}>
      <Form
        form={form}
        labelAlign="right"
        initialValues={{
          ...data,
          industry: INDUSTRY_OPTIONS.filter(({ value }) => Number(industry) & (1 << value)).map(({ value }) => value),
        }}
        onFinish={values => {
          if ((values.industry as unknown as number[])?.length > 5) {
            return message.error('最多可选择五个行业');
          }
          const partial: Partial<typeof values> = {};
          // eslint-disable-next-line prefer-const
          for (let [key, value] of Object.entries(values) as [keyof typeof values, any][]) {
            if (key === 'industry') {
              value = (value as number[]).reduce((industry, value) => industry + (1 << value), 0);
            }
            if (value !== data[key]) {
              partial[key] = value;
            }
          }
          onFinish(partial);
        }}
        labelCol={{
          offset: 2,
          span: 4,
        }}
        wrapperCol={{
          span: 16,
        }}
      >
        {label !== '项目' && (
          <Form.Item label={`${label}行业`} name="industry" rules={[{ required: true, message: `请选择${label}行业` }]}>
            <Select
              allowClear
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={`请选择${label}行业`}
              options={INDUSTRY_OPTIONS}
            />
          </Form.Item>
        )}
        <Form.Item
          label={`${label}名称`}
          name="name"
          rules={[
            { required: true },
            { whitespace: true, message: `请输入${label}名称` },
            { max: 20, message: `${label}名称不可超过20个字` },
          ]}
        >
          <Input placeholder={`请输入${label}名称`} />
        </Form.Item>
        <Form.Item
          label={`${label}封面`}
          name="cover"
          rules={[
            {
              required: required.cover,
              message: `请上传${label}封面`,
            },
          ]}
        >
          <UploadCover />
        </Form.Item>

        <Form.Item
          label={`${label}描述`}
          name="description"
          rules={[
            {
              required: required.description,
              message: `请输入${label}描述`,
            },
          ]}
        >
          <Input.TextArea placeholder={`请输入${label}描述`} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const INDUSTRY_OPTIONS = [
  {
    label: '游戏',
    value: 0,
  },
  {
    label: '电商',
    value: 1,
  },
  {
    label: '小说',
    value: 2,
  },
  {
    label: '数字文娱',
    value: 3,
  },
  {
    label: '生活服务',
    value: 4,
  },
  {
    label: '金融',
    value: 5,
  },
  {
    label: '出行旅游',
    value: 6,
  },
  {
    label: '汽车',
    value: 7,
  },
  {
    label: '快消',
    value: 8,
  },
  {
    label: '教育',
    value: 9,
  },
  {
    label: '社交资讯',
    value: 10,
  },
  {
    label: '工具通信',
    value: 11,
  },
  {
    label: 'VR 看房',
    value: 12,
  },
];
