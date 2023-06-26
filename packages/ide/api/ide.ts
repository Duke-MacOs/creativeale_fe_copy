import { http } from '@shared/api';

export function createScriptTag(params: {
  projectId: number;
  sceneId: number;
  tagName: string;
  jscode: string;
  desc?: string;
}) {
  return http.post('scene/createScriptTag', params);
}

export function getScriptTags(projectId: number, sceneId: number) {
  return http.get(`scene/getScriptTags?projectId=${projectId}&sceneId=${sceneId}`);
}
