import { ActionFlag, ActionType, EditorPropertyAction } from '@byted/riko';
import { mergeAndFlip, replaceNode } from '..';
import { ICaseState, INodeState, ISceneState, IScriptState } from '../../types';
export interface IEditorPropertyAction extends EditorPropertyAction {
  undo?: IEditorPropertyAction;
  playing?: boolean;
}
const ACTION = ActionType.EditorProperty;

export const changeEditor = (
  nodeId: number,
  partial: Partial<
    | ICaseState['editor']
    | ISceneState['editor']
    | NonNullable<INodeState['editor']>
    | NonNullable<IScriptState['editor']>
  >,
  playing = false,
  flag?: ActionFlag.SideEffect
): IEditorPropertyAction => ({
  type: ACTION,
  nodeId,
  partial,
  playing,
  flag,
});
export default (scene: ISceneState, action: ReturnType<typeof changeEditor>): ISceneState => {
  if (action.type === ACTION) {
    const { nodeId, partial } = action;
    return replaceNode([scene as INodeState], node => {
      if (node.id === nodeId) {
        const [editor, undoPartial] = mergeAndFlip(node.editor || {}, partial);
        for (const key of ['edit3d', 'stateId']) {
          if (key in partial) {
            action.undo = changeEditor(nodeId, undoPartial);
          }
        }
        return {
          ...node,
          editor,
        };
      }
      if (node.scripts?.find(({ id }) => id === nodeId)) {
        return {
          ...node,
          scripts: node.scripts.map(script => {
            if (script.id === nodeId) {
              const [editor] = mergeAndFlip(script.editor || {}, partial);
              return {
                ...script,
                editor,
              };
            }
            return script;
          }),
        };
      }
      return node;
    })[0] as any;
  }
  return scene;
};
