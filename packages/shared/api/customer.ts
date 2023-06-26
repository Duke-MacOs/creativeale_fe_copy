import { http } from './axios';

// 获取某个客户的项目列表
export const fetchProjectList = async (params: {
  page: number;
  pageSize: number;
  customerId: number;
  startDate: string;
  endDate: string;
  order?: string;
  orderType?: number;
}) => {
  const { data } = await http.get('disclosure/effectData/projects', { params });
  return data.data;
};

// 获取某个项目的投放素材列表
export const fetchMaterialList = async (projectId: number, params: { startDate: string; endDate: string }) => {
  const { data } = await http.get(`disclosure/effectData/projects/${projectId}/playables`, { params });
  return data.data;
};
