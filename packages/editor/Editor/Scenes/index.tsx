import { createResourceAutoCompress } from '@shared/api';
import { relativeUrl } from '@shared/utils';
import Icon, { DownOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { usePersistCallback } from '@byted/hooks';
import {
  addFromNode,
  changeEditor,
  ICaseState,
  newScene,
  newSceneAsync,
  reorderScene,
  useAddNode,
  useOnAddNodeFromFiles,
  useProject,
} from '@editor/aStore';
import { ONBOARD_STEP_3 } from '@editor/Editor/OnBoarding/OnBoarding';
import ResourceChangerCreator from '@editor/common/ResourceChanger';
import { ImportFigmaDialog, ImportPsdDialog, UploadFiles } from '@editor/Resource/upload';
import { parse as parseLottie } from '@editor/Resource/upload/UploadFiles/lottieParser';
import { isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';
import { centerNode, collectEvent, EventTypes, fromScene, getScene } from '@editor/utils';
import { SettingConfig } from '@icon-park/react';
import { Button, Dropdown, Menu, message, Modal, theme, Tooltip } from 'antd';
import Axios from 'axios';
import { css, cx } from 'emotion';
import JSZip from 'jszip';
import { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import addScene from './addScene';
import applyScene from './applyScene';
import { useScene } from './hooks/useScene';
import SceneList, { SceneListProps } from './SceneList';
import SceneModal from './SceneModal';
import './style.scss';

const ResourceChanger = ResourceChangerCreator({ selector: '.editor-scenes', top: 4, left: 168 });

export interface ScenesProps extends SceneListProps {
  onSelectScene(id: number): void;
  onAddScene(scene?: any): Promise<void>;
  onAddTemplateScene(scene: any): Promise<void>;
  onReorderScene(startIndex: number, endIndex: number): void;
}

export const shouldSettingsOn = (sceneMode: ICaseState['editor']['sceneMode'], settings: ICaseState['settings']) => {
  const { enable = true, enabled = enable } = settings;
  return sceneMode === 'Product' && enabled;
};

export default function Scenes() {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const project = useSelector(({ project }: EditorState) => project);
  const { scenes, settings, editor } = project;
  const isVRVideo = settings.typeOfPlay === 3 && settings.category === 3;
  const { selectedSceneId: selectedId, playing, sceneMode, readOnly, settingsOn } = editor;
  const sceneDisabled = sceneMode === 'Product' || readOnly;
  const settingsEnabled = shouldSettingsOn(sceneMode, settings);
  const { onSelectScene } = useScene();

  const onReorderScene = useCallback(
    (startIndex: number, endIndex: number) => {
      dispatch(reorderScene(startIndex, endIndex));
    },
    [dispatch]
  );

  const { token } = theme.useToken();

  return (
    <div
      className={cx(
        'editor-scenes',
        css({
          borderRight: `1px solid ${token.colorBorder}`,
        })
      )}
    >
      {!sceneDisabled && (settings.typeOfPlay === 4 || isVRVideo) ? (
        <VideoAdder disabled={playing > 0} typeOfPlay={settings.typeOfPlay} category={settings.category} />
      ) : (
        !isVRCaseAndInEdit(getState().project) && <SceneAdder disabled={playing > 0} />
      )}
      {settingsEnabled && <Settings active={settingsOn} />}
      <SceneList
        distance={4}
        scenes={scenes}
        lockAxis="y"
        helperClass={css({ zIndex: 2 })}
        sceneDisabled={sceneDisabled}
        selectedId={settingsEnabled && settingsOn ? 0 : selectedId}
        onSortEnd={({ oldIndex, newIndex }) => {
          if (oldIndex !== newIndex) {
            onReorderScene(oldIndex, newIndex);
          }
          if (scenes[oldIndex].id !== selectedId) {
            onSelectScene(scenes[oldIndex].id);
          }
        }}
      />
    </div>
  );
}

const VideoAdder = ({
  disabled,
  typeOfPlay,
  category,
}: {
  disabled: boolean;
  typeOfPlay: 0 | 1 | 2 | 3 | 4 | 6 | 5 | undefined;
  category: number | undefined;
}) => {
  const [visible, setVisible] = useState(false);
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const onAddNode = useAddNode();
  const isVRVideo = typeOfPlay === 3 && category === 3;
  return (
    <div className={css({ padding: 8 })}>
      <Button
        disabled={disabled}
        icon={<PlusOutlined />}
        type="primary"
        style={{ width: '100%' }}
        onClick={() => {
          collectEvent(EventTypes.SceneLibrary, {
            type: '添加视频场景',
          });
          setVisible(true);
        }}
      >
        添加视频场景
      </Button>
      {visible && (
        <ResourceChanger
          eleType={isVRVideo ? 'VRVideo' : 'NativeVideo'}
          onClose={() => setVisible(false)}
          onChange={async ({ url, name, extra }) => {
            const { project } = getState();
            await addScene(dispatch, project, newScene(name), project.scenes.length);
            await onAddNode({
              mime: typeOfPlay === 4 ? 'PVVideo' : isVRVideo ? 'VRVideo' : 'Video',
              url,
              extra,
              name,
              mapNode(node) {
                node.editor = { ...node.editor, isLocked: true, isHidden: isVRVideo };
                node.props!.jumpSceneId = 0;
                return centerNode(node);
              },
            });
            if (isVRVideo) {
              await onAddNode({ mime: 'Scene3D', name: 'VR3D场景', url: '' });
            }
            setVisible(false);
          }}
        />
      )}
    </div>
  );
};

const readJSON = (file: File) => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.readAsText(file);
  });
};

const addSceneHandler = async ({
  scene,
  project,
  dispatch,
}: {
  scene?: any;
  project: ICaseState;
  dispatch: ReturnType<typeof useDispatch>;
}) => {
  const { settings, scenes } = project;
  const { width, height } = settings;
  if (!scene?.url) {
    const scene = await newSceneAsync(`场景 ${scenes.filter(({ type }) => type === 'Scene').length - 1}`, {
      enabled3d: settings.enabled3d,
      height,
      width,
    });
    return addScene(dispatch, project, scene, scenes.length);
  }
  const { url, name } = scene;
  const { data } = await Axios.get(url);
  const { customScripts, scenes: newScenes } = data;
  const sceneArr = newScenes.map((scene: any) => {
    scene.editor.moment = 0;
    if (scene.type === 'Scene') {
      scene.props.name = `${name} - ${scene.props.name}`;
    }
    return fromScene(scene);
  });
  return applyScene(dispatch, project, sceneArr, scenes.length + newScenes.length - 1, customScripts);
};

const SceneAdder = memo(({ disabled }: { disabled: boolean }) => {
  const [figmaImporterVisible, setFigmaImporterVisible] = useState(false);
  const [psdImporterVisible, setPsdImporterVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const { onAddNode } = useOnAddNodeFromFiles();
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const projectId = useProject('id');

  const onAddScene = useCallback(
    async (scene?: any) => {
      try {
        const { project } = getState();
        return addSceneHandler({ scene, project, dispatch });
      } catch (e) {
        console.log(e);
        message.error(e.message || '模板场景添加失败');
      }
    },
    [dispatch, getState]
  );
  const onOpen = () => {
    setVisible(true);
    collectEvent(EventTypes.SceneLibrary, {
      type: '场景库页面曝光',
    });
  };
  const onFinish = (scene?: any) => {
    if (scene) {
      setLoading(true);
      onAddScene(scene).then(() => {
        setLoading(false);
        setVisible(false);
      });
    } else {
      setVisible(false);
    }
  };

  const hideModal = usePersistCallback(() => {
    setMessages([]);
  });

  return (
    <div className="scene-menu" id={ONBOARD_STEP_3}>
      <Dropdown.Button
        style={{ width: '100%' }}
        disabled={disabled}
        overlay={
          <Menu>
            <Menu.Item key="1" style={{ width: 147 }} onClick={onOpen}>
              添加模板场景
            </Menu.Item>

            <Menu.Item
              key="2"
              onClick={() => {
                setFigmaImporterVisible(true);
                collectEvent(EventTypes.SceneLibrary, {
                  type: '从 Figma 导入场景',
                });
              }}
            >
              <span>从Figma导入</span>
              <Tooltip title="点击查看帮助文档" placement="bottom">
                <QuestionCircleOutlined
                  style={{ position: 'absolute', right: 10, top: '50%', marginTop: '-7px' }}
                  onClick={e => {
                    collectEvent(EventTypes.Tutorial, {
                      type: '资源面板',
                    });
                    e.stopPropagation();
                    window.open('https://magicplay.oceanengine.com/tutorials/docs/import-figma');
                  }}
                />
              </Tooltip>
            </Menu.Item>
            <Menu.Item
              key="3"
              onClick={() => {
                setPsdImporterVisible(true);
                collectEvent(EventTypes.SceneLibrary, {
                  type: '从 PSD 导入场景',
                });
              }}
            >
              <span>从PSD导入</span>
              <Tooltip title="点击查看帮助文档" placement="bottom">
                <QuestionCircleOutlined
                  style={{ position: 'absolute', right: 10, top: '50%', marginTop: '-7px' }}
                  onClick={e => {
                    collectEvent(EventTypes.Tutorial, {
                      type: '资源面板',
                    });
                    e.stopPropagation();
                    window.open('https://magicplay.oceanengine.com/tutorials/docs/import-psd');
                  }}
                />
              </Tooltip>
            </Menu.Item>
            <UploadFiles
              uploading={loading}
              accepts={'.zip,.json'}
              setUploading={setLoading}
              beforeUpload={() => async file => {
                setLoading(true);
                dispatch(changeEditor(0, { loading: true }));
                const options = { projectId, distinct: true };
                const errors: string[] = [];
                collectEvent(EventTypes.UploadResource, {
                  type: '用户上传量',
                });
                if (file.type == 'application/json') {
                  try {
                    const json = JSON.parse(String(await readJSON(file)));
                    const node = parseLottie(json, []);
                    await onAddScene();
                    const scene = getScene(getState().project);
                    // 渲染问题，延迟添加
                    setTimeout(() => {
                      dispatch(addFromNode(scene.id, 0, node));
                    }, 100);
                    collectEvent(EventTypes.UploadResource, {
                      type: '上传成功量',
                    });
                  } catch (err) {
                    console.log(err);
                  }
                } else {
                  const zip = new JSZip();
                  const resource = await zip.loadAsync(file);
                  const entries = Object.entries(resource.files);
                  const resourceFiles: [string, JSZip.JSZipObject][] = [];
                  const jsonFiles: [string, JSZip.JSZipObject][] = [];
                  // 文件分类
                  for (const [filename, itemFile] of entries) {
                    const paths = filename.split('/');
                    const name = paths[paths.length - 1];
                    // 兼容 MAC 解压再压缩、非隐藏文件
                    if (!filename.startsWith('__MACOSX/') && !itemFile.dir && !name.startsWith('.')) {
                      if (
                        name.endsWith('.png') ||
                        name.endsWith('.jpg') ||
                        name.endsWith('.jpeg') ||
                        name.endsWith('.mp4') ||
                        name.endsWith('.mp3')
                      ) {
                        resourceFiles.push([filename, itemFile]);
                      } else if (name.endsWith('.json')) {
                        jsonFiles.push([filename, itemFile]);
                      }
                    }
                  }

                  // 先上传素材
                  const resPromise: Promise<any>[] = [];
                  let uploadRes: [string, string][] = [];
                  for (let i = 0; i < resourceFiles.length; i++) {
                    const content = await resourceFiles[i][1].async('blob');
                    const filename = resourceFiles[i][0];
                    if (filename.endsWith('.mp4')) {
                      resPromise.push(
                        createResourceAutoCompress({
                          file: new File([content], filename),
                          type: 6,
                          ...options,
                        }).catch(err => err)
                      );
                    } else if (filename.endsWith('.mp3')) {
                      resPromise.push(
                        createResourceAutoCompress({
                          file: new File([content], filename),
                          type: 8,
                          ...options,
                        }).catch(err => err)
                      );
                    } else {
                      resPromise.push(
                        createResourceAutoCompress({
                          file: new File([content], filename),
                          type: 5,
                          ...options,
                        }).catch(err => err)
                      );
                    }
                  }
                  if (resPromise.length > 0) {
                    const result = await Promise.all(resPromise);
                    uploadRes = result.reduce((list, res, idx) => {
                      if (res) {
                        if (res.url) {
                          list.push([resourceFiles[idx][0], relativeUrl(res.url)]);
                        } else if (res.message) {
                          errors.push(`${resourceFiles[idx][0]} ${res.message}`);
                        }
                      }
                      return list;
                    }, []);
                  }

                  // 解析生成节点
                  try {
                    const json = JSON.parse(await jsonFiles[0][1].async('string'));
                    json._projectId = projectId;
                    json._dispatch = dispatch;
                    json._errors = errors;
                    const node = parseLottie(json, uploadRes);
                    await onAddScene();
                    const scene = getScene(getState().project);
                    // 渲染问题，延迟添加
                    setTimeout(() => {
                      dispatch(addFromNode(scene.id, 0, node));
                    }, 100);
                    collectEvent(EventTypes.UploadResource, {
                      type: '上传成功量',
                    });
                  } catch (err) {
                    console.warn(err);
                    errors.push(err.message);
                  }
                }

                setMessages(errors);
                setLoading(false);
                dispatch(changeEditor(0, { loading: false }));
                return false;
              }}
              onAddResourceEntry={() => {
                //
              }}
            >
              <Menu.Item
                onClick={() => {
                  collectEvent(EventTypes.SceneLibrary, {
                    type: '从 AE(Lottie) 导入场景',
                  });
                }}
              >
                <span>从AE(Lottie)导入</span>
                <Tooltip title="点击查看帮助文档" placement="bottom">
                  <QuestionCircleOutlined
                    style={{ position: 'absolute', right: '-7px', top: '50%', marginTop: '-7px' }}
                    onClick={e => {
                      collectEvent(EventTypes.Tutorial, {
                        type: '资源面板',
                      });
                      e.stopPropagation();
                      window.open('https://magicplay.oceanengine.com/tutorials/docs/import-ae');
                    }}
                  />
                </Tooltip>
              </Menu.Item>
            </UploadFiles>
          </Menu>
        }
        icon={<DownOutlined />}
        type="primary"
        placement="bottomRight"
        onClick={() => {
          onAddScene();
          collectEvent(EventTypes.SceneLibrary, {
            type: '添加空白场景',
          });
        }}
        onOpenChange={(visible: boolean) => {
          if (visible) {
            collectEvent(EventTypes.SceneLibrary, {
              type: '模版场景按钮曝光',
            });
          }
        }}
      >
        添加空白场景
      </Dropdown.Button>
      <SceneModal visible={visible} onFinish={onFinish} loading={loading} />
      {figmaImporterVisible && (
        <ImportFigmaDialog
          onFinish={async dataList => {
            for (const { url, name } of dataList) {
              await onAddScene();
              await onAddNode({ mime: 'PSD', name, url });
            }
            setFigmaImporterVisible(false);
          }}
          onHide={() => setFigmaImporterVisible(false)}
        />
      )}
      {psdImporterVisible && (
        <ImportPsdDialog
          onFinish={async dataList => {
            for (const { url, name } of dataList) {
              await onAddScene();
              await onAddNode({ mime: 'PSD', name, url });
            }
            setPsdImporterVisible(false);
          }}
          onHide={() => setPsdImporterVisible(false)}
        />
      )}
      <Modal title="提示" open={messages.length > 0} onOk={hideModal} onCancel={hideModal}>
        {messages.map((msg, idx) => (
          <p key={`msg-${idx}`}>{msg}</p>
        ))}
      </Modal>
    </div>
  );
});
export const Settings = ({ active }: any) => {
  const dispatch = useDispatch<EditorDispatch>();
  const onTriggerSettings = useCallback(() => {
    dispatch(changeEditor(0, { settingsOn: true }));
  }, [dispatch]);
  return (
    <Button
      type="text"
      size="large"
      icon={<Icon component={SettingConfig as any} />}
      onClick={onTriggerSettings}
      style={{
        height: 64,
        background: active ? '#EEF3FE' : 'white',
        borderRadius: 0,
      }}
    >
      全局设置
    </Button>
  );
};
