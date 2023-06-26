import JSZip from 'jszip';
import getFileSuffix from '../fileSuffix';
import { validateFilenameInZip } from './zipFile';

export default async function convertDragonBones(sourceFile: File) {
  const suffix = getFileSuffix(sourceFile.name);

  if (suffix === 'zip') {
    const zip = new JSZip();
    const res = await JSZip.loadAsync(sourceFile);
    const entries = Object.entries(res.files).filter(
      item => !item[0].startsWith('__MACOSX/') && !item[0].endsWith('.DS_Store')
    );
    const mainFile = entries.find(item => item[0].endsWith('_ske.json'));
    const mainName = mainFile ? mainFile[0].slice(0, -9) : '';

    for (const [filename, file] of entries) {
      if (file.dir || filename.split('/').length > 2) {
        continue;
      }
      validateFilenameInZip(filename);
      const content = await res.file(filename)?.async('blob');
      const suffix = getFileSuffix(filename);
      if (content) {
        if (suffix === 'json') {
          if (filename.endsWith('_tex.json')) {
            zip.file(mainName + '_tex.json', content);
          } else {
            zip.file(filename, content);
          }
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
