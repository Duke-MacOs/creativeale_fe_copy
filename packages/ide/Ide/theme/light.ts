const theme = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: '', background: 'FFFFFF' },
    { token: 'comment', foreground: '919191' },
    { token: 'string', foreground: '00a33f' },
    { token: 'constant.language', foreground: 'a535ae' },
    { token: 'keyword', foreground: 'ff5600' },
    { token: 'storage', foreground: 'ff5600' },
    { token: 'entity.name.type', foreground: '21439c' },
    { token: 'entity.name.function', foreground: '21439c' },
    { token: 'support.function', foreground: 'a535ae' },
    { token: 'support.constant', foreground: 'a535ae' },
    { token: 'support.type', foreground: 'a535ae' },
    { token: 'support.class', foreground: 'a535ae' },
    { token: 'support.variable', foreground: 'a535ae' },
    { token: 'invalid', foreground: 'ffffff', background: '990000' },
    { token: 'constant.other.placeholder.py', foreground: '990000' },
  ],
  colors: {
    'editor.foreground': '#000000',
    'editor.background': '#F9F9F9',
    'editor.selectionBackground': '#BAD6FD',
    'editor.lineHighlightBackground': '#00000012',
    'editorCursor.foreground': '#000000',
    'editorWhitespace.foreground': '#BFBFBF',
  },
};

export default theme;
