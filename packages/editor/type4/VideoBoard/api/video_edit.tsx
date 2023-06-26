import { http } from '@shared/api';

export const videoEdit = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await http.post('/faas/video_edit', formData);
  return data.data;
};
