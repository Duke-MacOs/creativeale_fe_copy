import { createScene, deleteScene } from '@shared/api/project';
import { addMaterial, deleteMaterial as onDeleteMaterial, useProject } from '@editor/aStore';
import { materialInUsed } from '@editor/utils';
import { message } from 'antd';
import { useStore } from 'react-redux';
import { NodeType, AssetType, getValidMaterialAssetInfos, createAsset } from '@byted/riko';
import useTexture2D from './useTexture2D';

export default () => {
  const { getState, dispatch } = useStore();
  const projectId = useProject('id');
  const { addTexture2D } = useTexture2D();

  // 从 riko 获取内置材质基础信息
  // 不同节点类型能够使用的内置材质不同
  const getPresetMaterialInfo = (nodeType: NodeType) => {
    console.log('getValidMaterialAssetInfos(nodeType):', nodeType, getValidMaterialAssetInfos(nodeType));
    return getValidMaterialAssetInfos(nodeType);
  };

  // 新建材质
  const createMaterial = async (name: string, type: AssetType) => {
    const { entry, files } = await createAsset(name, type, {});
    const entryFile: any = files[entry];

    // 场景化材质用到的 Texture2D
    for (let i = 0, entries = Object.entries(entryFile.props); i < entries.length; i++) {
      const [key, value] = entries[i];
      if (key.endsWith('Url') && files[value as string]) {
        const texture2d = await addTexture2D(undefined, (files[value as string] as any).props, false);
        entryFile.props[key] = texture2d.orderId;
      }
    }
    console.log('entryFile:', entryFile);

    // 创建场景
    const { id, orderId } = await createScene({
      projectId: projectId,
      name,
      sceneContent: JSON.stringify({
        type: 'Material',
        material: entryFile,
        _originUrl: '',
        isCustom: true,
      }),
    });

    dispatch(
      addMaterial({
        id,
        orderId,
        name,
        type: 'Material',
        isCustom: true,
        _originUrl: '',
        material: entryFile,
      })
    );

    return { id, orderId };
  };

  const deleteMaterial = async (id: number) => {
    const deleteOrderId = getState().project.materials.find((material: { id: any }) => material.id === id)?.orderId;
    if (deleteOrderId && materialInUsed(getState().project, deleteOrderId)) {
      message.error('材质正在使用，无法删除');
      return undefined;
    } else {
      dispatch(onDeleteMaterial(id));
      deleteScene(id);
      return deleteOrderId;
    }
  };

  return {
    deleteMaterial,
    createMaterial,
    getPresetMaterialInfo,
  };
};
