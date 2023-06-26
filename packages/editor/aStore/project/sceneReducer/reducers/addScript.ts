import { ActionType, AddScriptAction, IScriptData } from '@byted/riko';
import { fromScripts } from '@editor/utils';
import { ISceneState } from '../../types';
import { IDeleteAction, delScript } from './deleteById';
import { replaceNode } from './utils';
export interface IAddScript extends Omit<AddScriptAction, 'script'> {
  script: IScriptData;
  undo?: IDeleteAction;
}
const ACTION = ActionType.AddScript;
export const addScript = (nodeId: number, script: IAddScript['script']): IAddScript => ({
  type: ACTION,
  nodeId,
  script,
});
export default (scene: ISceneState, action: ReturnType<typeof addScript>): ISceneState => {
  if (action.type === ACTION) {
    const props = { ...scene.props };
    const {
      editor: { stateId },
    } = scene;
    const script = fromScripts([action.script as any], props)[0];
    if (scene.type === 'Scene' && scene.id === action.nodeId) {
      return {
        ...scene,
        scripts: [script].concat(scene.scripts ?? []), // 暂时先直接替换,
        props,
      };
    }

    if (stateId && props[action.nodeId]?.state?.[stateId]) {
      props[action.nodeId].state = {
        ...props[action.nodeId].state,
        [stateId]: {
          ...props[action.nodeId]?.state?.[stateId],
          scripts: [...(props[action.nodeId]?.state?.[stateId].scripts || []), script],
        },
      };
      return {
        ...scene,
        props,
      };
    } else {
      const nodes = replaceNode(scene.nodes, node => {
        if (node.id === action.nodeId) {
          action.undo = delScript(script.id);
          return {
            ...node,
            scripts: node.scripts.concat(script as any),
          };
        }
        return node;
      });
      if (nodes !== scene.nodes) {
        return {
          ...scene,
          props,
          nodes,
        };
      }
    }
  }
  return scene;
};
