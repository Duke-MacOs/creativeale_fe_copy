import { ITag } from '../types/tags';
import { http } from './axios';

const prefix = 'tag';

export async function fetchTags(): Promise<ITag[]> {
  const { data } = await http.get(`${prefix}/all`);
  return data.data;
}

export async function createTag(name: string): Promise<ITag> {
  const { data } = await http.post(`${prefix}/create`, { name });
  return data.data;
}
