import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Dropdown, Menu } from 'antd';
import {
  useCanAddScripts,
  useOnAddScripts,
  useGetSelected,
  useOnDelete,
  useEmitter,
  useOnPaste,
  useOnCopy,
  useSettings,
} from '@editor/aStore';
import { NodeSpanProps } from '../NodeSpan';
import { collectEvent, EventTypes, onMacOS, SCALE } from '@editor/utils';
import withEffectChanger from '@editor/common/EffectChanger';

const EffectChanger = withEffectChanger();

export default () => {
  const [context, setContext] = useState({ time: -2, replacing: false });
  const onAddScripts = useOnAddScripts();
  const getSelected = useGetSelected();
  const timeRef = useRef(-1);
  const addScripts = useCallback((isScript: boolean) => {
    if (!getSelected().nodeIds.length) {
      return;
    }
    if (isScript) {
      onAddScripts('Script', {
        script: 'Click',
        name: '单击',
        time: timeRef.current,
      });
    } else {
      setContext({
        replacing: false,
        time: timeRef.current,
      });
    }
    hidePrevPopup?.();
  }, []);
  useEmitter('AddScripts', addScripts);
  let hidePrevPopup: undefined | (() => void);
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  const Overlay = useCallback<NodeSpanProps['Overlay']>(({ left, top, script, scale, hideOverlay }) => {
    const time = Math.max(SCALE.px2ms(left - SCALE.LENGTH * SCALE.OFF_HEAD, scale), 0);
    const { canAddBlueprint, canAddEffect, canAddScript } = useCanAddScripts();
    const { canPasteScripts, onPaste } = useOnPaste();
    const { canDelete, onDelete } = useOnDelete();
    const { onCopy } = useOnCopy();
    useEffect(() => {
      hidePrevPopup?.();
      hidePrevPopup = hideOverlay;
      timeRef.current = time;
      return () => {
        hidePrevPopup = undefined;
        timeRef.current = -1;
      };
    }, [scale]);
    let keyValue = 0;
    if (typeOfPlay === 4) {
      return null;
    }
    return (
      <Dropdown
        key={`${left}:${top}`}
        trigger={['contextMenu']}
        onOpenChange={visible => {
          if (!visible) {
            hideOverlay();
          }
        }}
        overlay={
          <Menu>
            <Menu.Item
              key={keyValue++}
              disabled={!canAddEffect}
              onClick={() => {
                setContext({
                  replacing: false,
                  time,
                });
              }}
            >
              添加动画
            </Menu.Item>

            {!isVRVideo && (
              <Menu.Item
                key={keyValue++}
                disabled={!canAddScript}
                onClick={() => {
                  onAddScripts('Script', {
                    script: 'Click',
                    name: '单击',
                    time,
                  });
                  collectEvent(EventTypes.UserSelectEventTrigger, {
                    name: '单击',
                  });
                }}
              >
                添加事件
              </Menu.Item>
            )}
            {!isVRVideo && (
              <Menu.Item
                key={keyValue++}
                disabled={!canAddBlueprint}
                onClick={() => {
                  onAddScripts(
                    'Blueprint',
                    {
                      script: 'Blueprint',
                      name: '节点蓝图',
                      time: 0,
                    },
                    {
                      inputPosition: { x: 100, y: 100 },
                      inputs: [
                        {
                          label: '开始',
                          key: 'onStart',
                          tooltip: '蓝图开始触发起点',
                        },
                      ],
                      nodeType: 'node',
                      outputPosition: { x: 500, y: 100 },
                      outputs: [],
                    }
                  );
                }}
              >
                添加蓝图
              </Menu.Item>
            )}
            {script && canDelete === 1 ? (
              <React.Fragment>
                <Menu.Item
                  key={keyValue++}
                  onClick={() => {
                    onCopy();
                  }}
                >
                  复制
                  <span style={{ float: 'right', marginLeft: '1em' }}>{onMacOS('Cmd', 'Ctrl')} + C</span>
                </Menu.Item>
                <Menu.Item
                  key={keyValue++}
                  onClick={() => {
                    onCopy(true);
                  }}
                >
                  剪切
                  <span style={{ float: 'right', marginLeft: '1em' }}>{onMacOS('Cmd', 'Ctrl')} + X</span>
                </Menu.Item>
                <Menu.Item
                  key={keyValue++}
                  onClick={() => {
                    onDelete();
                  }}
                >
                  删除
                  <span style={{ float: 'right', marginLeft: '1em' }}>Delete</span>
                </Menu.Item>
              </React.Fragment>
            ) : (
              canPasteScripts() && (
                <Menu.Item
                  key={keyValue++}
                  onClick={() => {
                    onPaste(time);
                  }}
                >
                  粘贴
                  <span style={{ float: 'right', marginLeft: '1em' }}>{onMacOS('Cmd', 'Ctrl')} + V</span>
                </Menu.Item>
              )
            )}
          </Menu>
        }
      >
        <div
          style={{
            top,
            left,
            position: 'absolute',
            width: 1,
            height: 1,
            zIndex: 999,
          }}
        />
      </Dropdown>
    );
  }, []);
  return {
    Overlay,
    element:
      context.time > -2 ? (
        <EffectChanger
          onClose={() => {
            setContext({ time: -2, replacing: false });
          }}
          onChange={({ props }: any) => {
            onAddScripts(
              'Effect',
              {
                ...props,
                time: context.time,
              },
              {},
              context.replacing
            );
            setContext({ ...context, replacing: true });
          }}
        />
      ) : null,
  };
};
