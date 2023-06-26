import { changeProps, ICaseState, useProject } from '@editor/aStore';
import { message } from 'antd';
import { css } from 'emotion';
import { useMemo } from 'react';
import { useStore } from 'react-redux';
import { Node } from 'react-flow-renderer';
import render, { ArrayCell, getIndexer, NULL_SPARK, Spark, withContext } from '../../../../Property/cells';
import { useBlueprint, useBPContext, useScriptModel } from '../../../hooks';
import { Signal } from '../../../types';
import {
  createCustomSignal,
  getConnectedEdgesOfNodes,
  getParentOfRootBlueprint,
  getSignals,
  newSignalIndex,
} from '../../../utils';
import { useSymbols } from '../../../hooks/useSymbols';
import { formulaSpark } from '@editor/Editor/Property/spark/common/formulaSpark';
import { IOperand } from '@editor/Editor/Property/spark/layouts/Script/Event/components/operand';
import { uniqBy } from 'lodash';
import { findById, getNodes, getScene } from '@editor/utils';
import { compPropsGroups } from '@editor/Editor/Property/spark/layouts/groups';
import { getUseValue } from '@editor/Editor/Property/spark';

const defaultKeys = ['onStart'];

export function SignalsGroup(): JSX.Element | null {
  const props = useBPContext()!;
  const store = useStore<EditorState>();
  const { state, nodes = [], edges = [], setEdges } = props;
  const caseType = useProject('type');
  const { script: value, onChange } = useScriptModel(props);
  if (!value) {
    return null;
  }
  return render(getSignalsGroup({ value, onChange, state, nodes, edges, setEdges, caseType, store }));
}

export function getSignalsGroup({
  value,
  onChange,
  state,
  nodes = [],
  edges = [],
  setEdges,
  caseType,
  store,
}: {
  value: RikoScript;
  onChange: (script: Partial<RikoScript>, options: any) => void;
  caseType: ICaseState['type'];
  store: EditorStore;
} & Pick<ReturnType<typeof useBlueprint>, 'state' | 'nodes' | 'edges' | 'setEdges'>): Spark {
  const node = nodes.filter(node => node.selected)[0];
  const isInOrOut = node.type === 'root' && ((node.id === '0' ? 'in' : 'out') as 'in' | 'out'); // 输入还是输出节点

  const signals = [
    { label: '输入信号', index: 'inputs', hidden: isInOrOut !== 'in' },
    { label: '输出信号', index: 'outputs', hidden: isInOrOut !== 'out' },
  ] as const;

  if (node.type === 'root') {
    return {
      spark: 'grid',
      content: [
        {
          spark: 'context',
          provide: () => ({
            useValue: index => {
              const { indexValue, indexEntries } = getIndexer(index);
              if (index in value || ([].concat(index as any) as any[]).includes('id')) {
                return {
                  value: [indexValue(value)],
                  onChange([newValue], options) {
                    if (options?.replace) {
                      onChange(newValue, options);
                    } else {
                      onChange({ ...Object.fromEntries(indexEntries(newValue)) }, options);
                    }
                  },
                };
              }
              return {
                value: [indexValue(value.props ?? {})],
                onChange([newValue]: any, options) {
                  if (options?.replace) {
                    onChange({ props: newValue }, options);
                  } else {
                    onChange({ props: { ...value.props, ...Object.fromEntries(indexEntries(newValue)) } }, options);
                  }
                },
              };
            },
          }),
          content: {
            spark: 'check',
            index: ['id', 'editor'],
            check: {
              hidden: check => {
                const [id, { nodeType }] = check;
                if (!id || !nodeType) return true;
                const { getState } = useStore<EditorState>();
                switch (nodeType) {
                  case 'node': {
                    const node = getParentOfRootBlueprint(value, getState);
                    return !node;
                  }

                  // 复制场景的时候没有更新场景的脚本id，不能根据脚本id找到父场景
                  // case 'scene': {
                  //   const scene = getParentOfRootBlueprint(script, getState);
                  //   return !scene;
                  // }
                }

                return true;
              },
            },
            content: {
              spark: 'group',
              label: '蓝图节点信息',
              content: {
                spark: 'grid',
                content: [
                  {
                    spark: 'value',
                    index: 'editor',
                    content({ nodeType }, onChange) {
                      const { dispatch, getState } = useStore<EditorState>();
                      if (nodeType === 'node') {
                        const node = getParentOfRootBlueprint(value, getState);
                        if (node) {
                          return {
                            spark: 'element',
                            content(render) {
                              return render({
                                spark: 'string',
                                label: '节点名称',
                                value: node.name,
                                onChange(newName, options) {
                                  onChange({ props: { ...value.props, name: newName } }, { replace: true });
                                  dispatch(
                                    changeProps(
                                      [node.id],
                                      {
                                        name: newName,
                                      },
                                      options
                                    )
                                  );
                                },
                              });
                            },
                          };
                        }
                      }

                      return NULL_SPARK;
                    },
                  },
                ],
              },
            },
          },
        },
        {
          spark: 'context',
          provide: () => ({
            useValue: index => {
              const { indexValue, indexEntries } = getIndexer(index);
              return {
                value: [indexValue(value.editor ?? {})],
                onChange([newValue]: any, options) {
                  if (options?.replace) {
                    onChange({ editor: newValue }, options);
                  } else {
                    onChange({ editor: { ...value.editor, ...Object.fromEntries(indexEntries(newValue)) } }, options);
                  }
                },
              };
            },
          }),
          content: {
            spark: 'element',
            content() {
              return (
                <div className={css({ flex: '0 0 340px' })}>
                  {render({
                    spark: 'grid',
                    content: signals.map(({ label, index, hidden }) => ({
                      hidden,
                      spark: 'group',
                      label: `${label}定义`,
                      content: {
                        spark: 'value',
                        index,
                        content(items: Signal[] = [], onChange) {
                          return {
                            spark: 'element',
                            content: () => {
                              const { selectedIds, edges, removeEdges, addSignal, removeSignal } = useBPContext()!;
                              return useMemo(
                                () => (
                                  <ArrayCell
                                    addable={!(state?.type === 'Scene' && caseType !== 'Component')}
                                    defaultExpanded
                                    label={label}
                                    array={items}
                                    onChange={onChange}
                                    onDelete={signal => {
                                      const handle = signal.key;
                                      if (defaultKeys.includes(handle)) {
                                        return message.warning('不允许删除默认信号');
                                      }
                                      const edgeIds = edges
                                        .filter(edge => {
                                          if (isInOrOut) {
                                            return index === 'inputs'
                                              ? edge.source === '0' && edge.sourceHandle === handle
                                              : edge.target === String(value.id) && edge.targetHandle === handle;
                                          } else {
                                            return index === 'outputs'
                                              ? edge.source === String(value.id) && edge.sourceHandle === handle
                                              : edge.target === String(value.id) && edge.targetHandle === handle;
                                          }
                                        })
                                        .map(edge => edge.id);
                                      if (edgeIds.length) {
                                        removeEdges(edgeIds);
                                      }
                                      removeSignal({
                                        id: selectedIds[0],
                                        type: index,
                                        signal,
                                      });
                                    }}
                                    defaultItem={() => {
                                      const newKey = newSignalIndex(items);
                                      addSignal({
                                        id: selectedIds[0],
                                        type: index,
                                        signal: {
                                          key: createCustomSignal(`$${index}`, newKey),
                                          label: `${label} ${newKey}`,
                                        },
                                      });
                                    }}
                                    render={(value, onChange) => {
                                      return render(
                                        withContext(value, onChange, {
                                          spark: 'grid',
                                          content: [
                                            { spark: 'string', label: '信号名称', index: 'label' },
                                            { spark: 'string', label: '信号提示', index: 'tooltip' },
                                            {
                                              spark: 'value',
                                              hidden:
                                                !(state?.type === 'Scene' && caseType === 'Component') ||
                                                value.key === 'onStart',
                                              index: 'parameters',
                                              content(parameters = [], onChange) {
                                                const options = useSymbols();
                                                return {
                                                  spark: 'element',
                                                  content(render) {
                                                    return (
                                                      <ArrayCell
                                                        addButtonProps={{ block: false }}
                                                        defaultExpanded
                                                        label="参数"
                                                        array={parameters}
                                                        onChange={onChange}
                                                        render={(value, onChange) => {
                                                          return render({
                                                            spark: 'select',
                                                            value,
                                                            onChange,
                                                            options,
                                                            label: '参数名',
                                                          });
                                                        }}
                                                      />
                                                    );
                                                  },
                                                };
                                              },
                                            },
                                          ],
                                        })
                                      );
                                    }}
                                  />
                                ),
                                [edges, items, removeSignal, selectedIds, removeEdges, addSignal]
                              );
                            },
                          };
                        },
                      },
                    })),
                  })}
                </div>
              );
            },
          },
        },
      ],
    };
  }

  return getAnimationBlueprintGroup({
    nodes,
    edges,
    setEdges,
    withParameters: isAnimationWithParameters(node),
    store,
  });
}

function getAnimationBlueprintGroup({
  nodes,
  edges,
  setEdges,
  store,
  withParameters,
}: { withParameters: boolean; store: EditorStore } & Pick<
  ReturnType<typeof useBlueprint>,
  'nodes' | 'edges' | 'setEdges'
>): Spark {
  const { getState } = store;
  const node = nodes.filter(node => node.selected)[0];
  const scene = getScene(getState().project);
  const sceneNodes = getNodes(scene);
  const [component] = findById(sceneNodes, Number(node.id), true);

  const { inputEdges, outputEdges } = getConnectedEdgesOfNodes(
    edges,
    nodes.filter(({ selected }) => selected).map(({ id }) => id)
  );
  return {
    spark: 'grid',
    content: [
      withParameters && {
        spark: 'group',
        label: '组件输入',
        content: {
          spark: 'element',
          content() {
            return (
              <ArrayCell
                defaultExpanded={true}
                sortable={false}
                addable={false}
                deletable={false}
                array={inputEdges}
                onChange={() => {
                  return;
                }}
                onSelect={index => {
                  const target = inputEdges[index];
                  setEdges(edges =>
                    edges.map(e => ({
                      ...e,
                      selected: e.id === target.id,
                    }))
                  );
                }}
                labelRender={edge => {
                  const prevNode = nodes.find(node => node.id === edge.source)!;
                  const prevNodeOutput = getSignals(prevNode)[prevNode.type === 'root' ? 'inputs' : 'outputs'].find(
                    output => output.key === edge.sourceHandle
                  );
                  const { label } = getSignals(node).inputs.find(input => input.key === edge.targetHandle) || {};
                  return `${prevNode.data.props.name}-${prevNodeOutput?.label || prevNodeOutput?.key}-${label}-${
                    node.data.props.name
                  }`;
                }}
                render={edge => {
                  // const data = edge.data || {};
                  const { parameters = [] } =
                    getSignals(node).inputs.find(input => input.key === edge.targetHandle) || {};
                  const prevNode = nodes.find(node => node.id === edge.source)!;
                  const options = isAnimationWithParameters(prevNode)
                    ? prevNode.data.editor?.outputs
                        ?.find(output => output.key === edge.sourceHandle)
                        ?.parameters?.map(p => ({ label: p, value: { type: 'scene', key: p } })) ?? []
                    : ([] as any);

                  let data: Array<[IOperand, Extract<IOperand, { type: 'scene' }> | '']> = edge.data || [];
                  if (edge.data && !Array.isArray(edge.data)) {
                    data = []; // 暂时兼容可能的脏数据
                  }

                  const dataMapping = uniqBy(
                    [
                      ...data,
                      ...parameters.map(
                        p => ['', { type: 'scene', key: p }] as [IOperand, Extract<IOperand, { type: 'scene' }>]
                      ),
                    ].filter(([_, value]) => value !== '' && parameters.includes(value.key)),
                    ([_, value]) => (value as any).key
                  );

                  if (!dataMapping.length) {
                    return null;
                  }
                  return render(
                    withContext(
                      dataMapping,
                      dataMapping => {
                        setEdges(edges =>
                          edges.map(e =>
                            e.id === edge.id
                              ? {
                                  ...e,
                                  data: dataMapping,
                                }
                              : e
                          )
                        );
                      },
                      {
                        spark: 'grid',
                        content: dataMapping.map(([_, { key: label }]: any, index) => ({
                          spark: 'enter',
                          index,
                          content: isAnimationWithParameters(prevNode)
                            ? {
                                spark: 'value',
                                index: 0,
                                content(value, onChange) {
                                  return {
                                    spark: 'element',
                                    content(render) {
                                      return render({
                                        spark: 'select',
                                        label,
                                        options,
                                        value,
                                        onChange,
                                      });
                                    },
                                  };
                                },
                              }
                            : formulaSpark({
                                spark: 'string',
                                label,
                                index: 0,
                              }),
                        })),
                      }
                    )
                  );
                }}
              />
            );
          },
        },
      },
      withParameters && {
        spark: 'group',
        label: '组件输出',
        content: {
          spark: 'element',
          content() {
            const symbols = useSymbols();

            return (
              <ArrayCell
                defaultExpanded={true}
                sortable={false}
                addable={false}
                deletable={false}
                array={outputEdges}
                onChange={() => {
                  return;
                }}
                onSelect={index => {
                  const target = outputEdges[index];
                  setEdges(edges =>
                    edges.map(e => ({
                      ...e,
                      selected: e.id === target.id,
                    }))
                  );
                }}
                labelRender={edge => {
                  const nextNode = nodes.find(node => node.id === edge.target)!;
                  const nextNodeInput = getSignals(nextNode)[nextNode.type === 'root' ? 'outputs' : 'inputs'].find(
                    input => input.key === edge.targetHandle
                  );
                  const { label } = getSignals(node).outputs.find(output => output.key === edge.sourceHandle) || {};
                  return `${node.data.props.name}-${label}-${nextNodeInput?.label || nextNodeInput?.key}-${
                    nextNode.data.props.name
                  }`;
                }}
                render={edge => {
                  const { parameters = [] } =
                    getSignals(node).outputs.find(output => output.key === edge.sourceHandle) || {};
                  const nextNode = nodes.find(node => node.id === edge.target)!;
                  const options = isAnimationWithParameters(nextNode)
                    ? nextNode.data.editor?.inputs
                        ?.find(input => input.key === edge.targetHandle)
                        ?.parameters?.map(p => ({ label: p, value: { type: 'scene', key: p } })) ?? []
                    : symbols.map(symbol => ({ ...symbol, value: { type: 'scene', key: symbol.value } }));

                  let data: Array<[Extract<IOperand, { type: 'scene' }> | '', IOperand]> = edge.data || [];
                  if (edge.data && !Array.isArray(edge.data)) {
                    data = []; // 暂时兼容可能的脏数据
                  }
                  const dataMapping = uniqBy(
                    [
                      ...data,
                      ...parameters.map(
                        p => [{ type: 'scene', key: p }, ''] as [Extract<IOperand, { type: 'scene' }> | '', IOperand]
                      ),
                    ].filter(([key]) => key !== '' && parameters.includes(key.key)),
                    ([key]) => (key as any).key
                  );

                  if (!dataMapping.length) {
                    return null;
                  }
                  return render(
                    withContext(
                      dataMapping,
                      dataMapping => {
                        setEdges(edges => edges.map(e => (e.id === edge.id ? { ...e, data: dataMapping } : e)));
                      },
                      {
                        spark: 'grid',
                        content: dataMapping.map(([{ key: label }]: any, index) => ({
                          spark: 'enter',
                          index,
                          content: {
                            spark: 'value',
                            index: 1,
                            content(value, onChange) {
                              return {
                                spark: 'element',
                                content(render) {
                                  return render({
                                    spark: 'select',
                                    label,
                                    options: options as any[],
                                    value,
                                    onChange,
                                  });
                                },
                              };
                            },
                          },
                        })),
                      }
                    )
                  );
                }}
              />
            );
          },
        },
      },
      {
        spark: 'context',
        content: compPropsGroups({} as any, { rootType: 'Scene' } as any),
        provide: () => ({
          useValue: getUseValue([component.id], store),
        }),
      },
    ].filter(Boolean) as Spark[],
  };
}

function isAnimationWithParameters(node: Node<RikoScript>) {
  const {
    data: { editor: { inputs = [], outputs = [] } = {} },
  } = node;
  return node.type === 'node' && [...inputs, ...outputs].some(({ parameters = [] }) => parameters.length > 0);
}
