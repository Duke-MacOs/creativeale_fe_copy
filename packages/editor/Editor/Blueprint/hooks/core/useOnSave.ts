import { usePersistCallback } from '@byted/hooks';
import { ActionFlag } from '@byted/riko';
import { addScript, groupActions, changeEditor, changeProps, SceneAction, delScript } from '@editor/aStore';
import { getScene } from '@editor/utils';
import { Node, Edge } from 'react-flow-renderer';
import { useStore } from 'react-redux';
import { isRoot, IState } from '../../types';
import { flowToScript } from '../../utils';
import { findBlueprintByNode, findBlueprintByScene } from './useOnInit';

/**
 * 保存蓝图数据
 * @param param0
 * @returns
 */
export function useOnSave({ state, nodes, edges }: { state: IState; nodes: Node[]; edges: Edge[] }) {
  const { dispatch, getState } = useStore<EditorState>();
  return usePersistCallback(() => {
    if (!state) return;
    const script = flowToScript(
      nodes.map(node => (node.selected ? { ...node, selected: false } : node)),
      edges
    );
    switch (state.type) {
      case 'Node': {
        return updateNodeBlueprint(state.id, script);
      }
      case 'Scene': {
        return updateSceneBlueprint(state.id, script);
      }
      case 'Project': {
        return;
        // return updateProjectBlueprint(script);
      }
      case 'Script': {
        const { parent: parentState } = state;
        if (!parentState) return;
        switch (parentState.type) {
          case 'Scene':
          case 'Node': {
            const scene = getScene(getState().project);
            const parentScript =
              parentState.type === 'Node' ? findBlueprintByNode(scene, parentState.id) : findBlueprintByScene(scene);
            if (parentScript) {
              const newParentScript = replaceScript(parentScript, oldScript =>
                oldScript.id === script.id ? script : oldScript
              );
              (parentState.type === 'Node' ? updateNodeBlueprint : updateSceneBlueprint)(
                parentState.id,
                newParentScript
              );
            }
            break;
          }
          default: {
            return;
          }
        }
      }
    }

    function replaceScript(script: RikoScript, map: (script: RikoScript) => RikoScript): RikoScript {
      const newScript = map(script);
      if (script === newScript) {
        for (const s of script.props.scripts || []) {
          const newS = replaceScript(s, map);
          if (s !== newS) {
            return {
              ...script,
              props: {
                ...script.props,
                scripts: (script.props.scripts || []).map(script => (script === s ? newS : script)),
              },
            };
          }
        }
      }
      return newScript;
    }

    function updateNodeBlueprint(nodeId: number, script: RikoScript) {
      const { props } = getScene(getState().project);
      if (!props[script.id]) {
        dispatch(addScript(nodeId, script));
      } else {
        dispatch(
          groupActions([
            changeEditor(script.id, script.editor!),
            changeProps([script.id], script.props, { replace: true }),
          ])
        );
      }
    }

    function updateSceneBlueprint(sceneId: number, script: RikoScript) {
      const { props } = getScene(getState().project);
      const scripts = (script.props.scripts || []).filter(
        script => script.type === 'Blueprint' && isRoot(script.editor?.nodeType)
      );
      const ids = Object.entries(props)
        .filter(([key, prop]) => Number(key) !== script.id && prop.type === 'Blueprint')
        .map(([key]) => Number(key));
      const actions = ids.reduce((actions, id) => {
        const script = scripts.find(script => script.id === id);
        if (script && script.editor) {
          actions.push(changeEditor(id, script.editor), changeProps([id], script.props, { replace: true }));
        } else {
          actions.push(delScript(id));
        }
        return actions;
      }, [] as SceneAction[]);

      if (!props[script.id]) {
        actions.push(
          addScript(sceneId, {
            ...script,
            props: {
              ...script.props,
              scripts: (script.props.scripts || []).filter(({ editor: { nodeType } = {} }) => !isRoot(nodeType)),
            },
          })
        );
      } else {
        actions.push(
          changeEditor(script.id, script.editor!),
          changeProps(
            [script.id],
            {
              ...script.props,
              scripts: (script.props.scripts || []).filter(({ editor: { nodeType } = {} }) => !isRoot(nodeType)),
            },
            { replace: true }
          )
        );
      }
      dispatch(groupActions(actions, ActionFlag.EditorOnly));
    }

    // function updateProjectBlueprint(script: RikoScript) {
    //   const { selectedSceneId } = getState().project.editor;
    //   const scenes = getState().project.scenes.filter(({ type, editor }) => type === 'Scene' && !editor.loading);
    //   dispatch(
    //     setSettings({
    //       blueprint: {
    //         ...script,
    //         props: {
    //           ...script.props,
    //           scripts: script.props.scripts?.filter(({ editor: { nodeType } = {} }) => !isRoot(nodeType)),
    //         },
    //       },
    //     })
    //   );
    //   script.props.scripts
    //     ?.filter(({ type, editor: { nodeType } = {} }) => type === 'Blueprint' && nodeType === 'scene')
    //     .map(script => ({
    //       ...script,
    //       editor: {
    //         ...script.editor,
    //         outputs: script.editor?.outputs?.slice(),
    //         inputs: script.editor?.inputs?.slice(),
    //       },
    //     }))
    //     .forEach((script, index) => {
    //       dispatch(changeEditor(0, { selectedSceneId: scenes[index].id }));
    //       if (intoScripts(scenes[index].scripts || [], scenes[index].props).find(({ type }) => type === 'Blueprint')) {
    //         dispatch(
    //           groupActions([
    //             changeEditor(script.id, script.editor!),
    //             changeProps(
    //               [script.id],
    //               {
    //                 ...script.props,
    //                 scripts: script.props.scripts?.filter(({ editor: { nodeType } = {} }) => !isRoot(nodeType)),
    //               },
    //               { replace: true }
    //             ),
    //           ])
    //         );
    //       } else {
    //         dispatch(addScript(scenes[index].id, script));
    //       }
    //     });
    //   dispatch(changeEditor(0, { selectedSceneId }));
    // }
  });
}
