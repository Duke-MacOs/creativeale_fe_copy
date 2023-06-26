import React, { memo, useRef } from 'react';
import JSZip from 'jszip';
import { message, Upload } from 'antd';
import { AcceptedType } from '../accepted';
import { fromScene, intoScene, openKeysToCompProps } from '@editor/utils';
import { createResource, uploadDataUri } from '@shared/api';
import { useProject, restoreState, addComponent, changeEditor } from '@editor/aStore';
import components from '@editor/Editor/Header/hooks/compatibles/applyState/components';
import { useStore } from 'react-redux';
import { createScene, updateScene } from '@shared/api/project';
import Axios from 'axios';
import useAddResourceEntry from '@editor/Resource/common/useAddResourceEntry';
import { captureNode3DData } from '@byted/riko';
import { isCar3D } from '@editor/Template/Model3D/utils';
export interface IUploadMesh {
  onAddResourceEntry(entry: { id: number; mime: string; name: string; url: string }): any;
  className?: string;
  uploading: boolean;
  children: React.ReactNode;
  setUploading(uploading: boolean): void;
}

export interface IRikoModelResponse {
  entry: string;
  files: {
    [key: string]: File | Blob;
  };
}

const ValidSuffix = ['obj', 'fbx', 'gltf', 'glb'];

/**
 * 更新 Model 封面
 */
export const useUpdateModelCover = () => {
  const projectId = useProject('id');
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  return async (orderId: number) => {
    const model = getState().project.scenes.find(i => i.orderId === orderId);
    if (!model) return;
    const { previewUrl } = await uploadDataUri(await captureNode3DData(orderId), `${orderId}`);

    dispatch(
      changeEditor(model.id, {
        cover: previewUrl,
      })
    );

    await updateScene({
      sceneContent: JSON.stringify(intoScene({ ...model, editor: { ...model.editor, cover: previewUrl } })),
      name: model.name || 'PanoramaSpaceNode',
      id: model.sceneId,
      projectId,
    });
  };
};

export const useUploadModel = () => {
  const projectId = useProject('id');
  const { propsMode } = useProject('editor');
  const onAddResourceEntry = useAddResourceEntry();
  const updateModelCover = useUpdateModelCover();
  const { dispatch, getState } = useStore<EditorState, EditorAction>();

  const originFileRef = useRef<File | null>(null);
  const entryFileNameRef = useRef('Model');

  const uploadModel = async (file: Blob | File): Promise<{ id: number; url: string }> => {
    if (originFileRef.current === null) throw new Error('上传模型失败：原始文件丢失');
    const { id, url } = await createResource({
      file,
      type: 27,
      projectId,
      name: entryFileNameRef.current,
      multiAnimationLayers: isCar3D(getState().project),
    });

    return { id, url };
  };

  const handleOriginComponent = async (id: number, url: string) => {
    const { data: rootComponent } = await Axios.get(url);
    const { orderId, id: sceneId } = await createScene({
      name: entryFileNameRef.current,
      projectId,
      sceneContent: JSON.stringify(rootComponent),
    });

    // 更新 database
    onAddResourceEntry('Model', 'project', '未分类', {
      id,
      name: entryFileNameRef.current,
      previewUrl: url,
    });

    // 更新场景数据
    dispatch(
      addComponent(
        fromScene({
          ...(rootComponent as any),
          id: sceneId,
          sceneId,
          orderId,
          parentId: url,
        })
      )
    );
    const newState = await components(getState().project);
    dispatch(
      restoreState({
        ...newState,
        scenes: newState.scenes.map(s => (s.type === 'Scene' && propsMode === 'Product' ? openKeysToCompProps(s) : s)),
      })
    );

    await updateModelCover(orderId);

    return orderId;
  };

  const handleBasicFile = async (file: File) => {
    const isValidFile = ValidSuffix.includes(file.name?.split('.')?.pop() ?? '');
    if (isValidFile) {
      originFileRef.current = file;
      const { id, url } = await uploadModel(file);
      return await handleOriginComponent(id, url);
    } else {
      throw new Error('文件无效');
    }
  };

  const handleZip = async (file: File) => {
    originFileRef.current = file;
    const zip = new JSZip();
    const fileList = await zip.loadAsync(file).then(async data => {
      const res: { [key: string]: File } = {};
      for (const [key, value] of Object.entries(data.files)) {
        if (key.startsWith('__MACOSX')) continue;
        if (key.endsWith('.DS_Store')) continue;
        if (value.dir) continue;
        const name = value.name?.split('/').pop() ?? 'noneName';
        const content = await value.async('blob');
        res[key] = new File([content], name);
      }
      return res;
    });

    const isValidZip = Object.keys(fileList).some(path => ValidSuffix.includes(path.split('.')?.pop() ?? ''));
    if (isValidZip) {
      const { id, url } = await uploadModel(file);
      return await handleOriginComponent(id, url);
    } else {
      throw new Error('zip 文件无效');
    }
  };

  return async (fileList: File[]) => {
    for (const item of fileList) {
      if (item.name.endsWith('.zip')) {
        return await handleZip(item);
      } else {
        return await handleBasicFile(item);
      }
    }
  };
};

export const UploadModel = memo(({ setUploading, children, uploading, className }: IUploadMesh) => {
  const uploadModel = useUploadModel();

  return (
    <Upload
      multiple
      disabled={uploading}
      showUploadList={false}
      className={className}
      accept={AcceptedType['Model']}
      beforeUpload={async (file, fileList) => {
        // 根据文件数目，会多次触发 beforeUpload
        // 忽略不是最后一个文件的触发
        if (fileList.indexOf(file) !== fileList.length - 1) {
          return false;
        }
        try {
          setUploading(true);
          await uploadModel(fileList);
        } catch (error) {
          message.error(error.message);
        } finally {
          setUploading(false);
          return false;
        }
      }}
    >
      {children}
    </Upload>
  );
});
