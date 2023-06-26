import { throttle } from 'lodash';
import { useState, useEffect } from 'react';
import { useSidebar } from '../../layout/common';

export function useWindowInnerWidth() {
  const { visible } = useSidebar();
  const [width, setWidth] = useState(window.innerWidth - (visible ? 280 + 1 : 0));

  useEffect(() => {
    setWidth(window.innerWidth - (visible ? 280 + 1 : 0));
  }, [visible]);
  useEffect(() => {
    const handler = throttle(() => {
      setWidth(window.innerWidth - (visible ? 280 + 1 : 0));
    });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [visible]);

  return width;
}
