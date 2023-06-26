import { createResource } from '@shared/api';
import JSZip from 'jszip';

export const useUploadVRAsset = () => {
  /**
   * 上传幸福里资源文件
   * @param file 幸福里资源文件
   */
  const uploadXingfuliAsset = async (file: File): Promise<string> => {
    if (file.name.endsWith('.zip')) {
      const zip = new JSZip();
      await zip.loadAsync(file).then(async data => {
        for (const [key, value] of Object.entries(data.files)) {
          if (key.startsWith('__MACOSX')) continue;
          if (key.endsWith('.DS_Store')) continue;
          if (value.dir) continue;
          if (/.*source_interactioin.json/.exec(key)) {
            const content = await value.async('blob');
            file = new File([content], 'xingfuli.json', { type: 'application/json' }) as any;
          }
        }
      });
      if (file.name.endsWith('.zip')) throw new Error('zip 包缺少 source_interactioin.json 文件');
    }
    const { url } = await createResource({
      file,
      type: 0,
      name: file.name,
    });
    return url;
  };

  return {
    uploadXingfuliAsset,
  };
};
