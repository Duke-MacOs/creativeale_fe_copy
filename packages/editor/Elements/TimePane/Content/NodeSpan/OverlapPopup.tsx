import React, { useEffect, useState } from 'react';
import { Dropdown, Menu, Button } from 'antd';
import { SCALE } from '@editor/utils';
import { IScriptState, useOnDelete } from '@editor/aStore';
import { ScriptIconById } from './ScriptSpan';
import { useMovement } from '../hooks/useMovement';
import { css } from 'emotion';
import { Icons } from '@editor/utils/icons';
import Icon from '@ant-design/icons';

export type OverlapPopupProps = {
  scripts: IScriptState[];
  scale: number;
  scriptIds: number[];
  onSelectId: any;
  activate(event: React.MouseEvent, whenDeactivated?: (distance: number) => void): void;
  backgroundColor?: string;
  nodeMovement: number;
};

export default function OverlapPopup({
  scripts,
  scale,
  scriptIds,
  onSelectId,
  activate,
  backgroundColor,
  nodeMovement,
}: OverlapPopupProps) {
  const [visible, setVisible] = useState(false);
  const { accumulative, activated } = useMovement(
    'Scripts',
    scripts.some(({ id }) => scriptIds.includes(id))
  );
  useEffect(() => {
    if (activated) {
      setVisible(false);
    }
  }, [activated]);
  const { onDelete } = useOnDelete();
  const curColor = `rgba(0,0,139,${visible || scripts.some(({ id }) => scriptIds.includes(id)) ? 1 : 0.48})`;
  if (scripts.length < 2) {
    return null;
  }
  const [{ time, duration = 0 }] = scripts;
  let offset = SCALE.ms2px(time, scale);
  let width = 20;
  if (duration) {
    width = SCALE.ms2px(duration, scale) - 24;
    offset += 12;
  } else {
    offset -= 10;
  }
  return (
    <Dropdown
      mouseEnterDelay={0.4}
      open={visible && !activated}
      onOpenChange={visible => setVisible(visible)}
      overlay={
        <Menu selectedKeys={scriptIds.map(String)}>
          {scripts
            .slice()
            .reverse()
            .map(script => (
              <Menu.Item
                key={String(script.id)}
                onMouseDown={event => {
                  event.stopPropagation();
                  setVisible(false);
                  onSelectId(event, [script.id]);
                  activate(event);
                }}
              >
                <div style={{ display: 'flex' }}>
                  {script.type === 'Script' && (
                    <React.Fragment>
                      <ScriptIconById id={script.id} />
                      &nbsp;
                    </React.Fragment>
                  )}
                  <div style={{ flex: 'auto', paddingRight: '1em' }}>{script.name || script.type}</div>
                  <Button
                    size="small"
                    type="link"
                    onMouseDown={event => {
                      event.stopPropagation();
                    }}
                    onClick={event => {
                      event.stopPropagation();
                      onDelete({ scriptIds: [script.id] });
                    }}
                  >
                    删除
                  </Button>
                </div>
              </Menu.Item>
            ))}
        </Menu>
      }
    >
      <div
        style={{
          position: 'absolute',
          cursor: 'pointer',
          height: '20px',
          width: `${width}px`,
          transform: `translateX(${
            nodeMovement + (scripts.every(({ id }) => scriptIds.includes(id)) ? accumulative + offset : offset)
          }px)`,
        }}
        onMouseDown={event => {
          event.stopPropagation();
          setVisible(false);
          // 存在某个被选中
          if (scripts.some(({ id }) => scriptIds.includes(id))) {
            event.persist();
            activate(event, distance => {
              event.persist();
              if (!distance) {
                onSelectId(
                  event,
                  scripts.map(({ id }) => id)
                );
              }
            });
          } else {
            onSelectId(
              event,
              scripts.map(({ id }) => id)
            );
            activate(event);
          }
        }}
      >
        {duration > 0 ? (
          <React.Fragment>
            <div style={styleCount(0.5, 2, 2)} />
            <div style={styleCount(0.7, 4, 4)} />
            <div
              style={styleCount(1, 6, 6)}
              className={css({
                textAlign: 'center',
                fontSize: 12,
              })}
            >
              {scripts.length}
            </div>
          </React.Fragment>
        ) : (
          scripts.some(({ type }) => type === 'Script') && (
            <div style={{ position: 'relative', top: -1 }}>
              <Button
                type="text"
                icon={<Icon component={Icons['default']} />}
                className={css({
                  pointerEvents: 'none',
                  padding: 0,
                  height: 20,
                  width: 20,
                  color: curColor,
                  transitionProperty: '-background',
                  backgroundColor,
                })}
              />
              <div
                style={{
                  position: 'absolute',
                  color: curColor,
                  right: 0,
                  bottom: 0,
                  lineHeight: '8px',
                  transform: 'scale(.5)',
                }}
              >
                {scripts.length}
              </div>
            </div>
          )
        )}
      </div>
    </Dropdown>
  );
}

const styleCount = (opacity: number, top: number, right: number): React.CSSProperties => ({
  position: 'absolute',
  opacity,
  height: 16,
  width: 16,
  right: right - 4,
  top: top - 2,
});
