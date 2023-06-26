import { IProjectFromServer } from '@main/pages/Projects/ProjectList/api';
import { http } from '../axios';
import { CancelableUrlQuery, IVersion } from './types';

class ProjectActionService {
  // 预览项目
  async previewProject(projectId: number, data?: string, maxAge = 24 * 60 * 60) {
    if (data) {
      const url = fetch(`https://rubeex.oceanengine.com/api/projects/preview/${projectId}?maxAge=${maxAge}`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          config: data,
        }),
      })
        .then(res => res.json())
        .then(res => {
          return res.url;
        });
      return url;
    } else {
      const { data: res } = await http.get(`project/preview?id=${projectId}&maxAge=${maxAge}`);
      return res.data;
    }
  }

  shareProject: CancelableUrlQuery = async (id, signal) => {
    const { data } = await http.get('project/collaborateInvite', { params: { id }, signal });
    return data.data.url;
  };

  //转换内网项目到外网
  transToMagicplay: CancelableUrlQuery = async (id, signal) => {
    const { data } = await http.post(`project/transferPlatform`, { id, operation: 'clabToMagic' }, { signal });
    return data.data.url;
  };

  //转换外网项目到内网
  transToClab: CancelableUrlQuery = async (id, signal) => {
    const { data } = await http.post(`project/transferPlatform`, { id, operation: 'magicToClab' }, { signal });
    return data.data.url;
  };
  //获取临时托管链接
  proTempLink: CancelableUrlQuery = async (id, signal) => {
    const { data } = await http.get(`project/hosting`, { params: { id }, signal });
    return data.data.previewUrl;
  };

  // 取消分享项目编辑权限
  async cancelShareProject(id: number): Promise<any> {
    const { data } = await http.get('project/collaborateRevoke', { params: { id } });
    return data.data;
  }

  async deleteProject(id: number): Promise<any> {
    const { data } = await http.get(`project/delete?id=${id}`);
    return data;
  }

  async projectTransition(id: number, status: number): Promise<any> {
    const { data } = await http.post('project/transition', { id, status });
    return data.data;
  }

  async projectSaveAs(id: number, name: string): Promise<IVersion> {
    const { data } = await http.post('project/saveAs', { id, name });
    return data.data;
  }

  async transToRubeex(id: number) {
    const { data } = await http.post(`project/toRubeex`, { id });
    return data;
  }

  async updateProject(
    params: Pick<IProjectFromServer, 'id'> & Partial<IProjectFromServer> & { projectContent: string }
  ): Promise<number> {
    const { data } = await http.post(`project/update`, params);
    return data.data;
  }

  // 用户删除、下架、取消发布、重新送审、送审个人案例
  async reviewMyCase(id: number, operation: number) {
    const { data } = await http.post(`publicProject/reviewCase`, { id, operation });
    return data;
  }

  async deletePlayable(id: number) {
    const { data } = await http.post(`disclosure/effectData/delete`, { id });
    return data;
  }

  async handoverPlayable(id: number) {
    const { data } = await http.get(`disclosure/effectData/handoverInvite?id=${id}`);
    return data;
  }
}

export const projectActionService = new ProjectActionService();
