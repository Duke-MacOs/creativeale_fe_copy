import React from 'react';
import { Button, Tooltip, TooltipProps } from 'antd';
import { Close, Tips } from '@icon-park/react';
import { useVisible } from '@editor/hooks';
import Icon from '@ant-design/icons';
import { css, cx } from 'emotion';

export interface GuideTipProps {
  id: string;
  head?: React.ReactNode;
  body: React.ReactNode;
  children: React.ReactNode;
  placement?: TooltipProps['placement'];
  className?: string;
}

export const GuideTip = ({ id, head, body, children, placement, className }: GuideTipProps) => {
  const [visible, setVisible] = useVisible(id);
  const content = (
    <div>
      {head && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Icon component={Tips as any} /> {head}
          </div>
          <Button
            type="text"
            size="small"
            icon={<Icon component={Close as any} />}
            style={{ color: 'white' }}
            onClick={event => {
              event.stopPropagation();
              setVisible(false);
            }}
          />
        </div>
      )}
      {body}
      <Button
        style={{ marginLeft: 'auto', marginTop: 16, display: 'block' }}
        type="link"
        onClick={event => {
          event.stopPropagation();
          setVisible(false);
        }}
      >
        我知道了
      </Button>
    </div>
  );
  return (
    <Tooltip
      open={visible}
      color="#2A55E5"
      title={content}
      placement={placement}
      overlayStyle={{ width: 336, maxWidth: 336 }}
      overlayClassName={cx(
        placement === 'leftTop' &&
          css({
            '.ant-tooltip-inner': {
              transform: 'translateY(-5px)',
            },
            '.ant-tooltip-arrow': {
              top: 0,
            },
          }),
        className
      )}
      arrowPointAtCenter
      overlayInnerStyle={{ padding: 16, lineHeight: '20px' }}
    >
      {children}
    </Tooltip>
  );
};
