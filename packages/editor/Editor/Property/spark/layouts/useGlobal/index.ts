import { getIndexer, collectIndices, IContext, Spark, filterIndices, flatEqual } from '../../../cells';
import { useSelector, useStore } from 'react-redux';
import { setSettings, useProject } from '@editor/aStore';
import { GlobalSettings, VRVideoGlobalSettings } from './schema';
import { useState } from 'react';

const getUseSettingValue = ({ dispatch }: EditorStore): IContext['useValue'] => {
  return (index, isEqual) => {
    const { indexValue, indexEntries } = getIndexer(index);
    const value: any = useSelector(({ project }: EditorState) => {
      return [indexValue(project.settings)];
    }, isEqual);
    return {
      value,
      onChange([value]) {
        dispatch(setSettings(Object.fromEntries(indexEntries(value)), true));
      },
    };
  };
};

export const useGlobalSettings = (): Spark => {
  const useValue = getUseSettingValue(useStore());
  const [next, setNext] = useState([0 as string | number]);
  const propsMode = useSelector((state: EditorState) => state.project.editor.propsMode);
  const { typeOfPlay, category } = useProject('settings');
  return {
    spark: 'context',
    content: {
      spark: 'visit',
      index: 0,
      label: '全局设置',
      content:
        propsMode === 'Product'
          ? filterIndices(GlobalSettings, collectIndices(GlobalSettings, ['recommended', 'required', 'static']))
          : typeOfPlay === 3 && category === 3
          ? VRVideoGlobalSettings
          : GlobalSettings,
    },
    provide: () => {
      const {
        value: [enabled = true],
        onChange: setEnabled,
      } = useValue('enabled', flatEqual);
      return {
        openKeys: {
          checking: propsMode === 'Template',
          enabled,
          setEnabled(enabled) {
            setEnabled([enabled]);
          },
        },
        useValue,
        visiting: {
          next,
          onVisit: setNext,
        },
      };
    },
  };
};
