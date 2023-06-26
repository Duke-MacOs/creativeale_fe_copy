import JSZip from 'jszip';
import { message } from 'antd';
import { Category } from '@editor/aStore';
import getFileSuffix from '../fileSuffix';

export default async (fileList: File[], category: Category, suffix: string) => {
  const accepts = [];
  const notZip = [];
  for (const file of fileList) {
    const suffix = getFileSuffix(file.name);
    if (suffix === 'zip') {
      accepts.push(file);
    } else {
      notZip.push(file);
    }
  }
  if (!notZip.length) {
    return fileList;
  } else {
    try {
      const mainFile = notZip.find(file => file.name.endsWith(suffix));
      if (!mainFile) {
        throw new Error('文件格式错误');
      }
      const mainName = mainFile.name.slice(0, -suffix.length);
      const zip = new JSZip();
      for (const file of notZip) {
        zip.file(file.name, file);
      }
      const zipPackage = await zip.generateAsync({ type: 'blob' }).then(blob => {
        return new File([blob], `${mainName}.zip`, {
          type: 'application/zip',
        });
      });
      accepts.push(zipPackage);
    } catch (e) {
      message.error(e.message);
    }
  }
  return accepts;
};

export function validateFilenameInZip(filename: string) {
  const arr = filename.split('/');
  if (arr.length > 1) {
    arr.shift();
  }
  for (const path of arr) {
    if (/[^\w\-\.]/.test(path)) {
      throw new Error('zip内文件名仅支持大小写字母、数字、减号和下划线组成，请修改后重新上传');
    }
  }
}
