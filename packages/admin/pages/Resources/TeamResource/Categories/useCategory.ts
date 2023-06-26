import { useState, useEffect } from 'react';
import { usePersistCallback } from '@byted/hooks';
import { isNil } from 'lodash';
import { fetchUserCategories, postUserCategory, deleteUserCategory } from '@shared/api/category';
import { IUserCategory } from '@/types/library';

export interface ICategoryItem extends Omit<IUserCategory, 'id'> {
  id?: string;
  count: number;
  isNew?: boolean;
}

export function useCategoryList(needsInit?: boolean) {
  const [list, setList] = useState<ICategoryItem[] | null>(null);

  const fetchList = usePersistCallback(() => {
    return fetchUserCategories().then(data => {
      const { categories, subTotal, total } = data;
      setList(
        categories.map(category => ({
          ...category,
          count: category.name === '全部' ? total : subTotal[category.id] ?? 0,
        }))
      );
    });
  });
  const onAddCategory = usePersistCallback(() => {
    if (!list) return;
    const existNewItem = !!list.find(item => item.isNew);
    if (existNewItem) {
      return;
    }
    setList(list => {
      if (!list) return list;
      const newList = [...list];
      newList.splice(-1, 0, { name: '', isNew: true, count: 0 });
      return newList;
    });
  });
  const onCancelAddCategory = usePersistCallback(() => {
    setList(list => {
      if (!list) return list;
      const newList = [...list];
      return newList.filter(item => !isNil(item.id));
    });
  });

  useEffect(() => {
    if (needsInit) {
      fetchList();
    }
  }, [fetchList, needsInit]);

  return { list, fetchList, onAddCategory, onCancelAddCategory };
}

export function useCategory(id?: string) {
  const onUpdate = usePersistCallback(({ name }) => {
    return postUserCategory({ id, name }).then(data => data.id);
  });
  const onDelete = usePersistCallback(deleteAsEmpty => {
    if (id) {
      return deleteUserCategory(id, deleteAsEmpty);
    } else {
      return Promise.reject('Category Id is not defined');
    }
  });
  return { onUpdate, onDelete };
}
