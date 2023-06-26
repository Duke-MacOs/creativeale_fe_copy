import { useRef } from 'react';
import { monaco } from 'react-monaco-editor';

export default () => {
  const diffEditorRef = useRef<any>(null);

  const createDiffEditor = (source: monaco.editor.ITextModel, target: monaco.editor.ITextModel) => {
    if (!diffEditorRef.current) {
      diffEditorRef.current = monaco.editor.createDiffEditor(document.getElementById('diffContainer')!, {
        readOnly: true,
      });
    }
    diffEditorRef.current.setModel({
      original: source,
      modified: target,
    });
  };

  return {
    createDiffEditor,
  };
};
