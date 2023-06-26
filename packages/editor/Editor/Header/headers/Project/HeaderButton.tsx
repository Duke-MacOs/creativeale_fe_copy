import React, { useState } from 'react';
import { Badge, Button } from 'antd';
import className from '../../style';
import { ButtonProps } from 'antd/lib/button';
export interface HeaderButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (...args: Parameters<NonNullable<ButtonProps['onClick']>>) => Promise<void> | void;
  dot?: boolean;
}
export default function HeaderButton({
  dot = false,
  type,
  icon,
  disabled,
  children,
  loading,
  onClick,
  ...props
}: HeaderButtonProps) {
  const [waiting, setWaiting] = useState(false);
  return (
    <div {...props} className={`${className}-btn`}>
      <Badge dot={dot}>
        <Button
          type={type}
          icon={icon}
          disabled={Boolean(disabled || waiting || loading)}
          loading={waiting || loading}
          onClick={(...args) => {
            if (!onClick) return;
            const promise = onClick(...args);
            if (promise instanceof Promise) {
              setWaiting(true);
              promise.finally(() => {
                setWaiting(false);
              });
            }
          }}
        />
      </Badge>
      <span>{children}</span>
    </div>
  );
}
