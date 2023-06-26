import useContextMenu from './TimePane/Content/hooks/useContextMenu';
import ControlBar from './ControlBar';
import TimePane from './TimePane';
import WarnBar from './WarnBar';
import { useSettings } from '@editor/aStore';
import { useBoolean } from '@byted/hooks';
import { memo, useEffect } from 'react';
import { useMovable } from '../hooks';
import { Layout } from 'antd';

const defaultHeight = 74 + 32 * 7;

export default function Elements() {
  const typeOfPlay = useSettings('typeOfPlay');
  const { state: collapsed, toggle: toggleCollapsed, setFalse: setCollapsedFalse } = useBoolean(false);
  const { accumulative, activate, activated } = useMovable(-32 * 14, 32 * 4, {
    storage: 'ui.settings.elements.height',
    reserved: true,
    vertical: true,
  });
  useEffect(() => {
    if (activated) {
      setCollapsedFalse();
    }
  }, [activated, setCollapsedFalse]);

  return (
    <Layout.Content
      style={{
        flex: collapsed ? 'none' : `0 0 ${defaultHeight - accumulative}px`,
        boxShadow: '0px -2px 8px rgba(0,0,0,0.08)',
        // background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {typeOfPlay === 3 && <WarnBar />}
      <ControlBar collapsed={collapsed} toggleCollapsed={toggleCollapsed} onReheight={activate} />
      {collapsed ? <DumbTimePane /> : <TimePane />}
    </Layout.Content>
  );
}

const DumbTimePane = memo(() => useContextMenu().element);
