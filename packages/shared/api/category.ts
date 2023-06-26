import { IMaterialType, IUserCategory } from '@/types/library';
// import { IPagination, IUploadFileRes } from '@/types/apis';
import { http } from './axios';

const prefix = 'category';

// 获取素材分类列表
export const fetchAllMaterialType = async (): Promise<IMaterialType[]> => {
  const { data } = await http.get(`${prefix}/all`);
  const { data: categories } = data;
  return categories;
};

// 个人素材分类列表
export const fetchUserCategories = async (): Promise<{
  categories: IUserCategory[];
  subTotal: Record<string, number>;
  total: number;
}> => {
  const { data } = await http.get(`user/category/list`);
  return data.data;
};
// 新建/编辑个人分类
export const postUserCategory = async ({ id, name }: { id?: string; name: string }) => {
  const { data } = await http.post(`user/category/${id ? 'update' : 'create'}`, { id, name });
  return data.data;
};
// 删除个人分类
export const deleteUserCategory = async (id: string, deleteAsEmpty: boolean) => {
  const { data } = await http.post('user/category/delete', { id, empty: deleteAsEmpty });
  return data.data;
};
