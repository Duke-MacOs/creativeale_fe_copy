import { useDispatch, useSelector } from 'react-redux';
import { changeCanvasScale } from '@editor/aStore';
import { Button, InputNumber, theme, Tooltip } from 'antd';
import { Minus, Plus } from '@icon-park/react';
import { memo, useCallback } from 'react';
import Icon from '@ant-design/icons';
import { css, cx } from 'emotion';

export default memo(() => {
  const canvasScale = useSelector((state: EditorState) => state.project.editor.canvasScale);
  const dispatch = useDispatch();
  const onChangeCanvasScale = useCallback(
    (value: number, setCenter?: boolean) => {
      dispatch(changeCanvasScale(value, setCenter));
    },
    [dispatch]
  );

  const { token } = theme.useToken();
  return (
    <div className={cx(className, css(style), css({ background: token.colorBgContainer }))}>
      <Tooltip title={canvasScale <= 0.2 ? '已缩小到最小值' : '缩小'} placement="bottom">
        <Button
          type="text"
          size="small"
          disabled={canvasScale <= 0.2}
          icon={<Icon component={Minus as any} />}
          onClick={event => {
            event.stopPropagation();
            if (canvasScale > 1) {
              onChangeCanvasScale(Math.ceil(canvasScale) - 1);
            } else if (canvasScale > 0.2) {
              onChangeCanvasScale(Math.ceil(canvasScale * 10 - 1) / 10);
            }
          }}
        />
      </Tooltip>
      <InputNumber
        size="small"
        controls={false}
        bordered={false}
        className={`${className}-num`}
        min={0.2}
        max={5}
        value={canvasScale}
        onChange={value => {
          onChangeCanvasScale(value);
        }}
        formatter={value => {
          return `${Math.floor((value as number) * 100)}%`;
        }}
        parser={(value: any) => {
          return Number(value.replace('%', '')) / 100;
        }}
      />
      <Tooltip title={canvasScale >= 5 ? '已放大到最大值' : '放大'} placement="bottom">
        <Button
          type="text"
          size="small"
          disabled={canvasScale >= 5}
          icon={<Icon component={Plus as any} />}
          onClick={event => {
            event.stopPropagation();
            if (canvasScale < 1) {
              onChangeCanvasScale(Math.floor(canvasScale * 10 + 1) / 10);
            } else if (canvasScale < 5) {
              onChangeCanvasScale(Math.floor(canvasScale) + 1);
            }
          }}
        />
      </Tooltip>
    </div>
  );
});

const className = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 8px',
  '&-num': {
    padding: 0,
    fontSize: 12,
    maxWidth: 48,
  },
});

export const style = {
  height: 34,
  // background: '#fff',
  borderRadius: 34,
  boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
};
