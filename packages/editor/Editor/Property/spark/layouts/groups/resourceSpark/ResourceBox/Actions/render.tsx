import Icon from '@ant-design/icons';
import { Tooltip, Button } from 'antd';
import { css, cx } from 'emotion';

export default (label: React.ReactNode, icon: any, onClick?: any, plain = false, last = false) => {
  if (plain) {
    return (
      <Tooltip title={label}>
        <Button
          size="small"
          type="link"
          className={cx(buttonClass, css({ width: 'auto !important' }), last && css({ marginLeft: 'auto' }))}
          icon={<Icon component={icon} />}
          onClick={event => {
            event.stopPropagation();
            onClick?.();
          }}
        />
      </Tooltip>
    );
  }
  return (
    <Button
      size="small"
      type="link"
      className={cx(buttonClass, last && css({ marginLeft: 'auto' }))}
      icon={<Icon component={icon} />}
      onClick={event => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {label}
    </Button>
  );
};

const buttonClass = css({
  padding: '0!important',
  fontSize: '12px!important',
  display: 'flex',
  alignItems: 'center',
  '&.ant-btn > .anticon + span': {
    marginLeft: 4,
  },
});
