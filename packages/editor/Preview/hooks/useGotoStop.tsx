import { Editor } from '@byted/riko';
import { useEffect } from 'react';
import type useEditorRef from './useEditorRef';
import type useStore from './useStore';

const seenSceneId: Record<number, boolean> = {};

export default (
  { id, editor: { moment, lockCapture, stateId }, nodes }: ReturnType<typeof useStore>['scene'],
  editorRef: ReturnType<typeof useEditorRef>['editorRef'],
  playing: number,
  onCapture: (editor: Editor) => Promise<void>
) => {
  useEffect(() => {
    if (!playing && editorRef.current) {
      editorRef.current = editorRef.current.then(editor => {
        editor.gotoAndStop(moment);
        return editor;
      });
      if (!lockCapture) {
        const promise = editorRef.current.then(editor => {
          const clearId = setTimeout(onCapture, seenSceneId[id] ? 800 : 4000, editor);
          seenSceneId[id] = true;
          return clearId;
        });
        return () => {
          promise.then(id => clearTimeout(id));
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, moment, lockCapture, playing, nodes.length === 0, stateId]);
};
