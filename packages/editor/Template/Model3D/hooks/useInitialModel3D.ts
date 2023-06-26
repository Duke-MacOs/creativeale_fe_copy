/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSearchParams } from '@editor/utils';
import { useStore } from 'react-redux';
import { useRef } from 'react';
import { dbServer } from '@editor/Template/Panorama/utils';
import { useUploadModel } from '@editor/Resource/upload';
import { useModel3DEdit } from './useModel3DEdit';
import { useScene } from '@editor/Editor/Scenes/hooks/useScene';

export const useInitialModel3D = () => {
  const hasInitial = useRef(false);

  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  const uploadModel = useUploadModel();
  const { replaceCarModelInProduct } = useModel3DEdit();
  const { onSelectScene } = useScene();
  const initialModel3DState = async () => {
    if (hasInitial.current === false) {
      const { emptyCar, fileId } = getSearchParams();
      const mainScene = getState().project.scenes.find(i => i.orderId === 2);
      mainScene && onSelectScene(mainScene.id);
      // 如果选择了资源，将资源上传
      let orderId: number | undefined;
      if (fileId) {
        const res = await dbServer.get(Number(fileId));
        if (res) {
          orderId = await uploadModel(res.files as any);
        }
      }
      if (emptyCar === '1') {
        console.log('没有选择汽车模板');
      } else if (orderId && mainScene) {
        const [modelNodeId] = Object.entries(mainScene.props).find(([id, props]) => props.type === 'Model') ?? [];
        // 替换模型资源
        modelNodeId && (await replaceCarModelInProduct(Number(modelNodeId), orderId));
      }
    }

    hasInitial.current = true;
  };
  const delSearchUrl = () => {
    let path = location.href;
    path = path.replace('emptyCar=1', '');
    path = path.replace('initialCar=1', '');
    path = path.replaceAll(/fileId=(.*?)&/g, '');

    window.history.replaceState({}, '', path);
  };
  return {
    initialModel3DState,
    delSearchUrl,
  };
};
