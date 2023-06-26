import { fromScripts, intoScripts, mapResNode, selfKeys } from '../../../../utils';
import { ActionFlag, ActionType, IScriptData, PropertyAction } from '@byted/riko';
import { ISceneState, ICompProp, IScriptState } from '../../types';
import { cloneDeep, isEqual, mapValues } from 'lodash';
import { replaceNode } from './utils';

const ACTION = ActionType.Property;
export interface IPropertyAction extends PropertyAction {
  undo?: IPropertyAction;
  playing?: boolean;
  replace?: boolean;
}

export const changeProps = (
  ids: number[],
  partial: Record<string, unknown>,
  options?: {
    playing?: boolean;
    replace?: boolean; // 替换
    flag?: ActionFlag;
  }
): IPropertyAction => ({
  type: ACTION,
  ids,
  partial,
  ...options,
});

export default (scene: ISceneState, action: ReturnType<typeof changeProps>): ISceneState => {
  if (action.type === ACTION) {
    const { stateId } = scene.editor;
    const [targetId, ...compIds] = action.ids;
    // 计算最新数据、变更数据
    const [props, undoPartial] = updateSceneProps(scene.props, targetId, props => {
      if (compIds.length !== 0) {
        return mergeAndFlipCompProps(compIds, props as any, action.partial, stateId);
      }
      if (action.replace) {
        if (action.partial['type'] || !(props as any).type) {
          return [cloneDeep(action.partial), props] as any;
        }
        return [cloneDeep({ ...action.partial, type: (props as any).type }), props] as any;
      }
      return mergeAndFlip(props, cloneDeep(action.partial) as any, stateId);
    });
    if (undoPartial) {
      action.undo = { ...action, partial: undoPartial };
      if (action.flag !== ActionFlag.Continuous && scene.props[targetId] && compIds.length === 0) {
        return updateSelf({ ...scene, props }, targetId, action);
      }
      return {
        ...scene,
        props,
      };
    }
    console.warn('No such id in current scene', action);
  }
  return scene;
};

export const mergeAndFlip = <T>(props: T, partial: Partial<T>, stateId?: number): [T, Partial<T>] => {
  if (stateId && (props as any).state?.[stateId]) {
    const [state, undoPartial] = mergeAndFlip((props as any).state?.[stateId], partial);
    return [{ ...props, state: { ...(props as any).state, [stateId]: state } }, undoPartial];
  }
  return [
    { ...props, ...partial },
    (Object.keys(partial) as Array<keyof T>).reduce((o: Partial<T>, k) => {
      o[k] = props?.[k];
      return o;
    }, {} as Partial<T>),
  ];
};

const updateSceneProps = (
  props: ISceneState['props'],
  targetId: number,
  mergeAndFlip: <T>(props: T) => [T, Partial<T>?]
) => {
  const newProps = {} as typeof props;
  let undoPartial: Record<string, unknown> | undefined = undefined;
  const updateScriptProps = <T extends Record<string, unknown>>(props: T): T => {
    const scripts = {} as Record<'scripts' | 'elseScripts', IScriptData[]>;
    for (const key of ['scripts', 'elseScripts'] as const) {
      if (Array.isArray(props[key])) {
        scripts[key] = [];
        for (const script of props[key] as IScriptData[]) {
          if (undoPartial) {
            scripts[key].push(script);
          } else if (script.id === targetId) {
            const [props, partial] = mergeAndFlip(script.props);
            undoPartial = partial;
            scripts[key].push({
              ...script,
              props,
            });
          } else {
            scripts[key].push({
              ...script,
              props: mapValues(script.props, (value, key) =>
                key.startsWith('$')
                  ? (mapResNode(value as any, node => {
                      if (node?.id === targetId) {
                        const [{ state, ...props }, partial] = mergeAndFlip({
                          ...node.props,
                          state: node.state,
                        }) as any;
                        undoPartial = partial;
                        return { ...node, props, state };
                      }
                      return node;
                    }) as any)
                  : value
              ),
            });
          }
        }
      }
    }
    return undoPartial ? { ...props, ...scripts } : props;
  };
  for (const [key, prop] of Object.entries(props)) {
    const currentId = Number(key);
    if (undoPartial) {
      newProps[currentId] = prop;
    } else if (currentId === targetId) {
      const [nodeProps, partial] = mergeAndFlip(prop);
      newProps[currentId] = nodeProps;
      undoPartial = partial;
    } else {
      newProps[currentId] = updateScriptProps(prop);
    }
  }
  return [undoPartial ? newProps : props, undoPartial] as const;
};

const mergeAndFlipCompProps = (
  ids: number[],
  props: Record<string, unknown>,
  partial: Record<string, unknown>,
  stateId?: number
) => {
  let undoPartial: Record<string, unknown> = {};
  const compProps = (props.compProps as ICompProp[]).map(comp => {
    if (isEqual(comp.ids, ids)) {
      if (stateId) {
        return {
          ...comp,
          name: partial.name ?? comp.name,
          state: {
            ...comp.state,
            [stateId]: {
              ...comp.state?.[stateId],
              ...partial,
            },
          },
        };
      }
      return {
        ...comp,
        name: partial.name ?? comp.name,
        props: comp.props.map(prop => {
          if (prop.key in partial) {
            undoPartial[prop.key] = prop.value;
            return {
              ...prop,
              value: partial[prop.key],
            };
          }
          return prop;
        }),
      };
    }
    return {
      ...comp,
      props: comp.props.map(prop => {
        if (prop.key.startsWith('$')) {
          return {
            ...prop,
            value: mapResNode(prop.value as any, node => {
              if (node.id === ids[ids.length - 1]) {
                const [{ state, ...props }, partial1] = mergeAndFlip(
                  { ...node.props, state: node.state },
                  partial,
                  stateId
                ) as any;
                undoPartial = partial1;
                return { ...node, props, state };
              }
              return node;
            }),
          };
        }
        return prop;
      }),
    };
  });
  return [{ ...props, compProps }, undoPartial];
};

function updateSelf(scene: ISceneState, nodeId: number, { partial, replace }: IPropertyAction) {
  const selfEntries = selfKeys.reduce((entries, key) => {
    if (key in partial) {
      entries.push([key, partial[key]]);
    }
    return entries;
  }, [] as [string, any][]);
  if (!selfEntries.length) {
    return scene;
  }
  const self = Object.fromEntries(selfEntries);
  if (nodeId === scene.id) {
    return {
      ...scene,
      ...self,
    };
  }
  const nodes = replaceNode(scene.nodes, node => {
    if (node.id === nodeId) {
      return {
        ...node,
        ...self,
      };
    }
    if (node.scripts.find(({ id }) => id === nodeId)) {
      return {
        ...node,
        scripts: node.scripts.map(script =>
          script.id === nodeId ? (replace ? updateScriptSelf(script, partial) : { ...script, ...self }) : script
        ),
      };
    }
    return node;
  });
  if (nodes !== scene.nodes || !scene.editor.stateId) {
    return {
      ...scene,
      nodes,
    };
  }
  return {
    ...scene,
    props: mapValues(scene.props, props => {
      const state = props.state?.[scene.editor.stateId!];
      if (state?.scripts?.find(({ id }) => id === nodeId)) {
        return {
          ...props,
          state: {
            ...props.state,
            [scene.editor.stateId!]: {
              ...state,
              scripts: state.scripts.map(script =>
                script.id === nodeId ? (replace ? updateScriptSelf(script, partial) : { ...script, ...self }) : script
              ),
            },
          },
        };
      }
      return props;
    }),
  };
}

export const updateScriptSelf = (script: IScriptState, partial: IPropertyAction['partial']) => {
  const props = { [script.id]: partial };
  return fromScripts(intoScripts([script], props), props)[0];
};
