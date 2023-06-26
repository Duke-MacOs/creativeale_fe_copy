import { ActionType, DeleteAction } from '@byted/riko';
import { findById, intoNodes, isAnimation } from '@editor/utils';
import { INodeState, ISceneState } from '../../types';
import { addFromNode, IAddNode } from './addNode';
import { addScript, IAddScript } from './addScript';
import { extractNode, replaceNode } from './utils';

const ACTION = ActionType.Delete;

export interface IDeleteAction extends DeleteAction {
  undo?: IAddNode | IAddScript;
}

export const delNode = (id: number): IDeleteAction => ({
  type: ACTION,
  id,
});

export const delScript = delNode;

function del(nodes: INodeState[], props: any, selected: any) {
  for (const node of nodes) {
    delete props[node.id];
    delete selected[node.id];
    for (const script of node.scripts) {
      delete props[script.id];
    }
    del(node.nodes, props, selected);
  }
}

export default (scene: ISceneState, action: IDeleteAction): ISceneState => {
  if (action.type === ACTION) {
    const [nodes, node] = extractNode(scene.nodes, action.id);
    if (node) {
      const [, parent = scene] = findById(scene.nodes, action.id);
      if (parent) {
        action.undo = addFromNode(
          parent.id,
          parent.nodes.findIndex(({ id }) => id === node.id),
          intoNodes([node], scene.props)[0]
        );
      }
      const selected = { ...scene.editor.selected };
      const props = { ...scene.props };
      del([node], props, selected);
      return {
        ...scene,
        editor: {
          ...scene.editor,
          selected,
        },
        nodes,
        props,
      };
    } else if (
      !scene.editor.stateId ||
      (isAnimation(scene.type) && scene.nodes[0] === findById(scene.nodes, action.id, true)[0]) // 互动组件根节点
    ) {
      const nodes = replaceNode(scene.nodes, node => {
        if (node.scripts.find(script => script.id === action.id)) {
          return {
            ...node,
            scripts: node.scripts.filter(script => {
              if (script.id !== action.id) {
                return true;
              }
              action.undo = addScript(node.id, { ...script, props: scene.props[script.id] as any });
              return false;
            }),
          };
        }
        return node;
      });
      if (nodes !== scene.nodes) {
        const { [action.id]: _, ...props } = scene.props;
        const selected = Object.entries(scene.editor.selected).map(([key, val]) => [
          key,
          val.filter(id => id !== action.id),
        ]);
        return {
          ...scene,
          editor: {
            ...scene.editor,
            selected: Object.fromEntries(selected),
          },
          props,
          nodes,
        };
      }
    } else {
      return {
        ...scene,
        editor: {
          ...scene.editor,
          selected: {},
        },
        props: Object.entries(scene.props).reduce((props, [idKey, prop]) => {
          if (Number(idKey) === action.id) {
            return props;
          }
          const state = prop.state?.[scene.editor.stateId!];
          if (state?.scripts?.find(({ id }) => id === action.id)) {
            props[Number(idKey)] = {
              ...prop,
              state: {
                ...prop.state,
                [scene.editor.stateId!]: { ...state, scripts: state.scripts.filter(({ id }) => id !== action.id) },
              },
            };
          } else {
            props[Number(idKey)] = prop;
          }
          return props;
        }, {} as typeof scene.props),
      };
    }
  }
  return scene;
};
