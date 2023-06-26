import Icon from '@ant-design/icons';
import { DirectionAdjustment, OneThirdRotation, OverallReduction } from '@icon-park/react';
import { changeCategory, changeEditor, useEditor, useProject } from '@editor/aStore';
import { useHotkeys } from 'react-hotkeys-hook';
import { useEventBus } from '@byted/hooks';
import { useStorage } from '@byted/hooks';
import { ActionType } from '@byted/riko';
import { Tool3DType } from '@byted/riko';
import { getScene } from '@editor/utils';
import { memo, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { useStore } from 'react-redux';
import { css, cx } from 'emotion';
import { isVRCase, isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';
import { useChangeModeInPanoramaData } from '@editor/Template/Panorama/hooks';

const colorEntries = ['rgb(200 200 200)', 'rgb(255,255,255)'];
const backgroundEntries = ['rgb(50 50 50 / 90%)', 'rgb(64 101 247)'];

export default memo(function Toolbar3D() {
  const [tool3d, setTool3D] = useStorage('tool3d.current.handler.type', Tool3DType.Move);
  const { dispatch, getState } = useStore<EditorState>();
  const { trigger } = useEventBus('EmitStateEvent');
  const { edit3d } = useEditor('edit3d');
  const projectType = useProject('type');
  const { typeOfPlay, category } = useProject('settings');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  const changeModeInPanoramaData = useChangeModeInPanoramaData();
  useEffect(() => {
    setTimeout(() => {
      trigger({
        type: ActionType.Toolbar,
        tool3d,
      });
    }, 0);
  }, [trigger, tool3d]);

  useHotkeys('1,2,3', ({ key }) => {
    const {
      editor: { edit3d },
    } = getScene(getState().project);
    if (edit3d) {
      setTool3D(Number(key) - 1);
    }
  });

  return (
    <div
      className={css({
        position: 'absolute',
        left: isVRVideo ? '' : 5,
        right: isVRVideo ? 5 : '',
        top: 5,
        display: 'flex',
        flexDirection: isVRVideo ? 'row-reverse' : 'row',
      })}
    >
      {(projectType === 'Project' || isVRCase(getState().project)) && (
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
              if (isVRCaseAndInEdit(getState().project)) {
                changeModeInPanoramaData(!edit3d);
              } else {
                const {
                  id: sceneId,
                  editor: { edit3d },
                } = getScene(getState().project);
                dispatch(changeEditor(sceneId, { edit3d: !edit3d, selected: {} }));
                dispatch(changeCategory(''));
              }
            }}
          />
        </Tooltip>
      )}
      {edit3d && (
        <>
          <Tooltip title="方向 快捷键1">
            <Button
              type="text"
              style={{ background: backgroundEntries[tool3d === Tool3DType.Move ? 1 : 0] }}
              className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
              onClick={() => setTool3D(0)}
              icon={
                <Icon
                  component={DirectionAdjustment as any}
                  className={css({
                    color: colorEntries[tool3d === Tool3DType.Move ? 1 : 0],
                  })}
                />
              }
            />
          </Tooltip>
          <Tooltip title="旋转 快捷键2">
            <Button
              type="text"
              style={{ background: backgroundEntries[tool3d === Tool3DType.Rotate ? 1 : 0] }}
              className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
              onClick={() => setTool3D(1)}
              icon={
                <Icon
                  component={OneThirdRotation as any}
                  className={css({
                    color: colorEntries[tool3d === Tool3DType.Rotate ? 1 : 0],
                  })}
                />
              }
            />
          </Tooltip>
          <Tooltip title="缩放 快捷键3">
            <Button
              type="text"
              style={{ background: backgroundEntries[tool3d === Tool3DType.Scale ? 1 : 0] }}
              className={cx(css({ pointerEvents: 'auto', margin: '0 1px' }))}
              onClick={() => setTool3D(2)}
              icon={
                <Icon
                  component={OverallReduction as any}
                  className={css({
                    color: colorEntries[tool3d === Tool3DType.Scale ? 1 : 0],
                  })}
                />
              }
            />
          </Tooltip>
        </>
      )}
    </div>
  );
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
        fill="white"
      />
    </svg>
  );
}
