import { usePersistCallback } from '@byted/hooks';
import { useEditor } from '@editor/aStore';
import { useEffect, useRef } from 'react';
import { Node, Edge } from 'react-flow-renderer';

/**
 * 打印选中的节点数据
 * @param nodes
 * @param selectedIds
 */
export function useLog(nodes: Node[], edges: Edge[], selectedIds: string[]) {
  const { enableBlueprint } = useEditor(0, 'enableBlueprint');
  const globalEditorScene = useRef<(() => EditorState) | null>(null);
  const handler = usePersistCallback(() => {
    const target = nodes.find(node => node.id === selectedIds[0]);
    if (target) {
      console.log(target, nodes, edges);
    }
  });
  useEffect(() => {
    if (enableBlueprint) {
      globalEditorScene.current = window.editorScene;
      window.editorScene = handler;
      return () => {
        window.editorScene = globalEditorScene.current;
      };
    }
  }, [enableBlueprint, handler]);
}
