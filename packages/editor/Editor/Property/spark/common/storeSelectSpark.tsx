import { ICheckSpark, ISelectSpark } from '../../cells';
import { useSelector } from 'react-redux';

export const storeSelectSpark = (selectSpark: ISelectSpark): ICheckSpark => {
  return {
    spark: 'check',
    index: [],
    check: { options: () => useStoreOptions() },
    content: selectSpark,
  };
};

export const useStoreOptions = () => {
  const store = useVariable();
  return Object.keys(store ?? {}).map(key => ({ label: key, value: key }));
};

export const useVariable = (): Record<string, any> => {
  return {
    ...useSelector(({ project }: EditorState) => {
      while (project.editor.prevState) {
        project = project.editor.prevState;
      }
      return project.settings.store;
    }),
    SceneLoadingProgress: 0,
    SupportShake: false,
  };
};
