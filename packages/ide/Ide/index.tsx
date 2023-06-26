import React, { useRef, useEffect } from 'react';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { usePersistCallback, useDebounceFn } from '@byted/hooks';
import { IdeState } from '@webIde/index';
import { useTab, updateWorkspace } from '@webIde/store';
import { EditorContext } from './context';
import { initMonaco, formatDocument, getMarkers, getService, getModel, viewState, extraLib } from './monacoUtils';
import { emitEventTasks } from './extensions';
import { useResource } from './hooks/useResource';
import MarkerPanel from './MarkerPanel';
import { addScriptHistory } from '@webIde/History/indexDB';
import { AutoCreateHistoryIntervalTime } from '@webIde/History';
import { useHistoryBlurSave, useHistoryReload } from '@webIde/History/hooks';

initMonaco();

export default function Ide(): any {
  const { trigger } = useHistoryReload();

  const dispatch = useDispatch();
  const { currentTab, setting, readOnly, initialRange } = useSelector((state: IdeState) => {
    return {
      currentTab: state.ide.workspace.currentTab,
      setting: state.ide.setting,
      readOnly: state.ide.workspace.readOnly,
      initialRange: state.ide.workspace.initialRange,
    };
  }, shallowEqual);
  useResource(currentTab);
  const { tab, localSyncTab } = useTab(currentTab, true);
  const tabModel = tab ? getModel(tab.name) : null;

  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { setInstance } = useHistoryBlurSave();

  const updateMarkers = usePersistCallback(async () => {
    if (tab && tabModel) {
      const markers = getMarkers(tab.name);
      //80004: JSDoc_types_may_be_moved_to_TypeScript_types
      dispatch(updateWorkspace({ markers: markers.filter(marker => marker.code !== '80004') }));

      try {
        await emitEventTasks(tabModel, 'onMarkersUpdate', null);
      } catch (e) {
        console.error(e.message);
      }
    }
  });

  useEffect(() => {
    const editorInstance = editorInstanceRef.current;

    editorInstance?.setModel(tabModel);
    formatDocument(editorInstance);
    if (currentTab) {
      const vs = viewState.get(currentTab);
      if (vs) {
        editorInstance?.restoreViewState(vs);
        editorInstance?.focus();
      }
    }

    return () => {
      currentTab && viewState.set(currentTab, editorInstance?.saveViewState());
    };
  }, [currentTab, tabModel]);

  useEffect(() => {
    const markerService = getService(editorInstanceRef.current, 'markerDecorationsService');
    if (markerService) {
      markerService._onDidChangeMarker.event(function () {
        updateMarkers();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorInstanceRef.current, updateMarkers]);

  useEffect(() => {
    const editorInstance = editorInstanceRef.current;
    if (currentTab && editorInstance && !readOnly) {
      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
        if (readOnly) return;
        localSyncTab(true);
        formatDocument(editorInstance);
        if (tab) {
          addScriptHistory({ ...tab, resourceContent: getModel(tab.name)?.getValue() ?? '' });
          trigger();
        }
      });
    }
  }, [currentTab, tab, localSyncTab, readOnly]);

  useEffect(() => {
    const editorInstance = editorInstanceRef.current;
    if (editorInstance && initialRange) {
      editorInstance.setSelection(initialRange);
      editorInstance.revealRangeInCenter(initialRange);
    }
  }, [initialRange]);

  const { run: addScriptHistoryDebounce } = useDebounceFn(async () => {
    if (tab) {
      await addScriptHistory({ ...tab, resourceContent: getModel(tab.name)?.getValue() ?? '' });
      trigger();
    }
  }, AutoCreateHistoryIntervalTime);

  const { run: syncContent } = useDebounceFn(async content => {
    if (currentTab && !readOnly) {
      localSyncTab();
      if (tab) {
        extraLib.add(tab.name, content);
        addScriptHistoryDebounce();
      }
    }
  }, 300);

  const options = {
    folding: true,
    foldingHighlight: true,
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    lineDecorationsWidth: 4,
    fontSize: setting.fontSize as number,
    theme: setting.theme as string,
    padding: { top: 10, bottom: 10 },
    lightbulb: { enabled: true },
    readOnly,
  };

  return (
    <EditorContext.Provider value={{ instance: editorInstanceRef.current }}>
      <MonacoEditor
        options={options}
        onChange={content => {
          syncContent(content);
        }}
        editorDidMount={monacoEditor => {
          monacoEditor.focus();
          editorInstanceRef.current = monacoEditor;
          setInstance(monacoEditor);
        }}
      />
      <MarkerPanel theme={setting.theme as string} />
    </EditorContext.Provider>
  );
}
