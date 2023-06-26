import { amIHere, parseJson } from '@shared/utils';
import store from '@editor/aStore';

const key = 'editor.export.history';

export type ExportHistory = {
  // 导出url
  content?: string;
  // 预览二维码
  QRCodeUrl: string;
  // 压缩包
  zipUrl?: string;
  createTime: number;
};

const MAX_LENGTH = 6;

const getArray = (value: any) => {
  return Array.isArray(value) ? value : [];
};

export const getHistory = (): Array<ExportHistory> =>
  amIHere({ release: false })
    ? getArray(parseJson(localStorage.getItem(key) ?? '{}')[store.getState().project.id]).slice(0, MAX_LENGTH)
    : [];

export const addHistory = (data: Omit<ExportHistory, 'createTime'>) => {
  if (amIHere({ release: false })) {
    const storageValue = parseJson(localStorage.getItem(key) ?? '{}');
    const projectId = store.getState().project.id;
    storageValue[projectId] = [{ ...data, createTime: Date.now() }]
      .concat(getArray(storageValue[projectId]))
      .slice(0, MAX_LENGTH);
    localStorage.setItem(key, JSON.stringify(storageValue));
  }
};
