import Editor from '@monaco-editor/react';

export function JsonEditor({
  value = JSON.stringify({}, null, 4),
  onChange,
}: {
  value?: string;
  onChange(value?: string): void;
}) {
  return (
    <Editor
      width="100%"
      height="600px"
      language="json"
      value={value}
      onChange={onChange}
      options={{
        folding: true,
        foldingHighlight: true,
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        tabSize: 2,
        lineDecorationsWidth: 0,
        fontSize: 12 as number,
        padding: { top: 10, bottom: 10 },
        lightbulb: { enabled: true },
        minimap: { enabled: false },
      }}
    />
  );
}
