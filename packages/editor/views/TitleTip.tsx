import { Tooltip, TooltipProps } from 'antd';
import { css } from 'emotion';
import React from 'react';

export interface TitleTipProps {
  title: React.ReactNode;
  children: React.ReactNode;
  placement?: TooltipProps['placement'];
}

export const TitleTip = ({ title, children, placement, ...rest }: TitleTipProps) => {
  return (
    <Tooltip
      {...rest}
      arrowPointAtCenter
      color="white"
      title={title}
      placement={placement}
      overlayInnerStyle={{ color: '#333' }}
      overlayClassName={css({ '.ant-tooltip-inner': { padding: '8px 16px' } })}
    >
      {children}
    </Tooltip>
  );
};
