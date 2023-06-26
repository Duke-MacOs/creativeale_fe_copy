import { message } from 'antd';
import { useCallback } from 'react';
import { useOnEdges, useOnNodes } from '..';
import { localBlueprint } from '../..';
import { updateFlowIds } from '../../utils';
import { Node } from 'react-flow-renderer';
import { useStore } from 'react-redux';
import { duplicateComponent } from '@editor/aStore/selectors/useClipboard/utils';
import { addComponent, addCustomScript, nameWithOrder } from '@editor/aStore';
import { getTopState } from '@editor/utils';
const offset = { x: 20, y: 20 };

/**
 * 粘贴节点
 * @param param0
 * @returns
 */
export function useOnPaste({
  setNodes,
  addNodes,
  addEdges,
}: { setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>> } & Pick<
  ReturnType<typeof useOnNodes>,
  'addNodes'
> &
  Pick<ReturnType<typeof useOnEdges>, 'addEdges'>) {
  const { getState, dispatch } = useStore<EditorState>();
  return useCallback(
    async (position?: { x: number; y: number }, deepClone = false) => {
      const state = localBlueprint.getValue();
      if (!state) {
        return;
      }
      const { projectId, edges } = state;
      let { nodes } = state;

      if (nodes?.length) {
        const origin = nodes.reduce(
          (origin, cur) => {
            if (cur?.position.x <= origin.x) {
              origin.x = cur.position.x;
            }
            if (cur?.position.y <= origin.y) {
              origin.y = cur.position.y;
            }
            return origin;
          },
          {
            x: Number.MAX_SAFE_INTEGER,
            y: Number.MAX_SAFE_INTEGER,
          }
        );

        const { copyScript, createScenes } = duplicateComponent(getState().project, projectId, deepClone);
        const actions = [] as Array<EditorAction>;
        nodes = await Promise.all(
          nodes.map(async node => ({
            ...node,
            data: (await copyScript([node.data]))[0], // 更新orderId
          }))
        );

        const { nodes: newNodes, edges: newEdges } = updateFlowIds(nodes, edges);
        addNodes(
          newNodes.map(node =>
            Object.assign(
              {
                ...node,
                position: {
                  ...node.position,
                  x: position ? node.position.x - origin.x + position.x : node.position.x + offset.x,
                  y: position ? node.position.y - origin.y + position.y : node.position.y + offset.y,
                },
                selected: false,
              },
              deepClone && {
                data: {
                  ...node.data,
                  props: {
                    ...node.data.props,
                    name: node.data.props.name + '(复制)',
                  },
                },
              }
            )
          )
        );
        setNodes(oldNodes =>
          oldNodes.map(oldNode => ({ ...oldNode, selected: newNodes.some(newNode => newNode.id === oldNode.id) }))
        );
        addEdges(newEdges);

        const { components, customScripts } = await createScenes();
        for (const component of components) {
          actions.push(addComponent(component));
        }
        for (const script of customScripts) {
          const newName = nameWithOrder(script.name, getTopState(getState().project).customScripts);
          actions.push(addCustomScript({ ...script, name: newName }));
        }
        for (const action of actions) {
          dispatch(action);
        }
        message.info('粘贴成功');
      }
    },
    [addEdges, addNodes, dispatch, getState, setNodes]
  );
}
