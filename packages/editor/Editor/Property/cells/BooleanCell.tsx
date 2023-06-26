import type { IBooleanSpark, SparkProps } from './types';
import { Checkbox, Switch, Button, Radio } from 'antd';
import { withValue } from './ValueCell';
import { neverThrow } from './utils';
import {
  EyeInvisibleOutlined,
  StopOutlined,
  UnlockFilled,
  EyeOutlined,
  LockFilled,
  StopFilled,
} from '@ant-design/icons';

export const BooleanBase = ({
  type = 'checkbox',
  defaultValue,
  tabIndex,
  readOnly,
  disabled,
  value,
  size,
  onChange,
  ...props
}: SparkProps<IBooleanSpark>) => {
  const checked = value ?? defaultValue ?? false;
  const onClick = () => onChange?.(!checked);
  if (readOnly || disabled) {
    onChange = undefined;
  }
  switch (type) {
    case 'checkbox':
      return (
        <Checkbox
          {...props}
          checked={checked}
          disabled={disabled}
          tabIndex={tabIndex}
          onChange={({ target: { checked } }) => onChange?.(checked)}
        />
      );
    case 'switch':
      return (
        <Switch
          {...props}
          size={size}
          checked={checked}
          disabled={disabled}
          tabIndex={tabIndex}
          onChange={checked => onChange?.(checked)}
        />
      );
    case 'radio':
      return <Radio {...props} disabled={disabled} checked={checked} onClick={onClick} />;
    case 'visible':
      return (
        <Button
          {...props}
          type="text"
          size={size}
          disabled={disabled}
          tabIndex={tabIndex}
          icon={checked ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={onClick}
        />
      );
    case 'locked':
      return (
        <Button
          {...props}
          type="text"
          size={size}
          disabled={disabled}
          tabIndex={tabIndex}
          icon={checked ? <LockFilled /> : <UnlockFilled />}
          onClick={onClick}
        />
      );
    case 'enabled':
      return (
        <Button
          {...props}
          type="text"
          size={size}
          danger={!checked}
          disabled={disabled}
          tabIndex={tabIndex}
          icon={checked ? <StopOutlined /> : <StopFilled />}
          onClick={onClick}
        />
      );
    default:
      return neverThrow(type);
  }
};

export const BooleanCell = withValue(BooleanBase);
