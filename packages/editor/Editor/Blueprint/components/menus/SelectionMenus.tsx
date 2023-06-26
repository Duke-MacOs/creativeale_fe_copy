import { Menu } from 'antd';
import { useBPContext, useAutoKeys } from '../../hooks';

/**
 * 选中框菜单
 * @param props
 * @returns
 */
export function SelectionMenus(props: any) {
  const {
    canOnCopy,
    onCopy,
    canOnEnter,
    onEnter,
    canOnGroup,
    onGroup,
    // canOnCollapse,
    // onCollapse,
    // canOnExpand,
    // onExpand,
    canOnPublish,
    onPublish,
    canOnToggle,
    onEnabled,
    onDisabled,
  } = useBPContext()!;
  const newKey = useAutoKeys();
  return (
    <Menu {...props}>
      <Menu.Item key={newKey()} onClick={() => onCopy()} disabled={!canOnCopy}>
        复制
      </Menu.Item>
      <Menu.Item key={newKey()} onClick={() => onCopy({ remove: true })} disabled={!canOnCopy}>
        剪切
      </Menu.Item>
      {canOnToggle && (
        <>
          <Menu.Item key={newKey()} onClick={() => onEnabled()}>
            启用
          </Menu.Item>
          <Menu.Item key={newKey()} onClick={() => onDisabled()}>
            禁用
          </Menu.Item>
        </>
      )}
      <Menu.Item
        key={newKey()}
        disabled={!canOnEnter}
        onClick={() => {
          onEnter();
        }}
      >
        进入节点蓝图
      </Menu.Item>
      <Menu.Item key={newKey()} disabled={!canOnGroup} onClick={() => onGroup()}>
        组合
      </Menu.Item>
      {/* <Menu.Item key={newKey()} disabled={!canOnCollapse} onClick={() => onCollapse()}>
        折叠子节点
      </Menu.Item>
      <Menu.Item key={newKey()} disabled={!canOnExpand} onClick={() => onExpand()}>
        展开
      </Menu.Item> */}
      {canOnPublish && (
        <Menu.Item key={newKey()} onClick={() => onPublish()}>
          发布
        </Menu.Item>
      )}
    </Menu>
  );
}
