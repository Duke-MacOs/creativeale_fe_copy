import { useCurrent } from '@editor/Editor/Property/cells';
import { UploadEntry } from '@editor/Resource/upload';
import { onMacOS } from '@editor/utils';
import { KeyboardEvent, useEffect } from 'react';
import { Node } from 'react-flow-renderer';
import { useHotkeys } from 'react-hotkeys-hook';

export default function useBoardHotKeys(
  nodes: Node<any>[],
  setVideos: React.Dispatch<React.SetStateAction<UploadEntry[]>>
) {
  const selectedRef = useCurrent(getSelectedIds(nodes));
  // useHotkeys('delete,backspace', () =>
  //   setVideos(videos => videos.filter(item => !selectedRef.current.includes(String(item.id))))
  // );
  useHotkeys(`${onMacOS('command', 'control')}+d`, () =>
    setVideos(videos =>
      selectedRef.current.reduce(
        (newVideos, id, index) => {
          const selectedVideo = videos.find(item => item.id === id);
          if (selectedVideo) {
            newVideos.push({ ...selectedVideo, id: String(Date.now() + index) });
          }
          return newVideos;
        },
        [...videos]
      )
    )
  );
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
      }
    };
    for (const event of ['keydown', 'keyup', 'keypress'] as const) {
      document.addEventListener(event, handler as any);
    }
    return () => {
      for (const event of ['keydown', 'keyup', 'keypress'] as const) {
        document.removeEventListener(event, handler as any);
      }
    };
  }, []);
}

const getSelectedIds = (nodes: Array<Node>) =>
  nodes.reduce((pre, node) => pre.concat(node.selected ? node.id : []), [] as string[]);
