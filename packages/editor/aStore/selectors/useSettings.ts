import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { ICaseState } from '../project';

export const useSettings = <K extends keyof ICaseState['settings']>(key: K): ICaseState['settings'][K] => {
  return useSelector(({ project }: EditorState) => {
    return project.settings[key];
  }, isEqual);
};
