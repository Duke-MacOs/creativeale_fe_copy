import { collectEvent, EventTypes } from '@editor/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { checkPlayableAreaAll, useOnPostMessage, useSettings } from '@editor/aStore';
import { previewProject } from '@shared/api/project';
import { useUrlVisible } from '@editor/hooks';
import { PlayOne } from '@icon-park/react';
import { RIKO_VERSION } from '@byted/riko';
import { intoScene } from '@editor/utils';
import HeaderButton from '../HeaderButton';
import Icon from '@ant-design/icons';
import Previewer from './Previewer';
import { message } from 'antd';

export const usePreviewUrl = (getState: () => EditorState) => {
  const [previewUrl, setPreviewUrl] = useState('');
  return {
    previewUrl,
    updatePreviewUrl: async () => {
      const { id, editor } = getState().project;
      const { previewUrl } = await previewProject(id);
      const url = new URL(previewUrl);
      url.searchParams.set('version', RIKO_VERSION);
      if (editor.readOnly) {
        url.searchParams.set('type', 'preview');
        url.searchParams.delete('projectUrl');
      }
      setPreviewUrl(url.href);
    },
    clearPreviewUrl: () => setPreviewUrl(''),
  };
};

export default function Preview({
  disabled,
  getState,
  onSaving,
}: {
  disabled: boolean;
  getState(): EditorState;
  onSaving(action?: string): Promise<void>;
}) {
  const typeOfPlay = useSettings('typeOfPlay');
  const [visible, setVisible] = useUrlVisible('preview');
  const { previewUrl: httpUrl, updatePreviewUrl, clearPreviewUrl } = usePreviewUrl(getState);
  const getDefaultResolution = useCallback((): [number, number] => {
    const { height = 667, width = 375 } = getState().project.settings;
    const previewH = Math.min(667, height);
    return [previewH, previewH && Math.floor((width * previewH) / height)];
  }, [getState]);
  useOnPostMessage('ProjectState', () => {
    const { project } = getState();
    const getScenes = ({ editor: { prevState }, scenes }: typeof project): typeof project.scenes => {
      if (prevState) {
        return scenes.concat(
          getScenes(prevState).filter(({ orderId }) => !scenes.some(scene => scene.orderId === orderId))
        );
      }
      return scenes;
    };
    return {
      ...project,
      scenes: getScenes(project)
        .map(scene => intoScene(scene))
        .concat(project.customScripts),
    };
  });
  useEffect(() => {
    if (visible && !disabled) {
      updatePreviewUrl();
    } else {
      clearPreviewUrl();
    }
  }, [visible, disabled]);
  return (
    <React.Fragment>
      <HeaderButton
        icon={<Icon component={PlayOne as any} />}
        disabled={disabled}
        onClick={async () => {
          collectEvent(EventTypes.OperationButton, {
            type: '预览',
          });
          try {
            await onSaving('预览');
            const warning = checkPlayableAreaAll(getState().project);
            if (warning) {
              message.warning(`${warning}，请及时检查是否影响互动效果`);
            }
            setVisible(true);
          } catch (error) {
            message.error(error?.message || '无法生成预览链接');
          }
        }}
      >
        预览
      </HeaderButton>
      {httpUrl.length > 0 && (
        <Previewer
          typeOfPlay={typeOfPlay}
          httpUrl={httpUrl}
          originSize={getDefaultResolution()}
          onClose={() => setVisible(false)}
        />
      )}
    </React.Fragment>
  );
}
