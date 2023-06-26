import { ISceneState } from '@editor/aStore';
import { intoScene, pickupScenes } from '@editor/utils';
import { createMaterial } from '@shared/api/library';
import { uploadDataUri } from '@shared/api';

export const publishScene = async (project: EditorState['project'], scene: ISceneState, params: any): Promise<any> => {
  const { name, cover, description, platformTags, isAuthControl } = params;
  const { scenes, customScripts } = pickupScenes(project, scene, params.orderIds);
  const { previewUrl } = await uploadDataUri(cover || scene.editor.capture || '', 'cover.png');
  return createMaterial({
    name: name || scene.name,
    file: new File(
      [
        JSON.stringify({
          scenes: scenes.map(scene => intoScene(scene)),
          customScripts,
          settings: {
            ...project.settings,
            sceneOrders: scenes.filter(({ type }) => type === 'Scene').map(({ orderId }) => orderId),
          },
        }),
      ],
      'data.json',
      { type: 'application/json' }
    ),
    cover: previewUrl,
    onPlatform: true,
    type: 26,
    description,
    platformTags,
    isAuthControl: isAuthControl ?? false,
  });
};
