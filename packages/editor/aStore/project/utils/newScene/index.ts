import { SCENE_FIXTURE_VERSION } from '@editor/Editor/Header/hooks/compatibles/version';
import { fromScene, intoScene } from '../../../../utils/intoFrom';
import { createNode, INodeData } from '@byted/riko';
export { default as videoScene } from './videoScene';
import { newID } from '../../../../utils/newID';
import playableScene from './playableScene';
import loadingScene from './loadingScene';
import { ISceneState } from '../../types';

type NewScene = {
  loading?: boolean;
  playable?: boolean;
  type?: ISceneState['type'];
  width?: number;
  height?: number;
  enabled3d?: boolean;
  nodes?: INodeData[];
  edit3d?: boolean;
  isOpen?: boolean;
};

export const newSceneAsync = async (name: string, options: NewScene = {}) => {
  if (options.enabled3d) {
    return newScene(name, { ...options, nodes: [await createNode('3D场景', 'Scene3D', newID, '')], edit3d: true });
  }
  return newScene(name, options);
};

export const newScene = (
  name: string,
  {
    loading = false,
    playable,
    type = 'Scene',
    width = 750,
    height = 1334,
    nodes = [],
    edit3d = false,
    isOpen = true,
  }: NewScene = {}
): ISceneState => {
  const id = newID();
  if (playable) {
    return playableScene(id, width, height) as ISceneState;
  }
  if (loading) {
    return loadingScene(id, width, height) as ISceneState;
  }
  return fromScene({
    id,
    sceneId: id,
    orderId: id,
    type,
    editor: {
      loading,
      dataVersion: SCENE_FIXTURE_VERSION,
      edit3d,
      isOpen,
    },
    props: {
      name,
      width,
      height,
    },
    nodes,
  } as any);
};

export function copyScene(scene: ISceneState, changeName = true) {
  const newScene = intoScene(scene);
  newScene.id = newID();
  if (changeName && newScene.props) {
    newScene.props.name = `${scene.name} 复制`;
  }
  return fromScene(newScene);
}
