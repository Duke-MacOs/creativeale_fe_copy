import { useStore } from 'react-redux';
import { message } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { ITabState, deleteTab, updateWorkspace } from '@webIde/store';
import { IdeState } from '@webIde/index';
import { getModel, extraLib } from '@webIde/Ide/monacoUtils';
import useEditorProxy from '@webIde/hooks/useEditorProxy';
import { deleteFileHistory } from '@webIde/History/indexDB';
export default function useDeleteTab() {
  const { dispatch, getState } = useStore<IdeState, any>();
  const { postMessage } = useEditorProxy();

  return usePersistCallback((tab: ITabState) => {
    return postMessage('deleteCustomScript', { id: tab.id, orderId: tab.orderId })
      .then(() => {
        const { resourceNav, currentTab } = getState().ide.workspace;
        const targetIdx = resourceNav.findIndex(tabId => tabId === tab.id);
        const nextNav = [...resourceNav];
        nextNav.splice(targetIdx, 1);
        const partial: Partial<IdeState['ide']['workspace']> = { resourceNav: nextNav };
        if (currentTab === tab.id) {
          if (targetIdx === resourceNav.length - 1) {
            partial.currentTab = resourceNav[resourceNav.length - 2];
          } else {
            partial.currentTab = resourceNav[targetIdx + 1];
          }
        }
        dispatch(updateWorkspace(partial));
        dispatch(deleteTab(tab.id));
        deleteFileHistory(tab.id);

        setTimeout(() => {
          const originModel = getModel(tab.name);
          originModel && originModel.dispose();
          extraLib.remove(tab.name);
        }, 300);
      })
      .catch(err => {
        message.error(err.message);
      });
  });
}
