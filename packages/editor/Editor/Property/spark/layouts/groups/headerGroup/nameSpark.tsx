import TypeIcon from '@editor/Elements/TimePane/Header/NodeSpan/NodeIcon';
import Icon, { CloudDownloadOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { changeProps, useOnEditComponent } from '@editor/aStore';
import { IFlexSpark, Spark } from '../../../../cells';
import { typeLabel } from './typeLabel';
import { Button, message, Tooltip } from 'antd';
import { SparkFn } from '../..';
import { useState } from 'react';
import { MindMapping, Sync } from '@icon-park/react';
import { useEventBus } from '@byted/hooks';
import { useCurrentNodeId } from '../customGroups/NodeCell';
import { amIHere } from '@shared/utils';
import { getMainScene, getScene, getSceneByOrderId } from '@editor/utils';
import { useSelector, useStore } from 'react-redux';

export const blueprintSpark = ({ type }: { type: 'Node' | 'Project' }): Spark => ({
  spark: 'element',
  hidden: !amIHere({ release: false }),
  content() {
    const { getState } = useStore<EditorState>();
    const { trigger } = useEventBus('Blueprint');
    const nodeId = useCurrentNodeId();
    const id = type === 'Node' ? nodeId : 0;
    return (
      <Tooltip title="编辑蓝图">
        <Button
          type="primary"
          icon={<Icon component={MindMapping as any} />}
          onClick={() => {
            const scene = getScene(getState().project);
            trigger({ type: scene.id === id ? 'Scene' : type, id });
          }}
        />
      </Tooltip>
    );
  },
});

export const nameSpark: SparkFn = ({ type, multiType, multiple }, { typeOfPlay, isRoot }): IFlexSpark => {
  return {
    spark: 'flex',
    content: [
      {
        spark: 'element',
        basis: 'auto',
        hidden: type !== 'Animation3D' || isRoot,
        content() {
          const { dispatch } = useStore();
          const { orderId, nodeId, project } = useSelector<EditorState>(({ project }) => {
            const scene = getScene(project, undefined, false);
            const {
              editor: { selected },
            } = scene;
            const props = scene.props[Object.keys(selected)[0] as any];
            return { project, orderId: props.url, nodeId: Object.keys(selected)[0] };
          });
          const revertProps = () => {
            if (typeof orderId === 'number') {
              const component = getSceneByOrderId(project, orderId);
              const props = component.props[component.id];

              dispatch(
                changeProps([Number(nodeId)], {
                  scale: props.scale ?? [1, 1, 1],
                  rotation: props.rotation ?? [0, 0, 0],
                  physics: props.physics ?? { type: 'none' },
                })
              );
            }
          };
          return (
            <Tooltip title="同步组件内部属性">
              <Button type="default" icon={<Sync />} onClick={revertProps} />
            </Tooltip>
          );
        },
      },
      {
        spark: 'check',
        basis: 'auto',
        index: 'url',
        hidden: amIHere({ release: true }) || typeOfPlay === 4,
        check: {
          hidden: url => !url,
        },
        content: {
          spark: 'value',
          index: 'preload',
          content(preload, onChange) {
            const load = useSelector<EditorState>(({ project }) => {
              if (preload !== undefined) {
                return preload;
              }
              if (type === 'Sprite') {
                return true;
              }
              if (type === 'Sound') {
                return false;
              }
              const { id } = getMainScene(project.scenes);
              return project.editor.selectedSceneId === id;
            });
            return {
              spark: 'element',
              content() {
                return (
                  <Tooltip title={load ? '已设置预加载' : '设置预加载'}>
                    <Button
                      type={load ? 'primary' : 'default'}
                      icon={<CloudDownloadOutlined />}
                      onClick={() => onChange(!load)}
                    />
                  </Tooltip>
                );
              },
            };
          },
        },
      },
      {
        spark: 'block',
        content: {
          spark: 'string',
          width: 72,
          index: 'name',
          defaultValue: '',
          tooltip: '名称',
          max: 20,
          label: multiType ? (
            <>
              <MoreOutlined /> 多选
            </>
          ) : (
            <>
              <TypeIcon type={type} /> {typeLabel(type)}
            </>
          ),
        },
      },
      { ...blueprintSpark({ type: 'Node' }), basis: 'auto', hidden: (type as any) !== 'Blueprint' },
      {
        spark: 'check',
        index: 'url',
        hidden: multiple || !['Animation', 'Animation3D'].includes(type),
        check: {
          hidden: url => !url || (typeof url !== 'string' && typeof url !== 'number'),
          basis: () => 'auto' as const,
        },
        content: {
          spark: 'value',
          index: 'url',
          content(url) {
            const { onEditComponent } = useOnEditComponent();
            const [loading, setLoading] = useState(false);
            return {
              spark: 'element',
              content: () => (
                <Button
                  loading={loading}
                  icon={typeof url === 'number' ? <EditOutlined /> : <EyeOutlined />}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await onEditComponent(url);
                    } catch (error) {
                      message.error(error.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              ),
            };
          },
        },
      },
    ],
  };
};
