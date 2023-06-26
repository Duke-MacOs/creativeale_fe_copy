import { useState, useEffect } from 'react';
import { usePersistCallback } from '@byted/hooks';
import { IUserMaterial } from '@/types/library';
import {
  fetchUserMaterialList,
  renameUserMaterial,
  deleteUserMaterial,
  restoreUserMaterial,
  cleanUserMaterial,
  removeUserMaterialFromCategory,
  updateCategoryOfUserMaterial,
} from '@shared/api/library';
import { ITeamResourceParams } from '..';
import { useUserInfo } from '@shared/userInfo';

export function useLibrary(params: ITeamResourceParams) {
  const [list, setList] = useState<IUserMaterial[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchList = usePersistCallback(() => {
    setLoading(true);
    return fetchUserMaterialList(params).then(({ materialList, pagination }) => {
      setList(materialList);
      setTotal(pagination.total);
      setLoading(false);
    });
  });

  useEffect(() => {
    fetchList();
  }, [params, fetchList]);

  return { loading, list, total, fetchList, setList };
}

export function useLibraryItem(id: IUserMaterial['id']) {
  const onDelete = usePersistCallback(() => {
    return deleteUserMaterial([id], useUserInfo.getState().userInfo.teamId);
  });
  const onRemoveFromCategory = usePersistCallback((categoryIds: string[]) => {
    return removeUserMaterialFromCategory([id], categoryIds);
  });
  const onRestore = usePersistCallback(() => {
    return restoreUserMaterial([id]);
  });
  const onClean = usePersistCallback(() => {
    return cleanUserMaterial([id]);
  });
  return { onDelete, onRemoveFromCategory, onRestore, onClean };
}

export function useBatchLibraryAction() {
  const {
    userInfo: { teamId },
  } = useUserInfo();
  const onBatchUpdate = usePersistCallback((names: Array<{ id: IUserMaterial['id']; name: string }>) => {
    return renameUserMaterial(names, teamId);
  });
  const onBatchUpdateCategories = usePersistCallback((ids: IUserMaterial['id'][], categoryIds: string[]) => {
    return updateCategoryOfUserMaterial(ids, categoryIds);
  });
  const onBatchDelete = usePersistCallback((ids: IUserMaterial['id'][]) => {
    return deleteUserMaterial(ids, useUserInfo.getState().userInfo.teamId);
  });
  const onBatchRestore = usePersistCallback((ids: IUserMaterial['id'][]) => {
    return restoreUserMaterial(ids);
  });
  const onBatchClean = usePersistCallback((ids: IUserMaterial['id'][]) => {
    return cleanUserMaterial(ids);
  });
  return { onBatchUpdate, onBatchUpdateCategories, onBatchDelete, onBatchRestore, onBatchClean };
}
