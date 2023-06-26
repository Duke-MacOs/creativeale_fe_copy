import React, { useEffect, useRef, useState } from 'react';
import { Tabs, message, Select, Button, Modal, Input, Space, Tooltip, Empty, Divider, Spin, Typography } from 'antd';
import { IMaterialType } from '@/types/library';
import { fetchAllMaterialType } from '@shared/api/category';
import { createCategory, deleteCategory, getCategory, updateCategory } from '@shared/api/store';
import { CategoryLevel1, CategoryLevel1Name, IStoreCategory } from '@shared/types/store';
import { Delete, Edit } from '@icon-park/react';
import Icon, { CreditCardOutlined } from '@ant-design/icons';
import StoreMaterial from '../Store';
import { WithPathProps } from '@main/routes/withPath';
import { Props } from './Library';

export type MaterialProps = WithPathProps<
  Pick<Props, 'page' | 'pageSize'> & {
    keyword: string;
    updateAfter: string;
    updateBefore: string;
    tagIds?: string;
    statuses: string;
    onPlatform?: boolean;
    types: string;
  }
>;

const CategoryLevel1Options = [
  ...Object.entries(CategoryLevel1Name)
    .filter(([, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      label: key,
      value,
    })),
];

const Item = ({
  data,
  onChangeInput,
  onBlur,
  onDelete,
  style,
}: {
  data: Pick<IStoreCategory, 'id' | 'name'>;
  onChangeInput: (val: string) => void;
  onBlur: (id: string) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}) => {
  const [disabled, setDisabled] = useState(data.id === '0' ? false : true);
  const [hover, setHover] = useState(false);

  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (data.id === '0') {
      inputRef.current?.focus();
    }
  }, []);

  const onEdit = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    });
    setDisabled(false);
  };

  return (
    <Space
      style={{
        backgroundColor: hover && disabled ? '#f2f3f5' : 'unset',
        display: 'flex',
        alignItems: 'center',
        height: '40px',
        ...style,
      }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <CreditCardOutlined />
      {disabled ? (
        <div onDoubleClick={onEdit}>
          <Typography.Text style={{ height: '40px', width: '140px', lineHeight: '40px' }} ellipsis>
            {data.name}
          </Typography.Text>
          {hover && (
            <>
              <Tooltip placement="top" title="编辑" style={{ marginLeft: '5px' }}>
                <Button type="link" icon={<Icon component={Edit as any} />} onClick={onEdit} />
              </Tooltip>
              <Tooltip placement="top" title="删除">
                <Button
                  type="link"
                  icon={<Icon component={Delete as any} />}
                  onClick={() => {
                    onDelete(data.id);
                  }}
                />
              </Tooltip>
            </>
          )}
        </div>
      ) : (
        <Input
          ref={inputRef}
          style={{ width: '150px' }}
          maxLength={15}
          required
          placeholder="请输入分类名称"
          // prefix={<span style={{ color: 'gray' }}>名称</span>}
          value={data.name}
          disabled={disabled}
          onChange={e => {
            onChangeInput(e.target.value);
          }}
          onBlur={() => {
            setDisabled(true);
            onBlur(data.id);
          }}
        />
      )}
    </Space>
  );
};

const Category = () => {
  // id = 0 时，为还未创建分类
  const [category, setCategory] = useState<Pick<IStoreCategory, 'id' | 'name'>[]>([]);
  const [selectedType, setSelectedType] = useState<IMaterialType['cid']>(CategoryLevel1Options[0].value as number);
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    if (selectedType) {
      onGetCategory(selectedType);
    }
  }, [selectedType]);

  const onCreateCategory = async (type: IMaterialType['cid'], name: string) => {
    try {
      await createCategory(type, name);
      message.success('创建成功');
    } catch (error) {
      message.error(`新建分类失败：${error}`);
    }
  };

  const onUpdateCategory = async (id: string, name: string) => {
    try {
      await updateCategory(id, { name });
    } catch (error) {
      message.error(`修改分类失败：${error}`);
    }
  };

  const onDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
    } catch (error) {
      message.error(`删除分类失败：${error}`);
    }
  };

  const onGetCategory = async (type: IMaterialType['cid']) => {
    setCategoryLoading(true);
    setCategory([]);
    try {
      const data = await getCategory(type);
      setCategory(data.map(i => ({ id: i.id, name: i.name })));
    } catch (error) {
      message.error('获取分类失败：', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const onAddTempCategory = () => {
    setCategory(prev => [...prev, { id: '0', name: '' }]);
  };

  const onBlur = async (id: string) => {
    const name = category.find(i => i.id === id)?.name;
    if (!name) {
      message.error('分类名称不能为空');
      selectedType && onGetCategory(selectedType);
      return;
    }
    if (category.find(i => i.id !== id && i.name === name)) {
      message.error('分类名字重复');
      selectedType && onGetCategory(selectedType);
      return;
    }

    if (id === '0') {
      if (!name) {
        setCategory(prev => prev.filter(i => i.id !== '0'));
      }
      if (selectedType && name) {
        // 新建
        await onCreateCategory(selectedType, name);
        await onGetCategory(selectedType);
      }
    } else {
      // 修改
      name && (await onUpdateCategory(id, name));
    }
  };

  const onDelete = async (id: string) => {
    const name = category.find(i => i.id === id)?.name;
    Modal.confirm({
      content: (
        <p>
          确定要删除<span style={{ color: 'orange' }}>{name}</span>分类吗？
        </p>
      ),
      cancelText: '取消',
      okText: '确定',
      onOk: async () => {
        await onDeleteCategory(id);
        await onGetCategory(selectedType!);
      },
    });
  };

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div>
          <Select
            value={selectedType}
            style={{ width: 120 }}
            onChange={setSelectedType}
            options={CategoryLevel1Options}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '20px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            height: '500px',
            width: '260px',
            overflowY: 'scroll',
          }}
        >
          <Button
            type="link"
            style={{ width: '80px', margin: '5px 10px' }}
            disabled={category.some(i => i.id === '0')}
            onClick={onAddTempCategory}
          >
            新增分类
          </Button>
          <Divider style={{ margin: '0 0 10px 0' }} />
          {category.length === 0 ? (
            categoryLoading ? (
              <Spin />
            ) : (
              <Empty />
            )
          ) : (
            category.map((i, idx) => {
              return (
                <Item
                  style={{ padding: '0 5px' }}
                  data={i}
                  onChangeInput={val => {
                    setCategory(prev => {
                      return prev.map((p, idx2) => (idx === idx2 ? { ...p, name: val } : p));
                    });
                  }}
                  onBlur={onBlur}
                  onDelete={onDelete}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <Tabs style={{ flex: 1, padding: '0 10px' }} defaultActiveKey="1" onChange={setActiveKey}>
      <Tabs.TabPane tab="商城管理" key="1">
        <StoreMaterial type="super" visible={activeKey === '1'} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="分类设置" key="2">
        <Category />
      </Tabs.TabPane>
    </Tabs>
  );
};
