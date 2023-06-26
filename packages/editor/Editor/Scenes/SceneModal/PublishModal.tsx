import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Form, Select, Input, message, Checkbox, Spin } from 'antd';
import { fetchMaterialTag } from '@shared/api/library';
import { Rule } from 'antd/lib/form';
import { ISceneState, useProjectHeight } from '@editor/aStore';
import UploadCover from '@main/pages/Resources/AdminResource/Modal/UploadCover';
import style from '@main/pages/Resources/AdminResource/Modal/style';
import { css } from 'emotion';
import { useStore } from 'react-redux';
import { getSceneByOrderId } from '@editor/utils';
import UploadPreVideo from '@main/pages/Resources/AdminResource/Modal/UploadPreVideo';

const { Option } = Select;
export type IPublishModalProps = {
  resourceType: 'Scene' | 'Component' | 'Model' | 'Particle3D';
  is3D?: boolean;
  requireCover?: boolean;
  scene?: ISceneState;
  onPublish: (params?: Record<string, any>) => Promise<any>;
  onClose: () => void;
};

enum ResourceTypeMap {
  Scene = '场景',
  Component = '互动组件',
  Model = '模型',
  Particle3D = '粒子',
}
const materialNameRules: Rule[] = [
  { required: true, whitespace: true, message: '请输入项目名称' },
  { max: 20, message: '项目名称不可超过20个字' },
];
const materialDescRules: Rule[] = [
  { whitespace: true, message: '项目描述不能为空格' },
  { max: 128, message: '项目描述不可超过128个字' },
];

const useTags = (resourceType: keyof typeof ResourceTypeMap) => {
  const [tags, setTags] = useState<Array<{ id: number; name: string; parentName: string }>>([]);
  useEffect(() => {
    fetchMaterialTag({
      category: 9,
      pageSize: 999,
      origin: 1,
      parentName: ResourceTypeMap[resourceType],
    }).then(({ tags }: { tags: Array<{ id: number; name: string; parentName: string }> }) => {
      setTags(tags);
    });
  }, [resourceType]);
  return tags;
};

export default function PublishModal({
  onClose,
  onPublish,
  resourceType = 'Scene',
  is3D = false,
  scene,
  requireCover = true,
}: IPublishModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const tags = useTags(resourceType);
  const scenes = useScenes(scene);
  return (
    <Modal
      open={true}
      title={`${ResourceTypeMap[resourceType]}信息录入`}
      width={720}
      centered={true}
      onOk={() => form.submit()}
      onCancel={onClose}
      okText="发布"
      cancelText="取消"
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          colon={false}
          labelAlign="right"
          onFinish={params => {
            setLoading(true);
            try {
              onPublish({ ...params, extra: JSON.stringify({ previewVideo: params.previewVideo }) }).then(() => {
                message.success(`${ResourceTypeMap[resourceType]}发布成功`);
                setLoading(false);
                onClose();
              });
            } catch (e) {
              message.error(e.message || '发布失败');
              setLoading(false);
            }
          }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          key={Number(Boolean(scene))}
          initialValues={{
            name: scene?.name,
            cover: scene?.editor.capture,
            orderIds: [],
          }}
        >
          {!is3D && (
            <Form.Item
              name="platformTags"
              label={`${ResourceTypeMap[resourceType]}标签：`}
              rules={[
                {
                  required: true,
                  message: `请选择${ResourceTypeMap[resourceType]}标签`,
                },
              ]}
            >
              <Select placeholder="请选择" showArrow={true}>
                {resourceType === 'Component' ? (
                  <>
                    <Select.OptGroup label="玩法组件">
                      {tags
                        .filter(tag => tag.parentName === '玩法组件')
                        .map(tag => {
                          const id = tag.id;
                          return (
                            <Option key={id} value={id}>
                              {tag.name}
                            </Option>
                          );
                        })}
                    </Select.OptGroup>
                    <Select.OptGroup label="附加组件">
                      {tags
                        .filter(tag => tag.parentName === '附加组件')
                        .map(tag => {
                          const id = tag.id;
                          return (
                            <Option key={id} value={id}>
                              {tag.name}
                            </Option>
                          );
                        })}
                    </Select.OptGroup>
                    <Select.OptGroup label="视频组件">
                      <Option
                        key={tags.filter(tag => tag.name === '视频组件')[0]?.id}
                        value={tags.filter(tag => tag.name === '视频组件')[0]?.id}
                      >
                        视频组件
                      </Option>
                    </Select.OptGroup>
                  </>
                ) : (
                  tags.map(tag => {
                    const id = tag.id;
                    return (
                      <Option key={id} value={id}>
                        {tag.name}
                      </Option>
                    );
                  })
                )}
              </Select>
            </Form.Item>
          )}
          <Form.Item label={`${ResourceTypeMap[resourceType]}名称：`} name="name" rules={materialNameRules}>
            <Input type="string" placeholder={`请输入${ResourceTypeMap[resourceType]}名称`} />
          </Form.Item>
          <Form.Item
            name="cover"
            label="上传封面："
            rules={[
              {
                required: requireCover,
                message: `请上传${ResourceTypeMap[resourceType]}封面`,
              },
            ]}
          >
            <UploadCover />
          </Form.Item>
          <Form.Item
            name="previewVideo"
            label="预览视频："
            rules={[
              {
                message: `请上传预览视频`,
              },
            ]}
          >
            <UploadPreVideo />
          </Form.Item>
          {scene && scenes.length > 0 && (
            <Form.Item name="orderIds" label="关联场景：" tooltip={``}>
              <ScenesPicker scene={scene} />
            </Form.Item>
          )}
          <Form.Item label={`${ResourceTypeMap[resourceType]}描述：`} name="description" rules={materialDescRules}>
            <Input.TextArea
              showCount
              maxLength={128}
              className={style.textarea}
              placeholder={`请输入${ResourceTypeMap[resourceType]}描述`}
            />
          </Form.Item>
          <Form.Item label="版权控制：" name="isAuthControl" valuePropName="checked">
            <Checkbox className={style.checkbox}>版权控制</Checkbox>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}

const ScenesPicker = ({ scene: root, value, onChange }: { scene: ISceneState; value?: number[]; onChange?: any }) => {
  const { width, height } = useProjectHeight(100);
  const scenes = useScenes(root, value);
  return (
    <div
      className={css({
        display: 'flex',
        position: 'relative',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      })}
    >
      {scenes.map((scene, index) => (
        <div
          key={index}
          className={css({
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            flex: 'none',
            position: 'relative',
            '&+&': {
              marginLeft: 8,
            },
          })}
          onClick={({ currentTarget }) => {
            currentTarget.scrollIntoView({ inline: 'center', behavior: 'smooth' });
          }}
        >
          <img style={{ width, height }} src={scene.editor.capture} />
          <Checkbox
            style={{ position: 'absolute', top: 8, right: 8 }}
            checked={value?.includes(scene.orderId)}
            onChange={({ target: { checked } }) => {
              if (!checked) {
                onChange((value || []).filter(item => item !== scene.orderId));
              } else {
                onChange((value || []).concat(scene.orderId));
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

const useScenes = (root?: ISceneState, value?: number[]) => {
  const { getState } = useStore<EditorState>();
  return useMemo(() => {
    if (!root) {
      return [];
    }
    return findScenes(getState().project, root, value).slice(1);
  }, [root, getState, value]);
};

function findScenes(project: EditorState['project'], root: ISceneState, orderIds: number[] = []) {
  const found = new Set<number>();
  function* fromScripts(scripts: RikoScript[] = []): Generator<ISceneState> {
    for (const {
      props: { script, sceneId, scripts: children, elseScripts },
    } of scripts) {
      if (script === 'ChangeScene' && typeof sceneId === 'number') {
        try {
          yield* fromScene(getSceneByOrderId(project, sceneId));
        } catch {}
      }
      yield* fromScripts(children);
      if (Array.isArray(elseScripts)) {
        yield* fromScripts(elseScripts);
      }
    }
  }
  function* fromScene(scene: ISceneState): Generator<ISceneState> {
    if (found.has(scene.orderId)) {
      return;
    }
    found.add(scene.orderId);
    yield scene;
    if (orderIds.includes(scene.orderId) || scene.orderId === root.orderId) {
      for (const { type, scripts } of Object.values(scene.props)) {
        if (type === 'Script') {
          yield* fromScripts(scripts);
        }
      }
    }
  }
  return Array.from(fromScene(root));
}
