import { useCallback } from 'react';
import { useSelector, useStore } from 'react-redux';
import { findById, getScene, getSelectedIds, intoNodes, sortedNodes, getNodes } from '../../../utils';
import { useOnDelete } from '../useOnDelete';
import { clipboard } from './utils';
import { copyText } from '@shared/utils';
import { consumeEvent } from '@editor/aStore';
import { message } from 'antd';
import { PVVideoIsSelected } from '@editor/utils';

export const useOnCopy = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  const { onDelete } = useOnDelete();

  const queryCanCopy = useCallback(({ project }: EditorState) => {
    return Object.keys(getScene(project).editor.selected).length > 0;
  }, []);

  return {
    canCopy: useSelector(queryCanCopy),
    onCopy: useCallback(
      (isCut = false) => {
        const canCopy = queryCanCopy(getState());

        if (PVVideoIsSelected(getState)) {
          message.warning('不允许执行该操作');
          return;
        }
        if (!canCopy) {
          return;
        }
        const { userinfo, project } = getState();
        const scene = getScene(project);
        const {
          editor: { selected },
          props,
        } = scene;
        const nodes = getNodes(scene);
        const { scriptIds, nodeIds } = getSelectedIds(selected);
        const { get } = consumeEvent();
        const event = get();
        if (event) {
          if (event.props.script === 'DownloadApp') {
            message.warning(`不能${isCut ? '剪切' : '复制'}下载APP事件`);
            return clipboard.setValue(null);
          } else {
            copyText(event.props.name);
            clipboard.setValue({
              userId: userinfo?.userId,
              projectId: project.id,
              events: [event],
            });
          }
        } else if (scriptIds.length) {
          // 复制脚本
          const scripts = scriptIds.reduce((scripts, scriptId) => {
            const [node] = findById(nodes, scriptId, true);
            const script = node?.scripts.find(({ id }) => id === scriptId);
            if (script) {
              scripts.push({
                ...script,
                // id 替换成所在节点 id, 用于实现控制条只能克隆到自身
                id: node.id,
                props: props[script.id] as any,
              });
            }
            return scripts;
          }, [] as RikoScript[]);
          if (scripts.length) {
            copyText(scripts.map(({ props: { name } }) => name).join(','));
            clipboard.setValue({
              userId: userinfo?.userId,
              projectId: project.id,
              scripts,
            });
          }
        } else if (nodeIds.length) {
          // 复制节点
          const { contextMenu } = project.editor;
          const copiedNodes = sortedNodes(nodes, nodeIds);
          copyText(copiedNodes.map(({ name }) => name).join(','));
          clipboard.setValue({
            userId: userinfo?.userId,
            projectId: project.id,
            nodes: intoNodes(copiedNodes, props),
            position: contextMenu && contextMenu.x + contextMenu.x >= 0 ? contextMenu : undefined,
          });
        }
        if (isCut) {
          onDelete();
        }
        message.success(`${isCut ? '剪切' : '复制'}成功`);
      },
      [getState, onDelete]
    ),
  };
};
