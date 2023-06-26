import { validateVersion3_8, validateVersion4_0 } from './lib';
import JSZip from 'jszip';

export async function validateSpineVersion(file: File): Promise<number | Error> {
  const res = await JSZip.loadAsync(file);
  const entries = Object.entries(res.files).filter(
    item => !item[0].startsWith('__MACOSX/') && !item[0].endsWith('.DS_Store')
  );
  const mainFile = entries.find(item => item[0].endsWith('.json') || item[0].endsWith('.skel'));

  if (!mainFile) {
    throw new Error('资源中缺少主入口文件，请检查后重新上传');
  }

  if (mainFile[0].endsWith('.json')) {
    const json = JSON.parse(await mainFile[1].async('text'));
    if (json.skeleton.spine.startsWith('3.7')) return 3.7;
    if (json.skeleton.spine.startsWith('3.8')) return 3.8;
    if (json.skeleton.spine.startsWith('4.0')) return 4;
  } else {
    const blob = await mainFile[1].async('blob');
    const binary = await fileToBinary(blob);
    const supportList: Record<string, (binary: Uint8Array) => boolean> = {
      '3.8': validateVersion3_8,
      '4': validateVersion4_0,
    };

    for (const version in supportList) {
      try {
        if (supportList[version](binary)) {
          return Number(version);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  throw new Error('该Spine版本暂不支持');
}

export function fileToBinary(file: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = evt => {
      const result = evt.target?.result;
      if (result) {
        resolve(new Uint8Array(result as ArrayBuffer));
      }
    };
    reader.onerror = err => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
