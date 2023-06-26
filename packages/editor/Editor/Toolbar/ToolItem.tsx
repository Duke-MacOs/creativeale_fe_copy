import { useEventBus, useStorage } from '@byted/hooks';
import { ActionType } from '@byted/riko';
import { TitleTip } from '@editor/views';
import { useEffect } from 'react';
import { Button } from 'antd';
import { css, cx } from 'emotion';
import Icon from '@ant-design/icons';

export default ({ id, title, Icon: IconComponent }: any) => {
  const [value, onChange] = useStorage(`canvas.settings.flag.${id}`, true);
  const { trigger } = useEventBus('EmitStateEvent');

  useEffect(() => {
    setTimeout(() => {
      trigger({
        type: ActionType.Toolbar,
        [id]: value,
      });
    });
  }, [trigger, id, value]);

  return (
    <TitleTip title={title} placement="left">
      <Button
        type={value ? 'link' : 'text'}
        className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
        onClick={() => onChange(!value)}
        icon={<Icon component={IconComponent} />}
      />
    </TitleTip>
  );
};
