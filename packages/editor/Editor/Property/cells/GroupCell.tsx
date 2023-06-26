import { CaretRightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Collapse, theme, Tooltip, TooltipProps } from 'antd';
import { SparkProps, IGroupSpark } from './types';
import { NULL_SPARK } from './utils';
import { css, cx } from 'emotion';
import React from 'react';
import { useImbot } from '@editor/aStore';

export const GroupCell = ({
  label,
  tooltip,
  extra,
  content,
  render,
  defaultActive = true,
  ...props
}: SparkProps<IGroupSpark>) => {
  const empty = content === NULL_SPARK;
  const { token } = theme.useToken();
  return (
    <Collapse
      {...props}
      key={String(empty)}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      collapsible={empty ? 'disabled' : undefined}
      defaultActiveKey={!empty || defaultActive ? ['1'] : []}
      className={cx(
        css({
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 0,
          '&-no-header .ant-collapse-header': {
            display: 'none !important',
          },
          '.ant-collapse-header': {
            paddingBottom: '0!important',
            alignItems: 'center',
            '.ant-collapse-extra': {
              alignItems: 'center',
              display: 'flex',
              maxHeight: 22,
            },
          },
          '.ant-collapse-content-box': {
            paddingBottom: '0!important',
          },
          '.ant-collapse-item': {
            paddingBottom: 0,
          },
        }),
        !label &&
          css({
            '.ant-collapse-header': {
              display: 'none !important',
            },
          })
      )}
      ghost
    >
      <Collapse.Panel
        extra={extra && <div onClick={event => event.stopPropagation()}>{render(extra)}</div>}
        header={
          <>
            {label}
            <TooltipHelp title={tooltip} message={label} />
          </>
        }
        key="1"
      >
        {render(content)}
      </Collapse.Panel>
    </Collapse>
  );
};

export const TooltipHelp = (props: { message?: React.ReactNode } & TooltipProps) => {
  const { showImDialog } = useImbot();
  return props.title ? (
    <Tooltip {...props}>
      &nbsp;
      <QuestionCircleOutlined
        onClick={() => {
          if (typeof props.message === 'string') {
            showImDialog(props.message);
          }
        }}
      />
    </Tooltip>
  ) : null;
};
