import { useStore } from 'react-redux';

export const usePanoramaUI = () => {
  const { getState } = useStore();

  /**
   * 选择 sideBar 类型
   * 0: 普通
   * 1: 全景
   */
  const switchSideBar = () => {
    const { propsMode, selectedSceneId } = getState().project.editor;
    const edit3d = getState().project.scenes.find((i: any) => i.id === selectedSceneId)?.editor.edit3d;

    return propsMode === 'Product' && !edit3d ? 0 : 1;
  };

  return {
    switchSideBar,
  };
};
