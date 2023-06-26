import { collectEventTab } from '@main/collectEvent';
import { reactText } from '@shared/utils';
import { css } from 'emotion';
import { Tabs } from 'antd';
import React from 'react';

export interface TabsContainerProps {
  value?: string | undefined;
  onChange?(value: string): void;
  options?: Array<{ name: React.ReactNode; value: string }>;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

export function TabsContainer({ value: v, onChange, options = [], children, extra }: TabsContainerProps) {
  return (
    <div
      className={css({
        flex: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '1208px',
        minHeight: '100%',
        borderRadius: '4px',
        margin: '0 16px',
        '.ant-tabs-nav': {
          margin: 0,
        },
      })}
    >
      {options.length > 0 && (
        <Tabs
          size="large"
          activeKey={findOption(v, options).value}
          onChange={key => {
            const { name } = findOption(key, options);
            collectEventTab(reactText(name));
            onChange?.(key);
          }}
          tabBarExtraContent={extra}
          style={{ color: '#b7b4c3' }}
          items={options.map(item => ({ label: item.name, key: item.value }))}
        />
      )}
      {!options.length && extra && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>{extra}</div>
      )}
      {children}
    </div>
  );
}

export const findOption = <O extends { name: React.ReactNode; value: string }>(
  value: string | undefined,
  options: O[]
): O => options.find(({ value: v }) => v === value) ?? options[0];
