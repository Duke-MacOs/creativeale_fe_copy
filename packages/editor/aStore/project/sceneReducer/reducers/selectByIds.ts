import { ActionType, SelectAction } from '@byted/riko';
import reducer, { changeEditor } from './changeEditor';
import { findById, getNodes } from '@editor/utils';
import { ISceneState } from '../../types';
import { omit } from 'lodash';

const ACTION = ActionType.Select;

export const selectNode = (ids: number[]): SelectAction => ({
  type: ACTION,
  ids,
  playing: true,
});

export const selectScript = (ids: number[]): SelectAction => ({
  type: ACTION,
  ids,
});

export default (scene: ISceneState, { type, ids }: SelectAction): ISceneState => {
  if (type === ACTION) {
    const selected = {} as typeof scene.editor.selected;
    const nodes = getNodes(scene);
    for (const scriptId of ids) {
      const [node] = findById(nodes, scriptId, true);
      if (node) {
        if (node.id in selected) {
          selected[node.id].push(scriptId);
        } else {
          selected[node.id] = [scriptId];
        }
      } else {
        if (Object.keys(selected).length) {
          console.warn(`The selecting script id ${scriptId} not existing:`, ids);
        }
        break;
      }
    }
    if (Object.keys(selected).length) {
      return {
        ...scene,
        editor: {
          ...scene.editor,
          selectedInnerNode: undefined,
          selected,
        },
      };
    }
    if (!ids.length) {
      return {
        ...scene,
        editor: {
          ...scene.editor,
          selectedInnerNode: undefined,
          selected: {},
        },
      };
    }
    const parents = findById(scene.nodes, ids[0]);
    const nodeIds = (parents[1] || scene).nodes.filter(({ id }) => ids.includes(id)).map(({ id }) => id);
    for (const parent of parents.slice(1)) {
      if (parent.editor?.isCollapsed) {
        scene = reducer(scene, changeEditor(parent.id, { isCollapsed: false }));
      }
    }
    if (nodeIds.length) {
      return {
        ...scene,
        editor: {
          ...omit(scene.editor, 'selectedInnerNode'),
          selected: Object.fromEntries(nodeIds.map(id => [id, []])),
        },
      };
    }

    const selectedInnerNode = ids.reduce((ids, id) => {
      const [pid] = getInnerNodeId(scene, id);
      if (pid) {
        ids.push(id);
        selected[pid] = [];
      }
      return ids;
    }, [] as number[]);
    return {
      ...scene,
      editor: {
        ...scene.editor,
        selected,
        selectedInnerNode,
      },
    };
  }
  return scene;
};

// 获取compProps中的动态节点
export function getInnerNodeId(scene: ISceneState, id: number): any {
  const nodes = getNodes(scene);
  const { props } = scene;
  const find = (items: any[]): any => {
    for (const item of items) {
      if (Array.isArray(item)) {
        const node = find(item);
        if (node) {
          return node;
        }
      } else if (item && typeof item === 'object') {
        if (item.id === id && typeof item.type === 'string') {
          return item;
        }
        const node = find(Object.values(omit(item, 'default')));
        if (node) {
          return node;
        }
      }
    }
  };
  for (const [pid, prop] of Object.entries(props)) {
    const node = find(Object.values(prop));
    if (node) {
      if (prop.type === 'Script') {
        const [{ id }] = findById(nodes, Number(pid), true);
        return [id, node];
      }
      return [Number(pid), node];
    }
  }
  return [0, {}];
}
