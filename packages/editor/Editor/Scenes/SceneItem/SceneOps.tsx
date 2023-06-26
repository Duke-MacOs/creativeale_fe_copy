import * as http from '@shared/api/project';
import Icon from '@ant-design/icons';
import { ActionFlag } from '@byted/riko';
import { ISceneState, useEditor, useHasUserPermission, useSettings } from '@editor/aStore';
import { Copy, Delete, Lock, ScreenshotOne, Send, Unlock } from '@icon-park/react';
import { Button, message, Modal, Tooltip } from 'antd';
import { memo, useCallback, useState } from 'react';
import { useStore } from 'react-redux';
import { changeEditor, copyScene, deleteScene } from '../../../aStore';
import { getScene } from '../../../utils';
import addScene from '../addScene';
import { useScenePropListener } from '../hooks/useScene';
import PublishModal from '../SceneModal/PublishModal';
import { publishScene } from './publishScene';
import './style.scss';

const FilledLock = (props: any) => <Lock {...props} theme="filled" fill="#333" />;
const FilledLink = (props: any) => <ScreenshotOne {...props} theme="filled" fill="#333" />;

const useProjectCover = (orderId: number) => {
  const { cover = '', onChange } = useEditor(0, 'cover');
  const order = `?orderId=${orderId}`;
  return [
    cover.includes(order),
    () => {
      if (cover.includes(order)) {
        onChange(cover.split('?orderId=')[0]);
      } else {
        onChange(`${cover.split('?orderId=')[0]}${order}`);
      }
    },
  ] as const;
};

export default memo(({ scene, deletable }: { scene: ISceneState; deletable: boolean }) => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const onLockCapture = useCallback(
    (id: number, lockCapture: boolean) => {
      dispatch(changeEditor(id, { lockCapture }, false, ActionFlag.SideEffect));
    },
    [dispatch]
  );

  const [visible, setVisible] = useState(false);
  const onClose = useCallback(() => {
    setVisible(false);
  }, []);

  const onDeleteScene = useCallback(
    async (id: number): Promise<void> => {
      const { project } = getState();
      if (project.editor.playing) {
        throw new Error('正在播放不能删除！');
      }
      const scenes = project.scenes.filter(({ type }) => type === 'Scene');
      if (scenes.length < 2) {
        throw new Error('最后一个场景不能删除！');
      }
      if (scenes.length < 3) {
        throw new Error('请保留一个非加载场景作为主场景！');
      }
      if (project.id) {
        const scene = getScene(project, id);
        await http.deleteScene(scene.sceneId).then(() => {
          dispatch(deleteScene(id));
        });
      } else {
        dispatch(deleteScene(id));
      }
    },
    [dispatch, getState]
  );

  const onCopyScene = useCallback(
    (id: number) => {
      const { scenes } = getState().project;
      const index = scenes.findIndex(scene => scene.id === id);
      if (index > -1) {
        return addScene(dispatch, getState().project, copyScene(scenes[index]), index + 1);
      }
    },
    [dispatch, getState]
  );

  const onPublishScene = useCallback(
    async (params?: any) => {
      const project = getState().project;
      if (scene) {
        return publishScene(project, scene, params);
      }
    },
    [getState, scene]
  );

  const [asProjectCover, setAsProjectCover] = useProjectCover(scene.orderId);
  const publishable = useHasUserPermission('publishScenes');
  const enabled3d = useSettings('enabled3d');
  const typeOfPlay = useSettings('typeOfPlay');

  const { loading } = scene.editor;
  const { lockCapture } = useScenePropListener(scene.id, { lockCapture: 'editor.lockCapture' });
  return (
    <div
      className="scene-ops"
      style={{ transformOrigin: '0 0', transform: 'scale(0.9)' }}
      onClick={event => {
        event.stopPropagation();
      }}
    >
      {!loading && (
        <Tooltip title="复制场景" placement="bottom">
          <Button
            size="small"
            type="default"
            icon={<Icon component={Copy as any} />}
            onClick={() => {
              onCopyScene(scene.id);
            }}
          />
        </Tooltip>
      )}
      {!loading && publishable && !enabled3d && typeOfPlay === 0 && (
        <>
          <Tooltip title="发布场景" placement="bottom">
            <Button
              size="small"
              type="default"
              icon={<Icon component={Send as any} />}
              onClick={() => {
                if (!scene.name) {
                  message.error('不能发布未命名场景');
                } else if (!scene.nodes.length) {
                  message.error('不能发布空白场景');
                } else {
                  setVisible(true);
                }
              }}
            />
          </Tooltip>
          {visible && <PublishModal resourceType="Scene" scene={scene} onPublish={onPublishScene} onClose={onClose} />}
        </>
      )}
      <Tooltip title={lockCapture ? '取消锁定' : '锁定封面'} placement="bottom">
        <Button
          size="small"
          type="default"
          icon={<Icon component={(lockCapture ? FilledLock : Unlock) as any} />}
          onClick={() => {
            onLockCapture(scene.id, !lockCapture);
          }}
        />
      </Tooltip>
      <Tooltip title={asProjectCover ? '取消设置' : '设为项目封面'} placement="bottom">
        <Button
          size="small"
          type="default"
          icon={<Icon component={(asProjectCover ? FilledLink : ScreenshotOne) as any} />}
          onClick={setAsProjectCover}
        />
      </Tooltip>
      {deletable && (
        <Tooltip title="删除场景" placement="bottom">
          <Button
            size="small"
            type="default"
            icon={<Icon component={Delete as any} />}
            onClick={() => {
              if (!scene.nodes.length) {
                onDeleteScene(scene.id).catch(error => {
                  message.error(error.message);
                });
              } else {
                Modal.confirm({
                  okText: '确定',
                  cancelText: '取消',
                  title: '是否确定删除此场景？',
                  onOk() {
                    onDeleteScene(scene.id).catch(error => {
                      message.error(error.message);
                    });
                  },
                });
              }
            }}
          />
        </Tooltip>
      )}
    </div>
  );
});
