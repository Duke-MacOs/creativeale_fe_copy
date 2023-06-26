import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { message } from 'antd';
import { findById, getNodes, getScene, getSelectedIds } from '../../../utils';
import { clipboard, duplicateComponent } from './utils';
import {
  addComponent,
  addCustomScript,
  addFromNode,
  addScript,
  groupActions,
  selectNode,
  selectScript,
  changeProps,
  updateNodeId,
  updateScriptId,
  changeEditor,
  addMaterial,
  addTexture2D,
} from '../../project';
import { consumeEvent } from '..';

export const useOnPaste = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const canPasteScripts = useCallback(() => {
    const { type: caseType } = getState().project;
    if (caseType === 'Model') {
      return false;
    }

    return Boolean(clipboard.getValue()?.scripts?.length);
  }, [getState]);

  const canPasteNodes = useCallback(() => {
    const { type: caseType } = getState().project;
    if (caseType === 'Model') {
      return false;
    }

    return Boolean(clipboard.getValue()?.nodes?.length);
  }, [getState]);

  return {
    canPasteNodes,
    canPasteScripts,
    onPaste: useCallback(
      async (startTime?: number) => {
        const { userinfo, project } = getState();
        let clipboardContent = clipboard.getValue();
        if (!clipboardContent || String(clipboardContent.userId) !== String(userinfo?.userId)) {
          return;
        } else if (clipboardContent.projectId !== project.id && clipboardContent[project.id]) {
          clipboardContent = clipboardContent[project.id];
        }
        const scene = getScene(project);
        const sceneNodes = getNodes(scene);
        const { nodeIds, scriptIds } = getSelectedIds(scene.editor.selected);
        const { projectId = 0, events, scripts, nodes, position: startPosition } = clipboardContent;
        const { copyNode, copyScript, createScenes } = duplicateComponent(project, projectId);
        const actions = [] as Array<EditorAction>;
        const pushAction = (action: EditorAction, index?: number) => {
          if (index !== undefined) {
            actions.splice(index, 0, action);
          } else {
            actions.push(action);
          }
        };
        try {
          dispatch(changeEditor(0, { loading: projectId !== project.id }));
          if (events?.length) {
            const { set } = consumeEvent();
            if (!(await set(async () => updateScriptId(await copyScript(events))[0]))) {
              // 粘贴事件
              const actions = scriptIds
                .filter(scriptId => {
                  const [node] = findById(sceneNodes, scriptId, true);
                  return node?.scripts?.find(({ id, type }) => id === scriptId && type === 'Script');
                })
                .map(async scriptId => {
                  const copiedEvents = updateScriptId(await copyScript(events));
                  return changeProps([scriptId], {
                    scripts: ((scene.props[scriptId].scripts as any) || []).concat(copiedEvents),
                  });
                });
              if (actions.length) {
                pushAction(groupActions(await Promise.all(actions)));
              }
            }
          } else if (scripts?.length) {
            // 粘贴脚本
            const filter = (scripts: RikoScript[], nodeId: number) => {
              const [node] = findById(sceneNodes, nodeId);
              let hasIgnoredControllers = false;
              try {
                return scripts.filter(script => {
                  if (script.type === 'Controller') {
                    if (script.id !== node.id) {
                      hasIgnoredControllers = true;
                    }
                    // Controller 粘贴到自身
                    return script.id === node.id;
                  }
                  if (script.type === 'Effect') {
                    // Sound 节点不支持动画效果
                    return node.type !== 'Sound';
                  }

                  if (script.type === 'Blueprint') {
                    return node.scripts.every(script => script.type !== 'Blueprint');
                  }
                  return true;
                });
              } finally {
                if (hasIgnoredControllers) {
                  message.warning('控制条只能粘贴到自身节点');
                }
              }
            };
            const deltaTime = startTime ? startTime - Math.min(...scripts.map(({ props: { time = 0 } }) => time)) : 0;
            const copiedScripts = await copyScript(scripts);
            const actions = nodeIds.reduce(
              (actions, id) =>
                actions.concat(
                  updateScriptId(filter(copiedScripts, id)).map(script =>
                    addScript(id, { ...script, props: { ...script.props, time: (script.props.time ?? 0) + deltaTime } })
                  )
                ),
              [] as ReturnType<typeof addScript>[]
            );
            if (actions.length) {
              pushAction(groupActions(actions));
              pushAction(selectScript(actions.map(({ script: { id } }) => id)));
              return scripts
                .map(script => script.props?.name)
                .filter(Boolean)
                .join(',');
            }
          } else if (nodes?.length) {
            // 粘贴节点
            const { contextMenu } = project.editor;
            const endPosition = contextMenu && contextMenu.x + contextMenu.x >= 0 ? contextMenu : undefined;
            const copiedNodes = updateNodeId(await copyNode(nodes));
            if (!nodeIds.length) {
              pushAction(
                groupActions(
                  copiedNodes.map((node, index) =>
                    addFromNode(scene.id, scene.nodes.length + index, node, startPosition, endPosition)
                  )
                )
              );
            } else {
              const [, parent = scene] = nodeIds.reduce(
                (parents, id) => (parents.length ? parents : findById(sceneNodes, id)),
                [] as ReturnType<typeof findById>
              );
              let startIndex = Math.max(...nodeIds.map(id => parent.nodes.findIndex(node => node.id === id))) + 1;
              if (startIndex === 0) {
                startIndex = parent.nodes.length;
              }
              pushAction(
                groupActions(
                  copiedNodes.map((node, index) =>
                    addFromNode(parent.id, startIndex + index, node, startPosition, endPosition)
                  )
                )
              );
            }
            setTimeout(() => {
              dispatch(selectNode(copiedNodes.map(node => node.id)));
            });
          }
        } finally {
          const { components, customScripts, materials, texture2Ds } = await createScenes();
          for (const component of components) {
            pushAction(addComponent(component), 0);
          }
          for (const script of customScripts) {
            pushAction(addCustomScript(script));
          }
          for (const material of materials) {
            pushAction(addMaterial(material), 0);
          }
          for (const texture2D of texture2Ds) {
            pushAction(addTexture2D(texture2D), 0);
          }
          // 将材质用到的 Texture2D 复制过来
          for (const action of actions) {
            dispatch(action);
          }
          dispatch(changeEditor(0, { loading: false }));
        }
      },
      [dispatch, getState]
    ),
  };
};
