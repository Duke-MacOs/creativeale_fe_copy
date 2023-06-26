import { ICheckSpark, ISelectSpark } from '@editor/Editor/Property/cells';
import { findById, getNodes, getScene, getSelectedIds } from '@editor/utils';
import { shallowEqual, useSelector } from 'react-redux';

// 脚本选择器
export function scriptSelectSpark(
  content: ISelectSpark,
  options: {
    targetId: number;
    includeTypes?: string[];
    excludeTypes?: string[];
    returnScriptId?: boolean; // 默认获取scriptId，可以设置为获取script name
  }
): ICheckSpark {
  return {
    spark: 'check',
    index: [],
    check: { options: () => useScriptOptions(options) },
    content,
  };
}

function useScriptOptions(options: {
  targetId: number;
  includeTypes?: string[];
  excludeTypes?: string[];
  returnScriptId?: boolean;
}) {
  const { targetId, includeTypes, excludeTypes, returnScriptId = true } = options;

  return useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    const sceneNodes = getNodes(scene);
    const {
      editor: { selected },
    } = scene;
    const { scriptIds, nodeIds } = getSelectedIds(selected);
    const [node] = findById(sceneNodes, targetId === -1 ? nodeIds?.[0] : targetId);
    if (!node) return [];
    const scripts = includeTypes
      ? node.scripts.filter(script => includeTypes.includes(script.type))
      : excludeTypes
      ? node.scripts.filter(script => !excludeTypes.includes(script.type))
      : node.scripts;
    return scripts.map(script => ({
      label: scriptIds?.[0] === script.id ? `${script.name}(自身)` : script.name,
      value: returnScriptId ? (scriptIds?.[0] === script.id ? -1 : script.id) : script.name,
    }));
  }, shallowEqual);
}
