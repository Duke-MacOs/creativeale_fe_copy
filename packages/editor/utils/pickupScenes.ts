import { getSceneByOrderId, getCustomScriptByOrderId, isAnimation } from '@editor/utils';
import { ICustomScriptState, ISceneState } from '@editor/aStore';
import { intoRikoHook } from './rikoHooks';
import { uniqBy } from 'lodash';

export const cleanProject = (project: EditorState['project']) => {
  if (project.settings.typeOfPlay === 4) {
    return project;
  }
  const cleanProject = {
    ...project,
    ...pickupScenes(project, getMainScene(project.scenes)),
  };
  const loading = project.scenes.find(({ editor }) => editor.loading);
  if (loading) {
    cleanProject.scenes.push(loading);
  }
  return cleanProject;
};

export const getMainScene = (scenes: ISceneState[]) => {
  return scenes.find(({ type, editor: { loading } }) => !loading && type === 'Scene') || scenes[0];
};

export const pickupScenes = (project: EditorState['project'], scene: ISceneState, stopOnOrderIds?: number[]) => {
  function* fromProps(props: any[]): Generator<ISceneState | ICustomScriptState> {
    for (const { callee, type, default: d, value = d, defaultItem } of props) {
      if (callee === 'Riko.useRes' && type === 'Component' && typeof value === 'number') {
        yield* fromComponent(getSceneByOrderId(project, value));
      } else if (callee === 'Riko.useArray') {
        yield* fromProps(value.map((value: any) => intoRikoHook(defaultItem, value)));
      } else if (callee === 'Riko.useObject' || callee === 'object') {
        yield* fromProps(Object.values(value));
      } else if (callee === 'Riko.useEvent') {
        yield* fromScripts(value);
      }
    }
  }
  function* fromScripts(scripts: RikoScript[] = []): Generator<ISceneState | ICustomScriptState> {
    for (const { props } of scripts) {
      const { script, url, sceneId, scripts = [], elseScripts = [] } = props;
      if (script === 'CloneComponent' && typeof url === 'number') {
        yield* fromComponent(getSceneByOrderId(project, url));
      }
      if (script === 'CustomScript') {
        if (typeof url === 'number') {
          yield getCustomScriptByOrderId(project, url);
        }
        yield* fromProps(
          Object.entries(props)
            .filter(([key, value]) => value && key.startsWith('$'))
            .map(entry => entry[1])
        );
      }
      if (
        script === 'ChangeScene' &&
        typeof sceneId === 'number' &&
        (!stopOnOrderIds || stopOnOrderIds.includes(sceneId))
      ) {
        try {
          yield* fromComponent(getSceneByOrderId(project, sceneId));
        } catch {}
      }
      yield* fromScripts(scripts as RikoScript[]);
      yield* fromScripts(elseScripts as RikoScript[]);
    }
  }
  function* fromComponent(component: ISceneState): Generator<ISceneState | ICustomScriptState> {
    if (!stopCircleOrderId.has(component.orderId)) {
      stopCircleOrderId.add(component.orderId);
      yield component;
      for (const { type, url, scripts, jumpSceneId, compProps = [] } of Object.values(component.props)) {
        if (jumpSceneId) {
          try {
            yield* fromComponent(getSceneByOrderId(project, jumpSceneId));
          } catch {}
        }
        if (isAnimation(type)) {
          if (typeof url === 'number') {
            yield* fromComponent(getSceneByOrderId(project, url));
          }
          for (const { props } of compProps) {
            yield* fromProps(props.filter(({ key, value }) => value && key.startsWith('$')).map(({ value }) => value));
          }
        }
        if (type === 'Script' || type === 'Blueprint') {
          yield* fromScripts(scripts);
        }
      }
    }
  }
  const stopCircleOrderId = new Set<number>();
  const scenes = uniqBy(Array.from(fromComponent(scene)), 'orderId');
  return {
    scenes: scenes.filter(({ type }) => type !== 'CustomScript') as ISceneState[],
    customScripts: scenes.filter(({ type }) => type === 'CustomScript') as ICustomScriptState[],
  };
};
