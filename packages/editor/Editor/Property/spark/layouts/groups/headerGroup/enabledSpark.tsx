import type { IValueSpark } from '../../../../cells';
import { Tooltip } from 'antd';

export const enabledSpark = (hidden = false): IValueSpark => {
  return {
    spark: 'value',
    index: 'enabled',
    hidden,
    content(enabled = true, onChange) {
      return {
        spark: 'element',
        content: render => (
          <Tooltip title={enabled ? '禁用' : '启用'}>
            {render({
              spark: 'boolean',
              value: enabled,
              type: 'enabled',
              size: 'small',
              onChange,
            })}
          </Tooltip>
        ),
      };
    },
  };
};
