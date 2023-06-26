import { changeCanvasScale } from '@editor/aStore';
import { style } from './CanvasScale';
import { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Focus } from '@icon-park/react';
import { Button, Tooltip } from 'antd';

export default memo(() => {
  const dispatch = useDispatch();
  const onChangeCanvasScale = useCallback(
    (value: number, setCenter?: boolean) => {
      dispatch(changeCanvasScale(value, setCenter));
    },
    [dispatch]
  );
  return (
    <Tooltip title="重置" placement="bottom">
      <Button
        type="default"
        size="small"
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34 }}
        icon={<Focus style={{ lineHeight: 0, fontSize: '16px' }} />}
        onClick={event => {
          event.stopPropagation();
          onChangeCanvasScale(1, true);
        }}
      />
    </Tooltip>
  );
});
