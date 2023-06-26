import { INodeState, ISceneState, IScriptState, IGlobalSettings } from '../aStore';
import { relativeUrl } from '@shared/utils';
import upperFirst from 'lodash/upperFirst';
import cloneDeep from 'lodash/cloneDeep';
import { newID } from './newID';
import pick from 'lodash/pick';
import omit from 'lodash/omit';

export const selfKeys = [
  'store',
  'name',
  'enabled',
  'time',
  'asMask',
  'duration',
  'loopInterval',
  'playBySelf',
  'loop',
  'loopTimes',
  'visible',
];

export function updateSceneId(scene: ISceneState, id: number, orderId: number) {
  const { [scene.id]: sceneProps, ...props } = scene.props;
  return {
    ...scene,
    id,
    orderId,
    sceneId: id,
    props: { ...props, [id]: sceneProps },
  };
}

/**
 * 将编辑器的场景数据格式转化成Riko的场景数据格式
 * @param scene
 * @param keys
 * @returns
 */
export function intoScene(scene: ISceneState, keys = ['store', 'type', 'compProps']): RikoNode {
  const {
    props,
    nodes,
    name: _name,
    history: _history,
    editor: { selected: _selected, ...editor },
    ...others
  } = scene;
  if (!editor.capture?.startsWith?.('https://')) {
    delete editor.capture;
  }
  return {
    ...others,
    editor: editor as any,
    props: cloneDeep(omit(props[scene.id] || {}, [...keys, 'url', 'state'])),
    state: cloneDeep(props[scene.id].state),
    nodes: intoNodes(nodes, props),
    scripts: intoScripts(scene.scripts || [], props),
  };
}
export function intoNodes(nodes: INodeState[], props: Record<number, Record<string, any>>): RikoNode[] {
  return nodes.map(node => ({
    ...omit(node as Omit<INodeState, 'editor'>, ['name', 'enabled', 'asMask', 'visible']),
    props: cloneDeep(omit(props[node.id], ['type', 'state'])),
    state:
      props[node.id]?.state &&
      Object.fromEntries(
        Object.entries(props[node.id].state).map(([id, state]: any) => {
          return [id, state.scripts ? { ...state, scripts: intoScripts(state.scripts, props) } : state];
        })
      ),
    scripts: intoScripts(node.scripts, props),
    nodes: intoNodes(node.nodes, props),
  }));
}

export function intoScripts(scripts: IScriptState[], props: Record<number, Record<string, any>>): RikoScript[] {
  return scripts.map(
    script =>
      ({
        ...omit(script, [
          'name',
          'enabled',
          'time',
          'duration',
          'loop',
          'script',
          'playBySelf',
          'loopInterval',
          'loopTimes',
        ]),
        props: cloneDeep(omit(props[script.id], ['type'])),
      } as any)
  );
}
export function intoSettings(settings: IGlobalSettings) {
  const newSettings = omit(settings, ['taskStack', 'active']);
  newSettings.enableProps = newSettings.enableProps?.map(prop => {
    return { key: prop.key, default: newSettings[prop.key] };
  });
  return newSettings;
}

/**
 * 将Riko的场景数据格式转化成编辑器的场景数据格式
 * @param scene
 * @returns
 */
export function fromScene(scene: RikoNode): ISceneState {
  const { props: p, editor, nodes = [] } = scene;
  const props = {
    [scene.id]: cloneDeep({
      ...pick(scene, ['name', 'store']),
      ...p,
      ...pick(scene, ['type', 'state']),
    }),
  };
  return {
    ...pick(p, ['name']),
    ...scene,
    editor: {
      scale: 50,
      moment: 0,
      ...(editor as any),
      selected: {},
    },
    props,
    nodes: fromNodes(nodes, props, editor as any),
    scripts: fromScripts(scene.scripts || [], props),
    history: {
      redoStack: [],
      undoStack: [],
    },
  } as any;
}
export function fromNodes(
  nodes: RikoNode[],
  props: Record<number, Record<string, any>>,
  editor: ISceneState['editor']
): INodeState[] {
  const { state } = editor || {};
  return nodes.map(({ props: p = {}, scripts = [], nodes = [], ...node }) => {
    if ('isMask' in p) {
      p.asMask = p.isMask;
      delete p.isMask;
    }
    props[node.id] = cloneDeep({
      ...pick(node, ['name', 'enabled', 'asMask', 'visible']),
      ...p,
      ...pick(node, ['type', 'state']),
    });
    if (node.type === 'Button' && typeof props[node.id]?.url === 'string') {
      props[node.id]!.url = relativeUrl(props[node.id]?.url as string);
    }
    if (props[node.id].state) {
      props[node.id].state = Object.fromEntries(
        Object.entries(props[node.id].state).map(([id, state]: any) => {
          return [id, state.scripts ? { ...state, scripts: fromScripts(state.scripts, props) } : state];
        })
      );
    } else if (state?.length) {
      props[node.id].state = Object.fromEntries(
        state.map(({ id }) => [id, { scripts: duplicateScripts(scripts, props) }])
      );
    }
    return {
      ...node,
      ...pick(props[node.id], ['name', 'enabled', 'asMask', 'visible']),
      scripts: fromScripts(scripts, props),
      nodes: fromNodes(nodes, props, editor),
    } as INodeState;
  });
}

export const duplicateScripts = (scripts: RikoScript[], props: Record<number, Record<string, any>>) => {
  const cloneScripts = (scripts: RikoScript[]): RikoScript[] =>
    scripts &&
    scripts.map(({ id: _, props, ...script }) => ({
      id: newID(),
      ...script,
      props: { ...props, scripts: cloneScripts(props.scripts!), elseScripts: cloneScripts(props.elseScripts! as any) },
    }));
  return fromScripts(cloneScripts(scripts), props);
};

export function fromScripts(
  scripts: RikoScript[],
  props: { [id: number]: Record<string, unknown> | undefined }
): IScriptState[] {
  return scripts.map(({ props: p = {}, ...script }) => {
    props[script.id] = cloneDeep({
      ...pick(script, ['name', 'enabled', 'time', 'duration', 'script']),
      ...p,
      ...pick(script, ['type']),
    });
    return {
      ...script,
      ...pick(props[script.id], [
        'name',
        'enabled',
        'time',
        'duration',
        'script',
        'loop',
        'playBySelf',
        'loopInterval',
        'loopTimes',
      ]),
      type: upperFirst(script.type),
    } as any;
  });
}
