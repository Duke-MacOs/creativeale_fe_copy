import { ICaseState, useEditor, useOnAddNodeFromFiles, useOnAddScripts, useScene } from '@editor/aStore';
import { NativeTypes } from 'react-dnd-html5-backend';
import { getScene, newID } from '@editor/utils';
import { useDrop } from 'react-dnd';
import { useRef } from 'react';

export default (state: ICaseState) => {
  const {
    editor: { propsMode },
    settings: { typeOfPlay },
  } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneEditor = useScene('editor');
  const { edit3d } = useEditor('edit3d');
  const { onAddNode, onAddNodeFromFiles } = useOnAddNodeFromFiles();
  const onAddScripts = useOnAddScripts();
  const [, drop] = useDrop<
    | { type: 'resource'; mime: string; name: string; url: string; cover?: string; props?: Record<string, unknown> }
    | { type: 'undefined'; files: File[] },
    any,
    any
  >({
    accept: ['resource', NativeTypes.FILE],
    canDrop(item) {
      if (item.type === 'resource' && item.mime === 'CustomScript' && Object.keys(sceneEditor.selected).length === 0) {
        return false;
      }
      if (
        propsMode === 'Product' ||
        (!item.type && typeOfPlay === 4) ||
        (typeOfPlay === 3 && getScene(state).editor.loading)
      ) {
        return false;
      }
      return true;
    },
    drop(item, monitor) {
      const position = monitor.getClientOffset() || undefined;
      // 3D模式暂不开放拖放元素
      if (!edit3d) {
        if (item.type === 'resource') {
          if (item.mime === 'CustomScript') {
            onAddScripts('Script', {
              script: 'Auto',
              name: '自动触发',
              once: true,
              time: sceneEditor.moment,
              scripts: [
                {
                  id: newID(),
                  type: 'Script',
                  props: {
                    name: '自定义脚本',
                    script: 'CustomScript',
                    url: item.url,
                  },
                },
              ],
            });
          } else {
            onAddNode(
              {
                ...item,
                position,
                mapNode(node) {
                  const props = { ...node.props, ...item.props };
                  return { ...node, props };
                },
              },
              true
            );
          }
        } else if (item.type === (undefined as unknown as 'undefined')) {
          onAddNodeFromFiles(item.files, { position });
        }
      }
    },
  });
  drop(containerRef);
  return containerRef;
};
