import render, { ArrayCell } from '@editor/Editor/Property/cells';
import { ComponentPropsWithoutRef } from 'react';

export function ExtraSignals({
  value = [],
  onChange,
  label,
  ...rest
}: { value: any; onChange: any } & Partial<ComponentPropsWithoutRef<typeof ArrayCell>>) {
  return (
    <ArrayCell
      {...rest}
      label={label}
      array={value}
      onChange={onChange}
      defaultExpanded
      render={(value, onChange) => {
        return render({
          spark: 'element',
          content(render) {
            return render({
              spark: 'string',
              value: value as string,
              label: '名称',
              onChange,
            });
          },
        });
      }}
    />
  );
}
