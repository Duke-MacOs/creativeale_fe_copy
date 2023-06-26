/**
 * VR 全景图片上传。
 * 会先将一张原始图片，经过 convert 算法切成6份图片，再将6张图片上传后，调用 riko 接口得到 props
 * 场景化该数据保存
 */
import React, { memo } from 'react';
import { message, Upload } from 'antd';
import { AcceptedType, acceptedType } from '../accepted';
import { collectEvent, EventTypes } from '@editor/utils';
import convertPanoramaList from './processImage';
import { uploadFile } from '@shared/api';
import { addCubeMap, useProject } from '@editor/aStore';
import JSZip from 'jszip';
import { getRikoAssetProps } from '@editor/Resource/entries/3d/utils';
import { createAsset } from '@byted/riko';
import { createScene } from '@shared/api/project';
import { useStore } from 'react-redux';
import { absoluteUrl, relativeUrl } from '@shared/utils';
import { createMaterial } from '@shared/api/library';

export interface UploadPanoramaProps {
  dispatch: any;
  className?: string;
  uploading: boolean;
  children: React.ReactNode;
  onAddResourceEntry(entry: {
    id: number;
    mime: string;
    name: string;
    url: string;
    cover?: string;
    extra?: Record<string, unknown>;
  }): any;
  setUploading(uploading: boolean): void;
}

export const Format = 'jpg';

const handleLightingData: <T>(data: T) => Promise<T> = async (data: any) => {
  if (data.editor?.lightingData) {
    const reflection = data.editor.lightingData.reflectionUrl;
    if (typeof reflection === 'object') {
      const [name, blob] = Object.entries((reflection as any).files)[0];
      // 二进制数据需要上传
      const { data: res }: any = await createMaterial({
        file: new File([blob as Blob], name),
        name,
        onPlatform: false,
        type: 0,
      });
      data.editor.lightingData.reflectionUrl = relativeUrl(res.url);
    }
  }

  return data;
};

const shrinkPictures = async (pictures: File[] | string[]): Promise<string[]> => {
  let res: string[] = [];
  if (typeof pictures[0] !== 'string') {
    for (const c of pictures) {
      const { downloadUrl } = await uploadFile(c as File);
      res.push(relativeUrl(downloadUrl) + `?ext=${downloadUrl.split('.').pop()}&width=1024`);
    }
  } else {
    res = pictures.map(url => `${relativeUrl(url as string)}?width=1024`);
  }
  return res;
};

/**
 * 处理导入 3D 场景事件中的天空盒资源
 */
export const useCreateCubemapFromImport = () => {
  const { dispatch } = useStore();
  const projectId = useProject('id');
  return async (data: any) => {
    data.props.textureUrls = await shrinkPictures(data.props.textureUrls);
    data.props.cover = absoluteUrl(data.props.textureUrls[0]);
    const { id, orderId } = await createScene({
      projectId: projectId,
      name: data.props.name,
      sceneContent: JSON.stringify(data),
    });
    const cubemap = {
      ...data,
      id,
      orderId,
    };
    dispatch(addCubeMap(cubemap));
    return cubemap;
  };
};

export const useCreateCubemap = () => {
  const { dispatch } = useStore();
  const projectId = useProject('id');
  // cube 为6张图片集合
  return async (cube: File[] | string[] | undefined, options = {} as any) => {
    let cubeUrl: string[] = [];
    const name = options.name ?? '贴图';
    if (cube) {
      cubeUrl = await shrinkPictures(cube);
    }
    const rikoAsset = await getRikoAssetProps(await createAsset(name, 'Cubemap', cubeUrl));
    const cubemapProps = {
      ...rikoAsset.files[rikoAsset.entry],
      name,
      cover: cube ? absoluteUrl(cubeUrl[0]) : '',
      ...options,
    };
    const { id, orderId } = await createScene({
      projectId: projectId,
      name,
      sceneContent: JSON.stringify(cubemapProps),
    });
    const cubemap = {
      ...cubemapProps,
      id,
      orderId,
    };
    dispatch(addCubeMap(cubemap));

    return cubemap;
  };
};

export const useUploadHDR = () => {
  const { getState, dispatch } = useStore();
  return async (file: File) => {
    const rikoAsset = await getRikoAssetProps(await createAsset(file.name, 'Cubemap', file));
    const entry: any = await handleLightingData(rikoAsset.files[rikoAsset.entry]);
    // 上传图片
    entry.props.textureUrls = await Promise.all(
      entry.props.textureUrls.map(async (key: string) => {
        const { downloadUrl } = await uploadFile(new File([rikoAsset.files[key]], key));
        return Promise.resolve(relativeUrl(downloadUrl));
      })
    );

    const cubemapProps = {
      ...entry,
      name: file.name,
      cover: absoluteUrl(entry.props.textureUrls[0]),
    };
    const { id, orderId } = await createScene({
      projectId: getState().project.id,
      name: file.name,
      sceneContent: JSON.stringify(cubemapProps),
    });
    const cubemap = {
      ...cubemapProps,
      id,
      orderId,
    };
    dispatch(addCubeMap(cubemap));

    return {
      id: cubemap.id,
      mime: 'Skybox',
      name: file.name,
      url: cubemap.orderId,
      cover: cubemap.props.textureUrls[0],
    };
  };
};

export const useHandleCubemapAsset = () => {
  const uploadHDR = useUploadHDR();
  const createCubemap = useCreateCubemap();
  const handleCubeList = async (cubeList: any[][], options?: Record<string, any>) => {
    const res = [];
    for (const cube of cubeList) {
      const originFile = cube.pop();
      const originFileName = originFile.name.substring(0, originFile.name.lastIndexOf('.'));
      const cubemap = await createCubemap(cube, { name: originFileName, ...options });
      res.push({
        id: cubemap.id,
        mime: 'Skybox',
        name: originFileName,
        url: cubemap.orderId,
        cover: cubemap.props.textureUrls[0],
      });
    }
    return res;
  };

  const handleZip = async (zipFile: File) => {
    const regArr: [RegExp, number][] = [
      ['right', 'r', 'px'],
      ['left', 'l', 'nx'],
      ['up', 'u', 'py'],
      ['down', 'd', 'ny'],
      ['front', 'f', 'pz'],
      ['back', 'b', 'nz'],
    ].map(([a, b, c], idx) => [new RegExp(`(^|[^a-zA-Z\\d])(${a}|${b}|${c})([^a-zA-Z\\d]|$)`, 'i'), idx]);

    // zip 资源名称和生成 json 图集的下标对应关系
    const map = [
      ['4', 'pz'],
      ['5', 'nz'],
      ['0', 'px'],
      ['1', 'nx'],
      ['2', 'py'],
      ['3', 'ny'],
    ];
    const originFileName = zipFile.name;
    const zip = new JSZip();
    return zip.loadAsync(zipFile).then(async data => {
      const array = [];
      for (const [key, value] of Object.entries(data.files)) {
        if (key.startsWith('__MACOSX')) continue;
        if (key.endsWith('.DS_Store')) continue;
        if (value.dir) continue;

        // 验证数字
        // eg: xxx/0.png
        const name = value.name?.split('/').pop()?.split('.').shift() ?? 'noneName';
        const idx = map.findIndex(i => i.includes(name));
        // 验证文件名
        // eg: xxxx.jpg_left
        const test = regArr.find(([reg]) => reg.exec(value.name) !== null);
        const content = await value.async('blob');
        if (idx !== -1) {
          array[idx] = new File([content], name);
        } else if (test) {
          array[test[1]] = new File([content], name);
        }

        // 最后一个放原始文件
        if (array[6] === undefined) array[6] = new File([content], originFileName);
      }
      return array;
    });
  };

  return async (fileList: File[]) => {
    const accepts = acceptedType(fileList, 'Cubemaps');
    const zipList: File[] = [];
    const imageList: File[] = [];
    const hdrList: File[] = [];
    // 资源分类
    accepts.forEach(accept => {
      if (['png', 'jpeg', 'jpg'].includes(accept.name?.split('.').pop() ?? '')) imageList.push(accept);
      if (accept.name.endsWith('.hdr')) hdrList.push(accept);

      if (accept.name.endsWith('.zip')) zipList.push(accept);
    });
    const imageCubeList = await convertPanoramaList(imageList);
    const zipCubeList = await Promise.all(zipList.map(handleZip));
    const hdrRes = await Promise.all(hdrList.map(uploadHDR));
    const otherRes = await handleCubeList(imageCubeList.concat(zipCubeList));
    return [...otherRes, ...hdrRes];
  };
};

export const UploadCubemaps = memo(
  ({ onAddResourceEntry, setUploading, children, uploading, className }: UploadPanoramaProps) => {
    const handleCubemapAsset = useHandleCubemapAsset();

    return (
      <Upload
        multiple
        disabled={uploading}
        showUploadList={false}
        className={className}
        accept={AcceptedType['Cubemaps']}
        beforeUpload={async (file, fileList) => {
          if (fileList.indexOf(file) !== fileList.length - 1) {
            return false;
          }
          fileList.forEach(() => {
            collectEvent(EventTypes.UploadResource, {
              type: '用户上传量',
            });
          });
          setUploading(true);

          try {
            const res = await handleCubemapAsset(fileList);
            for (const data of res) {
              await onAddResourceEntry(data);
            }
          } catch (error) {
            message.error(error.message);
          }
          setUploading(false);

          return false;
        }}
      >
        {children}
      </Upload>
    );
  }
);
