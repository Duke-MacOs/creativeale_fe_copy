import Icon from '@ant-design/icons';
import { changeCategory, changeEditor, useEditor, useEditor3DHotkeys, useSettings } from '@editor/aStore';
import { getScene } from '@editor/utils';
import {
  DirectionAdjustment,
  GridNine,
  Magnet,
  OneThirdRotation,
  OverallReduction,
  ClickToFold,
  MenuUnfoldOne,
} from '@icon-park/react';
import { Button, Tooltip } from 'antd';
import { css, cx } from 'emotion';
import { useStore } from 'react-redux';
import { ActionType } from '@byted/riko';
import { createEntry, EntryKey } from '../../../../globals/localStore';
import { Fragment, memo, useEffect, useState } from 'react';
import { Tool3DType } from '@byted/riko';
import { amIHere } from '@shared/utils';

interface IToolbarStorage {
  tool3d?: Tool3DType;
  enableGuides?: boolean;
  enableMagnet?: boolean;
  enableGrid?: boolean;
}

const defaultValue: IToolbarStorage = {
  tool3d: 0,
  enableGuides: true,
  enableMagnet: true,
  enableGrid: true,
};

export const toolbar = createEntry(
  EntryKey.TOOLBAR,
  value => {
    try {
      return JSON.parse(value as string) as IToolbarStorage;
    } catch {
      return defaultValue;
    }
  },
  JSON.stringify,
  true
);

function useToolbar(editorSender: any) {
  const [storage, setStorage] = useState<IToolbarStorage>(toolbar.getValue() ?? defaultValue);
  const { propsMode } = useEditor(0, 'propsMode');

  useEffect(() => {
    if (storage) {
      const enableGuides = propsMode === 'Product' ? false : storage.enableGuides;
      const newStorage = { ...storage, enableGuides };
      toolbar.setValue(newStorage);
      setTimeout(() => {
        editorSender.emit({
          type: ActionType.Toolbar,
          ...newStorage,
        });
      }, 0);
    }
  }, [editorSender, propsMode, storage]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        setStorage(toolbar.getValue() ?? defaultValue);
      }
    };
    document.addEventListener('visibilitychange', handler);

    return () => {
      document.removeEventListener('visibilitychange', handler);
    };
  }, [editorSender]);

  return { storage, setStorage };
}

export default memo(function Toolbar({ editorSender }: { editorSender: any }) {
  const { dispatch, getState } = useStore<EditorState>();
  const enabled3d = useSettings('enabled3d');

  const { edit3d } = useEditor('edit3d');
  const { sceneMode } = useEditor(0, 'sceneMode');

  const colorEntries = enabled3d ? ['rgb(200 200 200)', 'rgb(255,255,255)'] : ['#555', '#555'];
  const backgroundEntries = enabled3d ? ['rgb(50 50 50 / 90%)', 'rgb(64 101 247)'] : ['none', 'rgb(201 201 204)'];

  const { storage, setStorage } = useToolbar(editorSender);
  useEditor3DHotkeys('1, 2, 3', e => {
    const storage = toolbar.getValue();
    setStorage({
      ...storage,
      tool3d: Number(e.key) - 1,
    });
  });

  const [collapsed, setCollapsed] = useState(false);
  if (sceneMode !== 'Product' && amIHere({ release: false })) {
    return (
      <Fragment>
        {edit3d && (
          <div
            className={css({
              position: 'absolute',
              left: 5,
              top: 5,
              display: 'flex',
            })}
          >
            <Tooltip title="方向">
              <Button
                type="text"
                style={{ background: backgroundEntries[storage.tool3d === Tool3DType.Move ? 1 : 0] }}
                className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
                icon={
                  <Icon
                    component={DirectionAdjustment as any}
                    className={css({
                      color: colorEntries[storage.tool3d === Tool3DType.Move ? 1 : 0],
                    })}
                  />
                }
                onClick={() => {
                  setStorage({
                    ...storage,
                    tool3d: 0,
                  });
                }}
              />
            </Tooltip>

            <Tooltip title="旋转">
              <Button
                type="text"
                style={{ background: backgroundEntries[storage.tool3d === Tool3DType.Rotate ? 1 : 0] }}
                className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
                icon={
                  <Icon
                    component={OneThirdRotation as any}
                    className={css({
                      color: colorEntries[storage.tool3d === Tool3DType.Rotate ? 1 : 0],
                    })}
                  />
                }
                onClick={() =>
                  setStorage({
                    ...storage,
                    tool3d: 1,
                  })
                }
              />
            </Tooltip>
            <Tooltip title="缩放">
              <Button
                type="text"
                style={{ background: backgroundEntries[storage.tool3d === Tool3DType.Scale ? 1 : 0] }}
                className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
                icon={
                  <Icon
                    component={OverallReduction as any}
                    className={css({
                      color: colorEntries[storage.tool3d === Tool3DType.Scale ? 1 : 0],
                    })}
                  />
                }
                onClick={() =>
                  setStorage({
                    ...storage,
                    tool3d: 2,
                  })
                }
              />
            </Tooltip>
          </div>
        )}
        <div
          className={css({
            position: 'absolute',
            right: 5,
            top: 5,
            display: 'flex',
            pointerEvents: 'none',
          })}
          onClick={e => {
            e.preventDefault();
          }}
        >
          {enabled3d && (
            <Tooltip title={edit3d ? '开启2D视图' : '关闭2D视图'}>
              <Button
                type="text"
                style={{ background: backgroundEntries[!edit3d ? 1 : 0] }}
                className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
                icon={
                  <Icon
                    component={Dimension as any}
                    className={cx(
                      css({
                        fill: colorEntries[edit3d ? 0 : 1],
                      })
                    )}
                  />
                }
                onClick={() => {
                  const {
                    id: sceneId,
                    editor: { edit3d },
                  } = getScene(getState().project);
                  dispatch(changeEditor(sceneId, { edit3d: !edit3d, selected: {} }));
                  dispatch(changeCategory(''));
                }}
              />
            </Tooltip>
          )}
          {!collapsed && (
            <>
              <Tooltip title="物理辅助线">
                <Button
                  type="text"
                  style={{ background: backgroundEntries[storage.enableGuides ? 1 : 0] }}
                  className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
                  icon={
                    <Icon
                      component={PhysicsCollide as any}
                      className={css({
                        fill: colorEntries[storage.enableGuides ? 1 : 0],
                      })}
                    />
                  }
                  onClick={() => {
                    setStorage({
                      ...storage,
                      enableGuides: !storage.enableGuides,
                    });
                  }}
                />
              </Tooltip>
              <Tooltip title="网格">
                <Button
                  type="text"
                  style={{ background: backgroundEntries[storage.enableGrid ? 1 : 0] }}
                  className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
                  icon={
                    <Icon
                      component={GridNine as any}
                      className={css({
                        color: colorEntries[storage.enableGrid ? 1 : 0],
                      })}
                    />
                  }
                  onClick={() => {
                    setStorage({
                      ...storage,
                      enableGrid: !storage.enableGrid,
                    });
                  }}
                />
              </Tooltip>
              <Tooltip title="吸附">
                <Button
                  type="text"
                  style={{ background: backgroundEntries[storage.enableMagnet ? 1 : 0] }}
                  className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
                  icon={
                    <Icon
                      component={Magnet as any}
                      className={css({
                        color: colorEntries[storage.enableMagnet ? 1 : 0],
                      })}
                    />
                  }
                  onClick={() =>
                    setStorage({
                      ...storage,
                      enableMagnet: !storage.enableMagnet,
                    })
                  }
                />
              </Tooltip>
            </>
          )}

          <Tooltip title={collapsed ? '展开' : '收起'}>
            <Button
              type="text"
              shape="circle"
              style={{ background: backgroundEntries[!collapsed ? 1 : 0] }}
              className={css({ pointerEvents: 'auto', margin: '0 1px' })}
              icon={
                <Icon
                  component={collapsed ? MenuUnfoldOne : (ClickToFold as any)}
                  className={css({
                    color: colorEntries[!collapsed ? 1 : 0],
                  })}
                />
              }
              onClick={() => setCollapsed(collapsed => !collapsed)}
            />
          </Tooltip>
        </div>
      </Fragment>
    );
  }

  return null;
});

function Dimension() {
  return (
    <svg
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2543"
      width="1em"
      height="1em"
    >
      <path
        d="M37.010286 822.290286h353.536c21.686857 0 35.291429-13.622857 35.291428-34.468572 0-20.425143-13.604571-34.029714-35.291428-34.029714H107.209143v-2.139429l166.345143-161.645714c101.248-98.285714 131.017143-149.339429 131.017143-214.857143 0-97.408-86.345143-171.867429-201.636572-171.867428-90.624 0-168.045714 48.932571-194.011428 123.794285C3.84 341.577143 1.828571 353.462857 1.828571 364.105143c0 21.266286 12.635429 35.291429 33.481143 35.291428 20.004571 0 28.507429-9.344 34.889143-30.610285 3.401143-13.202286 8.082286-25.106286 14.884572-36.169143 22.546286-37.851429 64.676571-62.116571 117.851428-62.116572 68.918857 0 123.794286 48.493714 123.794286 108.909715 0 48.932571-19.986286 82.102857-104.228572 165.065143L23.405714 742.308571C5.522286 760.173714 0 770.816 0 786.56c0 22.125714 14.464 35.730286 37.010286 35.730286z m511.780571-0.859429h174.445714C913.792 821.430857 1024 707.84 1024 515.968c0-191.853714-110.189714-302.902857-300.781714-302.902857h-174.427429c-23.405714 0-38.272 15.323429-38.272 39.131428v529.664c0 24.246857 14.884571 39.570286 38.272 39.570286z m38.729143-69.778286V281.984h130.176c146.340571 0 227.602286 85.101714 227.602286 234.422857 0 150.162286-81.261714 235.245714-227.602286 235.245714z"
        p-id="2544"
      />
    </svg>
  );
}

function PhysicsCollide() {
  return (
    <svg
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="4742"
      width="1em"
      height="1em"
    >
      <path
        d="M416 882.368l45.248 45.248-45.248 45.248-45.248-45.248 45.248-45.248z m192 0l45.248 45.248-45.248 45.248-45.248-45.248 45.248-45.248zM512 160v76.16a304 304 0 1 1 0 551.68v76.16H96v-704H512z m-59.456 70.4H155.52v563.2H452.48v-42.24A303.488 303.488 0 0 1 336 512c0-97.152 45.568-183.68 116.544-239.36V230.4zM640 272c-47.04 0-90.88 13.504-128 36.928v406.144a240 240 0 1 0 128-443.072zM400 512c0 56.704 19.648 108.8 52.544 149.888V362.112A238.976 238.976 0 0 0 400 512zM416 51.2l45.248 45.248-45.248 45.248-45.248-45.248L416 51.2z m192 0l45.248 45.248-45.248 45.248-45.248-45.248L608 51.2z"
        p-id="4743"
      />
    </svg>
  );
}
