import { WeixinMarket, EveryUser, Like, DoubleLeft, MenuFoldOne, MenuUnfoldOne } from '@icon-park/react';
import { Button, MenuProps, Menu, Divider, Space } from 'antd';
import React from 'react';
import { useState } from 'react';
import { useModalState } from '../Context';
import { SidebarType } from '../type';
import shallow from 'zustand/shallow';
import Icon, { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { css } from 'emotion';
type MenuItem = Required<MenuProps>['items'][number];

const getItems = (sidebarType: SidebarType): MenuItem[] => {
  return [
    {
      key: '1',
      icon: <Icon style={{ color: 'orange' }} component={WeixinMarket as any} />,
      label: <span style={{ color: sidebarType === SidebarType.Store ? 'orange' : 'black' }}>资源商城</span>,
      title: '资源商城',
    },
    {
      key: '2',
      icon: <Icon style={{ color: 'orange' }} component={EveryUser as any} />,
      label: <span style={{ color: sidebarType === SidebarType.Team ? 'orange' : 'black' }}>团队资源</span>,
      title: '团队资源',
    },
    {
      key: '3',
      icon: <Icon style={{ color: 'orange' }} component={Like as any} />,
      label: <span style={{ color: sidebarType === SidebarType.AI ? 'orange' : 'black' }}>AI 工具</span>,
      title: 'AI 工具',
    },
  ];
};

export default React.memo(() => {
  const { sidebarType: selectSidebar, updateModalState } = useModalState(
    state => ({ sidebarType: state.modalState.sidebarType, updateModalState: state.updateModalState }),
    shallow
  );
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const getSidebarTypeKey = (sidebar: SidebarType) => {
    switch (sidebar) {
      case SidebarType.Store:
        return '1';
      case SidebarType.Team:
        return '2';
      case SidebarType.AI:
        return '3';
      default:
        return '1';
    }
  };

  const onClickMenu = (i: any) => {
    updateModalState({
      categoryId: '1',
      sidebarType: i.key === '1' ? SidebarType.Store : i.key === '2' ? SidebarType.Team : SidebarType.AI,
    });
  };

  return (
    <div style={{ position: 'relative', borderRight: '1px solid #f0f0f0' }}>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          padding: '6px 0',
          bottom: 0,
          right: 0,
          cursor: 'pointer',
          color: 'orange',
          borderTop: '1px solid #f0f0f0',
        }}
        onClick={toggleCollapsed}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            padding: '6px 12px',
            ['&:hover']: {
              background: '#f0f0f0',
            },
          })}
        >
          {collapsed ? (
            <>
              <Icon style={{ fontSize: '18px' }} component={DoubleRightOutlined as any} />
              <span style={{ marginLeft: '5px' }}>展开</span>
            </>
          ) : (
            <>
              <Icon style={{ fontSize: '18px' }} component={DoubleLeftOutlined as any} />
              <span style={{ marginLeft: '5px' }}>收起</span>
            </>
          )}
        </div>
      </div>
      <Menu
        selectedKeys={[getSidebarTypeKey(selectSidebar)]}
        mode="inline"
        inlineCollapsed={collapsed}
        items={getItems(selectSidebar)}
        onClick={onClickMenu}
      />
    </div>
  );
});
