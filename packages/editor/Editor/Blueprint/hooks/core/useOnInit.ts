import { IScriptData } from '@byted/riko';
import { ICaseState, INodeState, ISceneState, useEditor, useProject } from '@editor/aStore';
import { getScene, neverThrow, findById, getNodes, intoScripts, newID, findEventById, intoScene } from '@editor/utils';
import { omit } from 'lodash';
import { useCallback, useEffect } from 'react';
import { Node, Edge } from 'react-flow-renderer';
import { useStore } from 'react-redux';
import { IState } from '../../types';
import { createCustomSignal, flowToScript, scriptToFlow } from '../../utils';
import { collectScripts } from '../../utils/collectRikoHook';
import { transformFlow } from './useOnLayout';

/**
 * 蓝图数据初始化与重置
 * @param param0
 * @returns
 */
export function useOnInit({
  clearUndoStack,
  clearRedoStack,
  setState,
  setNodes,
  setEdges,
  state,
}: {
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge<any>[]>>;
  clearUndoStack: () => void;
  clearRedoStack: () => void;
  state: IState;
  setState: (arg: IState) => void;
}) {
  const caseType = useProject('type');
  const { getState } = useStore<EditorState>();
  const { onChange: openBlueprint } = useEditor(0, 'enableBlueprint');
  const { onChange: onChangeState } = useEditor(0, 'blueprintState');

  useEffect(() => {
    if (state?.script) {
      const { nodes, edges } = scriptToFlow(
        state.script,
        (state.type === 'Scene' && caseType !== 'Component') || state.type === 'Project'
      );
      setNodes(nodes);
      setEdges(edges);
    }
    onChangeState(state ? omit(state, ['script', 'parent']) : state);
  }, [caseType, onChangeState, setEdges, setNodes, state]);

  return useCallback(
    (state: IState extends infer T ? (T extends { script: unknown } ? Omit<IState, 'script'> : null) : never) => {
      /**
       * 关闭蓝图
       */
      setNodes([]);
      setEdges([]);
      clearUndoStack();
      clearRedoStack();

      if (!state) {
        openBlueprint(false);
        setState(null);
        return;
      }

      openBlueprint(true);
      const { type: projectType } = getState().project;
      const { type, id, parent } = state;
      switch (type) {
        case 'Node': {
          const scene = getScene(getState().project);
          const script = findBlueprintByNode(scene, id);
          if (script) {
            setState({ id, type, script });
          }
          return;
        }
        case 'Scene': {
          const scene = getScene(getState().project);
          const script = findBlueprintByScene(scene, projectType === 'Component');
          if (script) {
            setState({ type, id, script });
          }
          return;
        }
        case 'Project': {
          const project = getState().project;
          const script = findBlueprintByProject(project);
          if (script) {
            setState({ type, id, script });
          }
          return;
        }
        /**
         * 编辑复合蓝图节点
         */
        case 'Script': {
          const scene = getScene(getState().project);
          const [script] = findEventById(scene.props, id);
          if (script) {
            setState({ type, id, script, parent });
          }
          return;
        }
        default:
          return neverThrow(type);
      }
    },
    [clearRedoStack, clearUndoStack, getState, openBlueprint, setEdges, setNodes, setState]
  );
}

/**
 * 节点蓝图，描述节点自身的逻辑关系
 * @param scene
 * @param nodeId
 * @returns
 */
export function findBlueprintByNode(scene: ISceneState, nodeId: number): IScriptData | undefined {
  const [node] = findById(getNodes(scene), nodeId);
  if (node) {
    const scripts = intoScripts(node.scripts, scene.props);
    return scripts.find(script => script.type === 'Blueprint') ?? createBlueprintScript(node.name, 'node');
  }
}

/**
 * 场景蓝图，描述节点之间的逻辑关系
 * @param scene
 * @param id
 * @returns
 */
export function findBlueprintByScene(scene: ISceneState, componentMode = false) {
  const root =
    intoScripts(scene.scripts || [], scene.props).find(script => script.type === 'Blueprint') ??
    createBlueprintScript('场景蓝图', 'scene');
  const children = Array.from(collectNodeBlueprint(componentMode ? scene.nodes[0].nodes : scene.nodes, scene.props)); // 组件下不取根节点
  return {
    ...root,
    props: {
      ...root.props,
      scripts: children.concat(root.props.scripts ?? []), // 场景蓝图的子节点除了节点蓝图，可以包括普通的蓝图图块
    },
  };

  function* collectNodeBlueprint(nodes: INodeState[], props: ISceneState['props']): Generator<RikoScript> {
    for (const node of nodes) {
      const scripts = intoScripts(node.scripts, props);
      const blueprint = scripts.find(script => script.type === 'Blueprint');
      if (blueprint) {
        yield {
          ...blueprint,
          props: {
            ...blueprint.props,
            name: node.name, // 节点名作为蓝图名
          },
        };
      }
      if (node.nodes) {
        yield* collectNodeBlueprint(node.nodes, props);
      }
    }
  }
}

/**
 * 项目蓝图，描述场景之间的跳转关系
 * 理论只读，其跳转关系动态解析获取
 * @param project
 * @returns
 */
function findBlueprintByProject(project: ICaseState) {
  const { settings } = project;
  const root = settings.blueprint ?? createBlueprintScript('项目蓝图', 'project');
  const scenes = project.scenes.filter(({ type, editor }) => type === 'Scene' && !editor.loading);

  // 每个场景的跳转关系图
  const scenesMap = Object.fromEntries(
    scenes.map(scene => {
      const blueprint = createBlueprintScript(scene.name, 'scene');
      return [
        scene.orderId,
        {
          nextIds: Array.from(
            collectScripts(
              intoScene(scene),
              function* (script) {
                if (script.props.script === 'ChangeScene') {
                  yield script.props.sceneId;
                }
              },
              false
            )
          ),
          blueprint,
        },
      ];
    })
  );

  // 用于mock 切换至上一个场景
  let lastSceneScript = createBlueprintScript('上一个场景', 'scene');
  lastSceneScript = {
    ...lastSceneScript,
    id: -1,
    editor: {
      ...lastSceneScript.editor,
      inputs: [
        {
          key: '-1',
          label: '切换',
        },
      ],
    },
  };

  const scripts = scenes.map(scene => {
    const blueprint = scenesMap[scene.orderId].blueprint;
    const outputs = scenesMap[scene.orderId].nextIds.map((sceneId, index) => ({
      key: createCustomSignal('$outputs', index + 1),
      label: `条件 ${index + 1}`,
      _targetId: sceneId === -1 ? -1 : scenesMap[sceneId as keyof typeof scenesMap]?.blueprint?.id,
    }));

    const inputs = [
      {
        key: '-1',
        label: '切换',
      },
    ];

    return {
      ...blueprint,
      editor: {
        ...blueprint.editor,
        inputs,
        outputs: outputs.map(output => omit(output, '_targetId')),
      },
      props: {
        ...blueprint.props,
        outputs: Object.fromEntries(
          outputs.map(({ key, _targetId }) => {
            return [key, [_targetId ? [_targetId, '-1', {}] : []]];
          })
        ),
      },
    };
  });

  const projectBlueprint = {
    ...root,
    props: {
      ...root.props,
      scripts: scripts.concat(lastSceneScript as any).concat(root.props.scripts || []),
      inputs: {
        onStart: [[scenesMap[scenes[0].orderId].blueprint.id, '-1', {}]],
      },
    },
  };

  const { nodes, edges } = scriptToFlow(projectBlueprint);
  const { nodes: newNodes, edges: newEdges } = transformFlow(nodes, edges);
  const projectBlueprint1 = flowToScript(newNodes, newEdges);
  return projectBlueprint1;
}

/**
 * 创建空白蓝图节点
 * @param name
 * @returns
 */
export function createBlueprintScript(
  name = '未命名蓝图',
  nodeType: NonNullable<RikoScript['editor']>['nodeType']
): RikoScript {
  return {
    id: newID(),
    type: 'Blueprint',
    editor: {
      inputs: [
        {
          label: '开始',
          key: 'onStart',
          tooltip: '蓝图开始触发起点',
        },
      ],
      outputs: [],
      nodeType,
    },
    props: {
      script: 'Blueprint',
      name,
      time: 0,
      scripts: [],
    },
  };
}
