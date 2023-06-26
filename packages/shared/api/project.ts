import { IPagination } from '@/types/apis';
import {
  IProject,
  IScene,
  IFetchProjectList,
  IPostProject,
  IUpdateProject,
  ICreateScene,
  IUpdateScene,
} from '@/types/project';
import { AxiosRequestConfig } from 'axios';
import { http } from './axios';

// 获取项目列表
export const fetchProjectList: IFetchProjectList = async (params, isRandom?: boolean | undefined) => {
  if (isRandom) {
    const random = Math.floor(Math.random() * 10000);
    Object.assign(params, { random });
  }
  const { data } = await http.get('project/list', { params });
  const {
    data: { list: projectList, isVersion, ...pagination },
  } = data;
  return { projectList, pagination: pagination as IPagination, isVersion };
};

// 预览项目
export const previewProject = async (projectId: number) => {
  const { data: res } = await http.get(`project/preview?id=${projectId}&maxAge=${24 * 60 * 60}`);
  return res.data;
};
// 创建项目
export const postProject: IPostProject = async data => {
  const { data: res } = await http.post('project/create', data);
  return res.data;
};

// 更新项目
export const updateProject: IUpdateProject = async params => {
  const { data } = await http.post(`project/update`, params);
  return data.data;
};

// 删除项目
export const deleteProject = async (id: IProject['id']): Promise<any> => {
  const { data } = await http.get(`project/delete?id=${id}`);
  return data;
};

//项目另存为
export const projectSaveAs = async (id: IProject['id'], name: string): Promise<any> => {
  const { data } = await http.post('project/saveAs', { id, name });
  return data.data;
};
//获取版本列表
export const fetchVersionList = async (id: number) => {
  const { data } = await http.get(`project/subList?parentId=${id}`);
  return data.data;
};

//解析导出
export const analysisProject = async (id: IProject['id'], name: IProject['name']): Promise<any> => {
  const { data } = await http.get('project/ex', { params: { id }, responseType: 'blob' });
  const file = new File([data.data], name, { type: 'application/zip' });
  return file;
};

// 获取公共项目列表
export const fetchPublicProjectList: IFetchProjectList = async (params, isRandom?: boolean | undefined) => {
  if (isRandom) {
    const random = Math.floor(Math.random() * 10000);
    Object.assign(params, { random });
  }
  const { data } = await http.get('publicProject/list', { params });
  const {
    data: { list: projectList, isVersion, ...pagination },
  } = data;
  return { projectList, pagination: pagination as IPagination, isVersion };
};

// 获取单个项目数据
export const fetchProject = async (id: IProject['id'], config?: AxiosRequestConfig): Promise<IProject> => {
  const { data } = await http.get(`project/detail?id=${id}`, config);
  return data.data;
};
// 获取项目名称
export const fetchProjectInfo = async (ids: IProject['id'][], config?: AxiosRequestConfig): Promise<IProject[]> => {
  const { data } = await http.get(`project/baseData?ids=${ids}`, config);
  return data.data;
};
// 解析rubeexId为projectId
export const decodeProjectId = async (
  id: IProject['id'],
  type: number,
  config?: AxiosRequestConfig
): Promise<number> => {
  const { data } = await http.get(`project/transform?id=${id}&type=${type}`, config);
  return data.data.id;
};

// 发布项目
export const publishProject = async (
  params: Pick<IProject, 'id' | 'name' | 'cover' | 'tagIds'> | { isAuthControl: number }
): Promise<{
  versionId: number;
  templateId: number;
  message: string;
}> => {
  const { data } = await http.post('project/publish', params);
  return data;
};

// 导出项目
export const exportProject = async (
  id: IProject['id'],
  options: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<any> => {
  const {
    data: {
      data: { id: taskId },
    },
  } = await http.post(`project/export`, { id, ...options }, config);
  while (true) {
    const {
      data: { data },
    } = await new Promise<any>((resolve, reject) => {
      setTimeout(async () => {
        try {
          resolve(await http.get(`project/export_result?id=${id}&taskId=${taskId}`, config));
        } catch (e) {
          reject(e);
        }
      }, 3000);
    });
    if (data.status === 1) {
      return data;
    } else if (data.status === 2) {
      throw new Error(data.message);
    }
  }
};

// 批量创建场景
export const createScenes = async (
  projectId: number,
  scenes: Pick<IScene, 'name' | 'sceneContent' | 'orderId'>[]
): Promise<{ id: number; orderId: number }[]> => {
  if (!scenes.length) {
    return [];
  }
  const { data } = await http.post('scene/batch_create', { projectId, scenes });
  return data.data;
};
// 创建场景
export const createScene: ICreateScene = async params => {
  const { data } = await http.post('scene/create', params);
  return data.data;
};

// 删除场景
export const deleteScene = async (id: IScene['id']): Promise<Pick<IScene, 'id'>> => {
  const { data } = await http.get(`scene/delete?id=${id}`);
  return data.data;
};

// 更新场景
export const updateScene: IUpdateScene = async (params, config?) => {
  const { data } = await http.post(`scene/update`, params, config);
  return data.data;
};

// 获取单个场景数据
export const getSceneDetail = async (id: IScene['id'], config?: AxiosRequestConfig): Promise<IScene> => {
  const { data } = await http.get(`scene/detail?id=${id}`, config);
  return data.data;
};

// 获取项目回收站列表
export const fetchRecycleList: IFetchProjectList = async (params, isRandom?: boolean | undefined) => {
  if (isRandom) {
    const random = Math.floor(Math.random() * 10000);
    Object.assign(params, { random });
  }
  const { data } = await http.get('project/recycleBin', { params });
  const {
    data: { list: projectList, isVersion, ...pagination },
  } = data;
  return { projectList, pagination: pagination as IPagination, isVersion };
};
// 从回收站还原项目
export const recoverProject = async (id: number): Promise<any> => {
  const { data } = await http.post(`project/recycleBin/${id}/recover`, { params: { id } });
  return data;
};

//转为外网项目
export const transToMagicplay = async (id: IProject['id']) => {
  const { data } = await http.post(`project/transferToMagic`, { id });
  return data.data;
};
//获取临时托管链接
export const proTempLink = async (id: IProject['id']) => {
  const { data } = await http.get(`project/hosting?id=${id}`);
  return data.data;
};

//赠送项目
export const givePro = async (id: IProject['id'], targets: { userId: string; advId: string }[]) => {
  const { data } = await http.post(`project/giveTo`, { id, targets });
  return data;
};
// 转为rubeex项目
export const transToRubeex = async (id: IProject['id']) => {
  const { data } = await http.post(`project/toRubeex`, { id });
  return data;
};

// 获取项目制作时长数据
export const fetchProjectEditTime = async (params: { projectId: IProject['id'] }) => {
  const { data } = await http.get('disclosure/projectDuration', { params });
  return data.data.list;
};
