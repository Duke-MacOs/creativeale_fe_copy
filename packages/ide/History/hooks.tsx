import { useEventBus } from '@byted/hooks';
import { extraLib, getModel, modifyModel } from '@webIde/Ide/monacoUtils';
import { switchHistory, switchTag, useTab } from '@webIde/store';
import { message, Modal } from 'antd';
import { useCallback, useEffect, useRef } from 'react';
import { monaco } from 'react-monaco-editor';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { IdeState } from '..';
import { addScriptHistory, getScriptHistoryById } from './indexDB';
import dayjs from 'dayjs';
import zhCN from 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const confirmContent = (time: string, name: string) => {
  return (
    <p>
      确定将文件替换为
      <span style={{ color: 'orange' }}>
        {time} {name}
      </span>
    </p>
  );
};

export const useHistoryReload = () => {
  const { trigger } = useEventBus('historyReload');
  return { trigger };
};

export const useHistoryBlurSave = () => {
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { currentTab } = useSelector((state: IdeState) => {
    const { workspace } = state.ide;
    return {
      currentTab: workspace.currentTab,
    };
  }, shallowEqual);
  const editorDidBlurDisposeRef = useRef<monaco.IDisposable | null>(null);
  const { tab } = useTab(currentTab, true);
  const { trigger } = useHistoryReload();

  const onBlurAutoSave = useCallback(async () => {
    if (tab) {
      await addScriptHistory({ ...tab, resourceContent: getModel(tab.name)?.getValue() ?? '' });
      trigger();
    }
  }, [tab, trigger]);

  const setInstance = (instance: monaco.editor.IStandaloneCodeEditor) => {
    editorInstanceRef.current = instance;
  };

  useEffect(() => {
    const editorInstance = editorInstanceRef.current;
    if (editorDidBlurDisposeRef.current) editorDidBlurDisposeRef.current.dispose();
    if (editorInstance) editorDidBlurDisposeRef.current = editorInstance.onDidBlurEditorText(onBlurAutoSave);
  }, [onBlurAutoSave]);

  return {
    setInstance,
  };
};

export const useHistoryCommon = () => {
  const { dispatch } = useStore();
  const { currentTab } = useSelector((state: IdeState) => {
    const { workspace } = state.ide;
    return {
      currentTab: workspace.currentTab,
    };
  }, shallowEqual);
  const { tab, localSyncTab } = useTab(currentTab, true);

  const onCloseCompare = () => {
    dispatch(switchHistory(null));
    dispatch(switchTag(null));
  };

  const onApply = async (historyId: number) => {
    const state = await getScriptHistoryById(historyId);

    if (tab && state) {
      Modal.confirm({
        title: '历史记录覆盖',
        content: confirmContent(dayjs(new Date(state.createTime)).locale(zhCN).fromNow(), state.name),
        cancelText: '取消',
        onOk: () => {
          if (state.resourceContent) {
            try {
              modifyModel(tab.name, state.resourceContent);
              extraLib.add(tab.name, state.resourceContent);
              dispatch(switchHistory(null));
              localSyncTab();
              message.success('替换成功');
            } catch (error) {
              message.error(error);
            }
          }
        },
      });
    } else {
      message.error('文件已经被删除');
    }
  };

  return {
    onCloseCompare,
    onApply,
  };
};
