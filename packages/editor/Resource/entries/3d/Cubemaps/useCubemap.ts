import { createScene, deleteScene } from '@shared/api/project';
import { absoluteUrl } from '@shared/utils';
import { createAsset } from '@byted/riko';
import {
  addMaterial,
  deleteCubemap as onDeleteCubemap,
  updateCubemap as onUpdateCubemap,
  IMaterialState,
  updateMaterial,
} from '@editor/aStore';
import { useScene } from '@editor/Editor/Scenes/hooks/useScene';
import { useCreateCubemapFromImport } from '@editor/Resource/upload';
import { getCubemaps, cubemapInUsed } from '@editor/utils';
import { message } from 'antd';
import Axios from 'axios';
import { useSelector, useStore } from 'react-redux';
import { getRikoAssetProps } from '../utils';

export default () => {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  const { changeSceneHiddenProperty, getCurrentSceneNode3DProps } = useScene();
  const projectId = useSelector(({ project }: EditorState) => project.id);
  const createCubemap = useCreateCubemapFromImport();

  const createMaterial = async (url: string | number, name?: string): Promise<number> => {
    let material;
    if (typeof url === 'number') {
      const rikoAsset = await getRikoAssetProps(await createAsset('天空盒', 'Skybox6SidedMaterial', url));
      material = { ...rikoAsset.files[rikoAsset.entry] };
    } else {
      const res = await Axios.get(`${absoluteUrl(url, getState().project.settings.basePath)}`);
      material = res.data;
    }
    if (typeof material.props?.cubemapUrl === 'string') {
      const { data } = await Axios.get(
        `${absoluteUrl(material.props?.cubemapUrl, getState().project.settings.basePath)}`
      );
      const cubemap = await createCubemap(data);
      material.props.cubemapUrl = cubemap.orderId;
    }
    const materialProps = {
      material,
      name: name ?? '天空盒',
      type: 'Material',
      isCustom: false,
      _originUrl: '',
    };
    const { id, orderId } = await createScene({
      projectId,
      name: name ?? '天空盒',
      sceneContent: JSON.stringify(materialProps),
    });
    dispatch(
      addMaterial({
        ...materialProps,
        id,
        orderId,
      } as IMaterialState)
    );
    return orderId;
  };

  const scene3DApplyCubemap = async (url: number | string, onChange?: (order?: number) => void) => {
    const scene3D = getCurrentSceneNode3DProps();
    if (!scene3D) {
      message.error('不存在 scene3D 节点');
      return;
    }
    if (!scene3D?.skyboxMaterialUrl && typeof url === 'number') {
      const orderId = await createMaterial(url);
      onChange?.(orderId);
    } else {
      const material = getState().project.materials.find(i => i.orderId === scene3D.skyboxMaterialUrl);
      if (!material) {
        message.error(`找不到材质 orderId: ${scene3D.skyboxMaterialUrl}`);
        return;
      }
      dispatch(
        updateMaterial(material.id, {
          ...material.material,
          props: {
            ...material.material.props,
            cubemapUrl: url,
          },
        })
      );
      onChange?.(material.orderId);
    }
    setTimeout(changeSceneHiddenProperty);

    return;
  };

  const scene3DCancelApplyCubemap = (orderId: number, onChange?: () => void) => {
    const material = getState().project.materials.find(i => i.orderId === orderId);
    if (!material) return;
    dispatch(
      updateMaterial(material.id, {
        ...material.material,
        props: { ...material.material.props, cubemapUrl: 0 },
      })
    );
    onChange?.();
    setTimeout(changeSceneHiddenProperty);
  };

  const deleteCubemap = async (id: number) => {
    const deleteOrderId = getCubemaps(getState().project).find(cubemap => cubemap.id === id)?.orderId;
    if (deleteOrderId) {
      if (cubemapInUsed(getState().project, deleteOrderId)) {
        message.error('全景图正在使用，无法删除');
      } else {
        dispatch(onDeleteCubemap(id));
        await deleteScene(id);
      }
    }
  };

  const updateCubemap = (orderId: number, props: any) => {
    dispatch(onUpdateCubemap(orderId, props));
  };

  return {
    updateCubemap,
    deleteCubemap,
    createMaterial,
    scene3DApplyCubemap,
    scene3DCancelApplyCubemap,
  };
};
