import { useEffect, useState, useRef } from 'react';
import { isNil } from 'lodash';

interface IOriginState {
  x?: number;
  y?: number;
}

export const useDrag = (
  dragTriggerRef: React.MutableRefObject<any>,
  config: { originData?: IOriginState; disabled?: boolean } = {}
) => {
  const [isDragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [calculatedState, setCalculatedState] = useState(config.originData || { x: 0, y: 0 });
  const draggingStartRef = useRef<Record<string, any>>({});
  const originDataRef = useRef(calculatedState);
  originDataRef.current = config.originData || { x: 0, y: 0 };

  useEffect(() => {
    const onDragStart = (event: MouseEvent) => {
      if (config.disabled) {
        return;
      }
      setDragOffset({ x: 0, y: 0 });
      setDragging(true);
      draggingStartRef.current = {
        pos: { x: event.pageX, y: event.pageY },
        origin: { ...originDataRef.current },
        isDragging: true,
      };

      const calculatedState: IOriginState = {};
      if (!isNil(draggingStartRef.current.origin.x)) {
        calculatedState.x = draggingStartRef.current.origin.x;
      }
      if (!isNil(draggingStartRef.current.origin.y)) {
        calculatedState.y = draggingStartRef.current.origin.y;
      }
      setCalculatedState(calculatedState);
    };
    const triggerDom = dragTriggerRef.current;
    dragTriggerRef.current.addEventListener('mousedown', onDragStart);

    return () => {
      triggerDom.removeEventListener('mousedown', onDragStart);
    };
  }, [dragTriggerRef, config.disabled]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const onMove = (evt: MouseEvent) => {
      if (!draggingStartRef.current.isDragging) {
        return;
      }
      const { pageX, pageY } = evt;
      const dragOffsetX = pageX - draggingStartRef.current.pos.x;
      const dragOffsetY = pageY - draggingStartRef.current.pos.y;
      setDragOffset({ x: dragOffsetX, y: dragOffsetY });

      const calculatedState: IOriginState = {};
      if (!isNil(draggingStartRef.current.origin.x)) {
        calculatedState.x = draggingStartRef.current.origin.x + dragOffsetX;
      }
      if (!isNil(draggingStartRef.current.origin.y)) {
        calculatedState.y = draggingStartRef.current.origin.y + dragOffsetY;
      }
      setCalculatedState(calculatedState);
    };
    const onEnd = (evt: MouseEvent) => {
      onMove(evt);
      setDragging(false);
      draggingStartRef.current = {};
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      setDragging(false);
    };
  }, [isDragging]);

  return { isDragging, dragOffset, calculatedState };
};
