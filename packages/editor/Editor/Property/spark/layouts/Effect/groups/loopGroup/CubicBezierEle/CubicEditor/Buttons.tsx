import { ControlOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { css } from 'emotion';

export const Buttons = ({
  previewDisable,
  previewHelpVisible,
  resetVisible,
  onHelp,
  onPreview,
  onReset,
}: Record<'previewHelpVisible' | 'resetVisible' | 'previewDisable', boolean> &
  Record<'onPreview' | 'onHelp' | 'onReset', AnyFn>) => {
  return (
    <>
      {previewHelpVisible && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            className={css({
              fontSize: '12px',
              cursor: 'pointer',

              '& .anticon + span': {
                marginLeft: '4px',
              },
              '&:hover': {
                color: '#3955F6',
              },
            })}
            type="text"
            size="small"
            disabled={previewDisable}
            icon={<PlayCircleOutlined />}
            onClick={onPreview}
          >
            预览效果
          </Button>
          <Typography.Link
            style={{
              fontSize: '12px',
              color: '#3955F6',
            }}
            target="_blank"
            onClick={onHelp}
          >
            帮助
          </Typography.Link>
        </div>
      )}
      {resetVisible && (
        <Button
          className={css({
            fontSize: '12px',
            cursor: 'pointer',

            '& .anticon + span': {
              marginLeft: '4px',
            },
            '&:hover': {
              color: '#3955F6',
            },
          })}
          type="text"
          size="small"
          icon={<ControlOutlined />}
          onClick={onReset}
        >
          恢复默认
        </Button>
      )}
    </>
  );
};
