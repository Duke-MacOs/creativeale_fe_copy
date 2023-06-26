import JSZip from 'jszip';
import getFileSuffix from '../fileSuffix';
import { parsePlist } from './plistParser';
import { validateFilenameInZip } from './zipFile';

export default async function convertParticle(sourceFile: File) {
  const suffix = getFileSuffix(sourceFile.name);

  const zip = new JSZip();
  if (suffix === 'plist') {
    const filename = sourceFile.name;
    const jsonData = await parsePlist(sourceFile);
    zip.file(filename.slice(0, -5) + 'particle', JSON.stringify(jsonData));
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result as string);
      };
      reader.onerror = function (err) {
        reject(err);
      };
      reader.readAsText(sourceFile);
    })
      .then(content => {
        zip.file(filename, content as string);
        return zip.generateAsync({ type: 'blob' });
      })
      .then(blob => {
        return new File([blob], sourceFile.name, {
          type: 'application/zip',
        });
      });
  }
  if (suffix === 'zip') {
    const res = await JSZip.loadAsync(sourceFile);
    const entries = Object.entries(res.files).filter(
      item => !item[0].startsWith('__MACOSX/') && !item[0].endsWith('.DS_Store')
    );
    for (const [filename, file] of entries) {
      if (file.dir || filename.split('/').length > 2) {
        continue;
      }
      validateFilenameInZip(filename);
      const content = await res.file(filename)?.async('blob');
      if (content) {
        if (getFileSuffix(filename) === 'plist') {
          const jsonData = await parsePlist(content);
          zip.file(filename.slice(0, -5) + 'particle', JSON.stringify(jsonData));
        }
        zip.file(filename, content);
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
