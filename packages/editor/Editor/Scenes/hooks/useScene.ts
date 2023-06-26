import { useSelector, shallowEqual, useStore } from 'react-redux';
import { changeEditor, changeProps, ISceneState } from '@editor/aStore';
import { get } from 'lodash';
import { fromScene, getSceneByOrderId, intoScene } from '@editor/utils';
import Axios from 'axios';
import { absoluteUrl, relativeUrl } from '@shared/utils';
import { applyScene } from '@editor/Editor/Header/hooks/compatibles';
import { generateScene3DProps } from '@byted/riko';
import { createMaterial } from '@shared/api/library';

export const useScene = () => {
  const { getState, dispatch } = useStore<EditorState>();

  const getSceneById = (id: number): ISceneState | undefined => {
    return getState()['project']['scenes'].find(scene => scene.id === id);
  };

  const getProject = () => {
    return getState()['project'];
  };

  const onSelectScene = (id: number) => {
    dispatch(changeEditor(0, { selectedSceneId: id, settingsOn: false }));
  };

  const onChangeSceneName = (id: number, name: string) => {
    dispatch(changeProps([id], { name: name }));
  };

  const getCurrentScene = () => {
    const currentSceneId = getState()['project']['editor'].selectedSceneId;
    return getSceneById(currentSceneId);
  };

  const getCurrentSceneNode3DId = () => {
    const scene = getCurrentScene();
    return (
      scene &&
      Object.entries(scene.props)
        .find(item => item[1].type === 'Scene3D')
        ?.shift()
    );
  };

  const getCurrentSceneNode3DProps = () => {
    const scene = getCurrentScene();
    return scene && Object.entries(scene.props).find(item => item[1].type === 'Scene3D')?.[1];
  };

  const onChangeCurrentScene3DProps = (props: any) => {
    const scene3DId = Number(getCurrentSceneNode3DId());
    if (scene3DId) {
      dispatch(changeProps([scene3DId], props));
    }
  };

  const getSceneFromUrl = async (project: EditorState['project'], url: string | number) => {
    if (typeof url === 'number') {
      return getSceneByOrderId(project, url);
    }
    const { data } = await Axios.get(absoluteUrl(url));
    const [scene] = await applyScene(project.id, [fromScene(data)]);
    scene.orderId = 0;
    return scene;
  };

  /**
   * 获取 3D场景的隐藏属性变化值
   * @param scene 场景
   * @param scene3DId 3D 场景 ID
   * @returns
   */
  const getSceneHiddenProperty = async (scene: ISceneState, scene3DId?: number) => {
    const data = intoScene(scene)?.nodes?.find(i => i.id === Number(scene3DId));
    return data ? await generateScene3DProps(data) : undefined;
  };

  /**
   * 修改当前 3D 场景隐藏属性
   */
  const changeSceneHiddenProperty = async () => {
    const scene = getCurrentScene();
    const scene3DId = getCurrentSceneNode3DId();
    if (scene && scene3DId) {
      const props = await getSceneHiddenProperty(scene, Number(scene3DId));
      if (props) {
        const reflection = props.reflectionUrl;
        if (typeof reflection === 'object') {
          const [name, blob] = Object.entries((reflection as any).files)[0];
          // 二进制数据需要上传
          const file = new File([blob as Blob], name);
          const { data }: any = await createMaterial({ file, name, onPlatform: false, type: 0 });
          props.reflectionUrl = relativeUrl(data.url);
        }

        dispatch(changeProps([Number(scene3DId)], props));
      }
    }
  };

  return {
    getSceneById,
    getProject,
    onSelectScene,
    onChangeSceneName,
    getCurrentSceneNode3DId,
    onChangeCurrentScene3DProps,
    getSceneFromUrl,
    changeSceneHiddenProperty,
    getCurrentSceneNode3DProps,
  };
};

/**
 * 监听场景中的某些属性
 * @param sceneId 场景 id
 * @param paths {[key: 返回关键词]: [value: 取值路径]}
 * @returns {key: value}
 */
export const useScenePropListener = (sceneId: number, paths: { [key: string]: string }) => {
  return useSelector(({ project }: EditorState) => {
    const scene = project.scenes.find(scene => scene.id === sceneId);
    return Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, get(scene, path)]));
  }, shallowEqual);
};
