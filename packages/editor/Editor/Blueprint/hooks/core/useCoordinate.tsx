import { useRef } from 'react';
import { useViewport } from 'react-flow-renderer';

/**
 * 用于记录和获取画布内部坐标系内某点的坐标
 * @returns
 */
export function useCoordinate() {
  const ref = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const viewport = useViewport();

  return {
    ref,
    setCoordinate(event: React.MouseEvent) {
      if (ref.current) {
        const { left, top } = ref.current.getBoundingClientRect();
        const { clientX, clientY } = event;
        const x = (clientX - left - viewport.x) / viewport.zoom;
        const y = (clientY - top - viewport.y) / viewport.zoom;
        positionRef.current = { x, y };
      }
    },
    getCoordinate() {
      return positionRef.current;
    },
  };
}
