import { useEffect, useRef } from 'react';
import { useDrag } from '@editor/hooks';
import { isNil } from 'lodash';

interface IUseDrayY {
  minHeight?: number;
  maxHeightEqualHeight?: boolean;
  record?: any;
}

const useDragY = ({ minHeight = 0, maxHeightEqualHeight = false, record = {} }: IUseDrayY) => {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const footerHeightRef = useRef(0);
  const { isDragging: isFooterDragging, dragOffset: footerDragOffset } = useDrag(footerRef);

  useEffect(() => {
    const $main = mainRef.current;
    if (!isNil($main) && !isFooterDragging) {
      const mainHeight = $main.getBoundingClientRect().height;
      footerHeightRef.current = Math.max(mainHeight, minHeight);
    }
  }, [isFooterDragging]);

  /**
   * 动态容器高度不固定，需要在第一次拖拽前进行一次校验
   */
  useEffect(() => {
    const onMouseover = () => {
      const mainHeight = mainRef.current?.getBoundingClientRect()?.height ?? 0;
      footerHeightRef.current = Math.max(mainHeight, minHeight);
      footerRef.current?.removeEventListener('mouseover', onMouseover);
    };
    footerRef.current?.addEventListener('mouseover', onMouseover);

    return () => {
      footerRef.current?.removeEventListener('mouseover', onMouseover);
    };
  }, []);

  useEffect(() => {
    const $main = mainRef.current;
    if (!isNil($main) && isFooterDragging) {
      const mainRect = $main.getBoundingClientRect();
      let height = footerHeightRef.current + footerDragOffset.y;
      if (height < minHeight) {
        height = minHeight;
      } else if (mainRect.top + height > document.documentElement.clientHeight) {
        height = document.documentElement.clientHeight - mainRect.top;
      }
      $main.style.height = `${height}px`;
      if (maxHeightEqualHeight) $main.style.maxHeight = $main.style.height;
      record.height = height;
    }
  }, [isFooterDragging, footerDragOffset.y]);

  return {
    mainRef,
    footerRef,
  };
};

export default useDragY;
