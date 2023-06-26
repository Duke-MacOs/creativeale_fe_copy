import React from 'react';
import { useStore } from 'react-redux';
import { Button, Popconfirm, Tooltip } from 'antd';
import Icon from '@ant-design/icons';
import { Logout, Clear, Help } from '@icon-park/react';
import { restoreState, useEmitter } from '@editor/aStore';
import { addSceneHistory, cleanProjectHistories, cleanSceneHistories, getSceneById } from '../hooks';
import className from '../../Header/style';

export default function History() {
  const { getState, dispatch } = useStore<EditorState>();
  const cleanIndexedDB = useEmitter('CleanIndexedDB');

  const onBack = () => {
    const { project } = getState();
    const { prevState } = project.editor;
    if (prevState) {
      dispatch(
        restoreState({
          ...prevState,
          type: 'Project',
          editor: {
            ...prevState.editor,
            readOnly: false,
          },
        })
      );
    } else {
      dispatch(
        restoreState({
          ...project,
          type: 'Project',
          editor: {
            ...project.editor,
            readOnly: false,
          },
        })
      );
    }
  };

  const onApply = async () => {
    const { project } = getState();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { prevState, ...rest } = project.editor;
    const scene = getSceneById(project, project.editor.selectedSceneId);
    if (scene) {
      addSceneHistory(project.id, scene.id, scene);
    }
    dispatch(
      restoreState({
        ...project,
        type: 'Project',
        editor: {
          ...rest,
          readOnly: false,
        },
      })
    );
  };

  return (
    <div className={className} style={{ display: 'flex', alignContent: 'center', justifyContent: 'flex-start' }}>
      <div
        style={{
          flexBasis: 164,
          padding: '20px 32px',
          textAlign: 'center',
          fontWeight: 500,
          fontSize: 16,
        }}
      >
        历史记录
      </div>
      <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
        <Popconfirm
          title="确定直接返回吗？（选中的历史版本不会被应用）"
          onConfirm={onBack}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" icon={<Icon component={Logout as any} />}>
            返回项目
          </Button>
        </Popconfirm>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="清空当前场景的所有历史版本">
          <Button
            type="text"
            icon={<Icon component={Clear as any} />}
            onClick={async () => {
              const { project } = getState();
              const {
                project: {
                  editor: { selectedSceneId },
                },
              } = getState();
              await cleanSceneHistories(project.id, selectedSceneId);
              cleanIndexedDB(selectedSceneId);
            }}
          >
            清空场景记录
            <Icon component={Help as any} />
          </Button>
        </Tooltip>
        <Tooltip title="清空当前项目的所有历史版本">
          <Button
            type="text"
            icon={<Icon component={Clear as any} />}
            onClick={async () => {
              const { project } = getState();
              await cleanProjectHistories(project.id);
              cleanIndexedDB(0);
            }}
          >
            清空项目记录
            <Icon component={Help as any} />
          </Button>
        </Tooltip>
      </div>
      <Button
        onClick={onApply}
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        应用此版本
      </Button>
    </div>
  );
}
