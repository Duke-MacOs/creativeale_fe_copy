import React, { memo, useState } from 'react';
import { Popover, Button } from 'antd';
import { useVisible } from '@editor/hooks';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { css } from 'emotion';

export interface TipsPopupProps {
  disabled?: boolean;
  children: React.ReactNode;
  placement?: TooltipPlacement;
  trigger?: 'hover';
  visibleKey: string;
  content: string;
  title: string;
}

export default memo(
  ({ disabled = false, visibleKey, placement = 'bottom', trigger, children, content, title }: TipsPopupProps) => {
    const [triggered, setTriggered] = useState(false);
    const [visible, setVisible] = useVisible(visibleKey, {
      disabled: disabled || (trigger !== undefined && !triggered),
      byStep: trigger === undefined,
    });
    const popoverDesc = (
      <div>
        <p
          className={css({
            marginBottom: 0,
            color: 'white',
          })}
        >
          {content}
        </p>
        <div
          className={css({
            display: 'flex',
            justifyContent: 'flex-end',
          })}
        >
          <Button
            size="small"
            className={css({
              marginTop: '6px',
              fontSize: '12px',
              color: '#3955F6',
            })}
            onClick={() => {
              setVisible(false);
            }}
          >
            我知道了
          </Button>
        </div>
      </div>
    );

    return (
      <Popover
        color="#3955F6"
        title={title}
        trigger={trigger}
        placement={placement}
        open={visible}
        content={popoverDesc}
        onOpenChange={triggered => setTriggered(triggered)}
        overlayClassName={css({
          '.ant-popover-arrow': {
            borderTopColor: '#3955F6!important',
            borderLeftColor: '#3955F6!important',
            borderRightColor: '#3955F6!important',
            borderBottomColor: '#3955F6!important',
            'span::before': {
              background: 'linear-gradient(270deg,rgb(57, 85, 246),rgb(57, 85, 246)) no-repeat -10px -10px',
            },
          },
          '.ant-popover-title': {
            borderBottom: 'none',
            paddingTop: 12,
            color: 'white',
          },
          '.ant-popover-inner-content': {
            paddingTop: 0,
            maxWidth: 256,
          },
        })}
      >
        {children}
      </Popover>
    );
  }
);
