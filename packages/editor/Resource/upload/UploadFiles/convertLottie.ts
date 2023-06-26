import JSZip from 'jszip';
import getFileSuffix from '../fileSuffix';
import { validateFilenameInZip } from './zipFile';

export default async function convertLottie(sourceFile: File) {
  const suffix = getFileSuffix(sourceFile.name);

  if (suffix === 'zip') {
    const zip = new JSZip();
    const res = await JSZip.loadAsync(sourceFile);
    const entries = Object.entries(res.files).filter(
      item => !item[0].startsWith('__MACOSX/') && !item[0].endsWith('.DS_Store')
    );
    for (const [filename, file] of entries) {
      if (file.dir || getFileSuffix(filename) === 'html') {
        continue;
      }
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
