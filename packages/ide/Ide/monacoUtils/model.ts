import { monaco } from 'react-monaco-editor';
import { getNodeModulePath, getFilePath, getFileUri } from './path';

export function createModel(
  modelName: string,
  content: string,
  language: 'typescript' | 'javascript',
  isNodeModule = false
) {
  const existedModel = getModel(modelName);
  if (existedModel) return existedModel;
  return monaco.editor.createModel(
    content,
    language,
    getFileUri(isNodeModule ? getNodeModulePath(modelName) : getFilePath(modelName))
  );
}

export function modifyModel(modelName: string, content: string) {
  const existedModel = getModel(modelName);
  if (existedModel) {
    existedModel?.setValue(content);
    return existedModel;
  }
  throw new Error('文件不存在');
}

export function getModel(modelName: string) {
  return monaco.editor.getModel(getFileUri(getFilePath(modelName)));
}
