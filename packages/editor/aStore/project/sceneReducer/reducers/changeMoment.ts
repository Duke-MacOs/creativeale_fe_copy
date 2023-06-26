import { ISceneState } from '../../types';
const ACTION = Symbol('ChangeMoment');
export const changeMoment = (moment: number, playing = false) => {
  return {
    type: ACTION,
    playing,
    moment,
  };
};
export default (scene: ISceneState, action: ReturnType<typeof changeMoment>): ISceneState => {
  if (action.type === ACTION) {
    return { ...scene, editor: { ...scene.editor, moment: action.moment } };
  }
  return scene;
};
