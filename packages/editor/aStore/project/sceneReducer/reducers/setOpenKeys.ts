import { findEventById } from '@editor/utils';
import { isEqual } from 'lodash';
import { replaceNode } from '..';
import { ISceneState } from '../../types';

const ACTION = Symbol('SetOpenKeys');

export const setOpenKeys = (ids: number[], { openKeys, enabled }: { openKeys?: string[]; enabled?: boolean }) => ({
  type: ACTION,
  ids,
  openKeys,
  enabled,
});

export default (scene: ISceneState, action: ReturnType<typeof setOpenKeys>): ISceneState => {
  if (action.type === ACTION) {
    if (action.ids.length > 1) {
      // set in compProps
      return setCompProps(scene, action);
    }
    if (!scene.props[action.ids[0]]) {
      // 子脚本
      return setScripts(scene, action);
    }
    return setNodes(scene, action);
  }
  return scene;
};

const setCompProps = (
  scene: ISceneState,
  { ids: [nodeId, ...compIds], openKeys, enabled }: ReturnType<typeof setOpenKeys>
) => {
  return {
    ...scene,
    props: {
      ...scene.props,
      [nodeId]: {
        ...scene.props[nodeId],
        compProps: scene.props[nodeId].compProps?.map(compProp => {
          if (isEqual(compProp.ids, compIds)) {
            if (openKeys) {
              return {
                ...compProp,
                props: compProp.props.map(prop => {
                  return {
                    ...prop,
                    enabled: openKeys.includes(prop.key),
                  };
                }),
              };
            }
            return {
              ...compProp,
              enabled,
            };
          }
          return compProp;
        }),
      },
    },
  };
};

const setScripts = (scene: ISceneState, action: ReturnType<typeof setOpenKeys>) => {
  const { id, props } = findEventById(scene.props, action.ids[0]).reduce((child, parent) => {
    return {
      ...parent,
      props: {
        ...parent.props,
        scripts: (parent.props.scripts as RikoScript[]).map(script => {
          if (script.id === child.id) {
            if (child.id === action.ids[0]) {
              return setEditor(child as any, action);
            }
            return child;
          }
          return script;
        }),
        ...(parent.props.script === 'Conditions'
          ? {
              elseScripts: (parent.props.elseScripts as RikoScript[]).map(script => {
                if (script.id === child.id) {
                  if (child.id === action.ids[0]) {
                    return setEditor(child as any, action);
                  }
                  return child;
                }
                return script;
              }),
            }
          : {}),
      },
    };
  });

  return { ...scene, props: { ...scene.props, [id]: props as any } };
};

const setNodes = (scene: ISceneState, action: ReturnType<typeof setOpenKeys>) => {
  return {
    ...scene,
    nodes: replaceNode(scene.nodes, node => {
      if (node.id === action.ids[0]) {
        return setEditor(node, action);
      }
      if (node.scripts.find(({ id }) => id === action.ids[0])) {
        return {
          ...node,
          scripts: node.scripts.map(script => {
            if (script.id === action.ids[0]) {
              return setEditor(script, action);
            }
            return script;
          }),
        };
      }
      return node;
    }),
  };
};

const setEditor = <N extends { editor?: any }>(item: N, action: ReturnType<typeof setOpenKeys>) => {
  const { editor = {} } = item;
  const { openKeys = editor.openKeys, enabled = editor.enabled } = action;
  return {
    ...item,
    editor: {
      ...editor,
      openKeys,
      enabled,
    },
  };
};
