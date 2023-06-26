import { findById, getNodes, getScene, intoScripts } from '@editor/utils';

/**
 * 根据Blueprint根脚本，获取其父节点或父场景
 * @param script
 * @param getState
 * @returns
 */
export function getParentOfRootBlueprint(script: RikoScript, getState: () => EditorState) {
  switch (script.editor?.nodeType) {
    case 'node': {
      const [node] = findById(getNodes(getScene(getState().project)), script.id, true);
      return node;
    }
    case 'scene': {
      const scene = getState()
        .project.scenes.filter(scene => !scene.editor.loading && scene.type === 'Scene')
        .find(scene => {
          const scripts = intoScripts(scene.scripts || [], scene.props);
          return scripts.some(s => s.type === 'Blueprint' && s.editor?.nodeType === 'scene' && s.id === script.id);
        });
      return scene;
    }
  }
}
