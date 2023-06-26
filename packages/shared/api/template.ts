/**
 * 公共模板库对应接口
 */

import { http } from './axios';
import { IPagination, IPaginationReq } from '../types/apis';
import { IGlobalSettings } from '@editor/aStore';

//获取公共模板库列表
export const fetchTemplates = async (params: IPaginationReq) => {
  const { data } = await http.get('publicTemplate', { params });
  const {
    data: { list = [], tagList = [], ...pagination },
  } = data;
  return { list, tagList, pagination: pagination as IPagination };
};

//获取模板标签列表
export const fetchCategoryTag = async (params: {
  category: number;
  pageSize: number;
  origin: number;
  parentName: string;
}) => {
  const { data } = await http.get('tag/list', { params });
  return data.data;
};
// 使用模板、模板换肤
export const useTemplate = async (
  id: number,
  editMode: number,
  options?: { name?: string; typeOfPlay?: IGlobalSettings['typeOfPlay']; category?: IGlobalSettings['category'] }
) => {
  const { data } = await http.post('project/saveAs', { id, editMode, ...options });
  return data.data;
};

//删除模板
export const deleteTemplate = async (id: number) => {
  const { data } = await http.get(`template/delete?templateId=${id}`);
  return data.data;
};

//查看模板详情（预览）
export const previewTemplate = async (projectId: number, maxAge = 1800) => {
  const {
    data: { data },
  } = await http.get(`project/preview?id=${projectId}&maxAge=${maxAge}`);
  return data;
};
