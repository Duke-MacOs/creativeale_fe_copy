import { Button, Dropdown, Empty, Input, Menu, message, Modal, Space, Tooltip } from 'antd';
import { css, cx } from 'emotion';
import { useDrag, useDragLayer } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useBPContext, useCodeStatus, useOnAddNodeFromScript } from '../../hooks';
import { getCustomScriptByOrderId, neverThrow, newID, onMacOS } from '@editor/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useBlueprintHotkeys,
  useOnAddCustomScript,
  useOnDeleteCustomScript,
  useOnRenameCustomScript,
} from '@editor/aStore';
import BlueBlock from '../../components/BlueBlock';
import Icon, {
  CodeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusCircleFilled,
  UploadOutlined,
} from '@ant-design/icons';
import { ItemType, useMenus } from '../../hooks/useMenus';
import { useReactFlow, Node } from 'react-flow-renderer';
import { useEventBus } from '@byted/hooks';
import { iconOfScript } from '@editor/utils/icons';
import { useStore } from 'react-redux';
import { publishDynamicResource, unpublishDynamicResource } from '../../api';

export function BlockList() {
  const { setNodes, addNodes, setLoadingNodes } = useBPContext()!;
  const { menus, search, setSearch } = useMenus();
  const onAddCustomScript = useOnAddCustomScript();
  const onRenameCustomScript = useOnRenameCustomScript();
  const addNodeFromScript = useOnAddNodeFromScript(addNodes, setNodes, setLoadingNodes);

  const [modalState, setModalState] = useState<
    { type: 'add'; name: string } | { type: 'edit'; name: string; id: number } | null
  >(null);
  const [activeCategory, setActiveCategory] = useState(Object.keys(menus)[0]);
  const isScrolling = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) return;
          else if (!isScrolling.current) {
            setActiveCategory((entry.target as any).dataset.category);
          }
        }
      },
      {
        threshold: 0.8,
      }
    );

    for (const el of document.querySelectorAll('[data-category]')) {
      io.observe(el);
    }
  }, []);

  const inputRef = useRef<any>(null);
  useBlueprintHotkeys(`${onMacOS('command', 'control')}+f`, event => {
    event.preventDefault();
    inputRef.current?.focus();
  });

  const { setStatus } = useCodeStatus();

  return useMemo(
    () => (
      <>
        <div className={css({ padding: 10 })}>
          <Input.Search
            ref={inputRef}
            placeholder="搜索"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
            }}
            className={css({ flex: 1 })}
            allowClear
          />
        </div>
        <div
          className={css({
            height: 'calc(100% - 52px)',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid rgba(31, 28, 35, 0.08)',
          })}
        >
          {Object.keys(menus).length > 0 ? (
            <>
              <div
                className={css({
                  height: '100%',
                  padding: 8,
                  color: 'rgba(31, 28, 35, 0.8)',
                  borderRight: '1px solid rgba(31, 28, 35, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                })}
              >
                {Object.keys(menus).map(category => (
                  <div
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);

                      isScrolling.current = true;
                      document.querySelector(`[data-category=${category}]`)?.scrollIntoView({ behavior: 'auto' });
                      setTimeout(() => {
                        isScrolling.current = false;
                      }, 100);
                    }}
                    className={cx(
                      css({
                        fontSize: 12,
                        width: 72,
                        height: 36,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRight: 3,
                        marginBottom: 12,
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'rgb(243, 237, 249)',
                        },
                      }),
                      activeCategory === category &&
                        css({
                          color: 'rgb(106, 58, 199)',
                          background: 'rgb(243, 237, 249)',
                          fontWeight: 700,
                        })
                    )}
                  >
                    <span>{category}</span>
                  </div>
                ))}
                <Button
                  size="small"
                  icon={<PlusCircleFilled />}
                  onClick={async () => {
                    setModalState({ type: 'add', name: '未命名脚本' });
                  }}
                  className={css({ fontSize: 12, height: 30 })}
                >
                  新增
                </Button>
              </div>
              <div
                className={css({
                  height: '100%',
                  flex: 1,
                  margin: 12,
                  overflowY: 'scroll',
                  '::-webkit-scrollbar': {
                    display: 'none',
                  },
                })}
              >
                {Object.entries(menus).map(([category, items]) => (
                  <div key={category} className={css({ marginBottom: 24 })} data-category={category}>
                    <div className={css({ color: 'rgba(31, 28, 35, 0.8)', fontSize: 12, padding: 6 })}>{category}</div>
                    <div>
                      {items.map(({ type, script, resourceId, inUsed }, index) => (
                        <Block
                          key={`${script.props.name}_${index}`}
                          type={type}
                          resourceId={resourceId}
                          inUsed={inUsed}
                          script={script}
                          setModalState={setModalState}
                          onClick={() => {
                            addNodeFromScript(script, {
                              status: type === 0 ? 1 : 0,
                            });
                            setStatus({
                              type: 'hidden',
                            });
                          }}
                          setNodes={setNodes}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty />
          )}
        </div>

        {modalState && (
          <AddModal
            label={modalState.type === 'add' ? '新增脚本' : '编辑脚本'}
            defaultValue={modalState.name}
            onSubmit={async name => {
              if (name) {
                try {
                  switch (modalState.type) {
                    case 'add': {
                      const { orderId } = await onAddCustomScript(`${name}.ts`, 'typescript', defaultCode);
                      message.success('创建成功');
                      const id = newID();
                      await addNodes([
                        {
                          id: String(id),
                          position: { x: 100, y: 100 },
                          type: 'block',
                          data: {
                            id,
                            editor: { inputs: [], outputs: [], nodeType: 'block' },
                            props: { script: 'CustomScript', name, url: orderId },
                            type: 'Script',
                          },
                        },
                      ]);
                      setStatus({
                        type: 'selected',
                      });
                      break;
                    }

                    case 'edit': {
                      onRenameCustomScript(modalState.id, `${name}.ts`);
                      break;
                    }

                    default: {
                      neverThrow(modalState);
                    }
                  }
                } catch (error) {
                  message.error(error.message);
                } finally {
                  setModalState(null);
                }
              } else {
                setModalState(null);
              }
            }}
          />
        )}
        <DragLayer />
      </>
    ),
    [
      activeCategory,
      addNodeFromScript,
      addNodes,
      menus,
      modalState,
      onAddCustomScript,
      onRenameCustomScript,
      search,
      setNodes,
      setSearch,
      setStatus,
    ]
  );
}

export function Block({
  type,
  resourceId,
  inUsed,
  script,
  onClick,
  setModalState,
  setNodes,
}: {
  type: ItemType.Inherent | ItemType.Team | ItemType.Personal | ItemType.Project;
  resourceId?: number;
  inUsed?: boolean;
  script: RikoScript;
  onClick(): void;
  setModalState: (state: any) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
}) {
  const {
    id,
    props: { name, url, script: scriptType },
  } = script;
  const [_, ref, preview] = useDrag({
    item: {
      type: 'block',
      script,
      status: type === ItemType.Inherent ? 1 : 0,
    },
  });
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);
  const { getState } = useStore<EditorState>();
  const onDeleteCustomScript = useOnDeleteCustomScript();
  const { trigger: reload } = useEventBus('reloadResource');
  const { status, setStatus } = useCodeStatus();

  const el = (
    <div
      ref={ref}
      className={cx(
        css({
          cursor: 'pointer',
          border: '1px solid rgba(31,28,35,0.08)',
          borderRadius: 3,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'stretch',
        }),
        inUsed === false &&
          css({
            color: '#999',
          }),
        status.type === 'writeOnly' &&
          status.url === url &&
          css({ background: 'rgb(202 180 225)', '&:hover': { background: 'rgb(202 180 225)' } })
      )}
      onClick={onClick}
    >
      <Space
        className={css({ flex: 1, padding: 10, '&:hover': { background: 'rgb(243, 237, 249)' }, overflow: 'hidden' })}
      >
        <Icon component={iconOfScript(script)} style={{ fontSize: 16 }} />
        <Tooltip title={type !== ItemType.Inherent ? name?.replace(/\.ts$/, '') : undefined}>
          <div
            className={css({
              maxWidth: 86,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            })}
          >
            {name?.replace(/\.ts$/, '')}
          </div>
        </Tooltip>
      </Space>
      {scriptType === 'CustomScript' && url && (
        <Tooltip title="编辑">
          <CodeOutlined
            className={css({
              padding: 10,
              '&:hover': { background: 'rgb(243, 237, 249)' },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            })}
            onClick={e => {
              e.stopPropagation();
              const tsCode = url
                ? getCustomScriptByOrderId(getState().project, url).ideCode
                : (script.props.tsCode as string);
              if (url) {
                setStatus({
                  type: 'writeOnly',
                  url,
                });
              } else {
                setStatus({
                  type: 'readOnly',
                  name,
                  tsCode,
                });
              }

              setNodes(nodes => nodes.map(node => ({ ...node, selected: false })));
            }}
          />
        </Tooltip>
      )}
    </div>
  );

  const items =
    type === ItemType.Personal || type === ItemType.Team
      ? [
          {
            label: (
              <Space>
                <DownloadOutlined />
                下架
              </Space>
            ),
            key: '1',
          },
        ]
      : type === ItemType.Project
      ? [
          {
            label: (
              <Space>
                <UploadOutlined />
                发布
              </Space>
            ),
            key: '2',
          },
        ]
      : [];

  if (scriptType === 'CustomScript') {
    // if (url || script.props.tsCode) {
    //   items.push({
    //     label: (
    //       <Space>
    //         <CodeOutlined />
    //         {url ? '编辑' : '查看'}
    //       </Space>
    //     ),
    //     key: '3',
    //   });
    // }
    if (url) {
      items.push(
        {
          label: (
            <Space>
              <EditOutlined />
              重命名
            </Space>
          ),
          key: '4',
        } as any,
        {
          label: (
            <Space>
              <DeleteOutlined />
              删除
            </Space>
          ),
          key: '5',
        } as any
      );
    }
  }

  return (
    <Dropdown
      overlay={
        <Menu
          items={items}
          onClick={async e => {
            if (e.key === '1' && resourceId) {
              try {
                await unpublishDynamicResource({ id: resourceId });
                reload();
                message.success('下架成功');
              } catch (error) {
                message.error(error.message);
              }
            }

            if (e.key === '2') {
              const {
                props: { name = '', url },
              } = script!;
              const { ideCode } = getCustomScriptByOrderId(getState().project, url);
              await publishDynamicResource({
                name: name,
                description: '',
                type: 'code',
                data: {
                  code: ideCode,
                  contextType: 'both',
                },
              });
              reload();
              message.success('发布成功');
            }

            // if (e.key === '3') {
            //   const tsCode = url
            //     ? getCustomScriptByOrderId(getState().project, url).ideCode
            //     : (script.props.tsCode as string);
            //   if (url) {
            //     setStatus({
            //       type: 'writeOnly',
            //       url,
            //     });
            //   } else {
            //     setStatus({
            //       type: 'readOnly',
            //       name,
            //       tsCode,
            //     });
            //   }
            // }

            if (e.key === '4') {
              setModalState({ type: 'edit', name: name?.replace(/\.ts$/, ''), id });
            }

            if (e.key === '5') {
              if (inUsed) {
                message.error('脚本正在使用，无法删除');
              } else {
                onDeleteCustomScript(id, url, false);
              }
            }
          }}
        />
      }
      trigger={['contextMenu']}
    >
      {el}
    </Dropdown>
  );
}

function DragLayer() {
  const { getZoom } = useReactFlow();
  function getItemStyles(initialOffset: any, currentOffset: any) {
    if (!initialOffset || !currentOffset) {
      return {
        display: 'none',
      };
    }
    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {
      transform,
      WebkitTransform: transform,
    };
  }
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !item || !item.script) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <div
          className={css({
            transformOrigin: '0 0',
            transform: `scale(${getZoom()})`,
          })}
        >
          <BlueBlock
            id="0"
            type="block"
            data={item.script}
            isConnectable={false}
            selected={true}
            xPos={0}
            yPos={0}
            dragging={false}
            zIndex={0}
          />
        </div>
      </div>
    </div>
  );
}

function AddModal({
  defaultValue,
  onSubmit,
  label,
}: {
  label: string;
  defaultValue: string;
  onSubmit: (name: string | false) => Promise<void>;
}) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (value) {
      if (/\s/.test(value)) {
        message.warning('名字不能包含空白字符');
        return;
      }
      setLoading(true);
      onSubmit(value).finally(() => setLoading(false));
    } else {
      message.warning('名字不能为空');
    }
  };

  return (
    <Modal
      open={true}
      title={label}
      width={500}
      okText="确认"
      cancelText="取消"
      confirmLoading={loading}
      onOk={handleSubmit}
      onCancel={() => onSubmit(false)}
    >
      <Input
        autoFocus
        placeholder="请输入脚本名称"
        maxLength={20}
        value={value}
        onChange={({ currentTarget: { value } }) => {
          setValue(value);
        }}
        onPressEnter={handleSubmit}
      />
    </Modal>
  );
}

export const defaultCode = `export default class Script extends Riko.Script {
  enableSignal = Riko.useInput({ name: '启用' }); 

  // 脚本开始逻辑
  onAwake() {

  }

  onSignal(inputId: string, value: unknown) {
    if (inputId === this.enableSignal) {
      console.log("Hello World!");
    }
  }
}
`;
