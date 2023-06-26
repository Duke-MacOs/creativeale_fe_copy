import { findById, fromScene, getScene, intoNodes, intoScene } from '@editor/utils';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { addDebugFlag } from '@shared/globals/debugHooks';
import { copyText } from '@shared/utils';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import assertions from './assertions';
import resource from './resource';
import userinfo from './userinfo';
import project, { ISceneState, restoreState } from './project';
import { message } from 'antd';

export * from './utilities';
export * from './selectors';
export * from './checkers';
export * from './resource';
export * from './userinfo';
export * from './project';

const middlewares = [thunkMiddleware] as Parameters<typeof applyMiddleware>;
const [checked] = addDebugFlag({
  title: 'Redux日志',
  flagBit: 0b10,
  onChange() {
    location.reload();
  },
});
if (checked) {
  middlewares.push(createLogger());
}
const store = createStore(
  combineReducers({ project, resource, userinfo }),
  composeWithDevTools(applyMiddleware(...middlewares))
);

if (process.env.MODE === 'development') {
  // In development mode, detect state inconsistencies.
  assertions(store);
}

window.editorScene = (current = true) => {
  const scene = getScene(store.getState().project, undefined, false);
  const {
    editor: { selected },
  } = scene;
  const nodeIds = Object.keys(selected).map(Number);
  if (!current || !nodeIds.length || (nodeIds.length === 1 && nodeIds[0] === scene.id)) {
    const data = intoScene(scene);
    copyText(JSON.stringify(data), { onCopySuccess: () => console.log('The JSON data has been copied!') });
    return data;
  }
  const [, parent = scene] = findById(scene.nodes, nodeIds[0]);
  const data = intoNodes([parent as any], scene.props)[0].nodes?.filter(({ id }) => nodeIds.includes(id));
  copyText(JSON.stringify(data), { onCopySuccess: () => console.log('The JSON data has been copied!') });
  return data;
};

window.replaceSelectedScene = (newScene: ISceneState) => {
  try {
    fromScene(intoScene(newScene));
  } catch (error) {
    message.error(error.message);
    return;
  }
  const { getState, dispatch } = store;
  const { project } = getState();
  const {
    editor: { selectedSceneId },
  } = project;
  const oldScene = getScene(project, undefined, false);

  dispatch(
    restoreState({
      ...project,
      scenes: project.scenes.map(scene =>
        scene.id === selectedSceneId
          ? fromScene({
              ...intoScene(newScene),
              id: oldScene.id,
              sceneId: oldScene.sceneId,
            } as RikoNode)
          : scene
      ),
    })
  );
};

export default store;
