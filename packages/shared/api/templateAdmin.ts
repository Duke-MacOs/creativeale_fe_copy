import { http } from './axios';

//模板审核
export const templateReview = async (id: number, operation: number) => {
  const { data } = await http.post('publicTemplate/review', { id, operation });
  return data;
};
// 预览模板
export const previewTemplate = async (id: number, maxAge = 1800) => {
  const { data: res } = await http.get(`publicTemplate/preview?id=${id}&maxAge=${maxAge}`);
  return res.data;
};

// 更新公共模板信息
export const updatePublicTemplate = async (params: {
  id: number;
  name: string;
  cover: string;
  tagIds: string[];
  isAuthControl: number;
}) => {
  const { data } = await http.post('publicTemplate/update', params);
  return data;
};

//删除模板
export const deleteTemplate = async (id: number) => {
  const { data } = await http.get(`template/delete?templateId=${id}`);
  return data.data;
};

//获取版本列表
export const fetchVersionList = async (id: number) => {
  const { data } = await http.get(`template/version_list?templateId=${id}`);
  return data.data;
};

//推送
export const pushTemplateVersion = async (params: Record<string, unknown>) => {
  const { data } = await http.post('template/push', params);
  return data.data;
};
export const pushTemplateSkinVersion = async (params: Record<string, unknown>) => {
  const { data } = await http.post('template/pushSkin', params);
  return data.data;
};
