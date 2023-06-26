import { monaco } from 'react-monaco-editor';
import Dark from '../theme/dark';
import Light from '../theme/light';
import { setupExtensions } from '../extensions';
import { createModel } from './model';
import { extraLib } from './extraLibManager';
/* eslint-disable */
// @ts-ignore
import rikoTypes from '@byted/riko/dist/riko.d.ts?raw';
// @ts-ignore
import layaTypes from '@byted/riko/dist/LayaAir.d.ts?raw';
// @ts-ignore
// import { StandaloneCodeEditorServiceImpl } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeServiceImpl';
/* eslint-enable */

export * from './path';
export * from './model';
export * from './viewStateManager';
export * from './markers';
export * from './extraLibManager';

export function initMonaco() {
  defineThemes();
  createBasicDepModel();
  setupExtensions();
  registerPrettierFormatter();
}

function defineThemes() {
  monaco.editor.defineTheme('Dark', Dark);
  monaco.editor.defineTheme('light', Light);
}

function createBasicDepModel() {
  extraLib.add('laya/index.d.ts', layaTypes, true);
  createModel('laya/index.d.ts', layaTypes, 'typescript', true);
  extraLib.add('riko/index.d.ts', rikoTypes, true);
  createModel('riko/index.d.ts', rikoTypes, 'typescript', true);
}

async function registerPrettierFormatter() {
  const [prettier, babelParser, tsParser] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/parser-babel'),
    import('prettier/parser-typescript'),
  ]);

  monaco.languages.registerDocumentFormattingEditProvider('javascript', {
    async provideDocumentFormattingEdits(model) {
      const text = prettier.format(model.getValue(), { parser: 'babel', plugins: [babelParser], singleQuote: true });
      return [{ range: model.getFullModelRange(), text }];
    },
  });
  monaco.languages.registerDocumentFormattingEditProvider('typescript', {
    async provideDocumentFormattingEdits(model) {
      const text = prettier.format(model.getValue(), { parser: 'typescript', plugins: [tsParser], singleQuote: true });
      return [{ range: model.getFullModelRange(), text }];
    },
  });
}

export function formatDocument(editorInstance: monaco.editor.IStandaloneCodeEditor | null) {
  if (editorInstance) {
    editorInstance.getAction('editor.action.formatDocument').run();
  }
}

export function getService(editorInstance: monaco.editor.IStandaloneCodeEditor | null, serviceName: string) {
  if (editorInstance) {
    /* eslint-disable */
    // @ts-ignore
    const entries = editorInstance._instantiationService._parent._services._entries;
    for (const entry of entries) {
      if (entry[0].toString() === serviceName) {
        return entry[1];
      }
    }
    /* eslint-enable */
  }
  return null;
}
