import { Cover } from '../resourceSpark/ResourceBox/Cover';
import { Select, Tooltip, Typography } from 'antd';
import { css, cx } from 'emotion';

export interface ImageSelectCellProps {
  value: number;
  label?: string;
  tooltip?: string;
  deletable?: boolean;
  onChange: (value: number | string | undefined, options?: any) => void;
  invalidLabel?: (value: any) => React.ReactNode;
  options: Array<{ type: string; label: string; value: string | number; cover: string }>;
  disabled?: boolean;
}

export const ImageSelectCell = ({
  value,
  label: name,
  tooltip,
  options,
  deletable,
  invalidLabel,
  onChange,
  disabled = false,
}: ImageSelectCellProps) => {
  const index = options.findIndex(item => item.value === value);
  return (
    <div className={cx(css({ height: 48 }), index < 0 && 'ant-form-item-has-error')}>
      <Select
        disabled={disabled}
        showSearch
        value={index}
        allowClear={deletable}
        status={index < 0 ? 'error' : undefined}
        optionFilterProp="label"
        onChange={index => onChange(options[Number(index)]?.value)}
        className={css({
          width: '100%',
          '.ant-select-selector': {
            padding: '0 !important',
            height: '48px !important',
          },
          '.ant-select-selection-search': {
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 40,
          },
        })}
      >
        {options.map(({ type, label, cover }, index) => (
          <Select.Option key={index} value={index} label={label}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                columnGap: 4,
              })}
            >
              <Cover size={46} type={type} url={cover} />
              <Typography.Text type="secondary">
                <Tooltip title={tooltip}>{name}</Tooltip>
              </Typography.Text>
              {label}
            </div>
          </Select.Option>
        ))}
        {index < 0 && (
          <Select.Option disabled key={index} value={index}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                columnGap: 4,
              })}
            >
              <Cover size={46} invalid />
              {invalidLabel?.(value) || '请选择'}
              <Typography.Text type="secondary">
                <Tooltip title={tooltip}>{name}</Tooltip>
              </Typography.Text>
            </div>
          </Select.Option>
        )}
      </Select>
    </div>
  );
};
