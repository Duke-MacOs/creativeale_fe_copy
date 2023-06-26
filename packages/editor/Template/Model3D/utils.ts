import { ICaseState } from '@editor/aStore';

/**
 * 是否为 3D 看车 Case
 */
export const isCar3D = (state: ICaseState): boolean => {
  if (state.editor.prevState) return isCar3D(state.editor.prevState);
  return state.settings.category === 4;
};

/**
 * 是否显示替换模型
 */
export const isVisibleModelReplace = (state: ICaseState): boolean => {
  return isCar3D(state) && state.type === 'Project';
};
