import { monaco } from 'react-monaco-editor';
import { getModel } from './model';
import { getFileUri, getFilePath } from './path';

export function setMarkers(modelName: string, messageList: monaco.editor.IMarkerData[]) {
  const model = getModel(modelName);

  if (!model) {
    return;
  }
  monaco.editor.setModelMarkers(model, 'eslint', messageList);
}

export function getMarkers(modelName: string) {
  return monaco.editor.getModelMarkers({ resource: getFileUri(getFilePath(modelName)) });
}
