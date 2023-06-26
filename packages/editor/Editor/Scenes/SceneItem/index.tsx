import { resetState } from '@editor/Editor/Header/hooks/useRestore/getFromUrl';
import { useScene, useScenePropListener } from '../hooks/useScene';
import { ReactComponent as EmptyScene } from './empty-scene.svg';
import { addSceneHistory } from '@editor/Editor/History/hooks';
import { memo, useEffect, useRef, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { SortableElement } from 'react-sortable-hoc';
import { useProjectHeight } from '@editor/aStore';
import SceneHistory from './SceneHistory';
import SceneIndex from './SceneIndex';
import { Empty, Input, theme } from 'antd';
import SceneOps from './SceneOps';
import './style.scss';
import { ONBOARD_STEP_1 } from '@editor/Editor/OnBoarding/OnBoarding';
import { css, cx } from 'emotion';

export interface SceneItemProps {
  sceneId: number;
  orderId: number;
  sceneDisabled: boolean;
  selected: boolean;
  sceneIndex: number;
}

const useScrollIntoView = (scrollable: boolean) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollable && ref.current) {
      // NOTE: Don't scroll while the timeline is scrolling in the same render frame.
      const id = requestAnimationFrame(() => {
        ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return () => {
        cancelAnimationFrame(id);
      };
    }
  }, [scrollable]);
  return ref;
};

export const StaticSceneItem = ({ sceneId, orderId, selected, sceneIndex, sceneDisabled }: SceneItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { width, height } = useProjectHeight(132);
  const { getSceneById, onSelectScene, onChangeSceneName } = useScene();
  const ref = useScrollIntoView(selected);
  const { id, prevSceneId } = useSelector(({ project }: EditorState) => {
    return {
      id: project.id,
      prevSceneId: project.editor.selectedSceneId,
    };
  }, shallowEqual);

  const { previewImage, sceneName } = useScenePropListener(sceneId, {
    previewImage: 'editor.capture',
    sceneName: 'name',
  });

  const scene = getSceneById(sceneId);

  const onClickScene = () => {
    const prevScene = getSceneById(prevSceneId);

    if (prevScene && prevScene.id !== sceneId) {
      addSceneHistory(id, prevSceneId, prevScene);
    }
    resetState(String(orderId));
    onSelectScene(sceneId);
  };

  const { token } = theme.useToken();

  return scene ? (
    <div
      key={sceneId}
      ref={ref}
      className={cx(
        'scene-item',
        selected && 'scene-item-selected',
        selected &&
          css({
            background: token.colorPrimaryBg,
            '& .scene-item-content': {
              borderColor: token.colorPrimaryBorder,
            },
            '& .scene-item-name': {
              color: token.colorPrimaryText,
            },
          })
      )}
      onClick={onClickScene}
      id={sceneIndex === 0 ? ONBOARD_STEP_1 : undefined}
    >
      <div className="scene-item-content" style={{ width, height }}>
        {!sceneDisabled && <SceneOps scene={scene} deletable={sceneIndex !== 0} />}
        <SceneIndex orderId={scene.orderId} index={sceneIndex} editor={scene.editor} />
        <SceneHistory />
        <div
          className="scene-item-preview"
          style={
            scene.nodes.length <= 0
              ? { backgroundColor: '#fafafa' }
              : { backgroundColor: 'white', backgroundImage: `url(${previewImage})` }
          }
        >
          {scene.nodes.length <= 0 && (
            <Empty
              // image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
              description={
                <span
                  className={css({
                    color: token.colorTextQuaternary,
                  })}
                >
                  空白场景
                </span>
              }
              image={<EmptyScene />}
              imageStyle={{ width: 37, height: 37 }}
            />
          )}
        </div>
        <div
          className="scene-item-name"
          onDoubleClick={() => {
            if (!sceneDisabled) {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? (
            <Input
              size="small"
              autoFocus={true}
              defaultValue={scene.name?.toString() || ''}
              maxLength={20}
              onBlur={event => {
                setIsEditing(false);
                onChangeSceneName(scene.id, event.target.value);
              }}
              onPressEnter={event => {
                setIsEditing(false);
                onChangeSceneName(scene.id, (event.target as HTMLInputElement).value);
              }}
            />
          ) : (
            <div>{sceneName || '未命名场景'}</div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default memo(SortableElement(StaticSceneItem));
