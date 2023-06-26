import { Menu } from 'antd';
import { css } from 'emotion';
import { ComponentPropsWithoutRef, useCallback, useRef, useState } from 'react';
import ReactFlow, { Node } from 'react-flow-renderer';
import { useCoordinate, useMenus, useOnAddNodeFromScript, useOnEdges, useOnNodes } from '.';
import { getSignals } from '../utils';
import { createEdge } from '../utils/createEdge';

type Status = { type: 'reject' | 'none' | 'pending' };
type Params = Parameters<NonNullable<ComponentPropsWithoutRef<typeof ReactFlow>['onConnectStart']>>[1];

/**
 * 当连线到空白处，显示蓝图图块菜单
 * @param param0
 * @returns
 */
export function useConnectEnd(
  ref: React.RefObject<HTMLDivElement>,
  addNodes: ReturnType<typeof useOnNodes>['addNodes'],
  addEdges: ReturnType<typeof useOnEdges>['addEdges'],
  getCoordinate: ReturnType<typeof useCoordinate>['getCoordinate'],
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>,
  setLoadingNodes: React.Dispatch<React.SetStateAction<string[]>>
) {
  const addNodeFromScript = useOnAddNodeFromScript(addNodes, setNodes, setLoadingNodes);

  /**
   * reject - 本次连线连接两个节点，不需要显示菜单
   *
   * none - 尚未开始连线
   *
   * pending - 开始连线
   */
  const status = useRef<Status>({ type: 'none' });
  /**
   * 记录当前节点的信息，用于和后续动态生成的节点进行连线
   */
  const params = useRef<Params | null>(null);
  const changeStatus = useCallback((type: Status['type'], payload?: Params) => {
    status.current = { type };
    if (type === 'pending' && payload) {
      params.current = payload;
    }
  }, []);

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { menus: menusData } = useMenus();

  const menus = (
    <Menu mode="vertical" className={css({ position: 'absolute', ...position, width: 100 })}>
      {Object.entries(menusData).map(([category, items]) => {
        return (
          <Menu.SubMenu key={category} title={category}>
            <div className={css({ maxHeight: 300, overflow: 'scroll' })}>
              {items.map(({ type, script }) => (
                <Menu.Item
                  key={`${script.props.script}-${script.props.name}-${script.props.url}`}
                  onClick={async () => {
                    setVisible(false);
                    const newNodes = await addNodeFromScript(script, {
                      position: getCoordinate(),
                      status: type === 0 ? 1 : 0,
                    });
                    if (newNodes) {
                      // 如果新的创建的蓝图节点只有一个对应接口，则自动连接
                      const { inputs, outputs } = getSignals(newNodes[0]);
                      if (params.current?.handleType === 'source' && inputs?.length === 1) {
                        const source = params.current.nodeId!;
                        const sourceHandle = params.current.handleId;
                        const target = String(newNodes[0].id);
                        const targetHandle = inputs[0].key;
                        const newEdge = createEdge({ source, sourceHandle, target, targetHandle });
                        addEdges([newEdge]);
                      }
                      if (params.current?.handleType === 'target' && outputs?.length === 1) {
                        const target = params.current.nodeId!;
                        const targetHandle = params.current.handleId;
                        const source = String(newNodes[0].id);
                        const sourceHandle = outputs[0].key;

                        const newEdge = createEdge({ source, sourceHandle, target, targetHandle });
                        addEdges([newEdge]);
                      }
                    }
                  }}
                >
                  {script.props.name}
                </Menu.Item>
              ))}
            </div>
          </Menu.SubMenu>
        );
      })}
    </Menu>
  );

  return {
    status,
    changeStatus,
    visible,
    setVisible,
    position,
    setPositionBy: useCallback(
      (event: MouseEvent) => {
        const { left, top } = ref.current!.getBoundingClientRect();
        setPosition({ top: event.clientY - top, left: event.clientX - left });
      },
      [ref]
    ),
    menus,
  };
}
