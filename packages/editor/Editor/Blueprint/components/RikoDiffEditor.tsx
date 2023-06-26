import { DiffEditor } from '@monaco-editor/react';
import { monaco } from 'react-monaco-editor';
import { useOnMountEditor } from './RikoEditor';

interface IProps {
  theme?: 'light' | 'dark';
  readOnly?: boolean;
  width?: number;
  original: string;
  modified: string;
  virtualKey?: any;
}
export function RikoDiffEditor({
  theme = 'light',
  readOnly = false,
  width = 560,
  original,
  modified,
  virtualKey,
}: IProps) {
  const onMount = useOnMountEditor<monaco.editor.IStandaloneDiffEditor>(theme, virtualKey);

  return (
    <DiffEditor
      onMount={onMount}
      width={width}
      height="90vh"
      language="typescript"
      original={original}
      modified={modified}
      options={{
        folding: true,
        foldingHighlight: true,
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
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
