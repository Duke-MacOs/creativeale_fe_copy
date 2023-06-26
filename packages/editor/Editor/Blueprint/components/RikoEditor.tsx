import Editor, { Monaco, loader } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
/* eslint-disable */
// @ts-ignore
import rikoTypes from '@byted/riko/dist/riko.d.ts?raw';
// @ts-ignore
import layaTypes from '@byted/riko/dist/LayaAir.d.ts?raw';
import { monaco } from 'react-monaco-editor';
import { useStore } from 'react-redux';
import { useCustomScripts } from '../hooks';
import { ICustomScriptState } from '@editor/aStore';
import { useEventBus } from '@byted/hooks';

loader.config({ monaco });

interface IProps {
  theme?: 'light' | 'dark';
  readOnly?: boolean;
  name?: string;
  width?: number;
  value: string;
  onChange(value?: string): void;
  virtualKey?: any;
}

export function RikoEditor({
  theme = 'light',
  readOnly = false,
  width = 560,
  name,
  value,
  onChange,
  virtualKey,
}: IProps) {
  const onMount = useOnMountEditor(theme, virtualKey);

  return (
    <Editor
      width={width}
      height="90vh"
      defaultLanguage="typescript"
      onMount={onMount}
      {...(name
        ? {
            path: virtualPath(name),
          }
        : {})}
      value={value}
      onChange={onChange}
      options={{
        folding: true,
        foldingHighlight: true,
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        tabSize: 2,
        lineDecorationsWidth: 4,
        fontSize: 14 as number,
        padding: { top: 10, bottom: 10 },
        lightbulb: { enabled: true },
        minimap: { enabled: true },
        readOnly,
      }}
    />
  );
}

/**
 * 主要用来提供类型提示
 * @param theme
 * @returns
 */
export function useOnMountEditor<
  T extends
    | monaco.editor.IStandaloneCodeEditor
    | monaco.editor.IStandaloneDiffEditor = monaco.editor.IStandaloneCodeEditor
>(theme: 'light' | 'dark', virtualKey?: any): (editor: T, monaco: Monaco) => void {
  const { getState } = useStore<EditorState>();
  const editorRef = useRef<T>();
  const monacoRef = useRef<Monaco>();
  useEffect(() => {
    monacoRef.current?.editor.setTheme(theme === 'light' ? 'vs' : 'vs-dark');
  }, [theme]);
  const customScripts = useCustomScripts();
  const dispose = useRef<any>(null);
  useEffect(() => {
    return () => {
      dispose.current?.();
    };
  }, []);

  useEffect(() => {
    return () => {
      monaco.editor.getModels().forEach(model => model.dispose());
    };
  }, [virtualKey]);

  const { trigger: closeBlueprint } = useEventBus('closeBlueprint');

  return (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.setTheme(theme === 'light' ? 'vs' : 'vs-dark');
    setup(monaco);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_O, () => {
      closeBlueprint();
    });
    dispose.current = setupCustomScriptTypes(monaco, customScripts, getState);
  };
}

function setup(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    // allowNonTsExtensions: true,
    allowJs: true,
    removeComments: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  });

  setupRikoTypes(monaco);
  setupPrettier(monaco);

  // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
  //   // editor.getAction('editor.action.formatDocument').run(); // dont't work
  // });
}

function setupRikoTypes(monaco: Monaco) {
  createModel(monaco, rikoTypes, 'riko.d.ts');
  createModel(monaco, layaTypes, 'laya.d.ts');
}

function setupCustomScriptTypes(monaco: Monaco, customScripts: ICustomScriptState[], getState: () => EditorState) {
  for (const script of customScripts) {
    createModel(monaco, script.ideCode, script.name);
  }

  const { dispose } = monaco.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems: function (model, position) {
      const { lineNumber, column } = position;
      const lineContent = model.getLineContent(lineNumber);
      const range = {
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn: column,
        endColumn: column,
      };

      const completionMatch = lineContent.match(/^(import)\s[\s\S]*\s?from\s['"]\.\/['"]/);
      if (!completionMatch) {
        return { suggestions: [] };
      }
      return {
        suggestions: customScripts
          .filter(script => {
            return script.name!.slice(0, -3) !== model.uri.path.slice(1, -3);
          })
          .map(script => {
            const insertText = script.name!.slice(0, -3);
            return {
              label: insertText,
              kind: monaco.languages.CompletionItemKind.File,
              insertText: insertText,
              range,
            };
          }),
      };
    },
    triggerCharacters: [`/`],
  });

  return dispose;
}

async function setupPrettier(monaco: Monaco) {
  const [prettier, tsParser] = await Promise.all([import('prettier/standalone'), import('prettier/parser-typescript')]);
  monaco.languages.registerDocumentFormattingEditProvider('typescript', {
    async provideDocumentFormattingEdits(model) {
      try {
        const text = prettier.format(model.getValue(), {
          parser: 'typescript',
          plugins: [tsParser],
          singleQuote: true,
        });
        return [{ range: model.getFullModelRange(), text }];
      } catch (err) {}
    },
  });
}

function createModel(monaco: Monaco, content: string, name: string) {
  const path = virtualPath(name);
  const monacoPath = monaco.Uri.parse(path);
  const model = monaco.editor.getModel(monacoPath);
  if (!model) {
    monaco.editor.createModel(content, 'typescript', monacoPath);
    monaco.languages.typescript.typescriptDefaults.addExtraLib(content, path);
  }
}

function virtualPath(fileName: string) {
  return `workspace://src/${fileName}`;
}
