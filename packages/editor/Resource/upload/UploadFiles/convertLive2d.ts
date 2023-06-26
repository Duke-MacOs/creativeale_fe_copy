import JSZip from 'jszip';
import getFileSuffix from '../fileSuffix';
import { validateFilenameInZip } from './zipFile';

export default async function convertLive2d(sourceFile: File) {
  const suffix = getFileSuffix(sourceFile.name);

  if (suffix === 'zip') {
    const zip = new JSZip();
    const res = await JSZip.loadAsync(sourceFile);
    const entries = Object.entries(res.files).filter(
      item => !item[0].startsWith('__MACOSX/') && !item[0].endsWith('.DS_Store')
    );
    const mainFile = entries.filter(item => item[0].endsWith('.model3.json'));

    if (mainFile.length === 0) {
      throw new Error('缺少Live2D主入口文件，请修正后重新上传');
    }
    if (mainFile.length > 1) {
      throw new Error('存在多个Live2D主入口文件，请修正后重新上传');
    }

    for (const [filename, file] of entries) {
      if (file.dir) continue;

      validateFilenameInZip(filename);
      const content = await res.file(filename)?.async('blob');
      if (content) {
        zip.file(filename, content);
      }
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
