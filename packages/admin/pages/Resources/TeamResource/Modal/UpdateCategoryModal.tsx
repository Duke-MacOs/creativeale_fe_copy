import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { Modal, Form, Select, Row, Col, Button, message } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { css } from 'emotion';
import { IUserMaterial } from '@/types/library';
import { UserMaterialContext } from '../context';
import { useBatchLibraryAction } from '../Library/useLibrary';
import { fetchUserMaterialDetail } from '@shared/api/library';
import styles from '../style';

const { Option } = Select;

const innerStyles = {
  form: css({
    height: '300px',
  }),
  label: css({
    paddingLeft: '28px',
    color: '#999',
  }),
};
export interface UpdateCategoryModalProps {
  ids: IUserMaterial['id'][];
  onCancel(): void;
}

export default function UpdateCategoryModal({ ids, onCancel }: UpdateCategoryModalProps) {
  const [form] = Form.useForm();
  const { onBatchUpdateCategories } = useBatchLibraryAction();
  const {
    category: { list: categoryList, refreshList: refreshCategory },
    library: { refreshList: refreshLibrary },
  } = useContext(UserMaterialContext);
  const [saving, setSaving] = useState(false);
  const prevInitialRef = useRef(false);
  const convertedList = useMemo(() => {
    return (categoryList || []).filter(cat => cat.id !== '0' && cat.id !== '1' && cat.name !== '未分类');
  }, [categoryList]);

  useEffect(() => {
    if (ids.length === 1 && !prevInitialRef.current) {
      prevInitialRef.current = true;
      fetchUserMaterialDetail(ids[0]).then((detail: IUserMaterial) => {
        form.setFieldsValue({
          categoryIds: detail.categories.filter(cat => cat.name !== '未分类').map(cat => cat.id),
        });
      });
    }
  }, [ids, form]);

  const handleCancel = usePersistCallback(() => {
    onCancel();
  });
  const handleConfirm = usePersistCallback(() => {
    const categoryIds = form.getFieldsValue().categoryIds;
    if (!categoryIds.length) {
      message.error('请选择需要修改的分类');
      return;
    }
    setSaving(true);
    onBatchUpdateCategories(ids, categoryIds).then(() => {
      setSaving(false);
      refreshCategory();
      refreshLibrary();
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
          <div className={styles.modalFooterTips}>{ids.length > 1 ? `您将为${ids.length}个物料重新分类` : ''}</div>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" loading={saving} onClick={handleConfirm}>
            确认
          </Button>
        </div>
      }
      onOk={handleConfirm}
      onCancel={handleCancel}
    >
      <Form className={innerStyles.form} form={form} initialValues={{ categoryIds: [] }} colon={false}>
        <Row>
          <Col span={18}>
            <Form.Item name="categoryIds" label={<span className={innerStyles.label}>分类</span>}>
              <Select mode="multiple" placeholder="请选择" showArrow={true}>
                {(convertedList || []).map(cat => {
                  const id = cat.id as string;
                  return (
                    <Option key={id} value={id}>
                      {cat.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
