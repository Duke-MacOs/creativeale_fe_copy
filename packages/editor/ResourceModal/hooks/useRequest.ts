import { fetchUserMaterialList } from '@shared/api/library';
import { useCallback, useState } from 'react';
import { IRequestState, ResourceTypeInModal, IData, SidebarType } from '../type';
import { useUserInfo } from '@shared/userInfo';
import { fetchUserCategories } from '@shared/api/category';
import { getMaterialList, viewCountMaterial, usedCountMaterial } from '@shared/api/store';
import { StoreMaterialStatus } from '@shared/types/store';
import { debounce, omit, pick, throttle } from 'lodash';

export interface IRequestProps {
  keyword: string;
  sidebarType: SidebarType;
  type: ResourceTypeInModal;
  page: number;
  pageSize: number;
  categoryId: string;
}

export const Effects = [
  ResourceTypeInModal.Particle2D,
  ResourceTypeInModal.ImageSequence,
  ResourceTypeInModal.Live2d,
  ResourceTypeInModal.Lottie,
  ResourceTypeInModal.DragonBones,
  ResourceTypeInModal.Spine,
];

export default () => {
  const [state, setState] = useState<IRequestState>({
    loading: undefined,
    searchKey: '',
  });
  const {
    userInfo: { teamId },
  } = useUserInfo();

  const getTeamCategories = async () => {
    const { categories } = await fetchUserCategories();
    return categories.map(i => ({ id: i.id, name: i.name }));
  };

  const getStoreMaterials = async (params: IRequestProps) => {
    const data = await getMaterialList({
      ...pick(params, ['keyword', 'type', 'page', 'pageSize']),
      category: params.categoryId,
      status: StoreMaterialStatus.shelve,
    });
    return {
      data: data.data.map(i => ({
        ...i,
        id: `${i.id}`,
        name: i.name,
        url: i.url,
        extra: i.extra,
      })),
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total: data.total,
      },
    };
  };

  const getTeamMaterials = async (params: IRequestProps) => {
    const data = await fetchUserMaterialList({
      teamId,
      ...params,
      types: params.type === ResourceTypeInModal.Effect ? Effects.join(',') : params.type,
    } as any);
    return {
      data: data.materialList.map(i => ({
        ...i,
        id: `${i.id}`,
        name: i.name,
        url: i.url,
        extra: i.extra,
        cover: params.type === ResourceTypeInModal.Image ? i.previewUrl : i.cover, // 不知道为什么图片没有存 cover 字段
      })),
      pagination: data.pagination,
    };
  };

  const getProjectMaterials = async (projectId: number) => {
    const data = await fetchUserMaterialList({ projectId, status: '2', page: 1, pageSize: 999 } as any);
    return {
      data: data.materialList.map(i => ({
        ...i,
        id: `${i.id}`,
      })),
    };
  };

  // 自增商品查看详情次数
  const addViewCountMaterial = async (id: string) => {
    await viewCountMaterial(id);
  };

  // 自增商品被使用次数
  const addUsedCountMaterial = async (id: string) => {
    await usedCountMaterial(id);
  };

  const request = async (
    params: IRequestProps
  ): Promise<{
    data: IData[];
    pagination: { page: number; pageSize: number; total: number };
  }> => {
    console.log('params:', params);
    setState(prev => ({
      ...prev,
      loading: params.type,
    }));
    console.log('params:', params);
    try {
      return params.sidebarType === SidebarType.Store
        ? await getStoreMaterials(params)
        : await getTeamMaterials(params);
    } catch (error) {
      throw error;
    } finally {
      setState(prev => ({
        ...prev,
        loading: undefined,
      }));
    }
  };

  return {
    state,
    request,
    addViewCountMaterial,
    addUsedCountMaterial,
    getProjectMaterials,
    getTeamCategories,
  };
};
