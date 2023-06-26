import { Row, Col, Form, Input, Select } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import styles from './style';
const { Option } = Select;
const TYPE_OPTIONS = [
  {
    name: '场景',
    cid: 26,
    sortWeight: 990,
  },
  {
    name: '互动组件',
    cid: 4,
    sortWeight: 980,
  },
  {
    name: '互动组件3D',
    cid: 32,
    sortWeight: 980,
  },
  {
    name: '脚本',
    cid: 25,
    sortWeight: 970,
  },
  {
    name: '图片',
    cid: 5,
    sortWeight: 790,
  },
  {
    name: '视频',
    cid: 6,
    sortWeight: 780,
  },
  {
    name: '直出加载视频',
    cid: 34,
    sortWeight: 780,
  },
  {
    name: '交互视频',
    cid: 35,
    sortWeight: 780,
  },
  {
    name: '透明视频',
    cid: 36,
    sortWeight: 780,
  },
  {
    name: 'VR视频',
    cid: 37,
    sortWeight: 780,
  },
  {
    name: '音频',
    cid: 8,
    sortWeight: 770,
  },
  {
    name: '字体',
    cid: 29,
    sortWeight: 760,
  },
  {
    name: '3D模型',
    cid: 27,
    sortWeight: 750,
  },
  {
    name: '材质',
    cid: 28,
    sortWeight: 740,
  },
  {
    name: 'PSD',
    cid: 21,
    sortWeight: 730,
  },
  {
    name: '贴图',
    cid: 33,
    sortWeight: 720,
  },
  {
    name: '2D粒子',
    cid: 13,
    sortWeight: 590,
  },
  {
    name: '3D粒子',
    cid: 14,
    sortWeight: 580,
  },
  {
    name: '序列帧',
    cid: 18,
    sortWeight: 570,
  },
  {
    name: 'Lottie',
    cid: 12,
    sortWeight: 560,
  },
  {
    name: '龙骨动画',
    cid: 23,
    sortWeight: 550,
  },
  {
    name: '脊柱动画',
    cid: 24,
    sortWeight: 540,
  },
  {
    name: 'Live2d',
    cid: 30,
    sortWeight: 530,
  },
  {
    name: '天空盒',
    cid: 31,
    sortWeight: 520,
  },
].filter(item => ![25, 26, 21].includes(item.cid));
interface Props {
  types: string;
  keyword: string;
  onChange(partial: any): void;
}

export default function Filter({ keyword, types, onChange }: Props) {
  const [form] = Form.useForm();

  const handleChange = usePersistCallback(changedFields => {
    if (changedFields.length === 1) {
      const field = changedFields[0];
      if (field.name[0] === 'types') {
        onChange({ types: form.getFieldValue('types').join(','), keyword: form.getFieldValue('keyword') });
      }
    }
  });
  const onSearch = usePersistCallback(() => {
    onChange({ keyword: form.getFieldValue('keyword') });
  });

  return (
    <div className={styles.filterWrapper}>
      <Form
        form={form}
        initialValues={{
          keyword,
          types: types
            .split(',')
            .map(Number)
            .filter(type => TYPE_OPTIONS.find(({ cid }) => cid === type)),
        }}
        colon={false}
        onFieldsChange={handleChange}
      >
        <Row gutter={36} justify={'center'}>
          <Col span={6} xxl={5}>
            <Form.Item name="types" label={<span className={styles.filterLabel}>类型</span>}>
              <Select mode="multiple" placeholder="请选择" maxTagCount={2} showArrow={true}>
                {TYPE_OPTIONS.map(type => {
                  return (
                    <Option key={type.cid} value={type.cid}>
                      {type.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6} xxl={5}>
            <Form.Item name="keyword" label={<span className={styles.filterLabel}>搜索</span>}>
              <Input.Search placeholder="请输入资源名称、ID" onSearch={onSearch} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
