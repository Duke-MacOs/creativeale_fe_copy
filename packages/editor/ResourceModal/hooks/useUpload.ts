import { addComponent, addScene, useProject } from '@editor/aStore';
import { createComp } from '@editor/Editor/Header/headers/Component/createComp';
import { fromScene, getSceneFromUrl, intoScene } from '@editor/utils';
import { createResource } from '@shared/api';
import { createMaterialByUrls, saveAsProject } from '@shared/api/library';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { IData, ResourceTypeInModal } from '../type';

export default () => {
  const { dispatch } = useStore();
  const project = useSelector(({ project }: EditorState) => {
    return project;
  }, shallowEqual);
  const { settings } = project;
  const projectId = useProject('id');

  // 普通资源转为项目资源
  const uploadNormalMaterial = async (ids: string[]) => {
    const res = await saveAsProject(projectId, ids);
    return res;
  };

  // 场景化资源转为项目资源
  const uploadSceneMaterial = async (items: { url: string; cover: string; name: string }[]) => {
    const res: any = { success: [], exists: [], materials: [] };
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const scene: any = await getSceneFromUrl(project, item.url);
      scene.props[scene.id].name = scene.name = item.name;
      scene.editor.store = settings.store;
      scene.editor.capture = item.cover;

      const newComponent = await createComp(project, scene, true);
      console.log('newComponent:', newComponent);
      dispatch(addComponent(newComponent));
      res.success.push(newComponent);
    }

    return res;
  };

  // AI 资源转为项目资源
  const uploadAIImage = async (file: File) => {
    return await createResource({ projectId: project.id, file, type: 5 });
  };

  return {
    uploadAIImage,
    uploadNormalMaterial,
    uploadSceneMaterial,
  };
};
