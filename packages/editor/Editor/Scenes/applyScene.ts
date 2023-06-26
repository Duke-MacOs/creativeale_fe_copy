import * as http from '@shared/api/project';
import { ISceneState, ICaseState, addScene, addComponent, addCustomScript, ICustomScriptState } from '../../aStore';
import { updateComponent } from '@editor/aStore/selectors/useClipboard/utils';
import { fromScene, intoScene, updateSceneId } from '@editor/utils';

export default async (
  dispatch: EditorDispatch,
  state: ICaseState,
  scenes: ISceneState[],
  index: number,
  oldCustomScripts?: ICustomScriptState[],
  inComponent = false
) => {
  if (state.editor.playing) {
    return;
  }
  const { id: projectId } = state;
  if (projectId) {
    const { copyNode, createScenes } = updateComponent(
      state,
      false,
      true,
      (_, url): url is string | number => {
        return typeof url === 'number';
      },
      async urlOrId => {
        const oldComponent = scenes.find(({ orderId }) => orderId === urlOrId);
        if (!oldComponent) {
          throw new Error();
        }
        return [oldComponent.sceneId, oldComponent];
      },
      async (urlOrId, name) => {
        if (urlOrId === undefined && name) {
          const script = (oldCustomScripts || []).find(script => script.name === name);
          return [script?.id, script];
        } else {
          const oldScript = (oldCustomScripts || []).find(({ orderId }) => orderId === urlOrId);
          if (!oldScript) {
            throw new Error();
          }
          return [oldScript.id, oldScript];
        }
      }
    );
    let mainScene = intoScene({ ...scenes[0], parentId: scenes[0].sceneId });
    mainScene = { ...mainScene, nodes: await copyNode(mainScene.nodes) };
    const { components, customScripts } = await createScenes();
    const main = components.find(({ parentId }) => parentId === scenes[0].sceneId);
    if (!main) {
      const { id, orderId } = await http.createScene({
        projectId,
        name: scenes[0].name || '未命名场景',
        sceneContent: JSON.stringify(mainScene),
      });
      if (inComponent) {
        dispatch(addComponent(updateSceneId(fromScene(mainScene), id, orderId)));
        index++;
      } else {
        dispatch(addScene(updateSceneId(fromScene(mainScene), id, orderId), index++));
      }
    } else {
      dispatch(addScene(main, index++));
    }
    for (const component of components) {
      if (component === main) {
        continue;
      }
      if (component.type === 'Scene') {
        dispatch(addScene(component, index++));
      } else {
        dispatch(addComponent(component));
        index++;
      }
    }
    for (const customScript of customScripts) {
      dispatch(addCustomScript(customScript));
    }
  } else {
    for (const scene of scenes) {
      dispatch(addScene(scene, index++));
    }
  }
};
