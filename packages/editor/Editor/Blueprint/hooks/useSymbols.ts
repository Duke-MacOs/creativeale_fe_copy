import { getScene } from '@editor/utils';
import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';

/**
 * 获取所有场景数值（symbol）
 * @param category
 * @returns
 */
export function useSymbols(): Array<{ label: any; value: any }> {
  return useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    return Object.keys((scene.props[scene.id].sceneData || {}) as Record<string, any>).map(key => ({
      label: key,
      value: key,
    }));
  }, isEqual);
}
