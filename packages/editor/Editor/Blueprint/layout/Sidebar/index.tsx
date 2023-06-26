import { Button, Tooltip } from 'antd';
import { css, cx } from 'emotion';
import { memo, useState } from 'react';
import Icon, { ArrowLeftOutlined, ArrowRightOutlined, GlobalOutlined } from '@ant-design/icons';
import { useEventBus } from '@byted/hooks';
import { BlockList } from './BlockList';
import { ReactComponent as MyIcon } from './Icon.svg';
import { SceneVar } from './SceneVar';
import { useSidebar } from '../common';

export const Sidebar = memo(() => {
  const { visible, toggle } = useSidebar();

  const { trigger } = useEventBus('RikoLog');
  const [showBlockList, setShowBlockList] = useState(true);
  return (
    <div
      className={cx(
        css({
          width: showBlockList ? 280 : 440,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #ccc',
          boxSizing: 'content-box',
          position: 'relative',
          transition: 'all .3s',
          marginLeft: showBlockList ? '-280px' : '-440px',
        }),
        visible &&
          css({
            marginLeft: 'unset',
          })
      )}
    >
      {showBlockList ? <BlockList /> : <SceneVar />}
      <Tooltip title={visible ? '收起' : '图块列表'} placement="right">
        <Button
          shape="circle"
          className={css({
            position: 'absolute',
            right: -44,
            top: 8,
            zIndex: 5,
          })}
          icon={visible ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
          onClick={() => toggle()}
        />
      </Tooltip>
      <Tooltip title={'场景变量'} placement="right">
        <Button
          type={showBlockList ? undefined : 'primary'}
          shape="circle"
          className={css({
            position: 'absolute',
            right: -44,
            top: 8 + 40,
            zIndex: 5,
          })}
          icon={<Icon component={MyIcon} />}
          onClick={() => setShowBlockList(state => !state)}
        />
      </Tooltip>

      <Tooltip title={'全局变量'} placement="right">
        <Button
          shape="circle"
          className={css({
            position: 'absolute',
            right: -44,
            top: 8 + 40 * 2,
            zIndex: 5,
          })}
          icon={<GlobalOutlined />}
          onClick={() => trigger('globalVar')}
        />
      </Tooltip>
    </div>
  );
});
