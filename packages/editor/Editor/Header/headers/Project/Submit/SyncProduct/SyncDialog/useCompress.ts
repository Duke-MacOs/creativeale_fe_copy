import { useEffect, useMemo, useRef, useState } from 'react';
import { useSettings } from '@editor/aStore';
import { useEventBus } from '@byted/hooks';
import { message, Modal } from 'antd';
import { http } from '@shared/api';
import { zip } from 'lodash';

export type Database = Record<string, Result>;

export type Result = {
  key: string;
  imageSize: number;
  audioSize: number;
  videoSize: number;
  otherSize: number;
  afterSize: number;
  totalSize: number;
  previewUrl: string;
  playableError?: string;
  url: string;
  firstSceneSize?: number;
  duration?: number;
  playableUrl?: string;
  lynxUrl?: string;
  feedPlayablePreviewUrl?: string;
  id?: number;
};

export const VALUES = {
  imageQuality: 10,
  videoQuality: 10,
  audioQuality: 10,
};

export default (
  id: number,
  current: boolean,
  exportOnly: boolean,
  initValues: Partial<typeof VALUES> = {
    imageQuality: 8,
    videoQuality: 8,
    audioQuality: 8,
  }
) => {
  const resultRef = useRef<Result | undefined>(undefined);
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const hyruleJson = useSettings('hyruleJson');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  const [exportSettings, setExportSettings] = useState({
    region: 'mainland',
    exportAs: typeOfPlay === 3 ? 'feedContent' : 'landingPage',
    exportAsLynx: isVRVideo || location.search.includes('exportAsLynx'),
    hyruleJson: typeOfPlay === 3 ? hyruleJson : undefined,
    removeSDK: false,
  });
  const [values, setValues] = useState(() => (isVRVideo ? { ...VALUES } : { ...VALUES, ...initValues }));
  const [database, setDatabase] = useState<Database>({});
  const [compressing, setCompressing] = useState(true);
  useEventBus('ExportSettings', settings => setExportSettings(s => ({ ...s, ...settings })));
  const { trigger: abortCompressing } = useEventBus('abortCompressing');

  useEffect(() => {
    if (!current) {
      return;
    }
    let outdated = false;
    setCompressing(true);

    onCompress(values)
      .then(result => {
        if (outdated) {
          return;
        }
        // setDatabase(putData(VALUES, data));
        setDatabase(putData(values, result));
        setCompressing(false);
      })
      .catch(error => {
        if (outdated) {
          return;
        }
        let timeout = 3;
        const modal = Modal.confirm({
          title: '压缩失败，请稍后重试',
          content: error.message || '未知失败原因，请稍后重试',
          okButtonProps: { disabled: true },
          okText: `重试(3s)`,
          onOk() {
            setExportSettings(v => ({ ...v }));
          },
          cancelText: '取消',
          onCancel() {
            abortCompressing();
          },
        });
        const id = setInterval(() => {
          timeout--;
          modal.update({ okText: timeout ? `重试(${timeout}s)` : '重试', okButtonProps: { disabled: timeout > 0 } });
          if (timeout <= 0) {
            clearInterval(id);
          }
        }, 1000);
      });
    return () => {
      outdated = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, current, exportSettings]);
  const onCompress = async (values: any) => {
    const startTime = Date.now();
    const result = await syncToAdCompress(id, values, exportSettings);
    const endTime = Date.now();
    return { ...result, duration: endTime - startTime };
  };
  return {
    oneValues: values,
    exportSettings,
    compressing,
    ...useMemo(() => {
      const result = database?.[`${values.imageQuality}.${values.videoQuality}.${values.audioQuality}`];
      if (result) {
        resultRef.current = result;
        return { result, outdated: false, guessSize: result.afterSize };
      }
      return { result: resultRef.current, outdated: true, guessSize: guessSize(database, values) };
    }, [values, database]),
    setValues,
    onCompress: async () => {
      try {
        setCompressing(true);
        const result = await onCompress(values);
        setDatabase(putData(values, result));
        return result;
      } catch (error) {
        message.error(error.message || '压缩失败，请稍后重试');
        throw error;
      } finally {
        setCompressing(false);
      }
    },
  };
};

const putData =
  ({ imageQuality, videoQuality, audioQuality }: typeof VALUES, result: Result) =>
  (database: Database): Database => {
    console.info('Zip下载地址：', result.url);
    for (const [key, value] of Object.entries(result)) {
      if (key.toLowerCase().includes('preview') && typeof value === 'string' && value.includes('index.html')) {
        const url = new URL(value);
        url.searchParams.set('refer', 'scan');
        url.searchParams.set('is_playable', '1');
        (result as any)[key] = url.href;
      }
    }
    return {
      ...database,
      [`${imageQuality}.${videoQuality}.${audioQuality}`]: result,
    };
  };

const guessSize = (database: Database, { imageQuality, videoQuality, audioQuality }: typeof VALUES): number => {
  const qualities = [imageQuality, videoQuality, audioQuality];
  let greater: [typeof qualities, Partial<Result>] = [[10, 10, 10], {}];
  let smaller: [typeof qualities, Partial<Result>] = [[0, 0, 0], {}];
  for (const [keys, result] of Object.entries(database)) {
    const keyList = keys.split('.').map(Number);
    if (keyList.every((quality, index) => quality >= qualities[index])) {
      if (!greater[1].afterSize || result.afterSize < greater[1].afterSize) {
        greater = [keyList, result];
      }
    }
    if (keyList.every((quality, index) => quality <= qualities[index])) {
      if (!smaller[1].afterSize || result.afterSize > smaller[1].afterSize) {
        smaller = [keyList, result];
      }
    }
  }
  let left = 0;
  let right = 0;
  for (const [i, [min = 0, max = 0]] of zip(smaller[0], greater[0]).entries()) {
    if (min === max) {
      continue;
    }
    const key = (['imageSize', 'videoSize', 'audioSize'] as const)[i];
    const value = linear(smaller[1][key] || 0, greater[1][key] || 0, qualities[i], min, max);
    left += value - (smaller[1][key] || 0);
    right += (greater[1][key] || 0) - value;
  }
  return Math.floor(linear(smaller[1].afterSize || 0, greater[1].afterSize || 0, left, 0, left + right));
};

const linear = (min: number, max: number, index: number, iMin: number, iMax: number) => {
  return min + ((max - min) * (index - iMin)) / (iMax - iMin || 1);
};

const syncToAdCompress = async (id: number, values: typeof VALUES, settings: any) => {
  const {
    data: { data: task },
  } = await http.post('project/syncToAdCompress', { id, extra: settings, ...values });
  while (true) {
    const {
      data: { data },
    } = await new Promise<any>((resolve, reject) => {
      setTimeout(async () => {
        try {
          resolve(await http.get(`project/syncToAdCompressResult?id=${id}&taskId=${task.id}`));
        } catch (e) {
          reject(e);
        }
      }, 3000);
    });
    if (data.status === 1) {
      return data as Result;
    } else if (data.status === 2) {
      throw new Error('压缩失败');
    }
  }
};
