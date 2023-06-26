import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Col, Button, Input, message, Checkbox, TreeSelect } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { IMaterial } from '@/types/library';
import style from './style';
import UploadCover from './UploadCover';
import { Rule } from 'antd/lib/form';
import { fetchMaterialTag, updateMaterial } from '@shared/api/library';
import UploadPreVideo from './UploadPreVideo';

const { Option } = Select;
const { TreeNode } = TreeSelect;
export interface ModifyModalProps {
  id: IMaterial['id'][];
  item?: IMaterial;
  onCancel(): void;
  onRefetch: (resetPage?: boolean | undefined) => void;
}

export default function ModifyModal({ id, item, onCancel, onRefetch }: ModifyModalProps) {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchMaterialTag({ category: 9, pageSize: 2000, origin: 1, parentName: item?.type.name as string }).then(data => {
      setTags(data.tags);
    });
  }, [item]);

  // 素材名称校验规则
  const materialNameRules: Rule[] = [
    { required: true },
    { whitespace: true, message: '请输入素材名称' },
    { max: 20, message: '素材名称不可超过20个字' },
  ];
  // 素材描述校验规则
  const materialDescRules: Rule[] = [
    { whitespace: true, message: '素材描述不能为空格' },
    { max: 128, message: '素材描述不可超过128个字' },
  ];
  const [saving, setSaving] = useState(false);

  const handleCancel = usePersistCallback(() => {
    onCancel();
  });

  // 修改素材信息
  const modifyInfo = usePersistCallback(params => {
    if (!['图片', '视频', '音频'].includes(item?.type.name as string) && params.cover === '') {
      message.warning('请上传封面');
      return;
    }
    setSaving(true);
    updateMaterial(
      {
        ...params,
        cloudTags: [],
        platformTags: (item?.tags ?? [])
          .filter(item => item.origin !== 1)
          .map(item => item.id)
          .concat(params.platformTags ? [params.platformTags] : []),
        isAuthControl: params.isAuthControl ? 'true' : 'false',
        onPlatform: item?.onPlatform,
        onCloud: item?.onCloud,
        status: item?.status,
        extra: JSON.stringify({ previewVideo: params.previewVideo }),
      },
      id[0]
    )
      .then(() => {
        message.success('修改成功');
      })
      .then(() => {
        onRefetch();
      });
    setSaving(false);
    handleCancel();
  });
  return (
    <Modal
      title="素材信息录入"
      open={true}
      width={600}
      centered={true}
      className={style.modal}
      footer={
        <div>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            确认
          </Button>
        </div>
      }
      onOk={() => form.submit()}
      onCancel={handleCancel}
    >
      <Form
        className={style.form}
        form={form}
        colon={false}
        labelAlign="right"
        onFinish={params => {
          modifyInfo(params);
        }}
      >
        <Col span={18}>
          <Form.Item
            name="platformTags"
            label="素材类别："
            initialValue={item?.tags?.find(tag => tag.origin === 1)?.id}
          >
            {item?.type.name !== '互动组件' ? (
              <Select placeholder="请选择" showArrow={true} allowClear>
                {tags.map((item: any) => {
                  const id = item.id;
                  return (
                    <Option key={id} value={id}>
                      {item.name}
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
                  {tags
                    .filter((item: any) => item.parentName === '玩法组件')
                    .map((tag: any) => (
                      <TreeNode value={tag.id} key={tag.id} title={tag.name} />
                    ))}
                </TreeNode>
                <TreeNode value="parent 1-1" title="附加组件" selectable={false}>
                  {tags
                    .filter((item: any) => item.parentName === '附加组件')
                    .map((tag: any) => (
                      <TreeNode value={tag.id} key={tag.id} title={tag.name} />
                    ))}
                </TreeNode>
                <TreeNode value="parent 1-2" title="视频组件" selectable={false}>
                  {tags
                    .filter((item: any) => item.name === '视频组件')
                    .map((tag: any) => (
                      <TreeNode value={tag.id} key={tag.id} title={tag.name} />
                    ))}
                </TreeNode>
              </TreeSelect>
            )}
          </Form.Item>
          <Form.Item
            label="素材名称："
            name="name"
            initialValue={item?.name}
            rules={materialNameRules}
            style={{ marginLeft: '-11px' }}
          >
            <Input type="string" placeholder="请输入素材名称" />
          </Form.Item>
          <Form.Item
            required
            name="cover"
            label="上传封面："
            initialValue={item?.cover}
            hidden={['图片', '视频', '音频'].includes(item?.type.name as string)}
            rules={[
              {
                message: `请上传素材封面`,
              },
            ]}
            style={{ marginLeft: '-11px' }}
          >
            <UploadCover />
          </Form.Item>
          <Form.Item
            name="previewVideo"
            label="预览视频："
            initialValue={item?.extra.previewVideo}
            hidden={['图片', '视频', '音频'].includes(item?.type.name as string)}
            rules={[
              {
                message: `请上传预览视频`,
              },
            ]}
          >
            <UploadPreVideo />
          </Form.Item>

          <Form.Item label="素材描述：" name="description" initialValue={item?.description} rules={materialDescRules}>
            <Input.TextArea showCount maxLength={128} className={style.textarea} placeholder="请输入素材描述" />
          </Form.Item>
          <Form.Item
            label="版权控制："
            name="isAuthControl"
            initialValue={
              typeof item?.extra.isAuthControl === 'boolean'
                ? item?.extra.isAuthControl
                : item?.extra.isAuthControl === 'true'
                ? true
                : false
            }
            valuePropName="checked"
          >
            <Checkbox className={style.checkbox}>版权控制</Checkbox>
          </Form.Item>
        </Col>
      </Form>
    </Modal>
  );
}
