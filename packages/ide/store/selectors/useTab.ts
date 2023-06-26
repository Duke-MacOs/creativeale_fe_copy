import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePersistCallback } from '@byted/hooks';
import { message } from 'antd';
import { isNil } from 'lodash';
import { IdeState } from '@webIde/index';
import { updateTabs } from '@webIde/store';
import { getModel } from '@webIde/Ide/monacoUtils';
import { EditorIdeUpdateStorageKey } from '@webIde/constant';
import useEditorProxy from '@webIde/hooks/useEditorProxy';

type SaveTaskParams = {
  content?: string;
  name?: string;
  language?: 'typescript' | 'javascript';
  showsResult?: boolean;
};

export function useTab(tabId: number | null, needsWatchSaving = false) {
  const { postMessage } = useEditorProxy();
  const dispatch = useDispatch();
  const tab = useSelector((state: IdeState) => (isNil(tabId) ? null : state.ide.tabs[tabId]));
  const language = tab ? tab.resourceLanguage ?? 'typescript' : 'typescript';
  const needsSave = tab ? tab.needsSave : false;
  const saveStatus = tab ? tab.saveStatus : 0;
  const tabContent = tab ? tab.resourceContent ?? '' : '';
  const syncDataRef = useRef({
    showsSyncResult: false,
    saveStatus: 0,
    needsSave: false,
  });
  const saveTab = usePersistCallback(async ({ showsResult = false }: SaveTaskParams) => {
    if (!isNil(tab) && !isNil(tabId)) {
      const { id, name } = tab;
      const model = getModel(name);
      const content = model ? model.getValue() : tabContent;

      const result = { ideCode: '', jsCode: '' };
      result.ideCode = content;

      syncDataRef.current = {
        ...syncDataRef.current,
        saveStatus: 1,
        needsSave: false,
      };

      dispatch(updateTabs({ [tabId]: { ...tab, needsSave: false, saveStatus: 1 } }));
      try {
        postMessage('saveCustomScript', {
          id,
          name,
          content: { type: 'CustomScript', language, ideCode: content },
        });
        const newTab = {
          ...tab,
          resourceLanguage: language,
          resourceContent: content,
          saveStatus: 0 as const,
          needsSave: syncDataRef.current.needsSave,
        };
        syncDataRef.current = { ...syncDataRef.current, saveStatus: 0 };
        dispatch(updateTabs({ [tabId]: newTab }));
        localStorage.setItem(EditorIdeUpdateStorageKey, String(new Date().getTime()));
        if (showsResult) {
          message.success('保存成功');
        }
      } catch (error) {
        syncDataRef.current = { ...syncDataRef.current, saveStatus: 0 };
        dispatch(updateTabs({ [tabId]: { ...tab, saveStatus: 0, needsSave: true } }));
        if (showsResult) {
          message.error(error.message);
        }
      }
    } else {
      return Promise.resolve();
    }
  });

  const localSyncTab = usePersistCallback((showsResult = false) => {
    if (!isNil(tab) && !isNil(tabId)) {
      syncDataRef.current = {
        ...syncDataRef.current,
        needsSave: true,
        showsSyncResult: showsResult,
      };
      dispatch(updateTabs({ [tabId]: { ...tab, needsSave: true } }));
    }
  });

  useEffect(() => {
    const { saveStatus, showsSyncResult, needsSave } = syncDataRef.current;
    if (!needsWatchSaving || !needsSave) {
      return;
    }
    if (saveStatus !== 1) {
      saveTab({ showsResult: showsSyncResult });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncDataRef.current, needsWatchSaving, saveTab]);

  return {
    tab,
    tabContent,
    needsSave,
    saveStatus,
    language,
    saveTab,
    localSyncTab,
  };
}
