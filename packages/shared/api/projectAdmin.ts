import { IPagination } from '@/types/apis';
import { IProject, IFetchProjectList } from '@/types/project';
import { http } from './axios';

// 获取项目列表
export const fetchProjectList: IFetchProjectList = async (params, isRandom?: boolean | undefined) => {
  if (isRandom) {
    const random = Math.floor(Math.random() * 10000);
    Object.assign(params, { random });
  }
  const { data } = await http.get('admin/project/list', { params });
  const {
    data: { list: projectList, isVersion, ...pagination },
  } = data;
  return { projectList, pagination: pagination as IPagination, isVersion };
};

//复制项目
export const copyProjectAdmin = async (id: IProject['id']): Promise<any> => {
  const { data } = await http.get(`project/admin_copy?id=${id}`);
  return data.data;
};

//获取公共项目列表
export const fetchPublicProjectList: IFetchProjectList = async (params, isRandom?: boolean | undefined) => {
  if (isRandom) {
    const random = Math.floor(Math.random() * 10000);
    Object.assign(params, { random });
  }
  const { data } = await http.get('admin/publicProject/list', { params });
  const {
    data: { list: projectList, isVersion, ...pagination },
  } = data;
  return { projectList, pagination: pagination as IPagination, isVersion };
};

// 公共项目审核
export const projectReview = async (id: number, operation: number) => {
  const { data } = await http.post('/admin/publicProject/review', { id, operation });
  return data;
};
