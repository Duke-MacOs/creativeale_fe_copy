import { useStore } from 'react-redux';
import { message } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { ITabState, updateTabs } from '@webIde/store';
import { IdeState } from '@webIde/index';
import { createModel, getModel, extraLib } from '@webIde/Ide/monacoUtils';
import useEditorProxy from '@webIde/hooks/useEditorProxy';

export default function useRenameTab() {
  const { dispatch, getState } = useStore<IdeState, any>();
  const { postMessage } = useEditorProxy();

  return usePersistCallback((tab: ITabState, newName: string) => {
    const { name: originName } = tab;
    const tabs = getState().ide.tabs;

    if (newName === originName) {
      return Promise.resolve();
    }

    return postMessage('renameCustomScript', { id: tab.id, name: newName })
      .then(() => {
        const { id } = tab;

        const originModel = getModel(originName);
        if (originModel) {
          const language = originModel.getModeId() as 'typescript' | 'javascript';
          createModel(newName, originModel.getValue(), language);
          extraLib.add(newName, originModel.getValue());
          setTimeout(() => {
            extraLib.remove(originName);
            originModel && originModel.dispose();
          }, 300);
        }

        dispatch(updateTabs({ [id]: { ...tabs[id], name: newName } }));
      })
      .catch(err => {
        message.error(err.message);
      });
  });
}
