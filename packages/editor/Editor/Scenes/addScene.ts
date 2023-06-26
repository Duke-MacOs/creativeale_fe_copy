import * as http from '@shared/api/project';
import { ISceneState, ICaseState, addScene } from '../../aStore';
import { intoScene } from '../../utils';

export default async (dispatch: EditorDispatch, state: ICaseState, scene: ISceneState, index: number) => {
  if (state.editor.playing) {
    return;
  }
  const { id: projectId } = state;
  if (projectId) {
    const { id: sceneId, orderId } = await http.createScene({
      projectId,
      name: scene.name,
      sceneContent: JSON.stringify(intoScene(scene)),
    });
    dispatch(addScene({ ...scene, sceneId, orderId }, index));
  } else {
    dispatch(addScene(scene, index));
  }
};
