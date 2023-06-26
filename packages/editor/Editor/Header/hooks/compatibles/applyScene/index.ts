import { ISceneState } from '@editor/aStore';
import { SCENE_FIXTURE_VERSION } from '../version';
import fixCompProps from './compProps';
import fixCachedCustomScript from './cachedCustomScript';
import fromIdToIds from './fromIdToIds';

export const applyScene = async (projectId: number, scenes: ISceneState[]) => {
  const fixtures = [fixCompProps, fixCachedCustomScript, fromIdToIds];
  return Promise.all(
    scenes.map(async scene => {
      const fixedScene = await fixtures
        .slice(location.search.includes('update=force') ? 0 : scene.editor.dataVersion)
        .reduce(async (scene, fixture) => {
          return fixture({ projectId, scene: await scene });
        }, scene as ISceneState | Promise<ISceneState>);
      return {
        ...fixedScene,
        editor: {
          ...fixedScene.editor,
          dataVersion: SCENE_FIXTURE_VERSION,
        },
      };
    })
  );
};
