import JSZip from 'jszip';
import { createFrameResource, uploadFile } from '@shared/api';
import { filenameSorter } from '@editor/utils';
import { Category } from '@editor/aStore';
import { ResourceType } from '../accepted';
export const zipFrames = async (fileList: File[], options: any, category: Category) => {
  const targetFiles = fileList.sort(({ name: n1 }, { name: n2 }) => filenameSorter(n1, n2));
  if (!targetFiles.length) {
    throw new Error('No files');
  }
  const { previewUrl: cover } = await uploadFile(targetFiles[0], options.$config);
  const zip = new JSZip();
  for (let i = 0; i < targetFiles.length; i++) {
    zip.file(targetFiles[i].name, targetFiles[i]);
  }
  const name = targetFiles[0].name.split('/').pop()?.split('.')[0] || `序列动画${targetFiles.length}帧`;
  const zipFile = await zip.generateAsync({ type: 'blob' }).then(blob => {
    return new File([blob], `${name}.zip`, {
      type: 'application/zip',
    });
  });
  const { id, url } = await createFrameResource({
    file: zipFile,
    type: ResourceType[category],
    cover,
    ...options,
  });
  return {
    id,
    mime: category,
    name,
    url,
    cover,
  };
};
