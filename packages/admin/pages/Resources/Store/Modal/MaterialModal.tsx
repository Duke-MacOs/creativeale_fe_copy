import { useState } from 'react';
import { usePersistCallback } from '@byted/hooks';
import { Modal, Form, Select, Input, Upload, message, Spin, Button, Divider } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchUserMaterialDetail } from '@shared/api/library';
import { isNil, isObject, pick } from 'lodash';
import { useEffect } from 'react';
import { uploadFile } from '@shared/api';
import { IStoreMaterial, StoreMaterialStatus, StoreMaterialStatusName } from '@shared/types/store';
import { applyMaterial, getMaterialById, updateMaterialById, deleteMaterials } from '@shared/api/store';
import useCategories from '../hooks/useCategories';
import { getStatusTagColor } from '..';
import { useUserInfo } from '@shared/userInfo';
import { byteConvert } from '@shared/utils/byteConvert';

type Type = 'super' | 'admin' | 'examine';

type IProps = {
  id: string;
  type: Type;
  onCancel: () => void;
  onRefetch?: (resetPage?: boolean) => void;
};

// 老版 material.tags 为 object[]
const formatTagsToArray = (tags: string) => (typeof tags === 'string' ? tags?.split(',').filter(i => i) ?? [] : []);
const formatTagsToString = (tags: string[]) => tags?.join(',') ?? '';

export default ({ id, type, onCancel, onRefetch }: IProps) => {
  const [form] = Form.useForm();
  const [detail, setDetail] = useState<IStoreMaterial>({});
  const { categories, getCategories } = useCategories();
  const [loading, setLoading] = useState({
    detail: false,
    examine: false,
    delete: false,
    update: false,
    reject: false,
    agree: false,
    shelve: false,
    offShelve: false,
  });
  const [coverLoading, setCoverLoading] = useState(false);
  const { userInfo } = useUserInfo();

  // 是否禁止修改审核信息
  // 超管不能修改
  // 上架中的不能修改
  // 下架的不能修改
  const disableModifyApplyInfo =
    type === 'super' || detail.status === StoreMaterialStatus.shelve || detail.status === StoreMaterialStatus.offShelve;
  useEffect(() => {
    initial();
  }, [id]);

  const getExtra = (data: any) => {
    const teamId = userInfo.teamId;
    const teamName = userInfo.teams.find(i => i.id === teamId)?.name;
    if (isObject(data.extra)) {
      data.extra.teamId = teamId;
      data.extra.teamName = teamName;
      return JSON.stringify(data.extra);
    }
    return JSON.stringify({ teamId, teamName });
  };

  const onSetLoading = (key: string, value: boolean) => {
    setLoading(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const initial = async () => {
    try {
      onSetLoading('detail', true);
      const detail = await fetchDetail();
      detail && (await getCategories(detail.type?.cid));
      form.setFieldsValue({
        name: detail.name,
        description: detail.description,
        category: detail.category ?? '0',
        price: detail.price ?? 0,
        tags: formatTagsToArray(detail.tags),
        cover: detail.cover,
        rejectDesc: detail.rejectDesc,
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      onSetLoading('detail', false);
    }
  };

  const fetchDetail = usePersistCallback(async () => {
    if (!isNil(id)) {
      const detail = type === 'examine' ? await fetchUserMaterialDetail(id) : await getMaterialById(id);
      setDetail({
        ...detail,
        type: detail.type,
        category: '',
        price: 0,
        tags: detail?.tags,
        extra: detail.extra,
        cover: detail.cover || (detail.url?.endsWith('jpg') || detail.url?.endsWith('png') ? detail.url : ''),
      });
      return detail;
    }
  });

  const getFormData = () => {
    const formData = form.getFieldsValue();
    return {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      cover: formData.cover,
      tags: formatTagsToString(formData.tags),
    };
  };

  const getApplyRequestBody = () => {
    // 与原始资源保持同步的字段
    const keys = ['cover', 'type', 'url', 'previewUrl'];
    return {
      ...getFormData(),
      resourceId: detail.id,
      extra: getExtra(detail),
      ...pick(detail, keys),
    };
  };

  // 送审
  const onExamine = async () => {
    form
      .validateFields()
      .then(async () => {
        try {
          onSetLoading('examine', true);
          const params = getApplyRequestBody();
          await applyMaterial(params);
          onCancel();
          message.success('发布成功，等待管理员审核');
        } catch (error) {
          message.error(error.message);
        } finally {
          onSetLoading('examine', false);
        }
      })
      .catch(e => {
        console.log('e:', e);
      });
  };

  // 重新送审
  const onReExamine = async () => {
    form
      .validateFields()
      .then(async () => {
        try {
          onSetLoading('examine', true);
          const params = getFormData();
          console.log('params:', params);
          await updateMaterialById(detail.id, {
            ...detail,
            ...params,
            extra: JSON.stringify(detail.extra),
            status: StoreMaterialStatus.examine,
            rejectDesc: '',
          });
          onCancel();
          onRefetch?.();
          message.success('发布成功，等待管理员审核');
        } catch (error) {
          message.error(error.message);
        } finally {
          onSetLoading('examine', false);
        }
      })
      .catch(e => {
        console.log('e:', e);
      });
  };

  const onUpdateMaterial = async () => {
    form
      .validateFields()
      .then(async () => {
        try {
          onSetLoading('update', true);
          const values = getFormData();
          await updateMaterialById(detail.id, values);
          message.success('修改成功');
        } catch (error) {
          message.error(error.message);
        } finally {
          onSetLoading('update', false);
        }
      })
      .catch(e => {
        console.log('e:', e);
      });
  };

  const onDeleteMaterials = async (ids: string[]) => {
    try {
      onSetLoading('delete', true);
      await deleteMaterials(ids);
      onCancel();
      message.success('删除成功');
      await onRefetch?.();
    } catch (error) {
      message.error(error.message);
    } finally {
      onSetLoading('delete', false);
    }
  };

  const onRejectMaterial = async () => {
    form
      .validateFields()
      .then(async () => {
        try {
          onSetLoading('reject', true);
          const reject = form.getFieldValue('rejectDesc');
          console.log('reject:', reject);
          await updateMaterialById(detail.id, { status: StoreMaterialStatus.reject, rejectDesc: reject });
          message.success('资源已拒绝审核');
          onCancel();
          onRefetch?.();
        } catch (error) {
          message.error(error.message);
        } finally {
          onSetLoading('reject', false);
        }
      })
      .catch(e => {
        console.log('e:', e);
      });
  };

  const onAgreeMaterial = async () => {
    try {
      onSetLoading('agree', true);
      await updateMaterialById(detail.id, { status: StoreMaterialStatus.shelve });
      message.success('资源通过审核，自动上架');
      onCancel();
      onRefetch?.();
    } catch (error) {
      message.error(error.message);
    } finally {
      onSetLoading('agree', false);
    }
  };

  const onOffShelveMaterial = async () => {
    try {
      onSetLoading('offShelve', true);
      await updateMaterialById(detail.id, { status: StoreMaterialStatus.offShelve });
      message.success('已下架');
      onCancel();
      onRefetch?.();
    } catch (error) {
      message.error(error.message);
    } finally {
      onSetLoading('offShelve', false);
    }
  };

  const onShelveMaterial = async () => {
    try {
      onSetLoading('shelve', true);
      await updateMaterialById(detail.id, { status: StoreMaterialStatus.shelve });
      message.success('已上架');
      onCancel();
      onRefetch?.();
    } catch (error) {
      message.error(error.message);
    } finally {
      onSetLoading('shelve', false);
    }
  };

  const uploadButton = (
    <div>
      {coverLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  const ExamineFormItems = (
    <>
      <Divider />
      <Form.Item
        name="rejectDesc"
        label={<span>拒绝</span>}
        rules={[
          {
            required: true,
            message: '请输入拒绝原因',
          },
        ]}
      >
        <Input.TextArea
          placeholder="请输入拒绝原因"
          maxLength={125}
          disabled={!(type === 'super' && detail.status === StoreMaterialStatus.examine)}
        />
      </Form.Item>
    </>
  );

  const getFooter = () => {
    if (type === 'examine') {
      return (
        <Button type="primary" loading={loading.examine} onClick={onExamine}>
          发布
        </Button>
      );
    } else if (detail.status === StoreMaterialStatus.examine) {
      if (type === 'admin') {
        return (
          <>
            <Button
              type="primary"
              danger
              loading={loading.delete}
              onClick={() => {
                onDeleteMaterials([detail.id]);
              }}
            >
              删除
            </Button>
            <Button type="primary" loading={loading.update} onClick={onUpdateMaterial}>
              修改
            </Button>
          </>
        );
      }
      if (type === 'super') {
        return (
          <>
            <Button danger type="primary" loading={loading.reject} onClick={onRejectMaterial}>
              拒绝
            </Button>
            <Button type="primary" loading={loading.agree} onClick={onAgreeMaterial}>
              通过
            </Button>
          </>
        );
      }
    } else if (detail.status === StoreMaterialStatus.shelve) {
      return (
        <Button type="primary" loading={loading.offShelve} onClick={onOffShelveMaterial}>
          下架
        </Button>
      );
    } else if (detail.status === StoreMaterialStatus.offShelve) {
      return (
        <>
          <Button
            type="primary"
            danger
            loading={loading.delete}
            onClick={() => {
              onDeleteMaterials([detail.id]);
            }}
          >
            删除
          </Button>
          <Button type="primary" loading={loading.shelve} onClick={onShelveMaterial}>
            上架
          </Button>
        </>
      );
    } else if (detail.status === StoreMaterialStatus.reject) {
      if (type === 'admin') {
        return (
          <>
            <Button
              type="primary"
              danger
              loading={loading.delete}
              onClick={() => {
                onDeleteMaterials([detail.id]);
              }}
            >
              删除
            </Button>
            <Button type="primary" loading={loading.examine} onClick={onReExamine}>
              重新发布
            </Button>
          </>
        );
      }
      if (type === 'super') {
        return (
          <Button type="primary" loading={loading.agree} onClick={onAgreeMaterial}>
            通过
          </Button>
        );
      }
    } else if (detail.status === StoreMaterialStatus.deleted) {
      if (type === 'admin') {
        return (
          <Button type="primary" loading={loading.examine} onClick={onReExamine}>
            重新发布
          </Button>
        );
      }
      if (type === 'super') {
        return null;
      }
    }
  };

  return (
    <Modal visible={true} footer={getFooter()} onCancel={onCancel}>
      {loading.detail ? (
        <Spin />
      ) : (
        <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
          {type !== 'examine' && (
            <Form.Item label={<span>状态</span>}>
              <span
                style={{
                  color: 'white',
                  padding: '0 8px',
                  borderRadius: '4px 0 4px 0',
                  backgroundColor: getStatusTagColor(detail.status),
                }}
              >
                {StoreMaterialStatusName[detail.status]}
              </span>
            </Form.Item>
          )}
          {detail.extra?.teamName && (
            <Form.Item label={<span>团队</span>}>
              <span>{detail.extra.teamName}</span>
            </Form.Item>
          )}
          {detail.extra?.size && (
            <Form.Item label={<span>大小</span>}>
              <span>{byteConvert(detail.extra.size)}</span>
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label={<span>名称</span>}
            rules={[
              {
                required: true,
                message: '请输入商品名称',
              },
            ]}
          >
            <Input placeholder="请输入商品名称" maxLength={25} disabled={disableModifyApplyInfo} />
          </Form.Item>
          <Form.Item name="description" label={<span>描述</span>}>
            <Input.TextArea placeholder="请输入商品描述" maxLength={125} disabled={disableModifyApplyInfo} />
          </Form.Item>
          <Form.Item name="category" label={<span>分类</span>}>
            <Select style={{ width: '100%' }} disabled={disableModifyApplyInfo} options={categories} />
          </Form.Item>
          <Form.Item label={<span>封面</span>} name="cover">
            <Upload
              name="cover"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              disabled={disableModifyApplyInfo}
              beforeUpload={async file => {
                const isJpgOrPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
                if (!isJpgOrPng) {
                  message.error('只能上传图片（jpg/jpeg/png）');
                  return;
                }
                const isLt2M = file.size / 1024 / 1024 < 1;
                if (!isLt2M) {
                  message.error('图片超过 1MB!');
                  return;
                }
                setCoverLoading(true);

                try {
                  const res = await uploadFile(file);
                  setDetail(prev => ({
                    ...prev,
                    cover: res.downloadUrl,
                  }));
                  form.setFieldValue('cover', res.downloadUrl);
                } catch (error) {
                  message.error(error.message);
                }
                setCoverLoading(false);

                return false;
              }}
            >
              {detail?.cover ? (
                <img src={detail?.cover} alt="封面" style={{ height: '100%', width: '100%' }} />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="price" label={<span>价格</span>}>
            <Input disabled={true} prefix="￥" value={detail.price + ''} />
          </Form.Item>
          <Form.Item name="tags" label={<span>标签</span>}>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
              disabled={disableModifyApplyInfo}
              options={formatTagsToArray(detail.tags)
                .map(i => ({ label: i, value: i }))
                .filter(i => i)}
            />
          </Form.Item>
          {((detail.rejectDesc && detail.status === StoreMaterialStatus.reject) ||
            (type === 'super' && detail.status === StoreMaterialStatus.examine)) &&
            ExamineFormItems}
        </Form>
      )}
    </Modal>
  );
};
