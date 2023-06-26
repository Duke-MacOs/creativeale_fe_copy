import { message, Modal } from 'antd';
import JSZip from 'jszip';
import { captureTTF, INodeData } from '@byted/riko';
import { ResourceType, categoryOf, acceptedSize, acceptedType, acceptedDims } from '../accepted';
import { parse as parsePSD, filter as filterPSD, toNodeState } from './psdParse';
import { makeNewID } from '@editor/utils';
import { Category } from '@editor/aStore';
import { createResource, uploadDataUri } from '@shared/api';
import { validateSpineVersion } from './spineVersionValidator';
import convertLottie from './convertLottie';
import convertParticle from './convertParticle';
import convertDragonBones from './convertDragonBones';
import convertSpine from './convertSpine';
import convertLive2d from './convertLive2d';
import zipFile from './zipFile';
import PSD from 'psd.js';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import process from './Modal/process';
import { collectEvent, EventTypes } from '@editor/utils';
import { judge } from './Modal/fn';

export const fromFile = async (file: File, options: any, category?: Category) => {
  const resourceExtra: Record<string, unknown> = {};
  if (!category) {
    category = categoryOf(file);
  }
  if (file.type === 'image/vnd.adobe.photoshop') {
    const name = file.name.split('/').pop()?.split('.')[0] || 'PSD';
    const psd = await PSD.fromDroppedFile(file);
    const psdNode = await parsePSD(psd.tree());
    filterPSD(psdNode);
    psdNode.name = file.name;
    const zip = new JSZip();
    const images = zip.folder('images');
    const node = toNodeState(psdNode, images, 'images', makeNewID(1000)) as INodeData;
    const jsonName = 'psd.json';
    zip.file(jsonName, new File([JSON.stringify(node)], jsonName, { type: 'application/json' }));
    file = await zip.generateAsync({ type: 'blob' }).then(blob => {
      return new File([blob], `${name}_psd.zip`, {
        type: 'application/zip',
      });
    });
  }
  if (category === 'Lottie') {
    file = await convertLottie(file);
  }
  if (category === 'Particle') {
    file = await convertParticle(file);
  }
  if (category === 'DragonBones') {
    file = await convertDragonBones(file);
  }
  if (category === 'Spine') {
    file = await convertSpine(file);
    const version = await validateSpineVersion(file);
    resourceExtra.spineVersion = version;
  }
  if (category === 'Live2d') {
    file = await convertLive2d(file);
  }
  let cover = undefined;
  if (category === 'Font') {
    const coverData = await captureTTF(URL.createObjectURL(file), file.name.split('.')[0]);
    const { previewUrl } = await uploadDataUri(coverData, 'cover.png');
    cover = previewUrl;
  }
  const { id, url } = await createResource({
    file,
    type: ResourceType[category],
    cover,
    extra: JSON.stringify(resourceExtra),
    ...options,
  });
  return {
    id,
    mime: category,
    name: file.name.split('.').slice(0, -1).join('.'),
    url,
    cover,
    extra: resourceExtra,
  };
};

export async function fromFiles(
  fileList: File[],
  options: Record<string, any>,
  category?: Category,
  accept?: (files: File[]) => File[]
) {
  fileList.forEach(() => {
    collectEvent(EventTypes.UploadResource, {
      type: '用户上传量',
    });
  });
  const { uploadList, warningList, processList } = await judge(fileList, category);
  if (warningList.length !== 0) {
    const newFiles = await new Promise<File[]>((resolve, reject) => {
      Modal.confirm({
        centered: true,
        title:
          processList.length > 15
            ? `您有${processList.length}个文件需要经过转换处理，单次处理不能超过15个文件，本次将为您处理前15张`
            : `您有${processList.length}个文件需要经过转换处理`,
        icon: <ExclamationCircleOutlined />,
        content: warningList.map((item: { name: string; reason: string }, index: number) => (
          <div key={index}>
            <span>
              {item.name}({item.reason})
            </span>
            <br />
          </div>
        )),
        okText: '开始处理',
        cancelText: '放弃上传',
        onOk: () => {
          process({ processList: processList.length > 15 ? processList.splice(0, 15) : processList }).then(
            async (data: any) => {
              resolve(data);
            }
          );
        },
        onCancel: () => {
          reject(new Error(`已放弃${processList.length}个文件上传`));
        },
      });
    });
    uploadList.push(...newFiles);
  }
  let accepts =
    accept?.(uploadList) ?? (await acceptedDims(acceptedSize(acceptedType(uploadList, category), category), category));
  // 对于Spine和龙骨资源，当用户直接上传时我们对其进行打包处理
  if (category === 'Spine') {
    accepts = await zipFile(accepts, category, '.atlas');
  } else if (category === 'DragonBones') {
    accepts = await zipFile(accepts, category, '_ske.json');
  }
  if (accepts.length) {
    return async () => {
      try {
        return await Promise.all(accepts.map(file => fromFile(file, options, category)));
      } catch (error) {
        message.error(error.message);
        throw error;
      }
    };
  }
}
