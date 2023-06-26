import { useState, useEffect, memo } from 'react';
import { Button, Dropdown, Menu, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import store, {
  useOnAddNodeFromFiles,
  useOnPaste,
  useEditor,
  useProject,
  addFromNode,
  useOnDelete,
  restoreState,
  useAddNodeWith3D,
  useSettings,
} from '@editor/aStore';
import { UploadFrame, UploadFiles } from '@editor/Resource/upload';
import JSZip from 'jszip';
import { usePersistCallback } from '@byted/hooks';
import { findById, getScene, newID } from '@editor/utils';
import { useStore } from 'react-redux';
import components from '@editor/Editor/Header/hooks/compatibles/applyState/components';
import { handleResourceZip } from '@editor/Resource/upload/UploadModel/onConvert3DData';
import { useParticle3D } from '@editor/Resource/entries/3d/Particle3D/hooks';
import useCubemap from '@editor/Resource/entries/3d/Cubemaps/useCubemap';

export const usePaste = (setUploading: (uploading: boolean) => void) => {
  const { onAddNodeFromFiles } = useOnAddNodeFromFiles();
  const { onPaste } = useOnPaste();
  useEffect(() => {
    const handler = async (event: ClipboardEvent) => {
      const { enableBlueprint } = store.getState().project.editor;
      if (!enableBlueprint) {
        const files = Array.from(event.clipboardData?.items || [])
          .filter(item => item.kind === 'file')
          .map(item => item.getAsFile() as File);
        if (files.length) {
          setUploading(true);
          onAddNodeFromFiles(files).finally(() => {
            setUploading(false);
          });
        } else if (event.target !== document.activeElement || document.activeElement === document.body) {
          const names = await onPaste();
          if (names) {
            message.success(`${names}粘贴成功`, 0.6);
          }
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => {
      document.removeEventListener('paste', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAddNodeFromFiles, onPaste]);
};

const NodeAdder = ({ uploading, setUploading }: any) => {
  const onAddNodeWith3D = useAddNodeWith3D();
  const { onAddNode } = useOnAddNodeFromFiles();
  const projectId = useProject('id');
  const { edit3d } = useEditor('edit3d');
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const [messages, setMessages] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const { onDelete } = useOnDelete();
  const { getConvertParticleNode } = useParticle3D();
  const { onChange: onChangeLoading } = useEditor(0, 'loading');
  const { createMaterial } = useCubemap();
  const typeOfPlay = useSettings('typeOfPlay');

  useEffect(() => {
    // 每次重新上传清空提示
    if (uploading) {
      setMessages([]);
    }
  }, [uploading]);

  const hideModal = usePersistCallback(() => {
    setMessages([]);
  });

  const MenuItem2d = (
    <>
      <Menu.Item key="1">
        <UploadFiles
          uploading={uploading}
          setUploading={setUploading}
          onAddResourceEntry={entry => {
            onAddNode(entry);
          }}
        >
          本地文件<span style={{ color: 'gray' }}> 图片、声音、视频、粒子(.plist), Lottie(.json)</span>
        </UploadFiles>
      </Menu.Item>
      <Menu.Item key="2">
        <UploadFrame
          uploading={uploading}
          setUploading={setUploading}
          onAddResourceEntry={entry => {
            onAddNode(entry);
          }}
        >
          动画序列<span style={{ color: 'gray' }}> 请选择多个图片文件...</span>
        </UploadFrame>
      </Menu.Item>
      <Menu.Item
        key="3"
        onClick={() => {
          onAddNode({ mime: 'Container', name: '容器', url: '' });
        }}
      >
        添加容器
      </Menu.Item>
      {typeOfPlay === 3 && (
        <Menu.Item
          key="4"
          onClick={() => {
            onAddNode({
              mime: 'AlphaVideo',
              name: '出框视频',
              url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/private/preview/1f37e35899cfe85acecfb28cb26e1f45/00b9f975104efcede5106a8facfd7afc.mp4',
              cover: 'https://p7.itc.cn/images01/20210208/735c861e79684b1d9e9e743eabf1cfd5.png',
            });
          }}
        >
          出框视频
        </Menu.Item>
      )}
    </>
  );

  const MenuItem3d = (
    <>
      <Modal
        title="请注意"
        open={visible}
        onCancel={() => {
          setVisible(false);
        }}
        footer={
          <>
            <Button
              onClick={() => {
                setVisible(false);
              }}
            >
              取消
            </Button>
            <Button type="primary">
              <UploadFiles
                uploading={uploading}
                accepts={'.zip'}
                setUploading={setUploading}
                beforeUpload={() => async file => {
                  try {
                    onChangeLoading(true);
                    const { project } = getState();
                    const scene = getScene(project);
                    const scene3D = scene.nodes.find(node => node.type === 'Scene3D');
                    if (scene3D) {
                      onDelete({ nodeIds: [scene3D.id] });
                    }
                    setVisible(false);
                    setUploading(true);
                    const zip = new JSZip();
                    const resource = await zip.loadAsync(file);
                    const { res, errors } = await handleResourceZip(resource, projectId, 'assets');

                    // 处理 scene3D 节点 skyboxMaterial
                    for (let i = 0; i < res.length; i++) {
                      const node = res[i].node;
                      if (node.type === 'Scene3D' && node.props?.skyboxMaterialUrl) {
                        const orderId = await createMaterial(node.props.skyboxMaterialUrl as string);
                        node.props.skyboxMaterialUrl = orderId;
                      }
                    }

                    for (const { node: scene3d } of res) {
                      const newScene = await getConvertParticleNode(scene3d);
                      dispatch(addFromNode(scene.id, 0, newScene));
                      dispatch(restoreState(await components(getState().project)));
                    }

                    setMessages(errors);
                    setUploading(false);
                  } catch (error) {
                    setMessages([`导入失败: ${error.message}`]);
                  } finally {
                    setUploading(false);
                    onChangeLoading(false);
                  }
                  return false;
                }}
                onAddResourceEntry={() => {
                  //
                }}
              >
                <span style={{ color: '#fff' }}>继续</span>
              </UploadFiles>
            </Button>
          </>
        }
      >
        2222导入新的3D场景会替换掉原本的3D场景，仍要继续吗？
      </Modal>
      <Menu.Item
        key="3"
        onClick={() => {
          setVisible(true);
        }}
      >
        导入 3D 场景
      </Menu.Item>
      <Menu.Item key="11">
        <UploadFiles
          uploading={uploading}
          accepts={'.zip'}
          setUploading={setUploading}
          beforeUpload={() => async file => {
            const { project } = getState();
            const scene = getScene(project);
            const parentId = Object.keys(scene.editor.selected).map(Number)[0];
            const scene3D = scene.nodes.find(node => node.type === 'Scene3D');
            if (!scene3D) {
              message.error('当前无3D场景，无法导入节点');
              return false;
            }
            const parentNode = findById(scene3D.nodes, parentId)?.[0];

            setUploading(true);
            const zip = new JSZip();
            const resource = await zip.loadAsync(file);
            const { res, errors } = await handleResourceZip(resource, projectId, 'assets');

            let index = parentNode ? parentNode?.nodes.length : scene3D.nodes.length;
            for (const { node } of res) {
              node.id = newID();
              dispatch(addFromNode(scene3D.id, index, node));
              dispatch(restoreState(await components(getState().project)));
              index++;
            }

            setMessages(errors);
            setUploading(false);
            return false;
          }}
          onAddResourceEntry={() => {
            //
          }}
        >
          <span>导入 3D 节点</span>
        </UploadFiles>
      </Menu.Item>
      <Menu.Item
        key="5"
        onClick={() => {
          onAddNode({ mime: 'Scene3D', name: '3D场景', url: '' });
        }}
      >
        添加 3D 场景
      </Menu.Item>
      <Menu.Item
        key="10"
        onClick={() => {
          onAddNodeWith3D('Sprite3D', () => {
            onAddNode({ mime: 'Sprite3D', name: '容器', url: '' });
          });
        }}
      >
        添加 3D 容器
      </Menu.Item>
    </>
  );

  return (
    <>
      <Dropdown overlay={<Menu>{edit3d ? MenuItem3d : MenuItem2d}</Menu>}>
        <Button type="link" size="small" icon={<PlusOutlined />} loading={uploading}>
          添加节点
        </Button>
      </Dropdown>
      <Modal title="提示" open={messages.length > 0} onOk={hideModal} onCancel={hideModal}>
        {messages.map((msg, idx) => (
          <p key={`msg-${idx}`}>{msg}</p>
        ))}
      </Modal>
    </>
  );
};
export default memo(NodeAdder);
