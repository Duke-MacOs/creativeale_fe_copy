import { ICompProp } from '@byted/riko/dist/core';
import { isEqual, uniq } from 'lodash';
import { ISceneState } from '../../aStore';
import { fromScene, intoScene } from '../intoFrom';

// compProps 转 openKeys
export const compPropsToOpenKeys = (scene: ISceneState): ISceneState => {
  const { compProps, ...props } = scene.props[scene.id];
  if (!compProps || !compProps.length) {
    return {
      ...scene,
      props: {
        ...scene.props,
        [scene.id]: props,
      },
    };
  }
  const newScene = intoScene(scene);
  return fromScene({
    ...newScene,
    nodes: Array.from(
      fromNodes(
        newScene.nodes,
        compProps.filter(({ enabled = true }) => enabled),
        scene.type === 'Scene'
      )
    ),
  });
};

function* fromNodes(nodes: RikoNode[] = [], compProps: ICompProp[], enabledDefault: boolean): Generator<RikoNode> {
  for (const node of nodes) {
    yield {
      ...node,
      editor: mergeEditor(
        node.editor,
        compProps.filter(({ ids }) => isEqual(ids, [node.id])),
        enabledDefault
      ),
      props: fromCompProps(node, compProps),
      scripts: Array.from(fromScripts(node.scripts, compProps, enabledDefault)),
      nodes: Array.from(fromNodes(node.nodes, compProps, enabledDefault)),
    };
  }
}

function fromCompProps(node: RikoNode, compProps: ICompProp[]) {
  const { compProps: _compProps = [], ...props } = node.props ?? {};
  if (node.type !== 'Animation') {
    return props;
  }
  return {
    ...props,
    compProps: (_compProps as ICompProp[]).map(compProp => {
      const filtered = compProps.filter(({ ids }) => isEqual(ids, compProp.ids));
      if (filtered.length) {
        const openKeys = uniq(filtered.map(({ props }) => props.map(({ key }) => key)).flat());
        return {
          ...compProp,
          enabled: true,
          props: compProp.props.map(prop => ({ ...prop, enabled: openKeys.includes(prop.key) })),
        };
      }
      return {
        ...compProp,
        enabled: false,
      };
    }),
  };
}

function* fromScripts(
  scripts: RikoScript[] = [],
  compProps: ICompProp[],
  enabledDefault: boolean
): Generator<RikoScript> {
  for (const script of scripts) {
    let { editor } = script;
    if (script.props.script !== 'Conditions') {
      editor = mergeEditor(
        script.editor,
        compProps.filter(({ ids }) => isEqual(ids, [script.id])),
        enabledDefault
      );
    }
    yield {
      ...script,
      editor,
      props: {
        ...script.props,
        scripts: Array.from(fromScripts(script.props.scripts, compProps, enabledDefault)),
      },
    };
  }
}

const mergeEditor = (editor: Record<string, any> | undefined, compProps: ICompProp[], enabledDefault: boolean) => {
  if (compProps.length) {
    const openKeys = uniq(compProps.map(({ props }) => props.map(({ key }) => key)).flat());
    const enabled = enabledDefault ? undefined : true;
    return {
      openKeys,
      enabled,
      ...editor,
    };
  }
  if (enabledDefault) {
    return { ...editor, enabled: false };
  }
  return editor;
};
