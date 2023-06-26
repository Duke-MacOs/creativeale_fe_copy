import { monaco } from 'react-monaco-editor';

export const rootUri = 'workspace://';

export function getNodeModulePath(modelName: string) {
  return `${rootUri}node_modules/${modelName}`;
}
export function getFilePath(modelName: string) {
  return `${rootUri}src/${modelName}`;
}
export function getFileUri(path: string) {
  return monaco.Uri.parse(path);
}
