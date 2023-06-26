import JSZip from 'jszip';
import getFileSuffix from '../fileSuffix';
import { validateFilenameInZip } from './zipFile';

export default async function convertSpine(sourceFile: File) {
  const suffix = getFileSuffix(sourceFile.name);

  if (suffix === 'zip') {
    const zip = new JSZip();
    const res = await JSZip.loadAsync(sourceFile);
    const entries = Object.entries(res.files).filter(
      item => !item[0].startsWith('__MACOSX/') && !item[0].endsWith('.DS_Store')
    );
    let mainSuffixLength = 0;
    const mainFile = entries.find(item => {
      if (item[0].endsWith('.json') || item[0].endsWith('.skel')) {
        mainSuffixLength = 5;
        return true;
      } else if (item[0].endsWith('.json.txt') || item[0].endsWith('.skel.txt')) {
        mainSuffixLength = 9;
        return true;
      }
    });
    const mainName = mainFile ? mainFile[0].slice(0, -mainSuffixLength) : '';

    for (const [filename, file] of entries) {
      if (file.dir || filename.split('/').length > 2) {
        continue;
      }
      validateFilenameInZip(filename);
      const content = await res.file(filename)?.async('blob');
      const suffix = getFileSuffix(filename);
      if (content) {
        if (suffix === 'atlas' || (suffix === 'txt' && filename.slice(-9, -4) === 'atlas')) {
          zip.file(mainName + '.atlas', content);
        } else if (suffix === 'txt' && filename.slice(-8, -4) === 'json') {
          zip.file(mainName + '.json', content);
        } else if (suffix === 'txt' && filename.slice(-8, -4) === 'skel') {
          zip.file(mainName + '.skel', content);
        } else {
          zip.file(filename, content);
        }
      }
    }

    if (Object.keys(zip.files).length === 0) {
      throw new Error('zip包解析错误，暂不支持多层文件夹嵌套');
    }

    const zipPackage = await zip.generateAsync({ type: 'blob' }).then(blob => {
      return new File([blob], sourceFile.name, {
        type: 'application/zip',
      });
    });
    return zipPackage;
  }

  return sourceFile;
}
