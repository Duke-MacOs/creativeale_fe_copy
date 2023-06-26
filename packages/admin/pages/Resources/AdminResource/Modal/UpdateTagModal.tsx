/* 
  批量修改分类
*/

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Row, Col, Button, message, TreeSelect } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { css } from 'emotion';
import { IMaterial } from '@/types/library';
import { useBatchLibraryAction } from '../Library/useLibrary';
import styles from '../style';
import { fetchMaterialTag } from '@shared/api/library';

const { Option } = Select;
const { TreeNode } = TreeSelect;

const innerStyles = {
  form: css({
    height: '300px',
  }),
  label: css({
    paddingLeft: '28px',
    color: '#999',
  }),
};
export interface UpdateTagModalProps {
  ids: IMaterial['id'][];
  types: string;
  categories:
    | {
        cid: number;
        name: string;
      }[]
    | undefined;
  onCancel(): void;
  onRefetch: (resetPage?: boolean | undefined) => void;
}

export default function UpdateTagModal({ ids, types, categories, onCancel, onRefetch }: UpdateTagModalProps) {
  const [form] = Form.useForm();
  const { onBatchUpdateTags } = useBatchLibraryAction();
  const [catTags, setCatTags] = useState([]);
  const curType = categories?.filter(cat => cat.cid + '' === types)[0].name;
  useEffect(() => {
    fetchMaterialTag({ category: 9, pageSize: 2000, origin: 1, parentName: '' }).then(data => {
      setCatTags(data.tags.filter((item: any) => item.parentName !== '模板'));
    });
  }, []);

  const [saving, setSaving] = useState(false);

  const handleCancel = usePersistCallback(() => {
    onCancel();
  });
  const handleConfirm = usePersistCallback(() => {
    setSaving(true);
    const tagId = form.getFieldsValue().tags;
    onBatchUpdateTags(ids, [tagId]).then(() => {
      setSaving(false);
      onRefetch();
      message.success(`已成功为${ids.length}个物料重新分类`);
      onCancel();
    });
  });

  return (
    <Modal
      title="修改分类"
      open={true}
      width={600}
      centered={true}
      footer={
        <div className={styles.modalFooter}>
          <div className={styles.modalFooterTips}>
            {ids.length > 1 ? `您将为${ids.length}个物料重新设置分类标签` : ''}
          </div>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" loading={saving} onClick={handleConfirm}>
            确认
          </Button>
        </div>
      }
      onOk={handleConfirm}
      onCancel={handleCancel}
    >
      <Form className={innerStyles.form} form={form} colon={false}>
        <Row>
          <Col span={18}>
            <Form.Item name="tags" label={<span className={innerStyles.label}>标签</span>}>
              {curType !== '互动组件' ? (
                <Select placeholder="请选择" showArrow={true}>
                  {catTags
                    .filter((item: any) => item.parentName.startsWith(curType))
                    .map((tag: any) => {
                      const id = tag.id;
                      return (
                        <Option key={id} value={id}>
                          {tag.name}
                        </Option>
                      );
                    })}
                </Select>
              ) : (
                <TreeSelect
                  showSearch
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="Please select"
                  allowClear
                  treeDefaultExpandAll
                >
                  <TreeNode value="parent 1-0" title="玩法组件" selectable={false}>
                    {catTags
                      .filter((item: any) => item.parentName === '玩法组件')
                      .map((tag: any) => (
                        <TreeNode value={tag.id} key={tag.id} title={tag.name} />
                      ))}
                  </TreeNode>
                  <TreeNode value="parent 1-1" title="附加组件" selectable={false}>
                    {catTags
                      .filter((item: any) => item.parentName === '附加组件')
                      .map((tag: any) => (
                        <TreeNode value={tag.id} key={tag.id} title={tag.name} />
                      ))}
                  </TreeNode>
                </TreeSelect>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
