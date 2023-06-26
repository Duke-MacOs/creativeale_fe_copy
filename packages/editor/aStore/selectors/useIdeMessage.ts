import { useEffect } from 'react';
import {
  useOnAddCustomScript,
  useOnDeleteCustomScript,
  useOnRenameCustomScript,
  useOnSaveCustomScript,
  useEditor,
  useProject,
  setSettings,
} from '@editor/aStore';
import { useStore } from 'react-redux';
import { getTopState } from '@editor/utils';
import { compileAllToOne } from '@editor/Editor/Blueprint/utils';

const targetOrigin = window.location.origin;

function isWin(obj: any) {
  return /Window|global/.test({}.toString.call(obj)) || (obj == obj.document && obj.document != obj);
}

export function useIdeMessage() {
  const onAddCustomScript = useOnAddCustomScript();
  const onDeleteCustomScript = useOnDeleteCustomScript();
  const onRenameCustomScript = useOnRenameCustomScript();
  const onSaveCustomScript = useOnSaveCustomScript();
  const { readOnly } = useEditor(0, 'readOnly');
  const sourceProjectId = useProject('id');
  const { getState, dispatch } = useStore<EditorState>();

  useEffect(() => {
    const messageHandler = async (evt: MessageEvent) => {
      const { type, params, id: messageId, projectId } = evt.data;
      if (!messageId || evt.origin !== window.location.origin) {
        return;
      }
      const sourceWin: Window | null = evt.source && isWin(evt.source) ? (evt.source as Window) : null;
      if (sourceProjectId !== projectId) {
        sourceWin?.postMessage(
          {
            id: messageId,
            error: new Error(JSON.stringify({ code: -2, message: '项目Id不一致' })),
          },
          targetOrigin
        );
        return;
      }
      switch (type) {
        case 'initial':
          sourceWin?.postMessage({ id: messageId, result: { readOnly } }, targetOrigin);
          break;
        case 'addCustomScript':
          await onAddCustomScript(params.name, params.language)
            .then(({ id, orderId }) => {
              sourceWin?.postMessage({ id: messageId, result: { id, orderId } }, targetOrigin);
            })
            .catch(error => {
              sourceWin?.postMessage(
                { id: messageId, error: new Error(JSON.stringify({ code: -1, message: error.message })) },
                targetOrigin
              );
            });
          break;
        case 'deleteCustomScript':
          await onDeleteCustomScript(params.id, params.orderId)
            .then(() => {
              sourceWin?.postMessage({ id: messageId, result: null }, targetOrigin);
            })
            .catch(error => {
              sourceWin?.postMessage(
                { id: messageId, error: new Error(JSON.stringify({ code: -1, message: error.message })) },
                targetOrigin
              );
            });
          break;
        case 'renameCustomScript':
          await onRenameCustomScript(params.id, params.name)
            .then(() => {
              sourceWin?.postMessage({ id: messageId, result: null }, targetOrigin);
            })
            .catch(error => {
              sourceWin?.postMessage(
                { id: messageId, error: new Error(JSON.stringify({ code: -1, message: error.message })) },
                targetOrigin
              );
            });
          break;
        case 'saveCustomScript': {
          await onSaveCustomScript(params.id, params.name, params.content)
            .then(() => {
              sourceWin?.postMessage({ id: messageId, result: null }, targetOrigin);
            })
            .catch(error => {
              sourceWin?.postMessage(
                { id: messageId, error: new Error(JSON.stringify({ code: -1, message: error.message })) },
                targetOrigin
              );
            });
          break;
        }
      }
      const customScripts = getTopState(getState().project).customScripts;
      if (customScripts.length) {
        const jsCode = await compileAllToOne(customScripts);
        dispatch(
          setSettings(
            {
              jsCode,
            },
            true
          )
        );
      }
    };
    window.addEventListener('message', messageHandler);
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [
    sourceProjectId,
    onAddCustomScript,
    onDeleteCustomScript,
    onRenameCustomScript,
    onSaveCustomScript,
    readOnly,
    getState,
    dispatch,
  ]);
}
