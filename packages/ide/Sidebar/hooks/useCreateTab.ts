import { useStore } from 'react-redux';
import { usePersistCallback } from '@byted/hooks';
import { updateWorkspace, updateTabs } from '@webIde/store';
import { IdeState } from '@webIde/index';
import useEditorProxy from '@webIde/hooks/useEditorProxy';

export default function useCreateTab() {
  const { dispatch, getState } = useStore<IdeState, any>();
  const { postMessage } = useEditorProxy();

  return usePersistCallback((name: string, language: string) => {
    const { projectId, resourceNav } = getState().ide.workspace;
    const newName = name + (language === 'typescript' ? '.ts' : '.js');

    if (!projectId) {
      return Promise.reject(new Error('请打开指定工作区'));
    }

    return postMessage('addCustomScript', { name: newName, language }).then(({ id, orderId }: any) => {
      dispatch(
        updateTabs({
          [id]: {
            id,
            orderId,
            projectId,
            name: newName,
            needsSave: false,
            saveStatus: 0,
          },
        })
      );
      dispatch(updateWorkspace({ resourceNav: [id].concat(resourceNav), currentTab: id }));
    });
  });
}
