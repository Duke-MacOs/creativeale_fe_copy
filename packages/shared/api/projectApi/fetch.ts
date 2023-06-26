import { http } from '../axios';
import { FetchProjectList, IFetchPlayableList, IVersion, PaginationList } from './types';

class ProjectFetchService {
  //获取版本列表
  async version(id: number): Promise<PaginationList<IVersion>> {
    const {
      data: {
        data: { list, ...pagination },
      },
    } = await http.get(`project/subList?parentId=${id}`);
    return { list, pagination };
  }

  // 获取用户素材
  Playables: IFetchPlayableList = async params => {
    const {
      data: {
        data: { list, ...pagination },
      },
    } = await http.get('disclosure/effectData/playables', { params });

    return { list, pagination };
  };

  recycle: FetchProjectList = async (params, isRandom) => {
    if (isRandom) {
      const random = Math.floor(Math.random() * 10000);
      Object.assign(params, { random });
    }
    const { data } = await http.get('project/recycleBin', { params });
    const {
      data: { list, isVersion, ...pagination },
    } = data;
    return { list, pagination, isVersion };
  };
}

export const projectFetchService = new ProjectFetchService();
