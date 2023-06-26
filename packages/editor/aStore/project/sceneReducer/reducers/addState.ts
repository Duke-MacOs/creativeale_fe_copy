import { findById, intoScripts, duplicateScripts } from '@editor/utils';
import { ISceneState, IScriptState } from '../../types';
const ACTION = Symbol('AddState');

export const addState = (name: string, id: number) => {
  return {
    type: ACTION,
    stateItem: { name, id },
  };
};

export default (scene: ISceneState, action: ReturnType<typeof addState>): ISceneState => {
  if (action.type === ACTION) {
    const {
      editor: { state = [], stateId },
    } = scene;
    return {
      ...scene,
      props: cloneState({ ...scene, nodes: scene.nodes[0].nodes }, action.stateItem.id, stateId),
      editor: { ...scene.editor, state: [...state, action.stateItem] },
    };
  }
  return scene;
};

const cloneState = ({ props, nodes }: ISceneState, newStateId: number, oldStateId?: number) => {
  const newProps = {} as typeof props;
  for (const [idKey, prop] of Object.entries(props)) {
    if (!oldStateId) {
      const [node] = findById(nodes, Number(idKey));
      if (!node) {
        newProps[Number(idKey)] = prop;
      } else {
        newProps[Number(idKey)] = {
          ...prop,
          state: {
            ...prop.state,
            [newStateId]: {
              scripts: duplicateScripts(intoScripts(node.scripts || [], props), newProps).map(script => ({
                ...script,
                editor: {
                  ...script.editor,
                  enabled: false,
                },
              })),
            },
          },
        };
      }
    } else if (prop.state) {
      const oldState = prop.state[oldStateId];
      const scripts = duplicateScripts(intoScripts(oldState.scripts as IScriptState[], props), newProps).map(
        script => ({
          ...script,
          editor: {
            ...script.editor,
            enabled: false,
          },
        })
      );
      newProps[Number(idKey)] = {
        ...prop,
        state: { ...prop.state, [newStateId]: { ...oldState, scripts } },
        compProps: prop.compProps?.map(compProp => {
          return {
            ...compProp,
            ...(compProp.state
              ? {
                  state: {
                    ...compProp.state,
                    [newStateId]: compProp.state?.[oldStateId],
                  },
                }
              : {}),
          };
        }),
      };
    } else {
      newProps[Number(idKey)] = prop;
    }
  }
  return newProps;
};
