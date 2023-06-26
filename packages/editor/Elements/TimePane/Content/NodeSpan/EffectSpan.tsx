import React, { useRef } from 'react';
import { useMovement } from '../hooks/useMovement';
import { IScriptState, useSelected, changeProps, useSettings } from '@editor/aStore';
import { classnest, SCALE } from '@editor/utils';
import { SettingFilled } from '@ant-design/icons';
import { useUpdateEffect } from '@byted/hooks';
import { useMovable } from '@editor/hooks';
import { useStore } from 'react-redux';
import { css, cx } from 'emotion';
import { CNP } from '..';
import { useSetReflines } from '../hooks/useReflines';
import { ms2px } from '@editor/utils/SCALE';
import { theme } from 'antd';
interface Props {
  binDisabled: boolean;
  movement: number;
  script: IScriptState;
  scale: number;
  activate(event: React.MouseEvent, onDeactivated?: (distance: number) => void): void;
  activateLeft(event: React.MouseEvent, onDeactivated?: (distance: number) => void): void;
  activateRight(event: React.MouseEvent, onDeactivated?: (distance: number) => void): void;
  onScriptContextMenu: React.MouseEventHandler<HTMLDivElement>;
}

const useMoveInterval = (id: number, loopInterval: number, scale: number, edges: [number, number]) => {
  const setReflines = useSetReflines();
  const alignmentRef = useRef(0);
  const min = -SCALE.ms2px(loopInterval, scale);
  const { accumulative, activated, activate } = useMovable(min, Number.MAX_SAFE_INTEGER, {
    onChange: movement => {
      alignmentRef.current = setReflines(edges, Math.max(movement, min));
    },
  });
  const { dispatch } = useStore<EditorState, EditorAction>();
  useUpdateEffect(() => {
    if (!activated) {
      dispatch(
        changeProps([id], { loopInterval: loopInterval + SCALE.px2ms(accumulative + alignmentRef.current, scale) })
      );
      setReflines([], 0);
      alignmentRef.current = 0;
    }
  }, [activated]);
  return {
    accumulative: accumulative + alignmentRef.current,
    activated,
    activate,
  };
};

export default function EffectSpan({
  script: { id, name, time, enabled = true, duration = 0, playBySelf, intervalId = 0, loopInterval = 0 },
  binDisabled,
  movement,
  scale,
  onScriptContextMenu,
  activate,
  activateLeft,
  activateRight,
}: Props) {
  const offset = SCALE.ms2px(time, scale);
  const width = SCALE.ms2px(duration, scale);
  const { selected, onSelect, onSelectId } = useSelected(id);
  const { activated: middle, accumulative: accMiddle } = useMovement('Scripts', selected);
  const { activated: left, accumulative: accLeft } = useMovement('LeftOfScripts', selected);
  const { activated: right, accumulative: accRight } = useMovement('RightOfScripts', selected);
  const {
    accumulative: accInterval,
    activated: interval,
    activate: actInterval,
  } = useMoveInterval(intervalId, loopInterval, scale, [ms2px(time, scale), ms2px(time + duration, scale)]);
  const activated = left || middle || right;

  const typeOfPlay = useSettings('typeOfPlay');
  const { token } = theme.useToken();
  return (
    <div
      title={name}
      className={cx(
        cx(
          `${CNP}-effect`,
          css({
            background: token.colorPrimary,
            border: `2px solid ${token.colorPrimary}`,
          })
        ),
        activated && `${CNP}-effect-activated`,
        (selected || activated) &&
          cx(
            `${CNP}-effect-selected`,
            css({
              borderColor: token.colorPrimaryActive,
            })
          ),
        !enabled && `${CNP}-effect-disabled`,
        intervalId > 0 && { activated: interval } && `${CNP}-effect-interval`,
        id < 0 && !intervalId && `${CNP}-effect-shadowed`
      )}
      style={{
        width: `${Math.max(width - accLeft + accRight, SCALE.LENGTH * 3)}px`,
        transform: `translateX(${offset + accMiddle + accInterval + accLeft + movement}px)`,
        display: 'flex',
      }}
      data-script={String(id)}
      onMouseDown={event => {
        if (event.button === 2) {
          onScriptContextMenu(event);
        }
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            flex: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {width > SCALE.LENGTH * 3 ? name : ''}
        </div>
        {playBySelf && (
          <div
            style={{
              flex: 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 18,
              paddingRight: 8,
              height: 14,
            }}
          >
            {playBySelf && <SettingFilled style={{ position: 'absolute', fontSize: `12px` }} />}
          </div>
        )}
        {(left || middle || right) && (
          <div
            style={middle ? { left: 0 } : undefined}
            className={css({
              position: 'absolute',
              height: '100%',
              margin: '0 6px',
              padding: '0 8px',
              pointerEvents: 'none',
              background: 'rgba(0, 0, 0, 0.6)',
            })}
          >
            {(
              SCALE.px2ms(!middle ? width - accLeft + accRight : offset + accMiddle + accLeft + movement, scale) / 1000
            ).toFixed(2)}
            s
          </div>
        )}
      </div>
      {!binDisabled && (
        <div
          // className={classnest({ [`${CNP}-handle`]: selected || activated })}
          className={cx(
            (selected || activated) &&
              cx(
                `${CNP}-handle`,
                css({
                  background: token.colorPrimary,
                })
              )
          )}
          style={{
            flex: '0 1 6px',
            cursor: 'w-resize',
          }}
          onMouseDown={event => {
            if (typeOfPlay === 4) {
              return;
            }
            if (event.button !== 2) {
              if (selected) {
                event.persist();
                activateLeft(event, distance => {
                  if (!distance) {
                    onSelect(event);
                  }
                });
              } else {
                onSelect(event);
                activateLeft(event);
              }
            }
          }}
        />
      )}
      <div
        style={{
          flex: '1 1 12px',
        }}
        onMouseDown={event => {
          if (typeOfPlay === 4) {
            return;
          }
          if (event.button !== 2) {
            if (selected) {
              event.persist();
              activate(event, distance => {
                if (!distance) {
                  onSelect(event);
                }
              });
            } else if (intervalId) {
              onSelectId({}, [intervalId]);
              actInterval(event);
            } else {
              // 必须把 onSelect(event) 放在 activate/activateLeft/activateRight 之前否则会出现：
              // 选中动画a然后直接拖拽另一个动画b时会错误地移动a而不是移动b
              onSelect(event);
              activate(event);
            }
          }
        }}
      />
      {!binDisabled && (
        <div
          className={classnest({ [`${CNP}-handle`]: selected || activated })}
          style={{
            flex: '0 1 6px',
            cursor: 'e-resize',
          }}
          onMouseDown={event => {
            if (typeOfPlay === 4) {
              return;
            }
            if (event.button !== 2) {
              if (selected) {
                event.persist();
                activateRight(event, distance => {
                  if (!distance) {
                    onSelect(event);
                  }
                });
              } else {
                onSelect(event);
                activateRight(event);
              }
            }
          }}
        />
      )}
    </div>
  );
}
