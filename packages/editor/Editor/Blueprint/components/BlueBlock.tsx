import { Handle, Position, NodeProps } from 'react-flow-renderer';
import { Alert, Dropdown, Space, Spin, theme, Tooltip } from 'antd';
import React, { Fragment, memo, useMemo } from 'react';
import { useBPContext, useCodeStatus } from '../hooks';
import { CodeOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { css, cx } from 'emotion';
import { getNodeColor } from '../common';
import { INodeTypes, Signal } from '../types';
import { getRikoSignals } from '../utils/signals';
import { SelectionMenus } from './menus';
import { useCurrentNodeId } from '@editor/Editor/Property/spark/layouts/groups/customGroups/NodeCell';
import { getScene } from '@editor/utils';
import { isEqual, isString } from 'lodash';
import { useStore } from 'react-redux';
import { absoluteUrl } from '@shared/utils';
import { EVENTS } from '@editor/Editor/Property/spark/layouts/Script/Event';
import { useScriptError } from '@editor/aStore';
import { getConnectedEdgesOfNodes } from '../utils';
import { collectRikoHook } from '../utils/collectRikoHook';
import { useDeepMemo } from '@byted/hooks';

export const MIN_WIDTH = 160;

export const getHeight = (handles: number) => 24 + 2 * 10 + (handles + 1) * 20;

export default memo((node: NodeProps<RikoScript>) => {
  const { onSelectChildren, loadingNodes, setNodes, edges, onExpand } = useBPContext()!;
  const { id, type, data: script, isConnectable, selected, zIndex } = node;
  const { name, inputs, outputs } = getHandles(id, script, type === 'root');
  const { inputEdges, outputEdges } = getConnectedEdgesOfNodes(edges, [id]);
  const memorizedInputs = useDeepMemo(inputs, isEqual);
  const memorizedOutputs = useDeepMemo(outputs, isEqual);
  const memorizedInputEdges = useDeepMemo(inputEdges, isEqual);
  const memorizedOutputEdges = useDeepMemo(outputEdges, isEqual);
  const spinning = loadingNodes.some(nodeId => nodeId === id);

  const {
    editor: { collapsed } = {},
    props: { enabled },
  } = script;
  const preview = usePreview(script);
  const summary = useSummary(script);
  const { setStatus } = useCodeStatus();

  return useMemo(
    () => (
      <Alert.ErrorBoundary>
        <Spin spinning={spinning}>
          <Dropdown overlay={<SelectionMenus />} trigger={['contextMenu']}>
            <div
              onDoubleClick={() => {
                onSelectChildren(id);
              }}
              onContextMenu={event => {
                event.stopPropagation();
                setNodes(nodes => {
                  const node = nodes.find(node => node.id === id);
                  if (node?.selected) {
                    return nodes;
                  } else {
                    return nodes.map(node => ({ ...node, selected: node.id === id }));
                  }
                });
              }}
              className={cx(
                css({
                  boxSizing: 'content-box',
                  width: 220,
                  display: 'flex',
                  flexDirection: 'column',
                }),
                selected &&
                  css({
                    border: selected ? '6px solid #fd9c04' : 'none',
                    borderRadius: 2,
                    marginLeft: -6,
                    marginTop: -6,
                  }),
                enabled === false &&
                  css({
                    filter: 'grayscale(1)',
                  })
              )}
              onClick={e => e.stopPropagation()}
            >
              <div
                className={cx(
                  css({
                    boxSizing: 'content-box',
                    height: 24,
                    padding: 8,
                    background: getNodeColor(type as INodeTypes, selected),
                    color: '#fff',
                    flex: '0 0 24px',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                  }),
                  (memorizedInputs.length > 0 || memorizedOutputs.length > 0) &&
                    css({
                      marginBottom: 1,
                    })
                )}
              >
                <span
                  className={css({
                    marginRight: 'auto',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  })}
                >
                  <span>{name}</span>
                  {script.props.script === 'CustomScript' && name !== script.props.name && (
                    <span className={css({ color: '#545454', fontSize: 12 })}>（{script.props.name}）</span>
                  )}
                </span>

                <Space className={css({ marginLeft: 'auto' })}>
                  {script.props.script === 'CustomScript' && (
                    <Tooltip title={script.props.name}>
                      <CodeOutlined
                        onClick={() => {
                          if (!script.props.url && script.props.tsCode) {
                            setStatus({
                              type: 'readOnly',
                              tsCode: script.props.tsCode as string,
                            });
                          } else {
                            setStatus({
                              type: 'selected',
                            });
                          }
                        }}
                      />
                    </Tooltip>
                  )}
                  {collapsed && (
                    <Tooltip title="展开子节点">
                      <MenuUnfoldOutlined onClick={onExpand} />
                    </Tooltip>
                  )}
                </Space>
              </div>
              <Alert.ErrorBoundary description={null}>{summary}</Alert.ErrorBoundary>
              <div
                className={cx(
                  css({
                    position: 'relative',
                    background: '#d2c6d8',
                    flex: 'auto',
                    display: 'flex',
                    columnGap: 8,
                    fontSize: 14,
                    lineHeight: '20px',
                    opacity: 0.9,
                  }),
                  (memorizedInputs.length > 0 || memorizedOutputs.length > 0) &&
                    css({
                      padding: 10,
                    })
                )}
              >
                {memorizedInputs.map(({ key }, index) => (
                  <Handle
                    id={key}
                    key={key}
                    type="target"
                    position={Position.Left}
                    isConnectable={isConnectable}
                    style={{
                      top: 20 * (index + 1),
                      left: -8,
                      width: 16,
                      height: 16,
                      background: memorizedInputEdges.some(edge => edge.targetHandle === key) ? '#d97252' : '#9e9e9e',
                      zIndex: zIndex + 1,
                    }}
                  />
                ))}
                <div style={{ flex: '1 0 auto', minWidth: 40 }}>
                  {(memorizedInputs as Signal[]).map(({ key, label = key, tooltip }, index) => (
                    <div
                      key={index}
                      className={css({
                        color: memorizedInputEdges.some(edge => edge.targetHandle === key) ? '#555' : '#9e9e9e',
                      })}
                    >
                      <Tooltip title={tooltip}>{label}</Tooltip>
                    </div>
                  ))}
                </div>
                {preview}
                <div style={{ flex: '1 0 auto', textAlign: 'right', minWidth: 40 }}>
                  {(memorizedOutputs as Signal[]).map(({ key, label = key, tooltip }, index) => (
                    <div
                      key={index}
                      className={css({
                        color: memorizedOutputEdges.some(edge => edge.sourceHandle === key) ? '#555' : '#9e9e9e',
                      })}
                    >
                      <Tooltip title={tooltip}>{label}</Tooltip>
                    </div>
                  ))}
                </div>
                {memorizedOutputs.map(({ key }, index) => (
                  <Handle
                    id={key}
                    key={key}
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    style={{
                      top: 20 * (index + 1),
                      right: -8,
                      width: 16,
                      height: 16,
                      background: memorizedOutputEdges.some(edge => edge.sourceHandle === key) ? '#d97252' : '#9e9e9e',
                      zIndex: zIndex + 1,
                    }}
                  />
                ))}
              </div>
            </div>
          </Dropdown>
        </Spin>
      </Alert.ErrorBoundary>
    ),
    [
      spinning,
      selected,
      enabled,
      type,
      memorizedInputs,
      memorizedOutputs,
      name,
      script.props.script,
      script.props.url,
      script.props.tsCode,
      collapsed,
      onExpand,
      summary,
      preview,
      onSelectChildren,
      id,
      setNodes,
      setStatus,
      isConnectable,
      memorizedInputEdges,
      zIndex,
      memorizedOutputEdges,
    ]
  );
});

export const getHandles = (
  id: string,
  { props, editor: { inputs = [], outputs = [] } = {} }: RikoScript,
  isRoot = false
) => {
  const { name, _editor: { bpName } = {} as any } = props;
  const { inputs: $inputs, outputs: $outputs } = getRikoSignals(props);
  inputs = [...inputs.filter(({ key }) => (isRoot ? true : key !== 'onStart')), ...$inputs];
  outputs = [...outputs, ...$outputs];

  return isRoot
    ? id === '0'
      ? {
          name: '蓝图输入',
          outputs: inputs,
          inputs: [],
        }
      : {
          name: '蓝图输出',
          inputs: outputs,
          outputs: [],
        }
    : {
        name: bpName ?? name,
        inputs,
        outputs,
      };
};

/**
 * 需要在蓝图图块中展示该蓝图所引用到的所有资源，大部分是通过targetId引用，但也有通过url直接引用的资源
 * @param script
 * @returns
 */
function usePreview(script: RikoScript) {
  const { getState } = useStore<EditorState>();
  const currentId = useCurrentNodeId();
  const { props } = script;
  const { script: scriptName, nodeId, targetId, _editor: { cover } = { cover: '' } as any } = props;
  const elements = [];

  if (scriptName === 'PlayEffect') {
    elements.push({
      type: '',
      url: cover,
      name: '',
    });
  } else {
    const targetIds = (
      scriptName === 'CustomScript'
        ? [
            ...collectRikoHook([script], function* (hook) {
              if (hook.callee === 'Riko.useNode') {
                yield hook.value as number;
              }
            }),
          ]
        : ([nodeId, targetId] as number[]).filter(id => id !== -1 && id !== undefined)
    ).map(id => (id === -1 ? currentId : id));
    const { props: sceneProps } = getScene(getState().project);
    for (const id of targetIds) {
      const { type, name, url, _editor: { cover } = { cover: '' } } = sceneProps[id] || {};
      elements.push({
        type,
        url: cover || (isString(url) ? absoluteUrl(url) : ''),
        name,
      });
    }
  }

  const preview = elements.map((state, index) => (
    <Fragment key={index}>
      {state.url ? (
        <Tooltip title={state.name} mouseEnterDelay={0.5}>
          <div
            className={css({
              maxHeight: 80,
              background: '#d2c6d8',
              display: 'flex',
            })}
          >
            {state.type === 'Video' ? (
              <video
                src={state.url}
                className={css({
                  objectFit: 'contain',
                  width: '100%',
                })}
              />
            ) : (
              <img
                src={state.url}
                className={css({
                  objectFit: 'contain',
                  width: '100%',
                })}
              />
            )}
          </div>
        </Tooltip>
      ) : state.name ? (
        <div
          className={css({
            background: '#d2c6d8',
            textAlign: 'center',
            padding: '4px 0',
          })}
        >
          {state.name}
        </div>
      ) : null}
    </Fragment>
  ));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => preview, [script, currentId]);
}

function useSummary(script: RikoScript) {
  let summary: JSX.Element | string | boolean = useScriptError(script.props);
  const { token } = theme.useToken();

  const desc = EVENTS[script.props.script as keyof typeof EVENTS];
  if (desc && !summary) {
    const { Summary } = desc;
    if (Summary) {
      summary = <Summary {...script} />;
    }
  }

  if (script.props.script === 'CustomScript') {
    const symbols = [
      ...collectRikoHook([script], function* (hook) {
        if (hook.callee === 'Riko.useSymbol' && hook.type === 'define') {
          yield hook.value ?? hook.default;
        }
      }),
    ];
    summary = symbols.length > 0 && <>定义场景变量：{symbols.join(' ')}</>;
  }

  return useMemo(
    () =>
      summary && (
        <div
          className={cx(
            css({
              background: '#d2c6d8',
              padding: '6px 8px',
              textAlign: 'center',
              opacity: 0.9,
            }),
            typeof summary === 'string' &&
              css({
                color: token.colorErrorText,
              })
          )}
        >
          {summary}
        </div>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [script]
  );
}
