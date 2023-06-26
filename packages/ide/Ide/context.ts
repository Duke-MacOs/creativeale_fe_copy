import React from 'react';
import { monaco } from 'react-monaco-editor';

interface IEdtContext {
  instance: monaco.editor.IStandaloneCodeEditor | null;
}

export const EditorContext = React.createContext<IEdtContext>({
  instance: null,
});
