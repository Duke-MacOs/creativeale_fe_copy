import { getCategory } from '@shared/api/store';
import { message, Space } from 'antd';
import { css } from 'emotion';
import React, { useEffect } from 'react';
import shallow from 'zustand/shallow';
import { useCategories, useModalState } from '../Context';
import { ResourceTypeInModal, SidebarType } from '../type';

export default React.memo(() => {
  const { categoryId, sidebarType, resourceType, updateModalState, getModalState } = useModalState(
    state => ({
      resourceType: state.modalState.resourceType,
      categoryId: state.modalState.categoryId,
      sidebarType: state.modalState.sidebarType,
      updateModalState: state.updateModalState,
      getModalState: state.getModalState,
    }),
    shallow
  );
  const {
    categories: { team, store },
    updateCategories,
  } = useCategories(state => state);

  // 更新商城资源分类
  useEffect(() => {
    if (sidebarType === SidebarType.Store) onGetCategory(resourceType);
  }, [resourceType, sidebarType]);

  const onGetCategory = async (type: ResourceTypeInModal) => {
    updateModalState({ categoryId: '1' });
    try {
      const categories = await getCategory(type);
      if (getModalState().resourceType === type) {
        updateCategories('store', categories);
      }
    } catch (error) {
      message.error(`查询商城资源分类错误:${error.message}`);
      updateCategories('store', []);
    }
  };

  const onSelectCategory = (id: string) => {
    updateModalState({ categoryId: id });
  };

  if (sidebarType === SidebarType.Store && store.length === 0) return null;
  if (sidebarType === SidebarType.Team && team.length === 0) return null;

  const categories =
    sidebarType === SidebarType.Store
      ? [{ id: '1', name: '全部' }, ...store.map(i => ({ id: i.id, name: i.name }))]
      : team.map(i => ({ id: i.id, name: i.name })).filter(i => i.name !== '回收站');

  return (
    <Space
      className={css({
        padding: '10px 24px',
        overflowX: 'scroll',
      })}
    >
      {categories.map(i => (
        <span
          className={css({
            whiteSpace: 'nowrap',
            display: 'inline-block',
            padding: '2px 5px',
            borderRadius: '5px',
            border: '1px solid',
            backgroundColor: categoryId === i.id ? 'orange' : 'white',
            borderColor: categoryId === i.id ? 'orange' : 'gray',
            cursor: 'pointer',
          })}
          onClick={() => {
            onSelectCategory(i.id);
          }}
        >
          {i.name}
        </span>
      ))}
    </Space>
  );
});
