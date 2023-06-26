import { http } from '../axios';
import { ITag } from './types';

class TemplateService {
  // 模板管理列表

  //用户删除自己的模板
  async templateDelete(id: number): Promise<any> {
    const { data } = await http.get(`publicTemplate/userDeleteTemplate?id=${id}`);
    return data;
  }

  //获取模板标签列表
  async fetchCategoryTag(params: { category: number; pageSize: number; origin: number; parentName: string }) {
    const { data } = await http.get('tag/list', { params });
    return data.data.tags as Array<ITag>;
  }
  // FIXME: mode应该定义成具体的字面量类型
  async useTemplate(id: number, mode: number) {
    const { data } = await http.post('publicTemplate/use', { id, mode });
    return data.data;
  }
  async previewTemplate(id: number, maxAge = 1800) {
    const { data: res } = await http.get(`publicTemplate/preview?id=${id}&maxAge=${maxAge}`);
    return res.data;
  }
}

export const templateService = new TemplateService();
