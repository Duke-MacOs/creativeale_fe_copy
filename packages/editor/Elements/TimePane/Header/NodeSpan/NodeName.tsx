import React from 'react';
import { Input } from 'antd';
import { useProps } from '@editor/aStore';
export default function NodeName({ nodeId, setIsEditing }: any) {
  const { name, onChange } = useProps<string>(nodeId, 'name');
  return (
    <Input
      style={{
        background: 'none',
        borderRadius: 2,
        padding: 0,
        flex: 'auto',
      }}
      maxLength={20}
      autoFocus={true}
      spellCheck={false}
      defaultValue={name || ''}
      onBlur={event => {
        setIsEditing(false);
        onChange(event.target.value);
      }}
      onPressEnter={event => {
        setIsEditing(false);
        onChange(event.currentTarget.value);
      }}
    />
  );
}
