/* eslint-disable react-hooks/exhaustive-deps */
import { useEventBus } from '@byted/hooks';
import { useEffect, useMemo } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import type useStore from './useStore';

export const useSceneStack = (
  { id, history: { undoStack, redoStack } }: ReturnType<typeof useStore>['scene'],
  sender: any
) => {
  const undoIndex = useMemo(() => ({ current: undoStack.length }), [id]);
  const redoIndex = useMemo(() => ({ current: redoStack.length }), [id]);
  useEffect(() => {
    for (const action of undoStack.slice(undoIndex.current)) {
      try {
        sender.emit(cloneDeep(action as any));
      } catch (e) {
        console.error(action, e);
      }
    }
    undoIndex.current = undoStack.length;
  }, [undoStack]);
  useEffect(() => {
    for (const action of redoStack.slice(redoIndex.current)) {
      try {
        sender.emit(cloneDeep(action as any).undo);
      } catch (e) {
        console.error((action as any).undo, e);
      }
    }
    redoIndex.current = redoStack.length;
  }, [redoStack]);
};

export const useStateStack = (
  { id, editor: { editorTaskStack } }: ReturnType<typeof useStore>['state'],
  sender: any
) => {
  const editorTaskIndex = useMemo(() => ({ current: editorTaskStack.length }), [id]);
  useEffect(() => {
    for (const action of editorTaskStack.slice(editorTaskIndex.current)) {
      try {
        sender.emit(cloneDeep(action as any));
      } catch (e) {
        console.error(action, e);
      }
    }
    editorTaskIndex.current = editorTaskStack.length;
  }, [editorTaskStack]);
  useEventBus('EmitStateEvent', event => {
    sender.emit(event);
  });
};
