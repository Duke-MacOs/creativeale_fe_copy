import { ICheckSpark, ISelectSpark } from '@editor/Editor/Property/cells';
import { shallowEqual, useSelector } from 'react-redux';

// 场景选择器
export function sceneSelectSpark(selectSpark: ISelectSpark): ICheckSpark {
  return {
    spark: 'check',
    space: 'sceneSelectSpark',
    index: [],
    check: { options: () => useSceneOptions() },
    content: selectSpark,
  };
}

export function useSceneOptions() {
  return useSelector(({ project: { scenes, settings, editor } }: EditorState) => {
    const options = scenes
      .filter(({ type, editor }) => type === 'Scene' && !editor.loading)
      .map(({ name = '未命名场景', orderId }) => ({ label: name, value: orderId }));
    if (settings.typeOfPlay === 4) {
      const { orderId } = scenes.find(({ id }) => id === editor.selectedSceneId) ?? {};
      return options.filter(({ value }) => value !== orderId);
    }
    return [
      {
        label: '上一个场景',
        value: -1,
      },
      ...options,
    ];
  }, shallowEqual);
}
