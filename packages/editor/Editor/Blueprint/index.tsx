import { EntryKey } from '@shared/globals/localStore';
import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { useStorage } from '@byted/hooks';
import { DarkMode, Format } from '@icon-park/react';
import { Badge, Button, Dropdown, message, Tooltip } from 'antd';
import { css, cx } from 'emotion';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ControlButton,
  Controls,
  Edge,
  ReactFlowProvider,
  updateEdge,
  useStore,
} from 'react-flow-renderer';
import { createEntry } from '@shared/globals/localStore';
import BlueBlock from './components/BlueBlock';
import { GlobalMenus, SelectionMenus } from './components/menus/';
import { BlueprintContext, useBeforeUnload, useBlueprint, useCodeStatus, useConnectEnd, useOnDrop } from './hooks';
import { MainProps, Header, Sidebar } from './layout/index';
import { assertEdgeRemoveChange, assertNodeRemoveChange, INodeTypes, IStorage } from './types';
import { createEdge } from './utils/createEdge';
import { useEffect, useRef } from 'react';
import { ONBOARD_STEP_4 } from '../OnBoarding/OnBoarding';

export default function Blueprint() {
  return (
    <ReactFlowProvider>
      <Container />
    </ReactFlowProvider>
  );
}

function Container() {
  const context = useBlueprint();

  if (!context.visible) {
    return null;
  }

  return <Main context={context} />;
}

function Main({ context }: { context: ReturnType<typeof useBlueprint> }) {
  const {
    ref: flowRef,
    getCoordinate,
    setCoordinate,
    nodes,
    edges,
    setNodes,
    addNodes,
    setEdges,
    removeNodes,
    addEdges,
    removeEdges,
    dispatchAction,
    undoLen,
    redoLen,
    onLayout,
    setLoadingNodes,
  } = context;
  const dropRef = useOnDrop({ ref: flowRef, addNodes, setNodes, setLoadingNodes });
  useBeforeUnload();

  const {
    status,
    changeStatus,
    visible: vis,
    setVisible: setVis,
    setPositionBy,
    menus,
  } = useConnectEnd(flowRef, addNodes, addEdges, getCoordinate, setNodes, setLoadingNodes);

  const onEdgeUpdate = (oldEdge: Edge<any>, newConnection: any) =>
    setEdges(els => updateEdge(oldEdge, newConnection, els));

  const nodesSelectionActive = useStore(state => state.nodesSelectionActive);
  const { setStatus } = useCodeStatus();
  const [theme, setTheme] = useStorage<'light' | 'dark'>('ui.settings.blueprint.theme', 'light');

  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = document.querySelector(`#${ONBOARD_STEP_4}`);
    const parent = canvas?.parentNode;
    if (canvas) {
      previewRef.current?.appendChild(canvas);
    }

    return () => {
      if (parent) {
        parent.insertBefore(canvas, parent.firstChild);
      }
    };
  }, []);

  return (
    <BlueprintContext.Provider value={context}>
      <div
        className={cx(
          css({
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            top: 0,
            left: 0,
            zIndex: 2,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            '.react-flow__attribution': {
              display: 'none',
            },
          }),
          theme === 'dark' && darkMode
        )}
      >
        <Header />
        <main
          className={css({
            height: 'calc(100vh - 60px)',
            position: 'relative',
            display: 'flex',
            flex: 'auto',
          })}
        >
          <Sidebar />
          <Dropdown
            open={vis}
            onOpenChange={visible => {
              // 直接点击画布的话不展示菜单
              if (visible && status.current.type !== 'pending') {
                return;
              }
              setVis(visible);
            }}
            overlay={menus}
            trigger={['click']}
          >
            <Dropdown
              prefixCls="ant-dropdown"
              overlay={nodesSelectionActive ? <SelectionMenus /> : <GlobalMenus />}
              trigger={['contextMenu']}
            >
              <div
                className={cx(css({ width: '100%', height: 'calc(100vh - 60px)' }), theme === 'dark' && darkMode)}
                ref={dropRef}
              >
                <ReactFlow
                  ref={flowRef}
                  onContextMenu={setCoordinate}
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  onConnectStart={(_event, params) => {
                    changeStatus('pending', params);
                  }}
                  onConnect={connection => {
                    changeStatus('reject');
                    const newEdge = createEdge(connection);
                    if (edges.some(edge => edge.id === newEdge.id)) {
                      return message.error('连线重复');
                    }
                    addEdges([newEdge]);
                  }}
                  onConnectEnd={event => {
                    if (status.current.type === 'pending') {
                      setTimeout(() => {
                        setCoordinate(event as any);
                        setPositionBy(event);
                        setVis(true);
                        changeStatus('none');
                      }, 0);
                    }

                    if (status.current.type === 'reject') {
                      changeStatus('none');
                    }
                  }}
                  onEdgesChange={changes => {
                    switch (changes[0].type) {
                      case 'remove': {
                        assertEdgeRemoveChange(changes);
                        const edgeIds = changes.map(change => change.id);
                        return removeEdges(edgeIds);
                      }

                      default: {
                        setEdges(edges => applyEdgeChanges(changes, edges));
                      }
                    }
                    setEdges(edges => applyEdgeChanges(changes, edges));
                  }}
                  onNodesChange={changes => {
                    const nextChanges = changes.filter(change => {
                      switch (change.type) {
                        case 'remove': {
                          const canRemove = nodes.find(({ id }) => id === change.id)?.type !== 'root';
                          if (!canRemove) {
                            message.warning('不允许删除输入/输出节点');
                          }
                          return canRemove;
                        }
                        default:
                          return true;
                      }
                    });

                    if (nextChanges.length) {
                      switch (nextChanges[0].type) {
                        case 'remove': {
                          assertNodeRemoveChange(nextChanges);
                          const nodeIds = nextChanges.map(change => change.id);
                          return removeNodes(nodeIds);
                        }

                        default: {
                          setNodes(nodes => applyNodeChanges(nextChanges, nodes));
                        }
                      }
                    }
                  }}
                  onEdgeUpdate={onEdgeUpdate}
                  onClick={() => {
                    setStatus({ type: 'hidden' });
                  }}
                >
                  <Controls>
                    <ControlButton
                      onClick={() => {
                        onLayout();
                      }}
                    >
                      <Tooltip title="自动布局" placement="right">
                        <Format theme="outline" size="24" fill="#333" />
                      </Tooltip>
                    </ControlButton>
                    <ControlButton
                      className={cx(undoLen === 0 && disabledStyle)}
                      onClick={() => {
                        if (undoLen > 0) {
                          dispatchAction('undo');
                        }
                      }}
                    >
                      <Tooltip title="撤回(⌘+z)" placement="right">
                        <UndoOutlined />
                      </Tooltip>
                    </ControlButton>
                    <ControlButton
                      className={cx(redoLen === 0 && disabledStyle)}
                      onClick={() => {
                        if (redoLen > 0) {
                          dispatchAction('redo');
                        }
                      }}
                    >
                      <Badge size="small" count={redoLen} offset={[4, 0]}>
                        <Tooltip title="重做(⇧+⌘+z)" placement="right">
                          <RedoOutlined />
                        </Tooltip>
                      </Badge>
                    </ControlButton>
                  </Controls>
                  <Background
                    color="#aaa"
                    gap={60}
                    variant={'lines' as any}
                    className={cx(theme === 'dark' && css({ background: '#555' }))}
                  />
                  <Tooltip title="切换主题">
                    <Button
                      shape="circle"
                      icon={<DarkMode theme="filled" size="24" fill="#555" strokeWidth={2} />}
                      className={css({
                        position: 'absolute',
                        zIndex: 4,
                        right: 20,
                        bottom: 220,
                      })}
                      onClick={() => {
                        setTheme(theme => (theme === 'light' ? 'dark' : 'light'));
                      }}
                    />
                  </Tooltip>
                  <div
                    ref={previewRef}
                    className={css({
                      position: 'absolute',
                      zIndex: 4,
                      right: nodes.filter(node => node.selected).length > 0 ? 10 + 320 : 10,
                      bottom: 10,
                      width: 400,
                      height: 200,
                    })}
                  />
                </ReactFlow>
              </div>
            </Dropdown>
          </Dropdown>
          <MainProps theme={theme} />
        </main>
      </div>
    </BlueprintContext.Provider>
  );
}

const darkMode = css({
  filter: 'invert(1) hue-rotate(180deg)',
});

const disabledStyle = css({
  color: '#00000040',
  background: '#f5f5f5!important',
  cursor: 'not-allowed!important',
  span: {
    color: '#00000040',
  },
});

export const localBlueprint = createEntry(
  EntryKey.BLUEPRINT,
  value => {
    try {
      return JSON.parse(value as string) as IStorage;
    } catch {
      return null;
    }
  },
  JSON.stringify,
  true
);

const nodeTypes: Record<INodeTypes, typeof BlueBlock> = {
  root: BlueBlock,
  scene: BlueBlock,
  node: BlueBlock,
  block: BlueBlock,
  component: BlueBlock,
};
