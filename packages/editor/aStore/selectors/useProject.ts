import { useSelector, shallowEqual } from 'react-redux';
import { getScene } from '@editor/utils';
import { ICaseState, ISceneState } from '../project';
import { isEqual } from 'lodash';

export const getProjectHeight = ({ type, settings, scenes: [scene] }: ICaseState, width?: number) => {
  const { width: w = 750, height: h = 1334 } = type === 'Component' ? (scene.props[scene.id] as any) : settings;
  if (width) {
    return { width, height: Math.floor((h / w) * width) };
  }
  return { width: w, height: h };
};

export const useProjectHeight = (width?: number) => {
  return useSelector(({ project }: EditorState) => getProjectHeight(project, width), shallowEqual);
};

export const useProject = <K extends keyof ICaseState>(key: K): ICaseState[K] => {
  return useSelector(({ project }: EditorState) => {
    return project[key];
  }, isEqual);
};

export const useScene = <K extends keyof ISceneState>(key: K): ISceneState[K] => {
  return useSelector(({ project }: EditorState) => {
    return getScene(project)[key];
  }, isEqual);
};
