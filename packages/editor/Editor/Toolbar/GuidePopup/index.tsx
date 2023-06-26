import { classnest, collectEvent, EventTypes } from '@editor/utils';
import { Attention, Close, TipsOne } from '@icon-park/react';
import { Button, Popover, Tabs, Empty } from 'antd';
import { TitleTip } from '@editor/views';
import { memo, useState } from 'react';
import suggestions from './suggestions';
import useWarnings from './useWarnings';
import Icon from '@ant-design/icons';
import { css } from 'emotion';

export default memo(() => {
  const [visible, setVisible] = useState(false);
  const warnings = useWarnings();
  return (
    <div
      className={classnest([
        buttonStyle,
        warnings.length > 0 &&
          css({
            background: '#FFA900 !important',
            button: {
              color: 'white !important',
            },
          }),
      ])}
    >
      <Popover
        destroyTooltipOnHide
        placement="leftTop"
        trigger="click"
        overlayClassName={popupStyle}
        onOpenChange={(visible: boolean) => {
          if (visible) {
            if (warnings.length) {
              collectEvent(EventTypes.RiskAlert, {
                from: '编辑中曝光',
              });
            } else {
              collectEvent(EventTypes.CraftSuggestion, null);
            }
          }
          setVisible(visible);
        }}
        open={visible}
        content={
          <Content
            warnings={warnings}
            onClose={() => {
              setVisible(false);
            }}
          />
        }
      >
        <TitleTip title="制作建议" placement="left">
          <Button type="text" icon={<Icon component={TipsOne as any} />} />
        </TitleTip>
      </Popover>
    </div>
  );
});

const Content = ({ onClose, warnings }: any) => {
  return (
    <Tabs
      defaultActiveKey={warnings.length ? '2' : '1'}
      tabBarExtraContent={
        <Button type="text" style={{ marginRight: 10 }} onClick={onClose} icon={<Icon component={Close as any} />} />
      }
      onChange={(key: string) => {
        collectEvent(key === '1' ? EventTypes.CraftSuggestion : EventTypes.RiskAlert, null);
        if (key === '1') {
          collectEvent(EventTypes.CraftSuggestion, null);
        } else {
          collectEvent(EventTypes.RiskAlert, {
            from: '编辑中曝光',
          });
        }
      }}
    >
      <Tabs.TabPane key="1" tab="制作建议">
        <Card description="暂无制作建议" items={suggestions} />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="2"
        tab={
          warnings.length ? (
            <>
              风险提示 <Icon component={FilledAttention} />
            </>
          ) : (
            '风险提示'
          )
        }
      >
        <Card description="暂无风险提示" items={warnings as typeof suggestions} />
      </Tabs.TabPane>
    </Tabs>
  );
};

const Card = ({ items, description }: { items: Array<{ title?: string; items: string[] }>; description: string }) => {
  return (
    <div
      className={css({
        height: 400,
        overflow: 'auto',
        '::-webkit-scrollbar': {
          display: 'none',
        },
      })}
    >
      {items.length ? (
        items.map(({ items, title }, index) => (
          <div key={index} className={css({ padding: '12px 16px' })}>
            {title && <div className={css({ fontSize: 14, fontWeight: 600, paddingBottom: 8 })}>{title}</div>}
            {items.map((item, index) => (
              <div key={index} className={css({ color: '#666666' })}>
                {item}
              </div>
            ))}
          </div>
        ))
      ) : (
        <Empty description={description} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

const FilledAttention = (props: any) => <Attention {...props} theme="filled" fill="#FFA900" />;

const buttonStyle = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 34,
});

const popupStyle = css({
  '.ant-popover-inner-content': { padding: 0, width: 300 },
  '.ant-tabs-nav-wrap': {
    padding: '0 16px',
  },
});
