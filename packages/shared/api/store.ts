import { IMaterialType } from '@shared/types/library';
import { IStoreCategory, IStoreMaterial } from '@shared/types/store';
import { getFormData } from '.';
import { http } from './axios';

const parseExtra = (s: string) => {
  try {
    return JSON.parse(s);
  } catch (error) {}
  return {};
};

// 创建资源商城分类
export const createCategory = async (type: IMaterialType['cid'], name: string) => {
  await http.post(`store/category/create`, { type, name });
};

// 删除资源商城分类
export const deleteCategory = async (id: string) => {
  await http.post(`store/category/delete`, { id });
};

// 修改商城资源分类
export const updateCategory = async (id: string, params: Record<string, any>) => {
  await http.post(`store/category/update`, { id, ...params });
};

// 获取商城分类列表
export const getCategory = async (type: IMaterialType['cid']): Promise<IStoreCategory[]> => {
  const { data } = await http.get(`store/category/list?type=${type}`);
  const { data: categories } = data;
  return categories;
};

// 发布商品
export const applyMaterial = async (params: Record<string, any>) => {
  await http.post(`store/material/apply`, params);
};

// 获取单个商品
export const getMaterialById = async (id: string) => {
  const {
    data: { data },
  } = await http.get(`store/material/id?id=${id}`);
  return {
    ...data,
    extra: data?.extra ? parseExtra(data.extra) : {},
  };
};

// 获取商品列表
export const getMaterialList = async (params: {
  keyword: string;
  type: number;
  status: number;
  category: string;
  page: number;
  pageSize: number;
}): Promise<{
  data: IStoreMaterial[];
  total: number;
}> => {
  const {
    data: { data },
  } = await http.post(`store/material/list`, params);
  return {
    data: data.data.map(i => ({
      ...i,
      extra: i.extra ? parseExtra(i.extra) : {},
    })),
    total: data.total,
  };
};

// 更新商品
export const updateMaterialById = async (id: string, values: Record<string, any>) => {
  if (values.type?.cid) values.type = values.type.cid;
  return await http.post(`store/material/update`, { id, values });
};

// 删除商品
export const deleteMaterials = async (ids: string[]) => {
  return await http.post(`store/material/delete`, { ids });
};

// 自增商品查看次数
export const viewCountMaterial = async (id: string) => {
  return await http.post(`store/material/viewCount`, { id });
};

// 自增商品被使用次数
export const usedCountMaterial = async (id: string) => {
  return await http.post(`store/material/usedCount`, { id });
};

// AI 通过关键词生成图片
export const createAIImageByText = async (text: string) => {
  return await http.post(`faas/text2image`, { text });
};

// AI 通过图片生成图片
export const createAIImageByImage = async (file: File, text: string) => {
  const formData = getFormData({ image: file, text });
  return await http.post(`faas/image2image`, formData);
};
