import { notification } from 'antd';
import React from 'react';

type IProps = Parameters<(typeof notification)['success']>[0] & { type: 'success' | 'info' | 'warning' | 'error' };

function generateNotification<T extends Partial<IProps>>(defaultProps: T) {
  return (props: T extends { message: React.ReactNode } ? Partial<IProps> : IProps) => {
    const { type = 'success', ...rest } = { ...defaultProps, ...props };
    notification[type](rest);
  };
}

export const notificationForCompile = generateNotification({
  key: 'customScript',
  placement: 'bottomRight',
});
