import { usePersistCallback } from '@byted/hooks';
import { IScriptData } from '@byted/riko';
import { setSettings, useOnAddCustomScript } from '@editor/aStore';
import { jsCodeToProps } from '@editor/Editor/Property/spark/layouts/Script/Event/eventGroups/CustomScript/CustomScriptUpload';
import { getCustomScriptByOrderId, getTopState, newID } from '@editor/utils';
import { message } from 'antd';
import { omit } from 'lodash';
import { useCallback } from 'react';
import { Node, useUpdateNodeInternals } from 'react-flow-renderer';
import { useStore } from 'react-redux';
import { useLoading } from '..';
import { ActionFlag, IAction } from '../../types';
import { compileAllToOne, withTsSuffix } from '../../utils';
import { withoutFileSuffix } from '../../utils/fileSuffix';
import { useRedoStack } from './useRedoStack';
import { useUndoStack } from './useUndoStack';

/**
 * 新建节点和删除节点
 * @param param0
 * @returns
 */
export function useOnNodes({
  setLoadingNodes,
  pushRedo,
  pushUndo,
  setNodes,
}: {
  setLoadingNodes: ReturnType<typeof useLoading>[1];
  pushUndo: ReturnType<typeof useUndoStack>['pushUndo'];
  pushRedo: ReturnType<typeof useRedoStack>['pushRedo'];
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
}) {
  const addNodes = useCallback(
    async (nodes: Node<RikoScript>[], flag: ActionFlag = 'undo') => {
      try {
        nodes = nodes.map(node => ({ ...node, selected: true }));
        setNodes(oldNodes => [...oldNodes.map(node => ({ ...node, selected: false })), ...nodes]);
        const action = {
          type: 'removeNodes',
          data: nodes.map(node => node.id),
        } as IAction;
        flag === 'undo' ? pushUndo(action) : pushRedo(action);
        return nodes;
      } catch (error) {
        message.error(error);
      } finally {
        setLoadingNodes([]);
      }
    },
    [pushRedo, pushUndo, setLoadingNodes, setNodes]
  );

  const removeNodes = useCallback(
    (nodeIds: string[], flag: ActionFlag = 'undo') => {
      setNodes(nodes => {
        const removedNodes = nodes.filter(node => nodeIds.includes(node.id));
        const action = {
          type: 'addNodes',
          data: removedNodes,
        } as IAction;
        flag === 'undo' ? pushUndo(action) : pushRedo(action);
        return nodes.filter(node => !nodeIds.includes(node.id));
      });
    },
    [pushRedo, pushUndo, setNodes]
  );

  return {
    addNodes,
    removeNodes,
  };
}

/**
 * 添加脚本节点
 * @param addNodes
 * @param setNodes
 * @returns
 */
export function useOnAddNodeFromScript(
  addNodes: ReturnType<typeof useOnNodes>['addNodes'],
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>,
  setLoadingNodes: React.Dispatch<React.SetStateAction<string[]>>
) {
  const onAddCustomScript = useOnAddCustomScript();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getState, dispatch } = useStore<EditorState>();
  return usePersistCallback(
    async (script: IScriptData, options?: { position?: { x: number; y: number }; status?: 0 | 1 }) => {
      // status: 1表示内置的图块，即使场景化也不进行展示
      const id = newID();
      // 场景化保存
      try {
        if (script.props.script === 'CustomScript' && (script.props.tsCode || script.props.url)) {
          let tsCode = script.props.tsCode;
          if (script.props.url) {
            const { ideCode } = getCustomScriptByOrderId(getState().project, script.props.url as number);
            tsCode = ideCode;
          }

          const [oldNode] =
            (await addNodes([
              {
                id: String(id),
                position: options?.position ?? { x: 100, y: 100 },
                type: 'block',
                data: {
                  id,
                  editor: { inputs: [], outputs: [], nodeType: 'block' },
                  props: {
                    ...omit(script.props, 'tsCode'),
                    name: withoutFileSuffix(script.props.name || ''),
                    script: 'CustomScript',
                  },
                  type: 'Script',
                },
              },
            ])) || [];
          setLoadingNodes([String(id)]);

          if (oldNode) {
            if (!script.props.url) {
              const { orderId } = await onAddCustomScript(
                withTsSuffix(oldNode.data.props.name || '未命名脚本.ts'),
                'typescript',
                tsCode as string,
                '',
                options?.status ?? 1
              );
              setNodes(oldNodes =>
                oldNodes.map(node => {
                  return node.id === oldNode.id
                    ? { ...node, data: { ...node.data, props: { ...node.data.props, url: orderId } } }
                    : node;
                })
              );
            }
            const customScripts = getTopState(getState().project).customScripts;
            const jsCode = await compileAllToOne(customScripts);
            dispatch(
              setSettings(
                {
                  jsCode,
                },
                true
              )
            );
            let newNodes: [Node<RikoScript>] = [oldNode];
            setNodes(oldNodes => {
              return oldNodes.map(node => {
                if (node.id === oldNode.id) {
                  newNodes = [
                    {
                      ...node,
                      data: {
                        ...node.data,
                        props: {
                          ...node.data.props,
                          ...jsCodeToProps(node.data.props, jsCode, node.data.props.url),
                          // name: withoutFileSuffix(node.data.props.name || ''),
                        },
                      },
                    },
                  ];
                  return newNodes[0];
                }

                return node;
              });
            });

            setTimeout(() => {
              updateNodeInternals(oldNode.id);
            });
            return newNodes;
          }
        } else {
          return addNodes([
            {
              id: String(id),
              position: options?.position ?? { x: 100, y: 100 },
              type: 'block',
              data: {
                ...script,
                id,
                props: {
                  ...script.props,
                  name: script.props.name === '设置动画' ? '透明动画' : script.props.name,
                  _editor: {
                    bpName: script.props.name,
                  },
                },
              },
            },
          ]);
        }
      } finally {
        setLoadingNodes([]);
      }
    }
  );
}
