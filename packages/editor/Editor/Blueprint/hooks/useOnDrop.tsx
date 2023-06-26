import { useDrop } from 'react-dnd';
import { Node, useViewport } from 'react-flow-renderer';
import { useOnAddNodeFromScript, useOnNodes } from '.';

/**
 * 拖放时生成节点
 * @param param0
 * @returns
 */
export function useOnDrop({
  setNodes,
  addNodes,
  ref: flowRef,
  setLoadingNodes,
}: Pick<ReturnType<typeof useOnNodes>, 'addNodes'> & {
  setNodes: React.Dispatch<React.SetStateAction<Node<RikoScript>[]>>;
  ref: React.RefObject<HTMLDivElement>;
  setLoadingNodes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const viewport = useViewport();
  const addNodeFromScript = useOnAddNodeFromScript(addNodes, setNodes, setLoadingNodes);

  const [_, dropRef] = useDrop<{ type: string; script: RikoScript; status: 0 | 1 }, any, any>({
    accept: ['block'],
    drop({ script, status }, monitor) {
      const { left, top } = flowRef.current!.getBoundingClientRect();
      const { x: offsetX, y: offsetY } = monitor.getSourceClientOffset()!;
      addNodeFromScript(script, {
        position: {
          x: (offsetX - left - viewport.x) / viewport.zoom,
          y: (offsetY - top - viewport.y) / viewport.zoom,
        },
        status,
      });
    },
  });
  return dropRef;
}
