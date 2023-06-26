import { useState, useEffect } from 'react';
import { usePersistCallback } from '@byted/hooks';
import { IMaterial, IMaterialFilters } from '@/types/library';
import { IPaginationReq } from '@/types/apis';
import {
  fetchMaterialList,
  renameUserMaterial,
  deleteUserMaterial,
  restoreUserMaterial,
  removeUserMaterialFromCategory,
  updateTagOfMaterial,
  BatchDeleteMaterial,
  reviewMaterial,
  renameMaterial,
} from '@shared/api/library';

export function useLibrary(params: IMaterialFilters, pagination: IPaginationReq) {
  const [list, setList] = useState<IMaterial[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchList = usePersistCallback(() => {
    setLoading(true);
    return fetchMaterialList({
      ...params,
      ...pagination,
      allType: true,
    }).then(({ materialList, pagination }) => {
      setList(materialList.filter(item => item.type.cid !== 21));
      setTotal(pagination.total);
      setLoading(false);
    });
  });

  useEffect(() => {
    fetchList();
  }, [params, pagination, fetchList]);

  return { loading, list, total, fetchList, setList };
}

export function useLibraryItem(id: IMaterial['id']) {
  const onUpdate = usePersistCallback(({ name }) => {
    return renameUserMaterial([{ id, name }]);
  });
  const onDelete = usePersistCallback(() => {
    return deleteUserMaterial([id]);
  });
  const onRemoveFromCategory = usePersistCallback((categoryIds: string[]) => {
    return removeUserMaterialFromCategory([id], categoryIds);
  });
  const onRestore = usePersistCallback(() => {
    return restoreUserMaterial([id]);
  });
  // 审核物料
  const onReview = usePersistCallback(params => {
    return reviewMaterial(params);
  });
  return { onUpdate, onDelete, onRemoveFromCategory, onRestore, onReview };
}

export function useBatchLibraryAction() {
  const onBatchUpdate = usePersistCallback((names: Array<{ id: IMaterial['id']; name: string }>) => {
    return renameMaterial(names);
  });
  const onBatchUpdateTags = usePersistCallback((ids: IMaterial['id'][], tagIds: string[]) => {
    return updateTagOfMaterial(ids, tagIds, []);
  });
  // 批量删除物料
  const onBatchDelete = usePersistCallback((ids: IMaterial['id'][]) => {
    return BatchDeleteMaterial(ids);
  });

  const onBatchRestore = usePersistCallback((ids: IMaterial['id'][]) => {
    return restoreUserMaterial(ids);
  });
  return { onBatchUpdate, onBatchUpdateTags, onBatchDelete, onBatchRestore };
}
