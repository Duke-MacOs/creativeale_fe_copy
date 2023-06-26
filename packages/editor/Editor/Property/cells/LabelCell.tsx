import type { ILabelSpark, OnChange, SparkProps } from './types';
import { Tooltip, Typography } from 'antd';
import { TooltipHelp } from './GroupCell';
import React, { memo, FC } from 'react';
import { css, cx } from 'emotion';

const mainClass = css({
  display: 'flex',
  position: 'relative',
  minHeight: 32,
  '.ant-collapse-header &': {
    minHeight: 0,
  },
  '.ant-input-number-input': {
    paddingLeft: 0,
  },
  '[disabled]': {
    pointerEvents: 'auto',
  },
});

const labelClass = css({
  position: 'absolute',
  userSelect: 'none',
  overflow: 'hidden',
  transition: '2s',
  ':hover': {
    overflow: 'visible',
  },
  paddingLeft: 8,
  left: 0,
});

const moveClass = css({
  cursor: 'ew-resize',
  '*': {
    pointerEvents: 'none',
  },
});

export const LabelCell = ({
  label,
  tooltip,
  width = 64,
  content,
  reverse = content.spark === 'boolean',
  render,
}: SparkProps<ILabelSpark>) => {
  if (reverse) {
    const getContent = (children: any, label: any) => {
      return (
        <div className={css({ display: 'flex', columnGap: 4, minHeight: 32, alignItems: 'center' })}>
          <div className={css({ flex: 'none' })}>{children}</div>
          <div className={css({ flex: 'auto' })}>
            {label}
            {tooltip && <TooltipHelp title={tooltip} message={label} />}
          </div>
        </div>
      );
    };
    if (content.spark === 'boolean') {
      return render({
        spark: 'value',
        index: content.index,
        content(value = content.defaultValue, onChange) {
          return {
            spark: 'element',
            content(render) {
              return getContent(
                render({ ...content, value, onChange }),
                <span className={css({ cursor: 'pointer' })} onClick={() => onChange(!value)}>
                  {label}
                </span>
              );
            },
          };
        },
      });
    }
    return getContent(render(content), label);
  }
  const children = <div style={{ flex: 'auto' }}>{render(content)}</div>;
  return (
    <div className={css({ display: 'flex', alignItems: 'center', columnGap: 4, minHeight: 32 })}>
      {Boolean(label) && (
        <div style={{ flex: `0 0  ${width}px`, paddingLeft: 8, overflow: 'hidden' }}>
          <Tooltip title={tooltip} placement="top">
            <Typography.Text type="secondary">{label}</Typography.Text>
          </Tooltip>
        </div>
      )}
      {!label && tooltip ? (
        <Tooltip title={tooltip} placement="top">
          {children}
        </Tooltip>
      ) : (
        children
      )}
    </div>
  );
};

export const withLabel = <
  P extends { style?: React.CSSProperties } & Pick<ILabelSpark, 'label' | 'width' | 'tooltip' | 'align'>
>(
  Component: FC<P>,
  getOnChange?: (props: P) => OnChange<number>
) => {
  const useActivator = (props: any) => {
    if (!getOnChange || props.disabled || props.readOnly) return { cursor: 'pointer' };
    return {
      cursor: 'ew-resize',
      onMouseDown(event: React.MouseEvent) {
        event.stopPropagation();
        let accumulative = 0;
        const onChange = getOnChange(props);
        const deactivate = () => {
          for (const [event, listener] of Object.entries(listeners)) {
            document.removeEventListener(event as keyof typeof listeners, listener as any);
          }
          document.body.classList.remove(moveClass);
          onChange(accumulative);
        };
        const listeners = {
          mouseleave: deactivate,
          mouseup: deactivate,
          mousemove({ movementX }: MouseEvent) {
            onChange((accumulative += movementX), { before: true });
          },
        };
        for (const [event, listener] of Object.entries(listeners)) {
          document.addEventListener(event as keyof typeof listeners, listener as any);
        }
        document.body.classList.add(moveClass);
      },
    };
  };
  return memo(({ label, tooltip, width = 64, align = 'center', ...props }: Omit<P, 'style'>) => {
    const { cursor, onMouseDown } = useActivator(props as any);
    return (
      <div className={cx(mainClass)} style={align === 'center' ? { alignItems: 'center' } : {}}>
        <Component {...(props as any)} style={{ paddingLeft: label ? width + 4 : 4, width: '100%', zIndex: 0 }} />
        <div
          style={{
            width,
            cursor,
            paddingTop: align === 'center' ? 0 : 5,
            fontSize: getFontSize(label, width),
          }}
          className={labelClass}
          onMouseDown={onMouseDown}
        >
          <Tooltip title={tooltip ?? label} placement="top">
            <Typography.Text type="secondary">{label}</Typography.Text>
          </Tooltip>
        </div>
      </div>
    );
  });
};

function getFontSize(label: React.ReactNode, width = 64) {
  if (typeof label === 'string') {
    return [14, 13, 12].find(size => size * label.length <= width) || 12;
  }
  return 14;
}
