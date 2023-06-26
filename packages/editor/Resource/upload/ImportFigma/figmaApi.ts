import Axios from 'axios';
import { IFigmaNode, IFigmaParams } from './types';
const BASE_URL = 'https://api.figma.com';

// error情况
export async function getFigmaProject({
  fileKey,
  accessToken,
}: IFigmaParams): Promise<{ document: IFigmaNode; [key: string]: any }> {
  try {
    const { data } = await Axios.get(`${BASE_URL}/v1/files/${fileKey}`, {
      headers: { 'X-Figma-Token': accessToken },
    });
    return data;
  } catch (err) {
    const { status } = err.response;
    if (status === 404) {
      throw new Error('找不到该项目信息');
    }
    if (status === 403) {
      throw new Error('非法用户Token');
    }
    throw err;
  }
}

export async function renderFigmaNode({
  fileKey,
  ids,
  accessToken,
}: IFigmaParams & { ids: string }): Promise<{ images: Record<string, string> }> {
  const { data } = await Axios.get(`${BASE_URL}/v1/images/${fileKey}?`, {
    params: { ids },
    timeout: 15000,
    headers: { 'X-Figma-Token': accessToken },
  });
  return data;
}
