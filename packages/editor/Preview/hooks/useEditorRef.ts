/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo } from 'react';
import { Action, Editor, PlayerAction } from '@byted/riko';
import { getAllByOrderId, intoScene, popPlayState, getCustomScriptByOrderId } from '@editor/utils';
import { getProjectHeight } from '@editor/aStore';
import { useStore } from 'react-redux';

const editorRef = { current: null as Promise<Editor> | null };
export const useOnCapture = () => {
  const { getState } = useStore<EditorState>();
  return useCallback((nodeId?: number, width?: number, height?: number) => {
    const { project } = getState();
    return editorRef.current?.then(editor => {
      return editor.capture(
        nodeId ?? project.editor.selectedSceneId,
        width ?? 260,
        height ?? getProjectHeight(project, 260).height
      );
    });
  }, []);
};
export default (containerRef: React.RefObject<HTMLDivElement>) => {
  const [playerSender, playerRecver] = useMemo(() => getEmitter<PlayerAction>(), []);
  const [editorSender, editorRecver] = useMemo(() => getEmitter<Action>(), []);
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = Promise.resolve(
        new Editor(
          containerRef.current,
          editorRecver,
          playerRecver,
          id => {
            // 应薛涵要求，强制混合数据
            const target: any = getAllByOrderId(popPlayState(getState().project), id);
            if (['Material', 'CustomScript', 'Cubemap', 'PanoramaData', 'Texture2D'].includes(target.type)) {
              return target;
            }
            return intoScene(target);
          },
          async orderId => {
            return getCustomScriptByOrderId(popPlayState(getState().project), orderId);
          }
        )
      );
      return editorSender.on(dispatch as any);
    }
  }, []);
  return { editorRef, playerSender, editorSender };
};

const getEmitter = <Action>() => {
  type Listener = (action: Action) => void;
  let listeners1: Listener[] = [];
  let listeners2: Listener[] = [];
  return [
    {
      on(listener: Listener) {
        listeners1.push(listener);
        return () => {
          listeners1 = listeners1.filter(l => l !== listener);
        };
      },
      emit(action: Action) {
        for (const listener of listeners2) {
          listener(action);
        }
      },
    },
    {
      on(listener: Listener) {
        listeners2.push(listener);
        return () => {
          listeners2 = listeners2.filter(l => l !== listener);
        };
      },
      emit(action: Action) {
        for (const listener of listeners1) {
          listener(action);
        }
      },
    },
  ];
};
