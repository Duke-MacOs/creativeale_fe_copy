import React, { memo, useEffect } from 'react';
import { Checkbox, Dropdown, Menu } from 'antd';
import { useFlagItems, useDebugFlag } from '@shared/globals/debugHooks';
import Icon from '@ant-design/icons';
import { Bug } from '@icon-park/react';
import HeaderButton from './HeaderButton';
import { collectEvent, EventTypes } from '@editor/utils';

declare const Laya: any;

const DebugFlagsView = () => {
  const { flags, items, setFlags } = useFlagItems();
  const isOpen = useDebugFlag({
    flagBit: 0b100,
    title: '打开FPS面板',
  });

  useEffect(() => {
    let id: any;
    const setFPS = () => {
      if (!Laya || !Laya.stage) {
        id = setTimeout(setFPS, 10);
      } else {
        if (isOpen) {
          Laya.Stat.show();
        } else {
          Laya.Stat.hide();
        }
      }
    };
    setFPS();
    return () => {
      if (id) {
        clearTimeout(id);
      }
    };
  }, [isOpen]);
  if (!(flags & 1) || !items.length) {
    return null;
  }
  return (
    <Dropdown
      overlay={
        <Menu>
          {items
            .sort(({ flagBit: f1 }, { flagBit: f2 }) => f1 - f2)
            .map(item => (
              <Menu.Item key={item.flagBit}>
                <Checkbox
                  checked={Boolean(flags & item.flagBit)}
                  onChange={({ target: { checked } }) => {
                    let newFlags = flags | item.flagBit;
                    if (!checked) {
                      newFlags -= item.flagBit;
                    }
                    setFlags(newFlags);
                  }}
                >
                  {item.title}
                </Checkbox>
              </Menu.Item>
            ))}
        </Menu>
      }
      placement="bottomLeft"
    >
      <HeaderButton
        icon={<Icon component={Bug as any} />}
        onClick={() => {
          collectEvent(EventTypes.OperationButton, {
            type: '同步',
          });
        }}
      >
        调试
      </HeaderButton>
    </Dropdown>
  );
};

export default memo(DebugFlagsView);
