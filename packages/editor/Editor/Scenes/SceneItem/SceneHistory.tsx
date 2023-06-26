import { restoreState, useEditor, useProject } from '@editor/aStore';
import { History } from '@icon-park/react';
import { Button, Tooltip } from 'antd';
import { useStore } from 'react-redux';
import Icon from '@ant-design/icons';

export default function SceneHistory() {
  const { getState, dispatch } = useStore<EditorState>();
  const type = useProject('type');
  const { propsMode } = useEditor(0, 'propsMode');
  return type === 'Project' && propsMode === 'Project' ? (
    <div className="scene-history">
      <Tooltip title="历史回退" placement="top">
        <Button
          size="small"
          type="default"
          icon={
            <Icon
              component={History as any}
              onClick={() => {
                const { project } = getState();
                dispatch(
                  restoreState({
                    ...project,
                    type: 'History',
                    editor: {
                      ...project.editor,
                      readOnly: true,
                    },
                  })
                );
              }}
            />
          }
        />
      </Tooltip>
    </div>
  ) : null;
}
