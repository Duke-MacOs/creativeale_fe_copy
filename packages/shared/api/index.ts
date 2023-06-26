import { http } from './axios';
import { IUploadFileRes } from '@/types/apis';
import { AxiosRequestConfig } from 'axios';
import { PlayerType } from '@shared/config';
import { IPlayer } from '@/types';
import { isNil } from 'lodash';

export * from './axios';
export * from './user';

export const getFormData = (options: Record<string, any> = {}) => {
  const formData = new FormData();
  for (const [key, val] of Object.entries(options)) {
    if (!isNil(val)) {
      formData.append(key, val);
    }
  }
  return formData;
};

export async function createResource({ $config, ...options }: Record<string, any> = {}): Promise<{
  id: number;
  mime: string;
  url: string;
  cover?: string;
}> {
  const formData = getFormData(options);
  console.log('formData:', formData);
  console.log('config:', $config);
  const { data } = await http.post('user/resource/create', formData, $config);
  return data.data;
}

export async function createResourceAutoCompress({ $config, ...options }: Record<string, any> = {}): Promise<{
  id: number;
  mime: string;
  url: string;
  cover?: string;
}> {
  const formData = getFormData(options);
  const { data } = await http.post('user/resource/createOptimize', formData, $config);
  return data.data;
}
export async function createFrameResource({ $config, ...options }: Record<string, any> = {}): Promise<{
  id: number;
  mime: string;
  url: string;
  cover?: string;
}> {
  const formData = getFormData(options);

  const { data } = await http.post('user/resource/createMultiSequence', formData, $config);
  return data.data;
}

export async function uploadFile(file: File | Blob, config?: AxiosRequestConfig): Promise<IUploadFileRes> {
  const formData = new FormData();
  formData.append('file', file);
  const {
    data: { data },
  } = await http.post('upload/file', formData, config);
  return data;
}

export async function uploadDataUri(dataUri: string, filename: string) {
  let file: any;
  try {
    file = await dataUriToFile(dataUri, filename);
  } catch {
    return { previewUrl: dataUri };
  }
  return uploadFile(file);
}

export const dataUriToFile = async (dataUri: string, filename = 'filename') => {
  const metadata = /^data:(.*?\/(.*?));/.exec(dataUri);
  if (!metadata || metadata.length !== 3) {
    throw new Error();
  }
  const [type, ext] = metadata.slice(1);
  const res = await fetch(dataUri);
  return new File([await res.blob()], `${filename}.${ext}`, { type });
};

export async function getRedirectUrl(): Promise<string> {
  const {
    data: { data },
  } = await http.get(`/oauth2/auth_url?redirect=${window.location.pathname}`);
  return data.url;
}

export async function login() {
  const localUrl = location.href;
  location.href =
    localUrl.indexOf('oceanengine.com') > -1
      ? `https://e.oceanengine.com/account/page/service/login?from=${encodeURIComponent(localUrl)}`
      : await getRedirectUrl();
}

export async function fetchPlayerList(playerType: PlayerType, config?: AxiosRequestConfig): Promise<IPlayer[]> {
  const {
    data: { data },
  } = await http.get(`editor/player/list?playerType=${playerType}`, config);
  return data;
}

export async function fetchDashboardToken(): Promise<string> {
  const {
    data: { data },
  } = await http.get(`admin/dashboard/getAeolusToken`);
  return data.token;
}
export async function getStsToken() {
  const {
    data: { data },
  } = await http.get(`upload/stsToken`);
  return data;
}
