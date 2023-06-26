import { changeProps, ICompProp, ISceneState } from '@editor/aStore';
import reducer from '@editor/aStore/project/sceneReducer/reducers/changeProps';

// TODO: For compatibility only, should be removed in the future.
export default ({ scene }: { projectId?: number; scene: ISceneState }) => {
  const {
    props: {
      [scene.id]: { compProps },
    },
  } = scene;
  if (Array.isArray(compProps)) {
    for (const { ids, props } of compProps as ICompProp[]) {
      for (const prop of props) {
        if (prop.value !== undefined) {
          scene = reducer(scene, changeProps(ids, { [prop.key]: prop.value }));
          delete prop.value;
        }
      }
    }
  }
  return scene;
};
