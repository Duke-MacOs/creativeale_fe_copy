import { Menu } from 'antd';
import { useReactFlow } from 'react-flow-renderer';
import { useAutoKeys, useBPContext } from '../../hooks';

/**
 * 全局菜单
 * @param props
 * @returns
 */
export function GlobalMenus(props: any) {
  const { getCoordinate, onPaste, onLayout, onExpandAll } = useBPContext()!;
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const newKey = useAutoKeys();
  return (
    <Menu {...props}>
      <Menu.Item
        key={newKey()}
        onClick={() => {
          onPaste(getCoordinate());
        }}
      >
        粘贴（浅拷贝）
      </Menu.Item>
      <Menu.Item
        key={newKey()}
        onClick={() => {
          onPaste(getCoordinate(), true);
        }}
      >
        粘贴（深拷贝）
      </Menu.Item>
      <Menu.Item
        key={newKey()}
        onClick={() => {
          onExpandAll();
        }}
      >
        展开全部
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key={newKey()}
        onClick={() => {
          fitView();
        }}
      >
        居中
      </Menu.Item>
      <Menu.Item
        key={newKey()}
        onClick={() => {
          zoomIn();
        }}
      >
        放大
      </Menu.Item>
      <Menu.Item
        key={newKey()}
        onClick={() => {
          zoomOut();
        }}
      >
        缩小
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key={newKey()}
        onClick={() => {
          onLayout();
        }}
      >
        水平布局
      </Menu.Item>
      <Menu.Item
        key={newKey()}
        onClick={() => {
          onLayout('TB');
        }}
      >
        垂直布局
      </Menu.Item>
    </Menu>
  );
}
