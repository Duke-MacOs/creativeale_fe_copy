import { Row, Col, Form, Input, Select } from 'antd';
import styles from '../TeamResource/style';
import { CategoryLevel1Name, StoreMaterialStatusName } from '@shared/types/store';
import { ICategoryOptions } from './hooks/useCategories';

const StoreMaterialStatusOptions = [
  { label: '全部', value: -1 },
  ...Object.entries(StoreMaterialStatusName)
    .filter(([, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      label: key,
      value,
    }))
    .filter(i => i.label !== '删除'),
];

const CategoryLevel1Options = [
  { label: '全部', value: -1 },
  ...Object.entries(CategoryLevel1Name)
    .filter(([, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      label: key,
      value,
    })),
];

export default ({
  keyword,
  type,
  status,
  category,
  categories,
  onChange,
  onSearch,
}: {
  keyword: string;
  type: number;
  status: number;
  category: string;
  categories: ICategoryOptions[];
  onChange: (params: any) => void;
  onSearch: () => void;
}) => {
  const [form] = Form.useForm();

  return (
    <div className={styles.filterWrapper}>
      <Form form={form} colon={false}>
        <Row gutter={36} justify={'center'}>
          <Col span={6} xxl={5}>
            <Form.Item label={<span className={styles.filterLabel}>类型</span>}>
              <Select
                placeholder="请选择"
                maxTagCount={2}
                showArrow={true}
                value={type}
                onChange={val => {
                  onChange({ type: val, category: '0' });
                }}
              >
                {CategoryLevel1Options.map(type => {
                  return (
                    <Select.Option key={type.value} value={type.value}>
                      {type.label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6} xxl={5}>
            <Form.Item label={<span className={styles.filterLabel}>分类</span>}>
              <Select
                placeholder="请选择"
                maxTagCount={2}
                showArrow={true}
                value={category}
                onChange={val => {
                  onChange({ category: val });
                }}
              >
                {categories.map(type => {
                  return (
                    <Select.Option key={type.value} value={type.value}>
                      {type.label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6} xxl={5}>
            <Form.Item label={<span className={styles.filterLabel}>搜索</span>}>
              <Input.Search
                placeholder="请输入资源名称、ID"
                value={keyword}
                onChange={e => {
                  onChange({ keyword: e.target.value });
                }}
                onSearch={onSearch}
              />
            </Form.Item>
          </Col>
          <Col span={6} xxl={5}>
            <Form.Item label={<span className={styles.filterLabel}>商品状态</span>}>
              <Select
                allowClear
                maxTagCount={2}
                placeholder="请选择商品状态"
                showArrow={true}
                value={status}
                onChange={val => {
                  onChange({ status: val });
                }}
              >
                {StoreMaterialStatusOptions.map(item => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
